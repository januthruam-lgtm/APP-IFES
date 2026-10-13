import React from "react";
import { PuppetRigConfig } from "../types";

export interface MascotTemplate {
  id: string;
  name: string;
  svgDataUri?: string;
  defaultRig: PuppetRigConfig;
  defaultEmoji: string;
}

export const DEFAULT_PUPPET_CONFIG: PuppetRigConfig = {
  bodyRoot: { x: 50, y: 70 },
  headPivot: { x: 50, y: 35 },
  leftEarPivot: { x: 35, y: 15 },
  rightEarPivot: { x: 65, y: 15 },
  leftPawPivot: { x: 25, y: 75 },
  rightPawPivot: { x: 75, y: 75 },
  swayIntensity: 1.2,
  breatheIntensity: 1.0,
  earTwitchSpeed: 2.0,
  headTiltAngle: 4.0,
  activeMotionPreset: "idle",
  rigProfile: "mammal",
};

export const MASCOT_TEMPLATES: MascotTemplate[] = [
  {
    id: "bunny",
    name: "Coelhinho Sábio",
    defaultEmoji: "🐰",
    defaultRig: DEFAULT_PUPPET_CONFIG,
  },
  {
    id: "bird",
    name: "Coruja Erudita",
    defaultEmoji: "🦉",
    defaultRig: {
      ...DEFAULT_PUPPET_CONFIG,
      rigProfile: "bird",
      earTwitchSpeed: 2.5,
      headTiltAngle: 7.0,
    },
  },
  {
    id: "elephant",
    name: "Elefante da Memória",
    defaultEmoji: "🐘",
    defaultRig: {
      ...DEFAULT_PUPPET_CONFIG,
      rigProfile: "quadruped",
      swayIntensity: 0.8,
      breatheIntensity: 1.3,
    },
  },
  {
    id: "tiger",
    name: "Tigre Focado",
    defaultEmoji: "🐯",
    defaultRig: {
      ...DEFAULT_PUPPET_CONFIG,
      rigProfile: "mammal",
      swayIntensity: 1.4,
      earTwitchSpeed: 1.5,
    },
  },
  {
    id: "custom",
    name: "Androide Tutor",
    defaultEmoji: "🤖",
    defaultRig: {
      ...DEFAULT_PUPPET_CONFIG,
      rigProfile: "robot",
      swayIntensity: 0.5,
    },
  },
];

export function getRiggingCssVariables(config: PuppetRigConfig = DEFAULT_PUPPET_CONFIG): React.CSSProperties {
  return {
    ["--body-root-x" as string]: `${config.bodyRoot.x}%`,
    ["--body-root-y" as string]: `${config.bodyRoot.y}%`,
    ["--head-pivot-x" as string]: `${config.headPivot.x}%`,
    ["--head-pivot-y" as string]: `${config.headPivot.y}%`,
    ["--left-ear-x" as string]: `${config.leftEarPivot.x}%`,
    ["--left-ear-y" as string]: `${config.leftEarPivot.y}%`,
    ["--right-ear-x" as string]: `${config.rightEarPivot.x}%`,
    ["--right-ear-y" as string]: `${config.rightEarPivot.y}%`,
    ["--sway-intensity" as string]: `${config.swayIntensity}`,
    ["--breathe-intensity" as string]: `${config.breatheIntensity}`,
    ["--ear-twitch-speed" as string]: `${config.earTwitchSpeed}s`,
    ["--head-tilt-angle" as string]: `${config.headTiltAngle}deg`,
  };
}
