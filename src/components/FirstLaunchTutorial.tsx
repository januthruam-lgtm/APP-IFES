import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Compass,
  MessageSquareCode,
  Heart,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { PetType, UserPet } from "../types";
import { Pet3DView } from "./pet3d/Pet3DView";

interface FirstLaunchTutorialProps {
  isOpen: boolean;
  onComplete: (chosenPet: UserPet) => void;
}

interface StarterPetOption {
  type: PetType;
  defaultName: string;
  emoji: string;
  badge: string;
  description: string;
  trait: string;
}

const STARTER_PETS: StarterPetOption[] = [
  {
    type: "coruja",
    defaultName: "Athena",
    emoji: "🦉",
    badge: "Sabedoria & Síntese",