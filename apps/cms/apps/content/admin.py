"""Wagtail snippet registration retired (DEBT-0003 uninstall slice).

Content CRUD is SPA-only via ``/api/v1/admin/*``. Historical snippet ViewSet
classes lived here; they are intentionally not registered so Wagtail admin no
longer exposes Article/Series/research/project editors. Staff preview URLs
remain under ``/admin-wagtail/preview/`` via ``wagtail_hooks``.
"""
