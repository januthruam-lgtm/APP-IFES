import React from "react";
import { AppearanceSection } from "../settings/AppearanceSection";
import { UserProfile, CustomThemeColors } from "../../types";

interface ColorThemeTabProps {
  currentTheme?: CustomThemeColors;
  onThemeChange?: (theme: any) => void;
  user?: UserProfile;
}

export const ColorThemeTab: React.FC<ColorThemeTabProps> = ({
  currentTheme,
  onThemeChange,
  user,
}) => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm">
        <AppearanceSection
          currentTheme={currentTheme}
          onThemeChange={onThemeChange}
          user={user}
        />
      </div>
    </div>
  );
};

export default ColorThemeTab;
