/**
 * In-app product walkthrough: two videos from `frontend/public/`.
 *
 * Default files (served at site root):
 *   - /walkthrough-1.mp4
 *   - /walkthrough-2.mp4
 *
 * Override with `VITE_WALKTHROUGH_VIDEO_1_URL` and `VITE_WALKTHROUGH_VIDEO_2_URL` in `frontend/.env`
 * (full path or same-origin URL, e.g. /my-tour.webm).
 */

import { publicAsset } from "../utils/publicAsset.js";

export function getWalkthroughVideos() {
  return [
    {
      id: "1",
      title: "Part 1 — Getting started",
      description: "Orientation: workspace layout, navigation, and where to find key tools.",
      src: import.meta.env.VITE_WALKTHROUGH_VIDEO_1_URL || publicAsset("walkthrough-1.mp4"),
    },
    {
      id: "2",
      title: "Part 2 — Core workflows",
      description: "Documents, search, and the assistant in a typical review flow.",
      src: import.meta.env.VITE_WALKTHROUGH_VIDEO_2_URL || publicAsset("walkthrough-2.mp4"),
    },
  ];
}
