"""Minimal S3 helper for downloading reference voice audio.

The Next.js side stores reference voice audio in an S3-compatible bucket
(MinIO/R2/AWS) and passes the object key as ``voice_key`` in the request
payload. This helper downloads the object to a local temp file so it can
be fed into ``BantuVoice.create_voice_clone_prompt`` as ``ref_audio``.
"""

from __future__ import annotations

import logging
import os
import tempfile
from typing import Optional

logger = logging.getLogger(__name__)


def _read_settings() -> dict:
    """Read S3 settings from the current environment (lazy, per-call)."""
    return {
        "endpoint": os.environ.get("S3_ENDPOINT"),
        "access_key": os.environ.get("S3_ACCESS_KEY_ID"),
        "secret_key": os.environ.get("S3_SECRET_ACCESS_KEY"),
        "bucket": os.environ.get("S3_BUCKET_NAME"),
        "region": os.environ.get("S3_REGION") or "us-east-1",
    }


_client = None
_client_signature: Optional[tuple] = None


def _get_client_and_bucket() -> tuple:
    """Return ``(client, bucket)``. Rebuilds if credentials change."""
    global _client, _client_signature

    settings = _read_settings()
    signature = (
        settings["endpoint"],
        settings["access_key"],
        settings["secret_key"],
        settings["bucket"],
        settings["region"],
    )

    if not (
        settings["endpoint"]
        and settings["access_key"]
        and settings["secret_key"]
        and settings["bucket"]
    ):
        raise RuntimeError(
            "S3 not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, "
            "S3_SECRET_ACCESS_KEY and S3_BUCKET_NAME."
        )

    if _client is not None and _client_signature == signature:
        return _client, settings["bucket"]

    try:
        import boto3
        from botocore.config import Config
    except ImportError as e:
        raise RuntimeError(
            "boto3 is required for S3 voice fetching. "
            "Install with `pip install boto3`."
        ) from e

    _client = boto3.client(
        "s3",
        endpoint_url=settings["endpoint"],
        aws_access_key_id=settings["access_key"],
        aws_secret_access_key=settings["secret_key"],
        region_name=settings["region"],
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )
    _client_signature = signature
    return _client, settings["bucket"]


def download_voice(voice_key: str) -> str:
    """Download a voice audio object to a temp file. Returns the local path."""
    client, bucket = _get_client_and_bucket()
    suffix = os.path.splitext(voice_key)[1] or ".wav"
    fd, path = tempfile.mkstemp(prefix="bantuvoice_ref_", suffix=suffix)
    os.close(fd)
    try:
        client.download_file(bucket, voice_key, path)
    except Exception:
        try:
            os.remove(path)
        except OSError:
            pass
        raise
    logger.debug("Downloaded s3://%s/%s -> %s", bucket, voice_key, path)
    return path
