// Sample progress photos for the demo persona (AI-generated, not a real person).
import w1Back from "@/assets/progress/week1-back.jpg";
import w1Front from "@/assets/progress/week1-front.jpg";
import w1Side from "@/assets/progress/week1-side.jpg";
import w12Back from "@/assets/progress/week12-back.jpg";
import w12Front from "@/assets/progress/week12-front.jpg";
import w12Side from "@/assets/progress/week12-side.jpg";

export type PhotoView = "front" | "side" | "back";

export const progressPhotos: Record<1 | 12, Record<PhotoView, string>> = {
  1: { front: w1Front.src, side: w1Side.src, back: w1Back.src },
  12: { front: w12Front.src, side: w12Side.src, back: w12Back.src },
};
