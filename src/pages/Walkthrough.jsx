import React, { useId, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { getWalkthroughVideos } from "../config/walkthroughVideos.js";

export default function Walkthrough() {
  const videos = getWalkthroughVideos();
  const baseId = useId();
  const [loadError, setLoadError] = useState({});

  return (
    <ClientLayout title="Walkthrough">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Product walkthrough</h1>
          <p className="mt-2 text-sm text-slate-600">
            Short video tours to get you comfortable with Nomorae. Use the player controls; on mobile, videos may open
            full screen.
          </p>
        </div>

        <div className="space-y-10">
          {videos.map((v, idx) => {
            const err = loadError[v.id];
            return (
              <section key={v.id} className="border-b border-slate-100 pb-10 last:border-0 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#16A34A]">
                  Step {idx + 1} of {videos.length}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">{v.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{v.description}</p>
                <div className="mt-4 rounded-xl border border-slate-200 bg-black overflow-hidden shadow-lg">
                  {err ? (
                    <div className="bg-slate-900 text-slate-200 px-4 py-8 text-sm">
                      Could not load video from <span className="font-mono text-emerald-300">{v.src}</span>. Ensure the file
                      exists under <span className="font-mono">frontend/public/</span> or set the matching{" "}
                      <span className="font-mono">VITE_WALKTHROUGH_VIDEO_*</span> URL.
                    </div>
                  ) : (
                    <video
                      id={`${baseId}-vid-${v.id}`}
                      className="w-full aspect-video bg-black"
                      controls
                      playsInline
                      preload="metadata"
                      src={v.src}
                      aria-label={v.title}
                      onError={() =>
                        setLoadError((prev) => ({
                          ...prev,
                          [v.id]: true,
                        }))
                      }
                    >
                      Your browser does not support embedded video.
                    </video>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </ClientLayout>
  );
}
