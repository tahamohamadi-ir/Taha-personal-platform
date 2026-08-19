"""Media library — signature-validated uploads, private-by-default visibility.

A record is NOT public until ``is_active`` is set by an editor; ``is_active``
IS the public flag. Internal/archived records are simply ``is_active=False``.
"""

from django.db import models

from apps.media.sniff import sniff_mime
from apps.media.storage import media_upload_path
from apps.media.validators import validate_file_size, validate_file_type


class MediaQuerySet(models.QuerySet):
    """QuerySet with the public-media projection rule."""

    def active_public(self):
        """Only records explicitly marked active (the private-default rule)."""
        return self.filter(is_active=True)


class MediaManager(models.Manager):
    def get_queryset(self):
        return MediaQuerySet(self.model, using=self._db)

    def active_public(self):
        return self.get_queryset().active_public()


class Media(models.Model):
    file = models.FileField(
        upload_to=media_upload_path,
        validators=[validate_file_type, validate_file_size],
    )
    title = models.CharField(max_length=255)
    alt_text = models.CharField(max_length=255, blank=True)
    alt_text_fa = models.CharField(max_length=255, blank=True, default="", db_default="")
    alt_text_en = models.CharField(max_length=255, blank=True, default="", db_default="")
    mime = models.CharField(max_length=100, editable=False, blank=True)
    size = models.PositiveBigIntegerField(editable=False, default=0)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = MediaManager()

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Media"
        verbose_name_plural = "Media"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """Record mime/size from the actual file content, never from client metadata."""
        if self.file and self.file.name:
            self.file.seek(0)
            self.mime = sniff_mime(self.file) or ""
            self.file.seek(0)
            self.size = self.file.size
        super().save(*args, **kwargs)
