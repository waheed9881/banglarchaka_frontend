import type { WheelEvent } from 'react';

/** Prevents mouse wheel from nudging focused <input type="number"> values while scrolling. */
export function preventWheelChangeNumber(e: WheelEvent<HTMLInputElement>) {
  if (document.activeElement === e.currentTarget) e.preventDefault();
}
