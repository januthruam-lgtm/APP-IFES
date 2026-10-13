import React from "react";
import { SplashScreen, SplashScreenProps } from "./SplashScreen";

export interface Splash3DIntroProps {
  onComplete: () => void;
  autoCloseDelay?: number;
}

export const Splash3DIntro: React.FC<Splash3DIntroProps> = ({ onComplete }) => {
  return <SplashScreen onComplete={onComplete} />;
};

export { SplashScreen };
export default SplashScreen;
