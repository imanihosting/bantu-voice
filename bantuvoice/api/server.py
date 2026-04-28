"""FastAPI server exposing BantuVoice TTS to the Next.js frontend.

Endpoints (all require ``x-api-key`` header matching ``BANTUVOICE_API_KEY``):

* ``POST /generate``         - single-utterance TTS, returns ``audio/wav``.
* ``POST /generate-multi``   - multi-speaker dialogue TTS, returns ``audio/wav``.
* ``POST /transcribe``       - Whisper-backed ASR, returns JSON.
* ``POST /convert``          - WAV→MP3 transcoder, returns ``audio/mpeg``.
* ``GET  /healthz``          - liveness probe.

Schemas live alongside ``bantu-nextjs/src/types/bantuvoice-api.d.ts``.
Internally the work is dispatched to a singleton :class:`bantuvoice.BantuVoice`.
"""

from __future__ import annotations

import io
import logging
import os
import threading
from typing import Dict, List, Optional

import numpy as np
import soundfile as sf
import torch
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from bantuvoice import BantuVoice, BantuVoiceGenerationConfig
from bantuvoice.api.s3_client import download_voice

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Request schemas (consumed by bantu-nextjs via openapi-fetch)
# ---------------------------------------------------------------------------


class TTSRequest(BaseModel):
    prompt: str
    voice_key: Optional[str] = None
    language_id: str = "en"
    # BantuVoice diffusion knobs.
    num_step: int = 32
    guidance_scale: float = 2.0
    speed: float = 1.0
    duration: Optional[float] = None
    # Voice-design / cloning extras.
    instruct: Optional[str] = None
    ref_text: Optional[str] = None
    # Legacy sampling fields from the prior Chatterbox era — accepted for
    # backwards compatibility with old clients/rows, but ignored by BantuVoice.
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    exaggeration: Optional[float] = None
    cfg_weight: Optional[float] = None
    repetition_penalty: Optional[float] = None
    min_p: Optional[float] = None


class SpeakerLine(BaseModel):
    speaker: int
    text: str


class MultiSpeakerTTSRequest(BaseModel):
    script: List[SpeakerLine]
    voice_keys: Dict[str, str] = Field(default_factory=dict)
    cfg_weight: float = 0.5
    output_format: str = "wav"
    language_id: str = "en"


# ---------------------------------------------------------------------------
# Model holder + auth
# ---------------------------------------------------------------------------


class ModelHolder:
    def __init__(self) -> None:
        self.model: Optional[BantuVoice] = None
        self.lock = threading.Lock()


_holder = ModelHolder()


def _load_model(checkpoint: str, device: str, load_asr: bool, asr_model_name: str) -> BantuVoice:
    logger.info("Loading BantuVoice from %s on %s ...", checkpoint, device)
    dtype = torch.float16 if device.startswith("cuda") else torch.float32
    model = BantuVoice.from_pretrained(
        checkpoint,
        device_map=device,
        dtype=dtype,
        load_asr=load_asr,
        asr_model_name=asr_model_name,
    )
    logger.info("BantuVoice ready.")
    return model


def _require_api_key(x_api_key: Optional[str] = Header(default=None)) -> None:
    expected = os.environ.get("BANTUVOICE_API_KEY")
    if not expected:
        return  # Auth disabled if no key configured.
    if not x_api_key or x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


# ---------------------------------------------------------------------------
# Synthesis helpers
# ---------------------------------------------------------------------------


def _wav_response(waveform: np.ndarray, sampling_rate: int) -> Response:
    buf = io.BytesIO()
    if waveform.dtype != np.float32 and waveform.dtype != np.int16:
        waveform = waveform.astype(np.float32)
    sf.write(buf, waveform, sampling_rate, format="WAV")
    return Response(content=buf.getvalue(), media_type="audio/wav")


def _synthesize(
    model: BantuVoice,
    *,
    text: str,
    language_id: Optional[str],
    voice_key: Optional[str],
    ref_text: Optional[str],
    instruct: Optional[str],
    num_step: int,
    guidance_scale: float,
    speed: float,
    duration: Optional[float],
) -> np.ndarray:
    """Generate one utterance and return its waveform as a 1-D float array."""

    gen_config = BantuVoiceGenerationConfig(
        num_step=int(num_step or 32),
        guidance_scale=float(guidance_scale),
        denoise=True,
        preprocess_prompt=True,
        postprocess_output=True,
    )

    kw: Dict[str, object] = {
        "text": text.strip(),
        "language": language_id or None,
        "generation_config": gen_config,
    }
    if speed and float(speed) != 1.0:
        kw["speed"] = float(speed)
    if duration and float(duration) > 0:
        kw["duration"] = float(duration)

    if voice_key:
        local_ref = download_voice(voice_key)
        kw["voice_clone_prompt"] = model.create_voice_clone_prompt(
            ref_audio=local_ref,
            ref_text=ref_text,
        )

    if instruct and instruct.strip():
        kw["instruct"] = instruct.strip()

    with _holder.lock:
        audios = model.generate(**kw)

    return np.asarray(audios[0], dtype=np.float32)


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------


