#!/usr/bin/env python3
# Copyright    2026  Xiaomi Corp.        (authors:  Han Zhu)
#
# See ../../LICENSE for clarification regarding multiple authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""
Gradio demo for BantuVoice.

Supports voice cloning and voice design.

Usage:
    bantuvoice-demo --model /path/to/checkpoint --port 8000
"""

import argparse
import logging
from typing import Any, Dict

import gradio as gr
import numpy as np
import torch

from bantuvoice import BantuVoice, BantuVoiceGenerationConfig
from bantuvoice.utils.lang_map import LANG_NAME_TO_ID, lang_display_name


def get_best_device():
    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


# African language ISO codes (incl. Madagascar, African Arabic dialects,
# Berber/Tuareg, African creoles) plus English.
_AFRICAN_LANG_IDS = {
    "en",
    # East / Horn of Africa
    "am", "bou", "cgg", "dav", "ebu", "eko", "eyo", "fip", "guz", "gwe",
    "ida", "kam", "kln", "koo", "lag", "lg", "lkb", "lto", "luo", "lwg",
    "mer", "om", "orc", "pko", "rag", "rof", "rw", "so", "sw", "ti", "tig",
    "ttj", "tuv", "tuy", "zga",
    # Southern Africa
    "af", "hz", "kj", "kwm", "ng", "nso", "ny", "nyu", "sn", "tn", "xh", "zu",
    # West Africa — Nigeria / Niger Delta
    "abn", "abr", "afo", "ahs", "ala", "anc", "ank", "anw", "awo", "bba",
    "bbu", "bcs", "bcy", "bde", "bky", "bsj", "bux", "bwr", "byc", "bys",
    "bzw", "ccg", "cen", "cfa", "ckl", "cky", "dbd", "deg", "dgh", "ego",
    "ekr", "elm", "ets", "fkk", "gbr", "gby", "gdf", "glw", "gyz", "ha",
    "hbb", "hia", "hwo", "ibb", "idu", "ig", "ijc", "ijn", "ikw", "ish",
    "iso", "its", "itw", "juk", "juo", "kai", "kaj", "kcq", "kna", "kuh",
    "ldb", "lla", "lnu", "mfm", "mfn", "mfo", "mgi", "mkf", "nbh", "ndi",
    "ngi", "nja", "odu", "ogo", "pcm", "pip", "piy", "say", "tan", "tbf",
    "ttr", "tul", "wja", "wji", "yay", "yer", "yes", "yo",
    # West Africa — Cameroon
    "aal", "abb", "bag", "bas", "bax", "bbj", "bce", "beb", "bfd", "bkh",
    "bkm", "bnm", "bri", "bum", "byv", "dua", "eto", "etu", "ewo", "fan",
    "fmp", "gid", "giz", "gya", "jgo", "ksf", "maf", "mbo", "mcx", "mdd",
    "mgg", "mhk", "mua", "mxu", "nla", "nmg", "nnh", "tvu", "udl", "ver",
    "wes", "yav",
    # West Africa — Ghana / Togo / Benin
    "ahl", "ajg", "bqg", "dag", "fat", "gej", "gur", "kdh", "keu", "kmy",
    "kpo", "nmz", "tw", "wci",
    # West Africa — Mali / Senegal / Guinea / Burkina Faso / Côte d'Ivoire / Liberia
    "bci", "bda", "bjt", "bmq", "dyu", "ebr", "gol", "gsl", "kqo", "lir",
    "mfv", "mlq", "msw", "snk", "vai", "wo", "wof", "xpe",
    # Central Africa / DRC / Angola
    "cjk", "hem", "ln", "lua", "umb",
    # Chad / Niger / Sahel
    "bdm", "dje", "dzg", "kbl", "mcn", "mde", "mne", "mse", "mug", "tuq",
    # Cape Verde
    "kea",
    # Fula / Fulfulde varieties
    "ff", "ffm", "fub", "fuc", "fue", "fuf", "fuh", "fui", "fuq", "fuv",
    # Berber / Tuareg
    "kab", "thv", "zgh",
    # African Arabic dialects
    "aao", "aeb", "aec", "aju", "apd", "arq", "ary", "arz", "avl", "ayl",
    "fia", "shu",
    # Madagascar — Malagasy varieties
    "bhr", "bmm", "bzc", "msh", "plt", "skg", "tdx", "tkg", "txy", "xmv", "xmw",
    # Standard Arabic (cross-region but heavily used in N. Africa)
    "arb",
}

_AFRICAN_NAMES = {
    name for name, code in LANG_NAME_TO_ID.items()
    if code in _AFRICAN_LANG_IDS
}
_ALL_LANGUAGES = ["Auto"] + sorted(lang_display_name(n) for n in _AFRICAN_NAMES)

_AUTO = "auto"

# Chinese dialect VALUES must remain Chinese — the model was trained on those tokens.
_CATEGORIES = {
    "Gender": [("Male", "male"), ("Female", "female")],
    "Age": [
        ("Child", "child"),
        ("Teenager", "teenager"),
        ("Young adult", "young adult"),
        ("Middle-aged", "middle-aged"),
        ("Elderly", "elderly"),
    ],
    "Pitch": [
        ("Very low", "very low pitch"),
        ("Low", "low pitch"),
        ("Moderate", "moderate pitch"),
        ("High", "high pitch"),
        ("Very high", "very high pitch"),
    ],
    "Style": [("Whisper", "whisper")],
    "English accent": [
        ("American", "american accent"),
        ("Australian", "australian accent"),
        ("British", "british accent"),
        ("Canadian", "canadian accent"),
        ("Chinese", "chinese accent"),
        ("Indian", "indian accent"),
        ("Japanese", "japanese accent"),
        ("Korean", "korean accent"),
        ("Portuguese", "portuguese accent"),
        ("Russian", "russian accent"),
    ],
    "Chinese dialect": [
        ("Henan", "河南话"),
        ("Shaanxi", "陕西话"),
        ("Sichuan", "四川话"),
        ("Guizhou", "贵州话"),
        ("Yunnan", "云南话"),
        ("Guilin", "桂林话"),
        ("Jinan", "济南话"),
        ("Shijiazhuang", "石家庄话"),
        ("Gansu", "甘肃话"),
        ("Ningxia", "宁夏话"),
        ("Qingdao", "青岛话"),
        ("Northeast", "东北话"),
    ],
}

_ATTR_INFO = {
    "English accent": "Only effective for English speech.",
    "Chinese dialect": "Only effective for Chinese speech.",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="bantuvoice-demo",
        description="Launch a Gradio demo for BantuVoice.",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument("--model", default="k2-fsa/OmniVoice")
    parser.add_argument("--device", default=None)
    parser.add_argument("--ip", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=7860)
    parser.add_argument("--root-path", default=None)
    parser.add_argument("--share", action="store_true", default=False)
    parser.add_argument("--no-asr", action="store_true", default=False)
    parser.add_argument("--asr-model", default="openai/whisper-large-v3-turbo")
    return parser


def build_demo(
    model: BantuVoice,
    checkpoint: str,
    device_label: str = "MPS",
    generate_fn=None,
) -> gr.Blocks:

    sampling_rate = model.sampling_rate

    def _gen_core(
        text, language, ref_audio, instruct,
        num_step, guidance_scale, denoise,
        speed, duration, preprocess_prompt, postprocess_output,
        mode, ref_text=None,
    ):
        if not text or not text.strip():
            return None, "Please enter the text to synthesize."

        gen_config = BantuVoiceGenerationConfig(
            num_step=int(num_step or 32),
            guidance_scale=float(guidance_scale) if guidance_scale is not None else 2.0,
            denoise=bool(denoise) if denoise is not None else True,
            preprocess_prompt=bool(preprocess_prompt),
            postprocess_output=bool(postprocess_output),
        )

        lang = language if (language and language != "Auto") else None

        kw: Dict[str, Any] = dict(
            text=text.strip(), language=lang, generation_config=gen_config
        )

        if speed is not None and float(speed) != 1.0:
            kw["speed"] = float(speed)
        if duration is not None and float(duration) > 0:
            kw["duration"] = float(duration)

        if mode == "clone":
            if not ref_audio:
                return None, "Please upload a reference audio."
            kw["voice_clone_prompt"] = model.create_voice_clone_prompt(
                ref_audio=ref_audio,
                ref_text=ref_text,
            )

        if instruct and instruct.strip():
            kw["instruct"] = instruct.strip()

        try:
            audio = model.generate(**kw)
        except Exception as e:
            return None, f"Error: {type(e).__name__}: {e}"

        waveform = (audio[0] * 32767).astype(np.int16)
        return (sampling_rate, waveform), "Done."

    _gen = generate_fn if generate_fn is not None else _gen_core

    theme = gr.themes.Glass()

    # Structural CSS only — colors come from Glass.
    css = """
    html, body { margin: 0 !important; padding: 0 !important; }

    .gradio-container {
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    .gradio-container > .main, .gradio-container .contain {
        max-width: 100% !important;
        padding: 0 !important;
    }

    /* Kill blue label pills */
    .gradio-container [data-testid="block-label"],
    .gradio-container .block > label,
    .gradio-container .block .label-wrap,
    .gradio-container .block .label-content,
    .gradio-container label > span,
    .gradio-container .block-label,
    .gradio-container .head label,
    .gradio-container .head label > span,
    .gradio-container .form > .block > label > span:first-child {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        padding: 0 !important;
        font-weight: 500 !important;
        box-shadow: none !important;
    }
    .gradio-container .block label {
        margin-bottom: 6px !important;
    }

    /* ─── Top bar ─── */
    .ov-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 24px;
        border-bottom: 1px solid var(--border-color-primary, rgba(0,0,0,0.08));
        height: 56px;
        box-sizing: border-box;
        backdrop-filter: blur(12px);
    }
    .ov-brand {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .ov-logo-mark {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff1a8c 0%, #b91d73 100%);
        box-shadow: 0 0 10px rgba(255,26,140,0.5);
    }
    .ov-logo-text {
        font-size: 17px;
        font-weight: 700;
        letter-spacing: -0.01em;
    }
    .ov-logo-text .ov-accent {
        background: linear-gradient(135deg, #ff1a8c 0%, #b91d73 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
    }
    .ov-topbar-right { display: flex; align-items: center; gap: 18px; }
    .ov-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        padding: 6px 12px;
        border: 1px solid var(--border-color-primary, rgba(0,0,0,0.1));
        border-radius: 999px;
        backdrop-filter: blur(8px);
    }
    .ov-status-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #10d9c4;
        box-shadow: 0 0 6px rgba(16,217,196,0.6);
    }

    /* ─── Tabs ─── */
    .ov-tabs {
        padding: 0 24px !important;
        border-bottom: 1px solid var(--border-color-primary, rgba(0,0,0,0.08)) !important;
    }
    .gradio-container .tab-nav, .gradio-container .tabs > div:first-child {
        display: flex !important;
        gap: 0 !important;
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
    }
    .gradio-container .tab-nav button, .gradio-container .tabs > div:first-child button {
        font-weight: 500 !important;
        font-size: 13px !important;
        background: transparent !important;
        border: none !important;
        border-bottom: 2px solid transparent !important;
        border-radius: 0 !important;
        padding: 12px 18px !important;
        margin-bottom: -1px !important;
    }
    .gradio-container .tab-nav button.selected, .gradio-container .tabs > div:first-child button.selected {
        border-bottom-color: #ff1a8c !important;
        background: transparent !important;
    }
    .gradio-container .tabitem {
        padding: 0 !important;
        border: none !important;
        background: transparent !important;
    }

    /* ─── Two-column main ─── */
    .ov-main {
        gap: 0 !important;
        margin: 0 !important;
        align-items: stretch !important;
        min-height: calc(100vh - 56px - 49px);
    }
    .ov-col {
        padding: 28px 32px !important;
        min-width: 0 !important;
    }
    .ov-col-input {
        border-right: 1px solid var(--border-color-primary, rgba(0,0,0,0.08)) !important;
    }

    /* ─── Section headers ─── */
    .ov-section {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        padding-bottom: 8px;
        margin: 0 0 22px 0;
        border-bottom: 2px solid #ff1a8c;
        display: inline-block;
    }

    .ov-hint {
        opacity: 0.65;
        font-size: 12px;
        margin: 4px 0 0 2px;
    }

    /* Generate button — pink accent regardless of theme */
    .gradio-container button.primary, .gradio-container button.lg.primary {
        font-weight: 600 !important;
        font-size: 13px !important;
        height: 44px !important;
        background: #ff1a8c !important;
        color: #ffffff !important;
        border: none !important;
        box-shadow: 0 4px 14px rgba(255,26,140,0.25) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.06em !important;
    }
    .gradio-container button.primary:hover {
        background: #ff3d9e !important;
        box-shadow: 0 6px 20px rgba(255,26,140,0.4) !important;
    }

    .gradio-container input[type="range"] { accent-color: #ff1a8c !important; }
    .gradio-container input[type="checkbox"] { accent-color: #ff1a8c !important; }

    .compact-audio audio { height: 60px !important; }

    @media (max-width: 900px) {
        .ov-col-input {
            border-right: none !important;
            border-bottom: 1px solid var(--border-color-primary, rgba(0,0,0,0.08)) !important;
        }
        .ov-col { padding: 20px !important; }
    }
    """

    def _lang_dropdown(value="Auto"):
        return gr.Dropdown(
            label="Language",
            choices=_ALL_LANGUAGES,
            value=value,
            allow_custom_value=False,
            interactive=True,
            info="Leave on Auto to detect from text.",
        )

    def _gen_settings():
        with gr.Accordion("Advanced settings", open=False):
            with gr.Row():
                sp = gr.Slider(
                    0.25, 2.0, value=1.0, step=0.05,
                    label="Speed",
                    info="1.0 = normal. Ignored if Duration is set.",
                )
                du = gr.Number(
                    value=None,
                    label="Duration (s)",
                    info="Override speed.",
                )
            with gr.Row():
                ns = gr.Slider(
                    4, 64, value=32, step=1,
                    label="Inference steps",
                    info="Higher = better quality.",
                )
                gs = gr.Slider(
                    0.0, 4.0, value=2.0, step=0.1,
                    label="Guidance scale",
                    info="Default 2.0.",
                )
            with gr.Row():
                dn = gr.Checkbox(label="Denoise", value=True)
                pp = gr.Checkbox(label="Preprocess prompt", value=True)
                po = gr.Checkbox(label="Postprocess output", value=True)
        return ns, gs, dn, sp, du, pp, po

    with gr.Blocks(theme=theme, css=css, title="BantuVoice") as demo:

        gr.HTML(
            f"""
            <div class="ov-topbar">
              <div class="ov-brand">
                <div class="ov-logo-mark"></div>
                <div class="ov-logo-text">Omni<span class="ov-accent">Voice</span></div>
              </div>
              <div class="ov-topbar-right">
                <div class="ov-chip">
                  <span class="ov-status-dot"></span>
                  <span>Running on {device_label}</span>
                </div>
              </div>
            </div>
            """
        )

        with gr.Tabs(elem_classes="ov-tabs"):

            with gr.TabItem("Voice Clone"):
                with gr.Row(equal_height=False, elem_classes="ov-main"):

                    with gr.Column(scale=1, elem_classes=["ov-col", "ov-col-input"]):
                        gr.HTML('<div class="ov-section">Input</div>')

                        vc_text = gr.Textbox(
                            label="Text",
                            lines=5,
                            placeholder="What should the voice say?",
                        )
                        vc_lang = _lang_dropdown()
                        vc_ref_audio = gr.Audio(
                            label="Reference audio",
                            type="filepath",
                            elem_classes="compact-audio",
                        )
                        gr.HTML(
                            '<div class="ov-hint">3–10 second clip in the same '
                            'language works best.</div>'
                        )
                        vc_ref_text = gr.Textbox(
                            label="Reference transcript (optional)",
                            lines=2,
                            placeholder="Leave empty to auto-transcribe.",
                        )
                        with gr.Accordion("Style instruction (optional)", open=False):
                            vc_instruct = gr.Textbox(
                                label="Instruct",
                                lines=2,
                                placeholder="e.g. female, warm, slow",
                            )
                        (
                            vc_ns, vc_gs, vc_dn, vc_sp, vc_du, vc_pp, vc_po,
                        ) = _gen_settings()
                        vc_btn = gr.Button("Generate", variant="primary", size="lg")

                    with gr.Column(scale=1, elem_classes=["ov-col", "ov-col-output"]):
                        gr.HTML('<div class="ov-section">Output</div>')
                        vc_audio = gr.Audio(
                            label="Generated audio",
                            type="numpy",
                        )
                        vc_status = gr.Textbox(
                            label="Status", lines=2, interactive=False,
                        )

                def _clone_fn(
                    text, lang, ref_aud, ref_text, instruct,
                    ns, gs, dn, sp, du, pp, po,
                ):
                    return _gen(
                        text, lang, ref_aud, instruct,
                        ns, gs, dn, sp, du, pp, po,
                        mode="clone",
                        ref_text=ref_text or None,
                    )

                vc_btn.click(
                    _clone_fn,
                    inputs=[
                        vc_text, vc_lang, vc_ref_audio, vc_ref_text, vc_instruct,
                        vc_ns, vc_gs, vc_dn, vc_sp, vc_du, vc_pp, vc_po,
                    ],
                    outputs=[vc_audio, vc_status],
                )

            with gr.TabItem("Voice Design"):
                with gr.Row(equal_height=False, elem_classes="ov-main"):

                    with gr.Column(scale=1, elem_classes=["ov-col", "ov-col-input"]):
                        gr.HTML('<div class="ov-section">Input</div>')

                        vd_text = gr.Textbox(
                            label="Text",
                            lines=5,
                            placeholder="What should the voice say?",
                        )
                        vd_lang = _lang_dropdown()

                        vd_groups = []
                        cats = list(_CATEGORIES.items())
                        for i in range(0, len(cats), 2):
                            with gr.Row():
                                for j in range(2):
                                    if i + j < len(cats):
                                        cat_name, choices = cats[i + j]
                                        vd_groups.append(
                                            gr.Dropdown(
                                                label=cat_name,
                                                choices=[("Auto", _AUTO)] + choices,
                                                value=_AUTO,
                                                info=_ATTR_INFO.get(cat_name),
                                            )
                                        )

                        (
                            vd_ns, vd_gs, vd_dn, vd_sp, vd_du, vd_pp, vd_po,
                        ) = _gen_settings()
                        vd_btn = gr.Button("Generate", variant="primary", size="lg")

                    with gr.Column(scale=1, elem_classes=["ov-col", "ov-col-output"]):
                        gr.HTML('<div class="ov-section">Output</div>')
                        vd_audio = gr.Audio(
                            label="Generated audio",
                            type="numpy",
                        )
                        vd_status = gr.Textbox(
                            label="Status", lines=2, interactive=False,
                        )

                def _build_instruct(groups):
                    parts = [g for g in groups if g and g != _AUTO]
                    return ", ".join(parts) if parts else None

                def _design_fn(text, lang, ns, gs, dn, sp, du, pp, po, *groups):
                    return _gen(
                        text, lang, None, _build_instruct(groups),
                        ns, gs, dn, sp, du, pp, po,
                        mode="design",
                    )

                vd_btn.click(
                    _design_fn,
                    inputs=[
                        vd_text, vd_lang,
                        vd_ns, vd_gs, vd_dn, vd_sp, vd_du, vd_pp, vd_po,
                    ] + vd_groups,
                    outputs=[vd_audio, vd_status],
                )

    return demo


def main(argv=None) -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s: %(message)s",
    )
    parser = build_parser()
    args = parser.parse_args(argv)

    device = args.device or get_best_device()

    checkpoint = args.model
    if not checkpoint:
        parser.print_help()
        return 0
    logging.info(f"Loading model from {checkpoint}, device={device} ...")
    model = BantuVoice.from_pretrained(
        checkpoint,
        device_map=device,
        dtype=torch.float16,
        load_asr=not args.no_asr,
        asr_model_name=args.asr_model,
    )
    print("Model loaded.")

    demo = build_demo(model, checkpoint, device_label=device.upper())

    demo.queue().launch(
        server_name=args.ip,
        server_port=args.port,
        share=args.share,
        root_path=args.root_path,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
