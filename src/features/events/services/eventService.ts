import { EventMilestone, LiveEvent, UserEventParticipation } from "../types";
import { PRIMARY_LIVE_EVENT } from "../data/eventsData";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const EVENTS_PARTICIPATION_STORAGE_KEY = "brain_studio_event_participation_v3";

export function loadEventParticipation(
  eventId: string = PRIMARY_LIVE_EVENT.id,
  uid: string = "local_student"
): UserEventParticipation {
  try {
    const raw = localStorage.getItem(`${EVENTS_PARTICIPATION_STORAGE_KEY}_${eventId}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  return {
    eventId,
    uid,
    points: 180, // Pontos iniciais de progresso de boas-vindas para já ter marcos liberados!
    claimedMilestones: [1], // Marco 1 pré-resgatado
    lastUpdatedAt: Date.now(),
  };
}

export function saveEventParticipation(part: UserEventParticipation): void {
  try {
    localStorage.setItem(
      `${EVENTS_PARTICIPATION_STORAGE_KEY}_${part.eventId}`,
      JSON.stringify(part)
    );
  } catch {}

  if (db && part.uid && part.uid !== "local_student") {
    try {
      const docRef = doc(db, "participacoesEventos", `${part.eventId}_${part.uid}`);
      setDoc(docRef, part, { merge: true }).catch(() => {});
    } catch {}
  }
}

/**
 * Adiciona pontos ao evento ativo e dispara evento global para o HUD e notificações.
 */
export function addEventPoints(
  points: number,
  reason: string,
  eventId: string = PRIMARY_LIVE_EVENT.id
): UserEventParticipation {
  const current = loadEventParticipation(eventId);
  const updated: UserEventParticipation = {
    ...current,
    points: current.points + points,
    lastUpdatedAt: Date.now(),
  };

  saveEventParticipation(updated);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("brainstudio:event-points-added", {
        detail: { eventId, points, reason, newTotal: updated.points },
      })
    );
  }

  return updated;
}

/**
 * Reivindica com segurança e idempotência o marco de um evento.
 */
export function claimEventMilestone(
  step: number,
  event: LiveEvent,
  participation: UserEventParticipation
): {
  success: boolean;
  milestone?: EventMilestone;
  updatedParticipation: UserEventParticipation;
} {
  const milestone = event.milestones.find((m) => m.step === step);
  if (!milestone) {
    return { success: false, updatedParticipation: participation };
  }

  if (participation.claimedMilestones.includes(step)) {
    return { success: false, updatedParticipation: participation };
  }

  if (participation.points < milestone.pointsRequired) {
    return { success: false, updatedParticipation: participation };
  }

  const updatedParticipation: UserEventParticipation = {
    ...participation,
    claimedMilestones: [...participation.claimedMilestones, step],
    lastUpdatedAt: Date.now(),
  };

  saveEventParticipation(updatedParticipation);

  return {
    success: true,
    milestone,
    updatedParticipation,
  };
}
