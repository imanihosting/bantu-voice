import {
  AudioLines,
  Mic,
  Volume2,
  BookOpen,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Text to Speech",
    description:
      "Convert any text into natural-sounding speech with AI-powered voice synthesis. Multiple languages and styles supported.",
    icon: AudioLines,
    color: "bg-amber-500/10 text-amber-400",
  },
  {
    title: "Speech to Text",
    description:
      "Transcribe audio files with Whisper-powered accuracy. Upload recordings and get precise text output in seconds.",
    icon: Mic,
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    title: "Voice Cloning",
    description:
      "Clone any voice from a short audio sample. Create custom voices for personalized content and unique projects.",
    icon: Volume2,
    color: "bg-emerald-500/10 text-emerald-400",
  },
  {
    title: "REST API",
    description:
      "Integrate voice capabilities into your applications with a comprehensive REST API. Bearer token authentication included.",
    icon: BookOpen,
    color: "bg-amber-500/10 text-amber-400",
  },
  {
    title: "Explore Voices",
    description:
      "Browse a library of AI voices. Preview, filter, and select the perfect voice for your narration or content.",
    icon: LayoutGrid,
    color: "bg-pink-500/10 text-pink-400",
  },
  {
    title: "Secure & Private",
    description:
      "Your voice data stays protected with enterprise-grade security. Full data privacy with no third-party access.",
    icon: ShieldCheck,
    color: "bg-cyan-500/10 text-cyan-400",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-white/10 bg-black py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need for AI voice
          </h2>
          <p className="mt-4 text-base text-white/60 sm:text-lg">
            A complete suite of voice AI tools — text to speech, transcription,
            voice cloning, and more.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-white/10 bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
            >
              <CardHeader>
                <div
                  className={`mb-2 flex size-10 items-center justify-center rounded-lg ${feature.color}`}
                >
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-white/60">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
