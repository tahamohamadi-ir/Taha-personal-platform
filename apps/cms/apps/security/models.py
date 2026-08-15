"""Audit log — append-only security event journal (P3 admin-security slice)."""

from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=64)
    model_name = models.CharField(max_length=64, blank=True)
    object_id = models.CharField(max_length=64, blank=True)
    ip = models.CharField(max_length=45, blank=True)
    detail = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Audit log"
        verbose_name_plural = "Audit logs"

    def __str__(self) -> str:
        return f"{self.action} ({self.created_at:%Y-%m-%d %H:%M:%S})"
