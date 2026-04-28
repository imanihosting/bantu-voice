import { Separator } from "@/components/ui/separator";
import { DocsNote } from "@/features/docs/components/docs-note";
import { EndpointSection } from "@/features/docs/components/endpoint-section";

export default function VoicesDocsPage() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Voices</h1>
        <p className="text-muted-foreground leading-relaxed">
          List and search the voices available to your organization, including
          both system-provided and custom-cloned voices.
        </p>
      </div>

      <Separator />

      <section className="space-y-6">
        <h2 className="text-lg font-semibold">List Voices</h2>
        <EndpointSection
          method="GET"
          path="/api/v1/voices"
          description="Returns all voices available to your organization. Results are split into two arrays: custom voices (created by your org) and system voices (provided by TaurAI)."
          parameters={[
            {
              name: "search",
              type: "string",
              description:
                "Optional search query. Filters voices by name or description (case-insensitive).",
            },
          ]}
          requestExample={`# List all voices
curl -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  https://your-domain.com/api/v1/voices

# Search for voices
curl -H "Authorization: Bearer tk_YOUR_API_KEY" \\
  "https://your-domain.com/api/v1/voices?search=aria"`}
          responseExample={`{
  "data": {
    "custom": [
      {
        "id": "clx1abc123def456",
        "name": "My Custom Voice",
        "description": "A warm, friendly voice",
        "category": "conversational",
        "language": "en",
        "variant": "CUSTOM"
      }
    ],
    "system": [
      {
        "id": "clx0sys789ghi012",
        "name": "Aria",
        "description": "Natural female voice",
        "category": "general",
        "language": "en",
        "variant": "SYSTEM"
      }
    ]
  }
}`}
          errorCodes={[
            { status: 401, description: "Invalid or missing API key." },
          ]}
        />
      </section>

      <Separator />

      {/* Voice object */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Voice Object</h2>
        <p className="text-sm text-muted-foreground">
          Each voice object contains the following fields:
        </p>
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
                <td className="py-2">Unique voice identifier. Use this as the voiceId when generating speech.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">name</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Display name of the voice.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">description</code></td>
                <td className="py-2 pr-4">string | null</td>
                <td className="py-2">Optional description of the voice characteristics.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">category</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Voice category (e.g. general, conversational, narration, characters).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4"><code className="text-xs font-mono">language</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Language code (e.g. en, es, fr, de, pt, zu, xh, st, af, tn).</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code className="text-xs font-mono">variant</code></td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2">Either &quot;SYSTEM&quot; (built-in) or &quot;CUSTOM&quot; (cloned by your org).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      <DocsNote variant="tip">
        Custom voices are only visible to the organization that created them.
        System voices are shared across all organizations.
      </DocsNote>
    </>
  );
}
