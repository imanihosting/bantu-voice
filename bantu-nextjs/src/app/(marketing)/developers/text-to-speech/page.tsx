import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/features/docs/components/code-block";
import { DocsNote } from "@/features/docs/components/docs-note";
import { EndpointSection } from "@/features/docs/components/endpoint-section";

export default function DevelopersTextToSpeechPage() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Text to Speech</h1>
        <p className="text-muted-foreground leading-relaxed">
          Generate high-quality speech audio from text using any available voice.
        </p>
      </div>

      <Separator />

      {/* POST /api/v1/speech */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Generate Speech</h2>
        <EndpointSection
          method="POST"
          path="/api/v1/speech"
          description="Submit text and a voice ID to generate speech audio. Returns a generation object with a URL to download the audio."
          parameters={[
            {
              name: "text",
              type: "string",
              required: true,
              description: "The text to convert to speech. Maximum 5,000 characters.",
            },
            {
              name: "voiceId",
              type: "string",
              required: true,
              description: "The ID of the voice to use. Get IDs from the /voices endpoint.",
            },
            {
              name: "temperature",
              type: "number",
              default: "0.8",
              description: "Controls randomness of speech generation. Range: 0 to 5.",
            },
            {
              name: "topP",
              type: "number",
              default: "1.0",
              description: "Nucleus sampling threshold. Range: 0 to 1.",
            },
            {
              name: "exaggeration",
              type: "number",
              default: "0.5",
              description: "Controls expressiveness of the generated speech. Range: 0.25 to 2.",
            },
            {
              name: "repetitionPenalty",
              type: "number",
              default: "2.0",
              description: "Penalizes repeated tokens to reduce stuttering. Range: 1 to 3.",
            },
          ]}
          requestExample={`curl -X POST \\
  -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello from TaurAI!",
    "voiceId": "clx1abc123def456",
    "temperature": 0.8,
    "exaggeration": 0.5
  }' \\
  https://your-domain.com/api/v1/speech`}
          responseExample={`{
  "data": {
    "id": "clx2xyz789ghi012",
    "voiceName": "Aria",
    "text": "Hello from TaurAI!",
    "audioUrl": "/api/audio/clx2xyz789ghi012",
    "createdAt": "2025-06-15T10:30:00.000Z"
  }
}`}
          errorCodes={[
            { status: 400, description: "Invalid JSON body or validation error (missing text, voiceId, or parameters out of range)." },
            { status: 401, description: "Invalid or missing API key." },
            { status: 404, description: "Voice not found or does not belong to your organization." },
            { status: 422, description: "Voice audio reference is not available." },
            { status: 500, description: "Failed to store the generated audio." },
            { status: 502, description: "Upstream TTS engine failed to generate audio." },
          ]}
        />
      </section>

      <Separator />

      {/* Audio download */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Download Audio</h2>
        <EndpointSection
          method="GET"
          path="/api/audio/{id}"
          description="Download the generated audio file. Returns WAV by default. This endpoint does not require authentication — the generation ID acts as a capability URL."
          parameters={[
            {
              name: "id",
              type: "string",
              required: true,
              description: "The generation ID (from the path).",
            },
            {
              name: "format",
              type: "string",
              default: "wav",
              description: 'Set to "mp3" to receive the audio converted to MP3 format.',
            },
          ]}
          requestExample={`# Download as WAV (default)
curl -O https://your-domain.com/api/audio/clx2xyz789ghi012

# Download as MP3
curl -O https://your-domain.com/api/audio/clx2xyz789ghi012?format=mp3`}
        />

        <DocsNote variant="info">
          Audio files are cached with a <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">Cache-Control</code> header
          for 1 year. The response Content-Type is{" "}
          <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">audio/wav</code> or{" "}
          <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">audio/mpeg</code> depending on
          the format parameter.
        </DocsNote>
      </section>

      <Separator />

      {/* Full example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Full Example</h2>
        <p className="text-sm text-muted-foreground">
          Generate speech and download the resulting MP3 file:
        </p>
        <CodeBlock
          code={`# 1. Generate speech
RESPONSE=$(curl -s -X POST \\
  -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Welcome to TaurAI","voiceId":"YOUR_VOICE_ID"}' \\
  https://your-domain.com/api/v1/speech)

# 2. Extract the audio URL
AUDIO_URL=$(echo $RESPONSE | jq -r '.data.audioUrl')

# 3. Download as MP3
curl -o output.mp3 "https://your-domain.com\${AUDIO_URL}?format=mp3"`}
          language="bash"
        />
      </section>
    </>
  );
}
