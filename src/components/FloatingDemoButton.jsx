import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import BookDemoModal from "./BookDemoModal.jsx";

export default function FloatingDemoButton() {
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (!open) return undefined;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Marketing pages and header call `window.openDemoModal()` or dispatch `open-demo-modal`.
  useLayoutEffect(() => {
    function openModal() {
      setOpen(true);
    }
    window.openDemoModal = openModal;
    window.addEventListener("open-demo-modal", openModal);
    return () => {
      if (window.openDemoModal === openModal) {
        delete window.openDemoModal;
      }
      window.removeEventListener("open-demo-modal", openModal);
    };
  }, []);

  return (
    <>
      <BookDemoModal open={open} onClose={onClose} />
      <button
        type="button"
        className="fixed bottom-6 right-6 z-[150] rounded-full bg-[#16A34A] text-white shadow-lg shadow-brand-600/25 px-5 py-3 text-sm font-semibold hover:bg-[#15803D] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
        aria-label="Book a demo"
        onClick={() => setOpen(true)}
      >
        Book a demo
      </button>
    </>
  );
}

