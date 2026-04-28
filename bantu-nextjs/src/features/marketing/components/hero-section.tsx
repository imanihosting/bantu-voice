"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WavyBackground } from "@/components/ui/wavy-background";

const highlights = [
  "14+ African Languages",
  "Voice Cloning",
  "Speech to Text",
  "REST API",
];

export function HeroSection() {
  return (
    <WavyBackground
      colors={["#d97706", "#f59e0b", "#b45309", "#dc2626", "#ea580c"]}
      backgroundFill="black"
      blur={10}
      speed="slow"
      waveOpacity={0.5}
      waveYOffset={350}
      containerClassName="min-h-[calc(100vh-4rem)]"
      className="mx-auto max-w-4xl px-4 text-center"
    >
      <div className="flex flex-col items-center gap-8">
        {/* Trust badge */}
        <Badge
          variant="outline"
          className="border-white/20 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm"
        >
          First of Its Kind
        </Badge>

        {/* Headline */}
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          The First Voice Engine for{" "}
          <span className="bg-gradient-to-r from-amber-400 to-red-400 bg-clip-text text-transparent">
            African Languages
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base text-white/60 sm:text-lg md:text-xl">
          Pioneering natural voice AI for African languages — starting in
          Southern Africa. Text-to-speech, voice cloning, and transcription
          built for the continent.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="min-w-[160px]">
            <Link href="/sign-up">
              Get Started
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="min-w-[160px] border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <a href="#features">Learn More</a>
          </Button>
        </div>

        {/* Feature checkmarks */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {highlights.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-sm text-white/60"
            >
              <Check className="size-4 text-amber-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </WavyBackground>
  );
}
