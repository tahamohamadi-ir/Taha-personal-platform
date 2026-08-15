"""Upload validation — magic-byte sniffing with ``filetype``.

Client-supplied metadata (content_type, filename extension) is never trusted;
the file content itself is the source of truth.
"""

import os

import filetype
from django.core.exceptions import ValidationError

ALLOWED_MIMES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
}

MIME_TO_EXTENSIONS = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/gif": {".gif"},
    "application/pdf": {".pdf"},
}

MAX_FILE_SIZE = 5 * 1024 * 1024


def validate_file_type(value):
    """Reject files whose magic bytes are missing or not on the allowlist.

    Also rejects files whose extension does not match the detected content.
    The file pointer is restored to its original position either way.
    """
    value.seek(0)
    kind = filetype.guess(value.read(2048))
    value.seek(0)

    if kind is None or kind.mime not in ALLOWED_MIMES:
        raise ValidationError("Unsupported file type.")

    ext = os.path.splitext(value.name)[1].lower()
    if ext not in MIME_TO_EXTENSIONS.get(kind.mime, set()):
        raise ValidationError("File extension does not match file content.")


def validate_file_size(value):
    """Reject files larger than the 5 MB limit."""
    if value.size > MAX_FILE_SIZE:
        raise ValidationError("File too large. Max size is 5MB.")
