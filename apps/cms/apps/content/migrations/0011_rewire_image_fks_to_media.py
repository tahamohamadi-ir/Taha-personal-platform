"""Rewire featured/diagram/screenshot image FKs from wagtailimages to Media.

Additive sequence: add temporary Media FKs, copy Wagtail Image file bytes into
Media rows (deduped by Wagtail pk), drop the Wagtail FKs, rename Media FKs to
the original field names. Locale/slug/status columns are untouched.
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import django.db.models.deletion
from django.core.files.base import ContentFile
from django.db import migrations, models


def _copy_wagtail_to_media(wag_image, media_cache: dict[int, int]) -> int | None:
    """Create (or reuse) a Media row from a Wagtail Image; return Media pk."""
    if wag_image is None:
        return None
    cached = media_cache.get(wag_image.pk)
    if cached is not None:
        return cached

    # Import concrete Media so save() runs sniff + safe storage naming.
    from apps.media.models import Media
    from apps.media.sniff import sniff_mime

    try:
        wag_image.file.open("rb")
        try:
            data = wag_image.file.read()
        finally:
            wag_image.file.close()
    except (OSError, ValueError, FileNotFoundError):
        return None
    if not data:
        return None

    mime = sniff_mime(BytesIO(data)) or ""
    title = (getattr(wag_image, "title", None) or "Migrated image")[:255]
    alt = (getattr(wag_image, "description", None) or "")[:255]
    filename = Path(getattr(wag_image.file, "name", "") or "image.bin").name

    media = Media(
        title=title,
        alt_text=alt,
        is_active=True,
    )
    # Pre-set mime when sniff succeeds so upload_path can pick an extension.
    if mime:
        media.mime = mime
    try:
        media.file.save(filename, ContentFile(data), save=True)
    except Exception:
        return None
    media_cache[wag_image.pk] = media.pk
    return media.pk


def forwards_copy_images(apps, schema_editor):
    Article = apps.get_model("content", "Article")
    ProjectDiagram = apps.get_model("content", "ProjectDiagram")
    ProjectScreenshot = apps.get_model("content", "ProjectScreenshot")
    WagtailImage = apps.get_model("wagtailimages", "Image")

    cache: dict[int, int] = {}

    for row in Article.objects.exclude(featured_image_id__isnull=True).iterator():
        wag = WagtailImage.objects.filter(pk=row.featured_image_id).first()
        media_pk = _copy_wagtail_to_media(wag, cache)
        if media_pk is not None:
            Article.objects.filter(pk=row.pk).update(featured_image_media_id=media_pk)

    for row in ProjectDiagram.objects.exclude(diagram_image_id__isnull=True).iterator():
        wag = WagtailImage.objects.filter(pk=row.diagram_image_id).first()
        media_pk = _copy_wagtail_to_media(wag, cache)
        if media_pk is not None:
            ProjectDiagram.objects.filter(pk=row.pk).update(diagram_image_media_id=media_pk)

    for row in ProjectScreenshot.objects.exclude(screenshot_image_id__isnull=True).iterator():
        wag = WagtailImage.objects.filter(pk=row.screenshot_image_id).first()
        media_pk = _copy_wagtail_to_media(wag, cache)
        if media_pk is not None:
            ProjectScreenshot.objects.filter(pk=row.pk).update(
                screenshot_image_media_id=media_pk
            )


def noop_reverse(apps, schema_editor):
    """Wagtail Image bytes are not reconstructed; reverse clears Media FKs only."""
    Article = apps.get_model("content", "Article")
    ProjectDiagram = apps.get_model("content", "ProjectDiagram")
    ProjectScreenshot = apps.get_model("content", "ProjectScreenshot")
    Article.objects.all().update(featured_image_media_id=None)
    ProjectDiagram.objects.all().update(diagram_image_media_id=None)
    ProjectScreenshot.objects.all().update(screenshot_image_media_id=None)


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0010_entity_stories"),
        ("media", "0002_media_alt_text_en_media_alt_text_fa"),
        ("wagtailimages", "0027_image_description"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="featured_image_media",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="+",
                to="media.media",
            ),
        ),
        migrations.AddField(
            model_name="projectdiagram",
            name="diagram_image_media",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="+",
                to="media.media",
            ),
        ),
        migrations.AddField(
            model_name="projectscreenshot",
            name="screenshot_image_media",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="+",
                to="media.media",
            ),
        ),
        migrations.RunPython(forwards_copy_images, noop_reverse),
        migrations.RemoveField(
            model_name="article",
            name="featured_image",
        ),
        migrations.RemoveField(
            model_name="projectdiagram",
            name="diagram_image",
        ),
        migrations.RemoveField(
            model_name="projectscreenshot",
            name="screenshot_image",
        ),
        migrations.RenameField(
            model_name="article",
            old_name="featured_image_media",
            new_name="featured_image",
        ),
        migrations.RenameField(
            model_name="projectdiagram",
            old_name="diagram_image_media",
            new_name="diagram_image",
        ),
        migrations.RenameField(
            model_name="projectscreenshot",
            old_name="screenshot_image_media",
            new_name="screenshot_image",
        ),
    ]
