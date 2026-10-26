import React from "react";
import { UserProfile, CourseTrack } from "../../../types";
import { SocraticTutorTab } from "../SocraticTutorTab";

export interface LuminaCanonicalTabProps {
  user: UserProfile;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onRewardXp?: (xp: number) => void;
  courses: CourseTrack[];
  onNavigateToGames?: (quizData?: any) => void;
}

export const LuminaCanonicalTab: React.FC<LuminaCanonicalTabProps> = (props) => {
  return (
    <div className="h-full flex flex-col">
      <SocraticTutorTab {...props} />
    </div>
  );
};
