import { useRef } from "react";

const MIN_SWIPE_DISTANCE = 48;
const MAX_VERTICAL_DRIFT = 90;

type SwipeHandlers = {
  onPrev: () => void;
  onNext: () => void;
};

export function useSwipePaging({ onPrev, onNext }: SwipeHandlers) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart(event: React.TouchEvent) {
      const touch = event.touches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
    },

    onTouchEnd(event: React.TouchEvent) {
      if (!start.current) return;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.current.x;
      const dy = touch.clientY - start.current.y;
      start.current = null;

      if (Math.abs(dx) < MIN_SWIPE_DISTANCE) return;
      if (Math.abs(dy) > MAX_VERTICAL_DRIFT) return;

      if (dx < 0) {
        onNext();
      } else {
        onPrev();
      }
    },
  };
}
