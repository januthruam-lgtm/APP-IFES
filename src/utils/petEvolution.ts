import { UserPet, PetStageInfo } from "../types";
import { getPetDefinition } from "../features/gamificacao/petCatalog";

export function getPetStageInfo(pet?: UserPet): PetStageInfo {
  const level = pet?.level || 1;
  const def = getPetDefinition(pet?.activePetId || pet?.id);
  const baseEmoji = pet?.customSpeciesEmoji || def.emoji;

  if (level >= 30) {
    return {
      stageName: "Ancestral Lendário",
      minLevel: 30,
      perks: ["+35% Ganho de XP", "Resistência Máxima", "Aura Lendária"],
      auraColor: "#eab308",
      badge: "👑",
      avatarEmoji: baseEmoji,
      accessoryBadge: "👑",
    };
  }
  if (level >= 20) {
    return {
      stageName: "Mestre Guardião",
      minLevel: 20,
      perks: ["+25% Ganho de XP", "+10 Energia Máxima"],
      auraColor: "#a855f7",
      badge: "⚡",
      avatarEmoji: baseEmoji,
      accessoryBadge: "⚡",
    };
  }
  if (level >= 10) {
    return {
      stageName: "Jovem Erudito",
      minLevel: 10,
      perks: ["+15% Ganho de XP"],
      auraColor: "#3b82f6",
      badge: "🎓",
      avatarEmoji: baseEmoji,
      accessoryBadge: "🎓",
    };
  }

  return {
    stageName: "Filhote Acadêmico",
    minLevel: 1,
    perks: ["+5% Ganho de XP"],
    auraColor: "#22c55e",
    badge: "🐾",
    avatarEmoji: baseEmoji,
    accessoryBadge: "✨",
  };
}

export function feedPet(pet: UserPet, foodAmount: number = 10): UserPet {
  const newHunger = Math.max(0, pet.hunger - foodAmount);
  const newHappiness = Math.min(100, pet.happiness + 5);
  const currentExp = pet.experience || pet.exp || 0;
  const newExp = currentExp + 15;
  let newLevel = pet.level;

  if (newExp >= pet.level * 100) {
    newLevel += 1;
  }

  return {
    ...pet,
    hunger: newHunger,
    happiness: newHappiness,
    exp: newExp,
    experience: newExp,
    level: newLevel,
    lastFedTimestamp: new Date().toISOString(),
    lastFed: new Date().toISOString(),
  };
}
