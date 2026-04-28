import { Separator } from "@/components/ui/separator";
import { EndpointSection } from "@/features/docs/components/endpoint-section";
import { DocsNote } from "@/features/docs/components/docs-note";

export default function DevelopersSpeechToTextPage() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Speech to Text</h1>
        <p className="text-muted-foreground leading-relaxed">
          Transcribe audio files to text using the Whisper model running on the
          same GPU as the TTS engine. Supports 30+ languages with automatic
          language detection.
        </p>
      </div>

      <Separator />

      {/* Supported formats */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Supported Audio Formats</h2>
        <p className="text-sm text-muted-foreground">
          The following audio formats are accepted for transcription:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li><strong className="text-foreground">WAV</strong> — Uncompressed audio (recommended)</li>
          <li><strong className="text-foreground">MP3</strong> — MPEG Layer 3</li>
          <li><strong className="text-foreground">M4A</strong> — MPEG-4 Audio</li>
          <li><strong className="text-foreground">FLAC</strong> — Free Lossless Audio Codec</li>
          <li><strong className="text-foreground">OGG</strong> — Ogg Vorbis</li>
          <li><strong className="text-foreground">WebM</strong> — WebM audio</li>
        </ul>
        <DocsNote variant="info">
          Maximum file size is 25 MB. For best results, use WAV or FLAC format
          with a sample rate of 16 kHz or higher.
        </DocsNote>
      </section>

      <Separator />

      {/* Create transcription */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Create Transcription</h2>
        <EndpointSection
          method="POST"
          path="/api/v1/transcriptions"
          description="Upload an audio file and receive its text transcription. The audio is processed by the Whisper model on the GPU. Language can be auto-detected or specified manually."
          parameters={[
            {
              name: "file",
              type: "file",
              required: true,
              description: "Audio file to transcribe (WAV, MP3, M4A, FLAC, OGG, or WebM). Maximum 25 MB.",
            },
            {
              name: "language",
              type: "string",
              required: false,
              description: 'ISO 639-1 language code (e.g. "en", "sw", "fr"). Omit to auto-detect.',
            },
          ]}
          requestExample={`curl -X POST \\
  -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  -F "file=@recording.wav" \\
  -F "language=en" \\
  https://your-domain.com/api/v1/transcriptions`}
          responseExample={`{
  "data": {
    "id": "clx1234567890",
    "text": "Hello, this is a test recording.",
    "language": "en",
    "durationSeconds": 4.52,
    "segments": [
      {
        "start": 0.0,
        "end": 2.1,
        "text": "Hello, this is"
      },
      {
        "start": 2.1,
        "end": 4.52,
        "text": "a test recording."
      }
    ],
    "createdAt": "2026-03-13T10:30:00.000Z"
  }
}`}
          errorCodes={[
            { status: 400, description: "Missing file field or empty audio file" },
            { status: 401, description: "Invalid or missing API key" },
            { status: 413, description: "File exceeds 25 MB limit" },
            { status: 500, description: "Internal server error" },
            { status: 502, description: "Transcription service unavailable" },
          ]}
        />
      </section>

      <Separator />

      {/* List transcriptions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">List Transcriptions</h2>
        <EndpointSection
          method="GET"
          path="/api/v1/transcriptions"
          description="Retrieve a paginated list of your transcription history, ordered by most recent first."
          parameters={[
            {
              name: "page",
              type: "integer",
              default: "1",
              description: "Page number for pagination.",
            },
            {
              name: "limit",
              type: "integer",
              default: "20",
              description: "Number of results per page (max 100).",
            },
          ]}
          requestExample={`curl -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  "https://your-domain.com/api/v1/transcriptions?page=1&limit=10"`}
          responseExample={`{
  "data": [
    {
      "id": "clx1234567890",
      "text": "Hello, this is a test recording.",
      "language": "en",
      "durationSeconds": 4.52,
      "originalFileName": "recording.wav",
      "segments": [...],
      "createdAt": "2026-03-13T10:30:00.000Z",
      "updatedAt": "2026-03-13T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10
  }
}`}
        />
      </section>

      <Separator />

      {/* Get single transcription */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Get Transcription</h2>
        <EndpointSection
          method="GET"
          path="/api/v1/transcriptions/{id}"
          description="Retrieve a single transcription by its ID."
          requestExample={`curl -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  https://your-domain.com/api/v1/transcriptions/clx1234567890`}
          responseExample={`{
  "data": {
    "id": "clx1234567890",
    "text": "Hello, this is a test recording.",
    "language": "en",
    "durationSeconds": 4.52,
    "originalFileName": "recording.wav",
    "segments": [
      {
        "start": 0.0,
        "end": 2.1,
        "text": "Hello, this is"
      },
      {
        "start": 2.1,
        "end": 4.52,
        "text": "a test recording."
      }
    ],
    "createdAt": "2026-03-13T10:30:00.000Z",
    "updatedAt": "2026-03-13T10:30:00.000Z"
  }
}`}
          errorCodes={[
            { status: 401, description: "Invalid or missing API key" },
            { status: 404, description: "Transcription not found" },
          ]}
        />
      </section>

      <Separator />

      {/* Transcription object */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Transcription Object</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 text-left font-medium">Field</th>
                <th className="py-2 pr-4 text-left font-medium">Type</th>
                <th className="py-2 text-left font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">id</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Unique identifier</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">text</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Full transcription text</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">language</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Detected or specified language code</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">durationSeconds</code></td>
                <td className="py-2 pr-4">number</td>
                <td className="py-2">Audio duration in seconds</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">originalFileName</code></td>
                <td className="py-2 pr-4">string?</td>
                <td className="py-2">Original uploaded file name</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">segments</code></td>
                <td className="py-2 pr-4">array</td>
                <td className="py-2">Timestamped segments with start, end, and text</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">createdAt</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">ISO 8601 creation timestamp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
