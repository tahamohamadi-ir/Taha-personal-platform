"""Content Wagtail surface after DEBT-0003 uninstall slice."""

import pytest
from django_otp.plugins.otp_totp.models import TOTPDevice
from wagtail import hooks


@pytest.mark.django_db
def test_site_content_viewsets_not_registered():
    """Snippet/ModelViewSets for content are retired; SPA owns CRUD."""
    viewsets = hooks.get_hooks("register_admin_viewset")
    groups = [hook() for hook in viewsets]
    assert groups == [] or not any(
        type(group).__name__ == "SiteContentViewSetGroup" for group in groups
    )


@pytest.mark.django_db
def test_retired_articles_snippet_url_not_served(client, admin_user):
    TOTPDevice.objects.create(user=admin_user, name="default", confirmed=True)
    client.force_login(admin_user)
    session = client.session
    session["otp_device_id"] = TOTPDevice.objects.get(user=admin_user).persistent_id
    session.save()
    response = client.get("/admin-wagtail/snippets/content/article/")
    assert response.status_code in (404, 302)
