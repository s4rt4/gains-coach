// Sample progress photos for the demo persona (AI-generated, not a real person).
// Front view only. Keyed by check-in week; add more weeks here and the gallery and compare views pick them up.
import w1Front from "@/assets/progress/week1-front.jpg";
import w12Front from "@/assets/progress/week12-front.jpg";

export const progressPhotos: Partial<Record<number, { front: string }>> = {
  1: { front: w1Front.src },
  12: { front: w12Front.src },
};

/** Weeks that have a photo, oldest first. */
export const photoWeeks = Object.keys(progressPhotos).map(Number).sort((a, b) => a - b);