def build_app(
    *,
    checkpoint: str = "k2-fsa/OmniVoice",
    device: Optional[str] = None,
    load_asr: bool = True,
    asr_model_name: str = "openai/whisper-large-v3-turbo",
) -> FastAPI:

    if device is None:
        if torch.cuda.is_available():
            device = "cuda"
        elif torch.backends.mps.is_available():
            device = "mps"
        else:
            device = "cpu"

    app = FastAPI(title="BantuVoice API", version="1.0.0")

    @app.on_event("startup")
    def _startup() -> None:
        if _holder.model is None:
            _holder.model = _load_model(checkpoint, device, load_asr, asr_model_name)

    @app.get("/healthz")
    def healthz() -> JSONResponse:
        return JSONResponse({"status": "ok", "model_loaded": _holder.model is not None})

    @app.post("/generate", dependencies=[Depends(_require_api_key)])
    def generate(req: TTSRequest) -> Response:
        if _holder.model is None:
            raise HTTPException(status_code=503, detail="Model not loaded yet")

        logger.info(
            "POST /generate prompt_len=%d voice_key=%r language_id=%r instruct=%r",
            len(req.prompt or ""),
            req.voice_key,
            req.language_id,
            req.instruct,
        )

        try:
            waveform = _synthesize(
                _holder.model,
                text=req.prompt,
                language_id=req.language_id,
                voice_key=req.voice_key,
                ref_text=req.ref_text,
                instruct=req.instruct,
                num_step=req.num_step,
                guidance_scale=req.guidance_scale,
                speed=req.speed,
                duration=req.duration,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("generate failed")
            raise HTTPException(
                status_code=500,
                detail=f"{type(e).__name__}: {e}",
            )

        return _wav_response(waveform, _holder.model.sampling_rate)

    @app.post("/generate-multi", dependencies=[Depends(_require_api_key)])
    def generate_multi(req: MultiSpeakerTTSRequest) -> Response:
        if _holder.model is None:
            raise HTTPException(status_code=503, detail="Model not loaded yet")

        if not req.script:
            raise HTTPException(status_code=400, detail="Empty script")

        sr = _holder.model.sampling_rate
        silence = np.zeros(int(sr * 0.25), dtype=np.float32)
        chunks: List[np.ndarray] = []

        try:
            for i, line in enumerate(req.script):
                voice_key = req.voice_keys.get(str(line.speaker))
                if not voice_key:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Missing voice_key for speaker {line.speaker}",
                    )
                wav = _synthesize(
                    _holder.model,
                    text=line.text,
                    language_id=req.language_id,
                    voice_key=voice_key,
                    ref_text=None,
                    instruct=None,
                    num_step=32,
                    guidance_scale=2.0,
                    speed=1.0,
                    duration=None,
                )
                chunks.append(wav.astype(np.float32))
                if i < len(req.script) - 1:
                    chunks.append(silence)
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("generate-multi failed")
            raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")

        full = np.concatenate(chunks) if chunks else np.zeros(0, dtype=np.float32)
        return _wav_response(full, sr)

    @app.post("/convert", dependencies=[Depends(_require_api_key)])
    async def convert(request: Request) -> Response:
        """Transcode an uploaded WAV body to MP3.

        Used by the Next.js audio download route when ``?format=mp3`` is
        requested.
        """
        raw = await request.body()
        if not raw:
            raise HTTPException(status_code=400, detail="Empty request body")

        try:
            from pydub import AudioSegment
        except ImportError as e:
            raise HTTPException(
                status_code=500,
                detail=f"pydub not available: {e}",
            )

        try:
            seg = AudioSegment.from_file(io.BytesIO(raw), format="wav")
            out = io.BytesIO()
            seg.export(out, format="mp3", bitrate="192k")
        except Exception as e:
            logger.exception("convert failed")
            raise HTTPException(
                status_code=500,
                detail=f"{type(e).__name__}: {e}",
            )

        return Response(content=out.getvalue(), media_type="audio/mpeg")

    @app.post("/transcribe", dependencies=[Depends(_require_api_key)])
    async def transcribe(
        file: UploadFile = File(...),
        language: Optional[str] = Form(default=None),
    ) -> JSONResponse:
        if _holder.model is None:
            raise HTTPException(status_code=503, detail="Model not loaded yet")

        try:
            raw = await file.read()
            data, sr = sf.read(io.BytesIO(raw), always_2d=False)
            if data.ndim > 1:
                data = data.mean(axis=1)
            data = data.astype(np.float32)
            duration_seconds = float(len(data) / sr) if sr else 0.0

            with _holder.lock:
                if _holder.model._asr_pipe is None:
                    _holder.model.load_asr_model()
                text = _holder.model.transcribe((data, sr))
        except Exception as e:
            logger.exception("transcribe failed")
            raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")

        return JSONResponse(
            {
                "text": text,
                "language": language or "auto",
                "duration_seconds": duration_seconds,
                "segments": [
                    {"start": 0.0, "end": duration_seconds, "text": text},
                ],
            }
        )

    return app
