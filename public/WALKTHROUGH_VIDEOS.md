# Walkthrough videos (in-app)

Place **two** video files in this folder (`frontend/public/`) using these default names so the app can serve them at the site root:

| File | Served at |
|------|-----------|
| `walkthrough-1.mp4` | `/walkthrough-1.mp4` |
| `walkthrough-2.mp4` | `/walkthrough-2.mp4` |

Supported formats: **MP4** (H.264 + AAC) works broadly in browsers.

If your files use different names, set in `frontend/.env`:

```env
VITE_WALKTHROUGH_VIDEO_1_URL=/your-first-video.mp4
VITE_WALKTHROUGH_VIDEO_2_URL=/your-second-video.webm
```

Paths are relative to the site root (Vite `public/`). Restart the dev server after changing `.env`.

The in-app page is **Walkthrough** in the sidebar (`/walkthrough`).
