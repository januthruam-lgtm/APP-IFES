import { PuppetRigConfig } from "../types";

export const DEFAULT_PUPPET_CONFIG: PuppetRigConfig = {
  bodyRoot: { x: 50, y: 70 },
  headPivot: { x: 50, y: 35 },
  leftEarPivot: { x: 35, y: 20 },
  rightEarPivot: { x: 65, y: 20 },
  leftPawPivot: { x: 30, y: 65 },
  rightPawPivot: { x: 70, y: 65 },
  swayIntensity: 1.0,
  breatheIntensity: 1.0,
  earTwitchSpeed: 1.8,
  headTiltAngle: 3.5,
  activeMotionPreset: "idle",
  rigProfile: "mammal",
};

export const MASCOT_TEMPLATES = [
  { id: "owl", name: "Coruja Byte", emoji: "🦉", type: "owl" },
  { id: "fox", name: "Raposa Spark", emoji: "🦊", type: "tiger" },
  { id: "dragon", name: "Dragão Dracarys", emoji: "🐲", type: "custom" },
  { id: "cat", name: "Gato Neko", emoji: "🐱", type: "bunny" },
  { id: "robot", name: "Robô Circuit", emoji: "🤖", type: "custom" },
];

export function getRiggingCssVariables(config: PuppetRigConfig = DEFAULT_PUPPET_CONFIG) {
  return {
    "--rig-head-x": `${config.headPivot?.x ?? 50}%`,
    "--rig-head-y": `${config.headPivot?.y ?? 35}%`,
    "--rig-body-x": `${config.bodyRoot?.x ?? 50}%`,
    "--rig-body-y": `${config.bodyRoot?.y ?? 70}%`,
  } as React.CSSProperties;
}
