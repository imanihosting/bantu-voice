"""FastAPI server exposing the BantuVoice TTS contract.

The Next.js frontend (bantu-nextjs) calls this server via the
``BANTUVOICE_API_URL`` env var with the endpoints: ``/generate``,
``/generate-multi``, ``/transcribe``, and ``/convert``.
"""

from bantuvoice.api.server import build_app

__all__ = ["build_app"]
