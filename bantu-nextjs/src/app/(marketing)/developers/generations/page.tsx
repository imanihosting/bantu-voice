import { Separator } from "@/components/ui/separator";
import { EndpointSection } from "@/features/docs/components/endpoint-section";

export default function DevelopersGenerationsPage() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Generations</h1>
        <p className="text-muted-foreground leading-relaxed">
          Retrieve your speech generation history. Each generation includes the
          original text, voice used, and a URL to download the audio.
        </p>
      </div>

      <Separator />

      {/* List generations */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">List Generations</h2>
        <EndpointSection
          method="GET"
          path="/api/v1/generations"
          description="Returns a paginated list of your speech generations, ordered by most recent first."
          parameters={[
            {
              name: "page",
              type: "integer",
              default: "1",
              description: "Page number (1-based).",
            },
            {
              name: "limit",
              type: "integer",
              default: "20",
              description: "Number of results per page. Maximum 100.",
            },
          ]}
          requestExample={`curl -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  "https://your-domain.com/api/v1/generations?page=1&limit=10"`}
          responseExample={`{
  "data": [
    {
      "id": "clx2xyz789ghi012",
      "text": "Hello from TaurAI!",
      "voiceName": "Aria",
      "voiceId": "clx0sys789ghi012",
      "temperature": 0.8,
      "topP": 1.0,
      "exaggeration": 0.5,
      "repetitionPenalty": 2.0,
      "audioUrl": "/api/audio/clx2xyz789ghi012",
      "createdAt": "2025-06-15T10:30:00.000Z",
      "updatedAt": "2025-06-15T10:30:05.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10
  }
}`}
          errorCodes={[
            { status: 401, description: "Invalid or missing API key." },
          ]}
        />
      </section>

      <Separator />

      {/* Get single generation */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Get Generation</h2>
        <EndpointSection
          method="GET"
          path="/api/v1/generations/{id}"
          description="Retrieve a single generation by its ID."
          parameters={[
            {
              name: "id",
              type: "string",
              required: true,
              description: "The generation ID (path parameter).",
            },
          ]}
          requestExample={`curl -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  https://your-domain.com/api/v1/generations/clx2xyz789ghi012`}
          responseExample={`{
  "data": {
    "id": "clx2xyz789ghi012",
    "text": "Hello from TaurAI!",
    "voiceName": "Aria",
    "voiceId": "clx0sys789ghi012",
    "temperature": 0.8,
    "topP": 1.0,
    "exaggeration": 0.5,
    "repetitionPenalty": 2.0,
    "audioUrl": "/api/audio/clx2xyz789ghi012",
    "createdAt": "2025-06-15T10:30:00.000Z",
    "updatedAt": "2025-06-15T10:30:05.000Z"
  }
}`}
          errorCodes={[
            { status: 401, description: "Invalid or missing API key." },
            { status: 404, description: "Generation not found or does not belong to your organization." },
          ]}
        />
      </section>

      <Separator />

      {/* Generation object */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Generation Object</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 pr-4 text-left font-semibold">Field</th>
                <th className="py-2 pr-4 text-left font-semibold">Type</th>
                <th className="py-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">id</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Unique generation identifier.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">text</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">The input text that was converted to speech.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">voiceName</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Name of the voice used.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">voiceId</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">ID of the voice used.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">audioUrl</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Relative URL to download the audio file.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">temperature</code></td>
                <td className="py-2 pr-4">number</td>
                <td className="py-2">Temperature used for generation.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">topP</code></td>
                <td className="py-2 pr-4">number</td>
                <td className="py-2">Top-P value used for generation.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">exaggeration</code></td>
                <td className="py-2 pr-4">number</td>
                <td className="py-2">Exaggeration level used.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">repetitionPenalty</code></td>
                <td className="py-2 pr-4">number</td>
                <td className="py-2">Repetition penalty used.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">createdAt</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">ISO 8601 timestamp of when the generation was created.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code className="text-xs font-mono">updatedAt</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">ISO 8601 timestamp of the last update.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
