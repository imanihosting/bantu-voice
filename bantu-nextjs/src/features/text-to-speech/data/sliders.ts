interface Slider {
  id: "numStep" | "guidanceScale" | "speed" | "duration";
  label: string;
  leftLabel: string;
  rightLabel: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export const sliders: Slider[] = [
  {
    id: "numStep",
    label: "Quality",
    leftLabel: "Faster",
    rightLabel: "Better",
    min: 8,
    max: 64,
    step: 4,
    defaultValue: 32,
  },
  {
    id: "guidanceScale",
    label: "Voice Adherence",
    leftLabel: "Loose",
    rightLabel: "Tight",
    min: 0.5,
    max: 4,
    step: 0.1,
    defaultValue: 2.0,
  },
  {
    id: "speed",
    label: "Speed",
    leftLabel: "Slow",
    rightLabel: "Fast",
    min: 0.5,
    max: 1.75,
    step: 0.05,
    defaultValue: 1.0,
  },
  {
    id: "duration",
    label: "Length cap (s)",
    leftLabel: "Auto",
    rightLabel: "30s",
    min: 0,
    max: 30,
    step: 0.5,
    defaultValue: 0,
  },
];
