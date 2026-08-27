"""Admin graph authoring API (Track AB-05).

Staff + OTP protected authoring over the BK-04 graph storage under
``/api/v1/admin/graph/*``. Locale comes from the version row, never from the
path. Draft and active versions are both admin-visible here; the public read
gate (BK-05, not shipped yet) stays ``latest_active``.

Frozen contract (packet instruction + AB-05 row of
docs/plan/TRACK-AB-admin-backend-api-task-list.md):

- GET  ``/versions``                     -> [{id, locale, status, createdAt,
                                            updatedAt, nodeCount, edgeCount}]
- POST ``/versions`` {locale}            -> 201 empty draft; 404 unknown locale
- GET  ``/versions/{id}``                -> {id, locale, status, createdAt,
                                            updatedAt, nodes, edges, groups}
- PUT  ``/versions/{id}/payload``
       (If-Match: updatedAt ISO)         -> draft only (active -> 409
                                            IMMUTABLE_ACTIVE); 428
                                            PRECONDITION_REQUIRED when the
                                            header is missing; 409
                                            STALE_REVISION on mismatch; runs
                                            the AB-06 validator first and
                                            rejects atomically with
                                            400 {"issues": [...]} on any
                                            issue; else replace-all in one
                                            transaction; 200 {revision}
- POST ``/versions/{id}/activate``       -> draft only (else 409
                                            ALREADY_ACTIVE); re-runs the
                                            validator; blocking issues ->
                                            409 {"code": "VALIDATION_BLOCKED",
                                            "issues": [...]}; archives the
                                            previous active of the locale;
                                            audit ``graph.activate``;
                                            200 {id, status: "active"}
- GET  ``/validation/{id}``              -> {"issues": [...]} report, no mutation

Payload contract = AGENT-COORDINATION.md section 4 ``GraphNodePublic`` /
``GraphEdgePublic`` camelCase shapes (one payload everywhere: the admin API
stores/returns the same camel shapes the future public BK-05 read serves).
Storage stays snake_case BK-04 rows; mapping lives here. ``groups`` entries
are ``{name, nodeIds}`` (name -> ``GraphGroup.label``; membership -> node
``group`` FK).

Choices/deviations (reported to the integrator):
- Multiple drafts per locale are allowed (BK-04 only constrains one ACTIVE
  per locale via a partial unique index).
- ``createdAt``/``updatedAt`` are additionally exposed on the detail GET so
  the client can drive the PUT ``If-Match`` precondition.
- Edge ``id`` is composed (``source->target:relationType``) and never stored;
  supplied edge ids are ignored on write.
- Storage weight columns are BK-04 ``PositiveSmallIntegerField``: the 0..1
  payload weight contract is enforced at integral steps (0, 1) by the AB-06
  validator until a storage migration widens the column.
- Structural guards without validator codes return 400 ProblemDetails
  ``VALIDATION`` with stable tokens ``UNKNOWN_EDGE_ENDPOINT``,
  ``DUPLICATE_RELATED``, ``UNKNOWN_GROUP_MEMBER``, ``DUPLICATE_GROUP_MEMBER``.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Count, Prefetch
from django.http import JsonResponse
from ninja import Router, Schema, Status

from apps.api.admin_common import (
    AdminError,
    _check_csrf,
    _client_ip,
    _require_admin_otp,
)
from apps.api.admin_graph_validate import edge_public_id, validate_graph_payload
from apps.content.models import (
    Article,
    Book,
    Download,
    GraphEdge,
    GraphGroup,
    GraphNode,
    GraphNodeRelated,
    GraphVersion,
    GraphVersionStatus,
    Landing,
    Locale,
    Profile,
    Project,
    Publication,
    ResearchStatement,
    ResearchTopic,
    Series,
    Talk,
)
from apps.security.models import AuditLog

graph_router = Router()

VALID_LOCALES = tuple(Locale.values)

# Stable error tokens (declared once; see module docstring).
PRECONDITION_REQUIRED = "PRECONDITION_REQUIRED"
STALE_REVISION = "STALE_REVISION"
IMMUTABLE_ACTIVE = "IMMUTABLE_ACTIVE"
ALREADY_ACTIVE = "ALREADY_ACTIVE"
UNKNOWN_EDGE_ENDPOINT = "UNKNOWN_EDGE_ENDPOINT"
DUPLICATE_RELATED = "DUPLICATE_RELATED"
UNKNOWN_GROUP_MEMBER = "UNKNOWN_GROUP_MEMBER"
DUPLICATE_GROUP_MEMBER = "DUPLICATE_GROUP_MEMBER"

# SYNC-GUARD: the related-record family mapping. BK-05 (apps/api/api.py,
# ``public_graph_payload``) derives the public family string as
# ``content_type.model`` (lowercase model name) and composes edge ids as
# ``{source}->{target}:{relationType}``; it does not export a reusable
# helper, so the forward table (family -> model) is duplicated here with the
# SAME lowercase keys the public read serves (one payload everywhere). When
# BK-05 exports its mapping helper, import it here and delete this copy.
GRAPH_RELATED_FAMILIES: dict[str, type] = {
    "landing": Landing,
    "profile": Profile,
    "article": Article,
    "series": Series,
    "researchtopic": ResearchTopic,
    "researchstatement": ResearchStatement,
    "project": Project,
    "publication": Publication,
    "book": Book,
    "talk": Talk,
    "download": Download,
}


def _published_related_exists(family: str, record_id: str) -> bool:
    """Resolver for validate_graph_payload: published existence per family."""
    model = GRAPH_RELATED_FAMILIES.get(family)
    if model is None:
        return False
    try:
        pk = int(record_id)
    except (TypeError, ValueError):
        return False
    public = getattr(model.objects, "public", None)
    if public is None:
        return False
    return public().filter(pk=pk).exists()


# SYNC-GUARD: _format_iso/_parse_revision/_revisions_match mirror the
# admin_home.py (AB-02) conventions; Track AB doctrine limits cross-module
# imports to admin_common, so they are duplicated here (keep in sync).
def _format_iso(value: datetime) -> str:
    """ECMA-262 style ISO string at millisecond precision (mirrors admin_home)."""
    text = value.isoformat()
    if value.microsecond:
        text = text[:23] + text[26:]
    if text.endswith("+00:00"):
        text = text.removesuffix("+00:00") + "Z"
    return text


def _parse_revision(header: str | None) -> datetime | None:
    raw = (header or "").strip().strip('"')
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw)
    except ValueError:
        return None


def _revisions_match(expected: datetime, current: datetime) -> bool:
    """Compare both sides at millisecond precision (JS Date round-trip safety)."""
    try:
        expected_ms = expected.astimezone(UTC).replace(
            microsecond=(expected.microsecond // 1000) * 1000
        )
        current_ms = current.astimezone(UTC).replace(
            microsecond=(current.microsecond // 1000) * 1000
        )
    except (TypeError, ValueError):
        return False
    return expected_ms == current_ms


def _require_current_revision(request, version: GraphVersion) -> None:
    header = request.headers.get("If-Match")
    if header is None:
        raise AdminError(
            428,
            PRECONDITION_REQUIRED,
            "An If-Match revision is required. GET the graph version first.",
        )
    expected = _parse_revision(header)
    if expected is None or not _revisions_match(expected, version.updated_at):
        raise AdminError(
            409, STALE_REVISION, "The graph version was modified by someone else."
        )


def _serialize_version_row(
    version: GraphVersion, *, node_count: int, edge_count: int
) -> dict[str, Any]:
    return {
        "id": version.pk,
        "locale": version.locale,
        "status": version.status,
        "createdAt": _format_iso(version.created_at),
        "updatedAt": _format_iso(version.updated_at),
        "nodeCount": node_count,
        "edgeCount": edge_count,
    }


def _serialize_node(node: GraphNode) -> dict[str, Any]:
    data: dict[str, Any] = {
        "id": node.node_id,
        "type": node.type,
        "label": node.label,
    }
    if node.summary:
        data["summary"] = node.summary
    data["accessibleLabel"] = node.accessible_label
    data["colorRole"] = node.color_role
    data["iconRole"] = node.icon_role
    data["weight"] = node.weight
    if node.pos_x is not None and node.pos_y is not None:
        position: dict[str, float] = {"x": node.pos_x, "y": node.pos_y}
        if node.pos_z is not None:
            position["z"] = node.pos_z
        data["position"] = position
    data["relatedRecords"] = [
        {"family": related.content_type.model, "id": str(related.object_id)}
        for related in node.related_records.all()
    ]
    return data


def _serialize_edge(edge: GraphEdge) -> dict[str, Any]:
    source_id = edge.source.node_id
    target_id = edge.target.node_id
    data: dict[str, Any] = {
        "id": edge_public_id(source_id, target_id, edge.relation_type),
        "source": source_id,
        "target": target_id,
        "relationType": edge.relation_type,
        "directed": edge.directed,
        "weight": edge.weight,
    }
    if edge.explanation:
        data["explanation"] = edge.explanation
    return data


def _serialize_groups(version: GraphVersion) -> list[dict[str, Any]]:
    return [
        {
            "name": group.label,
            "nodeIds": [member.node_id for member in group.members.order_by("node_id")],
        }
        for group in version.groups.all()
    ]


def _stored_payload(version: GraphVersion) -> dict[str, Any]:
    """Camel payload rebuilt from stored rows (validation/activation input)."""
    nodes = version.nodes.order_by("node_id").prefetch_related(
        Prefetch(
            "related_records",
            queryset=GraphNodeRelated.objects.select_related("content_type"),
        )
    )
    return {
        "nodes": [_serialize_node(node) for node in nodes],
        "edges": [
            _serialize_edge(edge)
            for edge in version.edges.select_related("source", "target").order_by("id")
        ],
        "groups": _serialize_groups(version),
    }


def _get_version_or_404(version_id: int) -> GraphVersion:
    version = GraphVersion.objects.filter(pk=version_id).first()
    if version is None:
        raise AdminError(404, "NOT_FOUND", "Unknown graph version.")
    return version


def _audit(request, *, action: str, version: GraphVersion, status: int, extra: str) -> None:
    AuditLog.objects.create(
        user=request.user,
        action=action,
        model_name="graph",
        object_id=str(version.pk),
        ip=_client_ip(request),
        detail=f"{request.method} /api/v1/admin/graph/... -> {status}; {extra}",
    )


class GraphVersionCreateIn(Schema):
    """POST /versions body."""

    locale: str


class GraphVersionOut(Schema):
    """One row of the versions list / POST create response."""

    id: int
    locale: str
    status: str
    createdAt: str
    updatedAt: str
    nodeCount: int
    edgeCount: int


class GraphVersionDetailOut(Schema):
    """Full camel payload of one version (PUT If-Match uses ``updatedAt``)."""

    id: int
    locale: str
    status: str
    createdAt: str
    updatedAt: str
    nodes: list[dict[str, Any]]
    edges: list[dict[str, Any]]
    groups: list[dict[str, Any]]


class GraphPayloadIn(Schema):
    """PUT /versions/{id}/payload body (validator owns the semantics)."""

    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []
    groups: list[dict[str, Any]] = []


class GraphRevisionOut(Schema):
    """PUT response: the new version revision (updatedAt ISO)."""

    revision: str


class GraphActivateOut(Schema):
    """POST activate response."""

    id: int
    status: str


class GraphValidationOut(Schema):
    """GET /validation/{id} response."""

    issues: list[dict[str, Any]]


def _payload_dict(payload: GraphPayloadIn) -> dict[str, Any]:
    return {"nodes": payload.nodes, "edges": payload.edges, "groups": payload.groups}


def _check_storage_guards(payload: dict[str, Any]) -> None:
    """Structural guards with no validator code (400 VALIDATION, atomic)."""
    nodes = payload.get("nodes") or []
    edges = payload.get("edges") or []
    groups = payload.get("groups") or []

    node_ids = {str(node.get("id")) for node in nodes if isinstance(node, dict)}
    for edge in edges:
        if (
            str(edge.get("source")) not in node_ids
            or str(edge.get("target")) not in node_ids
        ):
            raise AdminError(
                400,
                "VALIDATION",
                "Edge endpoints must reference payload nodes.",
                fields={"edges": [UNKNOWN_EDGE_ENDPOINT]},
            )

    for node in nodes:
        entries = node.get("relatedRecords") or []
        keys = [
            (entry.get("family"), str(entry.get("id")))
            for entry in entries
            if isinstance(entry, dict)
        ]
        if len(keys) != len(set(keys)):
            raise AdminError(
                400,
                "VALIDATION",
                "A node references the same related record twice.",
                fields={"nodes": [DUPLICATE_RELATED]},
            )

    seen_members: set[str] = set()
    for group in groups:
        for member in group.get("nodeIds") or []:
            member_id = str(member)
            if member_id not in node_ids:
                raise AdminError(
                    400,
                    "VALIDATION",
                    "Group members must reference payload nodes.",
                    fields={"groups": [UNKNOWN_GROUP_MEMBER]},
                )
            if member_id in seen_members:
                raise AdminError(
                    400,
                    "VALIDATION",
                    "A node may belong to at most one group.",
                    fields={"groups": [DUPLICATE_GROUP_MEMBER]},
                )
            seen_members.add(member_id)


def _replace_payload(version: GraphVersion, payload: dict[str, Any]) -> None:
    """Delete-and-recreate the whole version payload inside one transaction.

    The validator plus :func:`_check_storage_guards` must already have passed.
    """
    nodes = payload.get("nodes") or []
    edges = payload.get("edges") or []
    groups = payload.get("groups") or []

    version.edges.all().delete()
    version.nodes.all().delete()  # cascades GraphNodeRelated rows
    version.groups.all().delete()

    group_by_member: dict[str, GraphGroup] = {}
    for group_data in groups:
        group = GraphGroup.objects.create(
            version=version, label=str(group_data.get("name") or ""), color_role=""
        )
        for member in group_data.get("nodeIds") or []:
            group_by_member[str(member)] = group

    node_by_id: dict[str, GraphNode] = {}
    for node_data in nodes:
        position = node_data.get("position")
        position = position if isinstance(position, dict) else {}
        node = GraphNode.objects.create(
            version=version,
            node_id=str(node_data.get("id") or ""),
            label=str(node_data.get("label") or ""),
            type=str(node_data.get("type") or ""),
            summary=str(node_data.get("summary") or ""),
            accessible_label=str(node_data.get("accessibleLabel") or ""),
            color_role=str(node_data.get("colorRole") or ""),
            icon_role=str(node_data.get("iconRole") or ""),
            weight=int(node_data["weight"]),
            pos_x=position.get("x"),
            pos_y=position.get("y"),
            pos_z=position.get("z"),
            group=group_by_member.get(str(node_data.get("id") or "")),
        )
        node_by_id[node.node_id] = node
        for entry in node_data.get("relatedRecords") or []:
            GraphNodeRelated.objects.create(
                node=node,
                content_type=ContentType.objects.get_for_model(
                    GRAPH_RELATED_FAMILIES[entry["family"]]
                ),
                object_id=int(entry["id"]),
            )

    for edge_data in edges:
        GraphEdge.objects.create(
            version=version,
            source=node_by_id[str(edge_data.get("source"))],
            target=node_by_id[str(edge_data.get("target"))],
            relation_type=str(edge_data.get("relationType") or ""),
            directed=bool(edge_data.get("directed", True)),
            weight=int(edge_data["weight"]),
            explanation=str(edge_data.get("explanation") or ""),
        )


@graph_router.get(
    "/versions",
    response=list[GraphVersionOut],
    summary="Every graph version with node/edge counts.",
)
def graph_versions_list(request):
    _require_admin_otp(request)
    versions = GraphVersion.objects.annotate(
        node_count=Count("nodes", distinct=True),
        edge_count=Count("edges", distinct=True),
    ).order_by("locale", "-id")
    return [
        GraphVersionOut(
            id=version.pk,
            locale=version.locale,
            status=version.status,
            createdAt=_format_iso(version.created_at),
            updatedAt=_format_iso(version.updated_at),
            nodeCount=version.node_count,
            edgeCount=version.edge_count,
        )
        for version in versions
    ]


@graph_router.post(
    "/versions",
    response={201: GraphVersionOut},
    summary="Create an empty draft graph version.",
)
def graph_version_create(request, payload: GraphVersionCreateIn):
    _require_admin_otp(request)
    _check_csrf(request)
    if payload.locale not in VALID_LOCALES:
        raise AdminError(404, "NOT_FOUND", "Unknown locale.")
    version = GraphVersion.objects.create(
        locale=payload.locale, status=GraphVersionStatus.DRAFT
    )
    _audit(
        request,
        action="graph.create",
        version=version,
        status=201,
        extra=f"locale={version.locale}",
    )
    return Status(
        201,
        GraphVersionOut(
            id=version.pk,
            locale=version.locale,
            status=version.status,
            createdAt=_format_iso(version.created_at),
            updatedAt=_format_iso(version.updated_at),
            nodeCount=0,
            edgeCount=0,
        ),
    )


@graph_router.get(
    "/versions/{version_id}",
    response=GraphVersionDetailOut,
    summary="Full camel payload of one graph version.",
)
def graph_version_detail(request, version_id: int):
    _require_admin_otp(request)
    version = _get_version_or_404(version_id)
    payload = _stored_payload(version)
    return GraphVersionDetailOut(
        id=version.pk,
        locale=version.locale,
        status=version.status,
        createdAt=_format_iso(version.created_at),
        updatedAt=_format_iso(version.updated_at),
        nodes=payload["nodes"],
        edges=payload["edges"],
        groups=payload["groups"],
    )


@graph_router.put(
    "/versions/{version_id}/payload",
    response=GraphRevisionOut,
    summary="Replace the whole payload of a DRAFT version (If-Match optimistic lock).",
)
def graph_payload_put(request, version_id: int, payload: GraphPayloadIn):
    _require_admin_otp(request)
    _check_csrf(request)
    payload_dict = _payload_dict(payload)
    with transaction.atomic():
        version = (
            GraphVersion.objects.select_for_update().filter(pk=version_id).first()
        )
        if version is None:
            raise AdminError(404, "NOT_FOUND", "Unknown graph version.")
        if version.status != GraphVersionStatus.DRAFT:
            raise AdminError(
                409,
                IMMUTABLE_ACTIVE,
                "The active graph version is immutable. Edit or create a draft.",
            )
        _require_current_revision(request, version)
        issues = validate_graph_payload(
            payload_dict, related_resolver=_published_related_exists
        )
        if issues:
            return JsonResponse({"issues": issues}, status=400)
        _check_storage_guards(payload_dict)
        _replace_payload(version, payload_dict)
        version.save(update_fields=["updated_at"])
        revision = _format_iso(version.updated_at)
    node_count = len(payload_dict.get("nodes") or [])
    edge_count = len(payload_dict.get("edges") or [])
    _audit(
        request,
        action="graph.update",
        version=version,
        status=200,
        extra=f"nodes={node_count}; edges={edge_count}",
    )
    return GraphRevisionOut(revision=revision)


@graph_router.post(
    "/versions/{version_id}/activate",
    response=GraphActivateOut,
    summary="Activate a DRAFT version; the previously active one is archived.",
)
def graph_version_activate(request, version_id: int):
    _require_admin_otp(request)
    _check_csrf(request)
    with transaction.atomic():
        version = (
            GraphVersion.objects.select_for_update().filter(pk=version_id).first()
        )
        if version is None:
            raise AdminError(404, "NOT_FOUND", "Unknown graph version.")
        if version.status != GraphVersionStatus.DRAFT:
            raise AdminError(409, ALREADY_ACTIVE, "This graph version is already active.")
        issues = validate_graph_payload(
            _stored_payload(version), related_resolver=_published_related_exists
        )
        if issues:
            return JsonResponse({"code": "VALIDATION_BLOCKED", "issues": issues}, status=409)
        GraphVersion.objects.filter(
            locale=version.locale, status=GraphVersionStatus.ACTIVE
        ).exclude(pk=version.pk).update(status=GraphVersionStatus.DRAFT)
        version.status = GraphVersionStatus.ACTIVE
        version.save(update_fields=["status", "updated_at"])
    _audit(
        request,
        action="graph.activate",
        version=version,
        status=200,
        extra=f"locale={version.locale}",
    )
    return GraphActivateOut(id=version.pk, status="active")


@graph_router.get(
    "/validation/{version_id}",
    response=GraphValidationOut,
    summary="Validator report for one version (no mutation).",
)
def graph_validation_report(request, version_id: int):
    _require_admin_otp(request)
    version = _get_version_or_404(version_id)
    issues = validate_graph_payload(
        _stored_payload(version), related_resolver=_published_related_exists
    )
    return GraphValidationOut(issues=issues)
