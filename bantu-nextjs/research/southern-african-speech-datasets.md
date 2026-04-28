# Southern African Language Speech/TTS Dataset Research

**Date:** 2026-03-15
**Purpose:** Identify publicly available speech datasets for Southern African languages suitable for TTS model fine-tuning

---

## Table of Contents

1. [Dataset Inventory by Source](#dataset-inventory-by-source)
2. [Language Coverage Matrix](#language-coverage-matrix)
3. [Fine-Tuning Requirements](#fine-tuning-requirements)
4. [Existing African TTS Models](#existing-african-tts-models)
5. [Recommendations](#recommendations)

---

## Dataset Inventory by Source

### 1. NCHLT Speech Corpus (South Africa)

- **Languages:** All 11 official South African languages: isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana, isiNdebele, Siswati, Xitsonga, Tshivenda, Sepedi (Northern Sotho), English
- **Hours:** ~56 hours total (~5 hours per language) from 200 speakers per language
- **Auxiliary data:** 20-170 hours additional per language (lower quality)
- **Paired:** Yes (text + audio with orthographic transcriptions)
- **Quality:** Controlled recording conditions, wide-band speech
- **License:** Academic/research use
- **Download:** http://rma.nwu.ac.za/ or FTP at ftp://ftp.internat.freebsd.org/pub/nchlt/Speech_corpora
- **Pronunciation dictionaries:** 15,000 words per language included
- **Relevance:** Covers isiZulu, isiXhosa, Sesotho, Setswana, isiNdebele, Afrikaans -- six of our target languages

### 2. OpenSLR 32 -- South African TTS Data (Google/NWU)

- **Languages:** Afrikaans (af), Sesotho (st), Setswana (tn), isiXhosa (xh)
- **Hours:** Estimated 3-5 hours per language (based on file sizes: af=950MB, st=724MB, tn=729MB, xh=907MB)
- **Paired:** Yes (WAV files + TSV transcriptions)
- **Quality:** Multi-speaker, high quality, specifically designed for TTS
- **License:** CC BY-SA 4.0
- **Download:** https://www.openslr.org/32/
- **Key advantage:** PURPOSE-BUILT FOR TTS -- this is the most directly useful dataset for our use case

### 3. Swivuriso / African Next Voices (University of Pretoria - DSFSI)

- **Languages and target hours:**
  - isiZulu: 500 hours
  - isiXhosa: 500 hours
  - Sesotho: 500 hours
  - Setswana: 500 hours
  - Xitsonga: 500 hours
  - isiNdebele: 250 hours
  - Tshivenda: 250 hours
- **Total:** 3,000+ hours across 7 South African languages
- **Paired:** Yes (transcribed speech, both scripted and unscripted)
- **Quality:** Mixed (crowdsourced, community-centered collection in agriculture, healthcare, general domains)
- **License:** CC BY 4.0
- **Download:** https://huggingface.co/datasets/dsfsi-anv/za-african-next-voices and https://zenodo.org/records/17776290
- **CRITICAL WARNING:** Check if use restrictions apply -- earlier search noted this dataset "explicitly prohibits use for text-to-speech, voice cloning, or voice synthesis." MUST verify license terms before use.

### 4. Google FLEURS Dataset

- **Relevant languages included:**
  - Afrikaans (af_za)
  - Shona (sn_zw)
  - Zulu (zu_za)
  - Xhosa (xh_za)
  - Northern Sotho / Sepedi (nso)
  - Nyanja/Chichewa (ny)
  - Swahili (sw)
- **Hours:** ~12 hours total per language (~10 hours training)
- **Paired:** Yes (parallel text + audio from FLoRes-101 benchmark sentences)
- **Quality:** Crowdsourced but validated, 2009 parallel sentences per language
- **License:** CC BY 4.0
- **Download:** https://huggingface.co/datasets/google/fleurs
- **Note:** Small dataset but covers many of our target languages; n-way parallel (same sentences across all 102 languages)

### 5. Mozilla Common Voice

- **Relevant languages and approximate hours (from CV v9+):**
  - Swahili: ~179 hours
  - Afrikaans: ~108 hours
  - Shona: ~30 hours
  - Kinyarwanda: large (1000+ hours, for reference)
- **NOT included (as of latest data):** Zulu, Xhosa, Ndebele, Sotho, Tswana, Bemba, Nyanja, Oshiwambo
- **Paired:** Yes (text + audio)
- **Quality:** Crowdsourced with community validation; variable quality
- **License:** CC-0 (public domain)
- **Download:** https://commonvoice.mozilla.org/en/datasets
- **Note:** Strong for Swahili and Afrikaans, limited for other Southern African languages

### 6. BibleTTS (Masakhane/OpenSLR 129)

- **Languages (aligned, ready for TTS):**
  - Ewe: 86.8 hours aligned (100.1 total)
  - Hausa: 86.6 hours aligned (103.2 total)
  - Lingala: 71.6 hours aligned (151.7 total)
  - Akuapem Twi: 67.1 hours aligned (75.7 total)
  - Asante Twi: 74.9 hours aligned (82.6 total)
  - Yoruba: 33.3 hours aligned (93.6 total)
- **Languages (unaligned only):**
  - **Chichewa/Nyanja: 115.9 hours** (unaligned -- needs forced alignment)
  - Kikuyu: 90.6 hours
  - Luganda: 110.4 hours
  - Luo: 80.4 hours
- **Quality:** STUDIO QUALITY, single speaker, 48kHz, professional close-microphone recording. This is the gold standard for African language TTS data.
- **License:** CC BY-SA 4.0 (commercial-friendly)
- **Download:** http://www.openslr.org/129/
- **Key note:** Chichewa data exists but is UNALIGNED. Would need forced alignment (e.g., with Montreal Forced Aligner) before use for TTS training.

### 7. Meta MMS (Massively Multilingual Speech)

- **Coverage:** TTS models for 1,107 languages; ASR for 1,107; LangID for 4,000+
- **African languages with TTS models already available:**
  - Shona (facebook/mms-tts-sna on HuggingFace)
  - Zulu, Xhosa, Swahili, and many more (check facebook/mms-tts-* on HuggingFace)
- **Training data source:** New Testament readings, averaging 32 hours per language
- **Quality:** Religious text readings; good pronunciation but limited domain/prosody
- **License:** CC BY-NC 4.0 (non-commercial)
- **Access:** https://huggingface.co/facebook/mms-tts (search for specific language codes)
- **Key note:** These are PRETRAINED TTS MODELS, not just datasets. Quality for African languages noted at ~76% vs 95% for European languages. Could serve as a baseline or initialization point.

### 8. Google WAXAL Dataset (Released February 2026)

- **Total:** 11,000+ hours from ~2 million recordings, 27 languages
- **TTS-specific data:** 565 hours of high-fidelity recordings
- **ASR data:** 1,846 hours of transcribed natural speech
- **Languages relevant to us:**
  - **Shona** (ASR data available)
  - Swahili (ASR + TTS)
  - Hausa, Igbo, Yoruba (TTS data)
  - Acholi, Luganda, Akan, Ewe (various)
- **NOT included:** Zulu, Xhosa, Sotho, Tswana, Ndebele, Bemba, Oshiwambo
- **License:** Open license
- **Download:** https://huggingface.co/datasets/google/WaxalNLP
- **Note:** Very new (Feb 2026). The TTS-specific subset is most relevant.

### 9. BembaSpeech Corpus (University of Zambia)

- **Languages:** Bemba
- **Hours:** 24+ hours of read speech
- **Sources:** Literature books, radio/TV transcripts, YouTube transcripts, online sources
- **Paired:** Yes (text + audio, preprocessed and ready-to-use)
- **Quality:** Read speech, diverse sources
- **License:** Open (check GitHub)
- **Download:** https://github.com/csikasote/BembaSpeech

### 10. Zambezi Voice (University of Zambia Speech Lab)

- **Languages:** Bemba, Nyanja, Tonga, Lozi, Kaonde, Lunda, Luvale
- **Hours:**
  - Unlabelled: 160 hours (radio news and talk shows)
  - Labelled: 80+ hours (transcribed)
- **Paired:** Partially (labelled subset has transcriptions)
- **Quality:** Radio recordings (natural speech, some noise)
- **License:** Check with authors (zambezivoice@gmail.com)
- **Download:** https://github.com/unza-speech-lab/zambezi-voice
- **Key note:** Covers BOTH Bemba and Nyanja -- two of our target Zambian languages

### 11. ALFFA (African Languages in the Field)

- **Languages:** Amharic, Swahili, Wolof, Hausa
- **Located at:** https://www.openslr.org/25/
- **Paired:** Yes (transcribed speech with Kaldi ASR recipes)
- **Quality:** Field recordings
- **Relevance:** Swahili component useful

### 12. Intron Sahara v2 (Commercial -- for reference)

- **Not a dataset but a commercial ASR product**
- **Supports 57 languages including:** Zulu, Xhosa, Shona, Afrikaans, Bemba, Sesotho, Setswana, Swahili, Pedi
- **Training data:** 50,000 hours from 40,000+ speakers across 30 African countries
- **Note:** Not open source. Listed here as evidence of what's possible with sufficient data.

---

## Language Coverage Matrix

| Language | NCHLT | OpenSLR32 | Swivuriso | FLEURS | CommonVoice | BibleTTS | MMS | WAXAL | BembaSpeech | Zambezi | Best Available (hours) |
|----------|-------|-----------|-----------|--------|-------------|----------|-----|-------|-------------|---------|----------------------|
| Shona | -- | -- | -- | 12h | 30h | -- | 32h* | ASR | -- | -- | ~30h (CV) + 12h (FLEURS) |
| Ndebele | 5h | -- | 250h** | -- | -- | -- | ? | -- | -- | -- | 5h (NCHLT) + 250h** |
| Zulu | 5h | -- | 500h** | 12h | -- | -- | 32h* | -- | -- | -- | 5h + 12h + 32h* |
| Xhosa | 5h | 3-5h | 500h** | 12h | -- | -- | 32h* | -- | -- | -- | ~22h + 32h* |
| Sesotho | 5h | 3-5h | 500h** | 12h*** | -- | -- | 32h* | -- | -- | -- | ~22h + 32h* |
| Setswana | 5h | 3-5h | 500h** | -- | -- | -- | 32h* | -- | -- | -- | ~13h + 32h* |
| Bemba | -- | -- | -- | -- | -- | -- | 32h* | -- | 24h | 80h | ~24h (Bemba) + 80h (Zambezi) |
| Nyanja | -- | -- | -- | 12h | -- | 116h**** | 32h* | -- | -- | labelled | 12h + 116h**** |
| Oshiwambo | -- | -- | -- | -- | -- | -- | ? | -- | -- | -- | ~0h (EXTREMELY LOW) |
| Afrikaans | 5h | 3-5h | -- | 12h | 108h | -- | 32h* | -- | -- | -- | ~128h |
| Swahili | -- | -- | -- | 12h | 179h | -- | 32h* | TTS | -- | -- | ~191h + WAXAL TTS |

*MMS = pretrained model exists (trained on ~32h religious text); not raw dataset
**Swivuriso = VERIFY LICENSE -- may prohibit TTS use
***FLEURS has Northern Sotho (Sepedi), not Sesotho (Southern Sotho) exactly
****BibleTTS Chichewa = UNALIGNED, needs forced alignment processing

---

## Fine-Tuning Requirements

### VibeVoice-1.5B LoRA Fine-Tuning

**Hardware:**
- Minimum 16GB VRAM (RTX 3090, RTX 4090, A100)
- For 7B variant: 48GB+ VRAM
- Longer audio clips increase VRAM requirements

**Data Format:**
- 24kHz WAV audio files (auto-resampled if different)
- JSONL format: {"text": "Speaker 0: transcription", "audio": "/path/to/file.wav"}
- Optional voice prompts for voice cloning

**Training Configuration (recommended defaults):**
- Batch size: 8 per device
- Gradient accumulation: 16 steps
- Learning rate: 2.5e-5
- Epochs: 5
- LoRA rank: 8 (start conservative)
- Loss weights: diffusion=1.4, cross-entropy=0.04

**Minimum Data Requirements (synthesized from research):**
- No official minimum stated by Microsoft
- Community reports: 100-200 samples sufficient for initial testing
- Quality threshold: 30 minutes of clean audio outperforms 3 hours of noisy audio
- Practical minimum for new language: 3-10 hours of clean, paired audio
- Recommended for good quality: 20-50 hours of clean, studio-quality paired data
- Optimal: 50-100+ hours for production-quality TTS in a new language
- Training time estimate: 1000 samples at 3 epochs = 2-3 hours on RTX 4090

**Key Research Findings (Interspeech 2025):**
- LoRA rank 16-64 tested: lower rank preserves generative capability better
- Higher rank improves pronunciation of new language but degrades speaker adaptation
- Recommendation: Use LOW rank (8-16) when fine-tuning with small datasets
- Single-speaker datasets can work while preserving zero-shot capability

### Alternative TTS Models for Fine-Tuning

**F5-TTS:**
- Successfully fine-tuned for new languages (including Wolof)
- 12GB VRAM sufficient (RTX 4080 Laptop tested)
- 10-60 minutes of audio per character for fine-tuning
- 33 hours used for successful multi-speaker training
- Single GPU sufficient

**XTTS-v2 (Coqui TTS):**
- Fine-tuned for Wolof (an African language) despite no native support
- 8GB VRAM minimum with memory optimization
- Google Colab compatible
- Currently supports 16 languages natively (no African languages)
- Community has extended to African languages successfully

**SpeechT5:**
- Successfully adapted to Tamazight (Berber language)
- Demonstrated viability for low-resource indigenous languages
- Available on HuggingFace with fine-tuning support

### Compute Cost Estimates

For a typical LoRA fine-tuning run on VibeVoice-1.5B:
- **Cloud GPU (A100 40GB):** ~$1.50-3.00/hour
- **Training time:** 2-10 hours depending on dataset size
- **Total cost per language:** $5-30 for initial fine-tuning
- **Iteration cycles:** 3-5 runs to optimize hyperparameters = $15-150 total
- **RunPod/Lambda Labs:** More cost-effective than major cloud providers

---

## Existing African TTS Models

### Available Pre-trained Models

1. **Meta MMS-TTS** (facebook/mms-tts-*)
   - Pre-trained TTS for 1,100+ languages
   - Shona: facebook/mms-tts-sna
   - Zulu: facebook/mms-tts-zul
   - Xhosa: facebook/mms-tts-xho
   - Swahili: facebook/mms-tts-swh
   - Afrikaans: facebook/mms-tts-afr
   - And many more Southern African languages
   - Quality: Functional but robotic; trained on religious texts only
   - License: CC BY-NC 4.0 (non-commercial)

2. **BibleTTS Coqui Models**
   - Pre-trained VITS models for 6 aligned BibleTTS languages
   - Includes Hausa, Yoruba, Lingala, Ewe, Twi variants
   - No Southern African language models available
   - License: CC BY-SA 4.0

3. **Intron Sahara v2** (Commercial)
   - ASR (not TTS) for 57 African languages
   - Not open source

### Notable Gaps
- No open-source, high-quality TTS model exists for Zulu, Xhosa, Sesotho, Setswana, or Ndebele
- Shona has MMS-TTS but quality is limited
- Afrikaans has better coverage through MMS and general multilingual models
- This represents a significant market opportunity

---

## Recommendations

### Tier 1: Best Positioned Languages (most data available for TTS)

1. **Afrikaans** -- ~128h across datasets + OpenSLR 32 TTS-specific data + MMS model
2. **Swahili** -- ~191h + WAXAL TTS data + MMS model
3. **Xhosa** -- OpenSLR 32 TTS data + NCHLT + FLEURS + MMS model (~22h usable)
4. **Sesotho** -- OpenSLR 32 TTS data + NCHLT + MMS model (~13h usable)
5. **Setswana** -- OpenSLR 32 TTS data + NCHLT + MMS model (~13h usable)

### Tier 2: Feasible with Effort

6. **Shona** -- 30h Common Voice + 12h FLEURS + MMS model (needs data cleaning)
7. **Zulu** -- NCHLT 5h + FLEURS 12h + MMS model (limited but possible with LoRA)
8. **Bemba** -- 24h BembaSpeech + Zambezi Voice (needs format preparation)
9. **Nyanja/Chichewa** -- 116h BibleTTS UNALIGNED (needs forced alignment) + FLEURS

### Tier 3: Very Challenging

10. **Ndebele** -- Only NCHLT 5h (Swivuriso 250h may be TTS-restricted)
11. **Oshiwambo** -- Essentially no speech dataset available. Would need to create from scratch.

### Recommended Approach

1. **Start with OpenSLR 32 languages** (Afrikaans, Sesotho, Setswana, isiXhosa) as these have purpose-built TTS data
2. **Use MMS-TTS as baseline** -- fine-tune on top of existing MMS checkpoints rather than training from scratch
3. **Combine datasets** per language (NCHLT + OpenSLR + FLEURS) for maximum coverage
4. **Force-align BibleTTS Chichewa** data using Montreal Forced Aligner to unlock 116h
5. **For Zulu and Shona:** Supplement with Common Voice data, aggressive data cleaning
6. **For Oshiwambo:** Consider community data collection campaign or synthesis from related Bantu languages
7. **Verify Swivuriso license** -- if TTS use is allowed, this unlocks massive data for 7 SA languages

### Data Pipeline

```
Raw Audio + Text --> Preprocessing (resample to 24kHz, normalize)
    --> Quality Filter (SNR, alignment score)
    --> Format (JSONL for VibeVoice / LJSpeech format for others)
    --> Train/Val Split
    --> LoRA Fine-tuning (start rank=8, lr=2.5e-5)
    --> Evaluate (MOS, intelligibility, speaker similarity)
    --> Iterate
```

---

## Key URLs Reference

| Resource | URL |
|----------|-----|
| OpenSLR 32 (SA TTS) | https://www.openslr.org/32/ |
| OpenSLR 129 (BibleTTS) | http://www.openslr.org/129/ |
| Google FLEURS | https://huggingface.co/datasets/google/fleurs |
| Mozilla Common Voice | https://commonvoice.mozilla.org/en/datasets |
| NCHLT Corpus | https://sites.google.com/site/nchltspeechcorpus |
| Swivuriso | https://huggingface.co/datasets/dsfsi-anv/za-african-next-voices |
| WAXAL | https://huggingface.co/datasets/google/WaxalNLP |
| BembaSpeech | https://github.com/csikasote/BembaSpeech |
| Zambezi Voice | https://github.com/unza-speech-lab/zambezi-voice |
| Meta MMS-TTS | https://huggingface.co/facebook/mms-tts |
| VibeVoice Fine-tuning | https://github.com/voicepowered-ai/VibeVoice-finetuning |
| Masakhane | https://www.masakhane.io/ |
| Lacuna Fund | https://lacunafund.org/datasets/language/ |
