# TaurAI

AI-powered text-to-speech and voice cloning platform with multilingual support (25 languages including Swahili, Shona, and Ndebele).

Built with Next.js 16, React 19, and Chatterbox Multilingual TTS. Designed for self-hosted bare-metal GPU deployment.

## Features

- **Multilingual Text-to-Speech** — Generate speech in 25 languages with adjustable temperature, variety, expression, and flow
- **Zero-Shot Voice Cloning** — Upload or record a voice sample (10-30s) and clone it instantly — no fine-tuning required
- **20 Built-in Voices** — Pre-seeded system voices across 12 categories
- **Waveform Audio Player** — WaveSurfer.js visualization with seek, play/pause, and download
- **Service Health Dashboard** — Settings page with live health checks for TTS engine, storage, and database
- **Generation History** — Browse and replay past generations with preserved voice metadata
- **Fully Responsive** — Mobile-first with bottom drawers, compact controls, and adaptive layouts

### Supported Languages

Arabic, Chinese (Mandarin), Danish, Dutch, English (US/UK/AU/IN), Finnish, French, German, Greek, Hebrew, Hindi, Italian, Japanese, Korean, Malay, Ndebele, Norwegian, Polish, Portuguese (Brazil), Russian, Shona, Spanish, Swahili, Swedish, Turkish.

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────┐
│   Next.js App   │────▶│  Chatterbox Server   │     │    MinIO      │
│   (Port 3000)   │     │  (GPU, Port 8000)    │────▶│  (S3 Storage) │
│                 │────▶│  RTX A4000 / CUDA    │     │              │
└────────┬────────┘     └─────────────────────┘     └──────────────┘
         │
    ┌────▼────┐
    │ Postgres │
    └─────────┘
```

## Prerequisites

- **Node.js 20.9+** — for the Next.js app
- **PostgreSQL** — any managed or self-hosted instance
- **MinIO** (or S3-compatible storage) — for audio file storage
- **GPU machine with CUDA** — for the Chatterbox TTS server (tested on RTX A4000, 20GB VRAM)
- **Python 3.11** — on the GPU machine

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd taurai-languange
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_URL` | App URL (default: `http://localhost:3000`) |
| `S3_ENDPOINT` | MinIO/S3 endpoint (e.g. `http://10.10.10.45:9000`) |
| `S3_ACCESS_KEY_ID` | MinIO access key |
| `S3_SECRET_ACCESS_KEY` | MinIO secret key |
| `S3_BUCKET_NAME` | Bucket name for audio storage |
| `S3_REGION` | S3 region (e.g. `emea-west-1`) |
| `CHATTERBOX_API_URL` | Chatterbox server URL (e.g. `http://10.10.10.43:8000`) |
| `CHATTERBOX_API_KEY` | API key matching the GPU server's `.env.chatterbox` |

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Seed built-in voices

```bash
npx prisma db seed
```

Seeds 20 system voices to the database and MinIO. The WAV files are included in the repository.

### 5. Deploy the Chatterbox TTS server

On your **GPU machine** (bare metal or Proxmox container with GPU passthrough):

```bash
# Copy server files to the GPU machine
scp chatterbox_server.py requirements-chatterbox.txt setup-chatterbox.sh .env.chatterbox.example user@gpu-host:~/chatterbox/

# SSH into the GPU machine
ssh user@gpu-host
cd ~/chatterbox

# Run the setup script (creates Python 3.11 venv, installs deps, patches perth)
chmod +x setup-chatterbox.sh
./setup-chatterbox.sh

# Configure environment
cp .env.chatterbox.example .env.chatterbox
# Edit .env.chatterbox with your S3 credentials and API key

# Start the server
source .venv/bin/activate
python chatterbox_server.py
```

The multilingual model (~500MB) downloads automatically on first launch. Verify with:

```bash
curl http://localhost:8000/health
```

### Running Chatterbox as a System Service

To auto-start the TTS server on boot and restart it if it crashes, create a systemd service:

```bash
cat > /etc/systemd/system/chatterbox.service << 'EOF'
[Unit]
Description=Chatterbox Multilingual TTS Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/chatterbox
ExecStart=/root/chatterbox/.venv/bin/python chatterbox_server.py
Restart=always
RestartSec=10
Environment=PATH=/root/chatterbox/.venv/bin:/usr/local/bin:/usr/bin:/bin
EnvironmentFile=/root/chatterbox/.env.chatterbox

[Install]
WantedBy=multi-user.target
EOF
```

> **Note:** Adjust `User`, `WorkingDirectory`, and `ExecStart` paths if your setup differs from `/root/chatterbox`.

Enable and start:

```bash
systemctl daemon-reload
systemctl enable chatterbox
systemctl start chatterbox
```

Management commands:

| Command | Description |
|---------|-------------|
| `systemctl status chatterbox` | Check if running, see recent output |
| `systemctl restart chatterbox` | Restart after updating `chatterbox_server.py` |
| `systemctl stop chatterbox` | Stop the server |
| `journalctl -u chatterbox -f` | Live tail the logs |
| `journalctl -u chatterbox --since "5 min ago"` | Recent logs |

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Using Other Languages

The language is determined by the **voice**, not the text input.

1. **Create a voice** — Click "Voice cloning" in the sidebar, upload or record an audio sample
2. **Set the language** — Pick the target language (e.g. Swahili) from the dropdown
3. **Type text in that language** — e.g. *"Habari, jina langu ni TaurAI"*
4. **Generate** — The app sends the correct language code to Chatterbox automatically

The 20 built-in voices are English. To use other languages, create a custom voice with the desired language set.

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (dashboard)/            # All routes (home, TTS, voices, settings)
│   └── api/                    # Audio proxy + voice upload + tRPC handler
├── components/                 # Shared UI (shadcn/ui + custom)
├── features/
│   ├── dashboard/              # Home page, quick actions
│   ├── text-to-speech/         # TTS form, audio player, settings, history
│   ├── voices/                 # Voice library, creation, recording
│   └── settings/               # Settings page, service health
├── hooks/                      # App-wide hooks
├── lib/                        # Core: db, storage, env, chatterbox client
├── trpc/                       # tRPC routers, client, server helpers
├── generated/                  # Prisma client (auto-generated)
└── types/                      # Chatterbox API types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Lint with ESLint |

## GPU Server Reference

The Chatterbox server (`chatterbox_server.py`) runs **ChatterboxMultilingualTTS** (500M params) on bare metal CUDA. Key endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Model status, CUDA device, VRAM usage |
| `/generate` | POST | Generate speech (returns `audio/wav`) |

TTS parameters sent per request: `temperature`, `top_p`, `exaggeration`, `cfg_weight`, `repetition_penalty`, `min_p`, `language_id`.

## Acknowledgements

- [Chatterbox TTS](https://github.com/resemble-ai/chatterbox) by Resemble AI — open-source zero-shot voice cloning model
- [Modal](https://modal.com) — original voice sample pack used for built-in voices
