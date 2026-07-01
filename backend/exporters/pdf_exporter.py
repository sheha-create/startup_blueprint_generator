"""
PDF exporter — converts a blueprint dict into a formatted PDF using WeasyPrint + Jinja2.
"""
from __future__ import annotations

import io
from typing import Any, Dict

from jinja2 import Environment, BaseLoader

from exporters.shared_template import render_html

try:
    from weasyprint import HTML as WeasyHTML
    WEASYPRINT_AVAILABLE = True
except Exception:
    WEASYPRINT_AVAILABLE = False


def export_pdf(blueprint: Dict[str, Any]) -> bytes:
    """Return PDF bytes for the given blueprint dict."""
    html_content = render_html(blueprint)
    if not WEASYPRINT_AVAILABLE:
        raise RuntimeError(
            "WeasyPrint is not installed or has missing system dependencies. "
            "Install GTK runtime on Windows or use the DOCX export instead."
        )
    pdf_bytes = WeasyHTML(string=html_content).write_pdf()
    return pdf_bytes
