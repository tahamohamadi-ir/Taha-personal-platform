"""Wagtail admin viewsets for CMS content models."""

import pytest
from django_otp.plugins.otp_totp.models import TOTPDevice
from wagtail import hooks

from apps.content.viewsets import SiteContentViewSetGroup


@pytest.mark.django_db
def test_site_content_viewset_group_registered():
    viewsets = hooks.get_hooks("register_admin_viewset")
    groups = [hook() for hook in viewsets]
    assert any(isinstance(group, SiteContentViewSetGroup) for group in groups)


@pytest.mark.django_db
def test_articles_admin_list_requires_staff(client, admin_user):
    TOTPDevice.objects.create(user=admin_user, name="default", confirmed=True)
    client.force_login(admin_user)
    session = client.session
    session["otp_device_id"] = TOTPDevice.objects.get(user=admin_user).persistent_id
    session.save()
    response = client.get("/admin/articles/")
    assert response.status_code == 200
