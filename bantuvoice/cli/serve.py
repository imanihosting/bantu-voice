"""Run the BantuVoice FastAPI server.

Usage:
    bantuvoice-serve --host 0.0.0.0 --port 8000 \
        --model k2-fsa/OmniVoice

Required env vars (when used by bantu-nextjs):
    BANTUVOICE_API_KEY     Shared key the Next.js app sends as ``x-api-key``.
    S3_ENDPOINT            S3/MinIO endpoint URL.
    S3_ACCESS_KEY_ID       S3 access key.
    S3_SECRET_ACCESS_KEY   S3 secret key.
    S3_BUCKET_NAME         Bucket where Next.js uploads voice references.
    S3_REGION              (optional)
"""

from __future__ import annotations

import argparse
import logging
import os
from pathlib import Path

import uvicorn


def _load_dotenv(explicit: str | None = None) -> None:
    """Load environment variables from a .env file.

    Resolution order:
      1. ``--env-file`` CLI flag (if given).
      2. ``BANTUVOICE_ENV_FILE`` env var.
      3. ``./.env`` in the current working directory.
      4. ``<repo_root>/.env`` (next to ``pyproject.toml``).
    """
    candidates = []
    if explicit:
        candidates.append(Path(explicit))
    if os.environ.get("BANTUVOICE_ENV_FILE"):
        candidates.append(Path(os.environ["BANTUVOICE_ENV_FILE"]))
    candidates.append(Path.cwd() / ".env")
    candidates.append(Path(__file__).resolve().parents[2] / ".env")

    try:
        from dotenv import load_dotenv
    except ImportError:
        return

    for path in candidates:
        if path.is_file():
            load_dotenv(path, override=False)
            logging.getLogger(__name__).info("Loaded env file: %s", path)
            return


from bantuvoice.api.server import build_app  # noqa: E402  (loaded after dotenv)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="bantuvoice-serve",
        description="Launch the BantuVoice FastAPI server.",
    )
    p.add_argument("--model", default="k2-fsa/OmniVoice")
    p.add_argument("--device", default=None)
    p.add_argument("--host", default="0.0.0.0")
    p.add_argument("--port", type=int, default=8000)
    p.add_argument("--no-asr", action="store_true", default=False)
    p.add_argument("--asr-model", default="openai/whisper-large-v3-turbo")
    p.add_argument("--reload", action="store_true", default=False)
    p.add_argument(
        "--env-file",
        default=None,
        help="Path to a .env file with BANTUVOICE_API_KEY / S3_* settings.",
    )
    return p


def main(argv=None) -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s: %(message)s",
    )
    args = build_parser().parse_args(argv)

    _load_dotenv(args.env_file)

    app = build_app(
        checkpoint=args.model,
        device=args.device,
        load_asr=not args.no_asr,
        asr_model_name=args.asr_model,
    )
    uvicorn.run(app, host=args.host, port=args.port, reload=args.reload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
