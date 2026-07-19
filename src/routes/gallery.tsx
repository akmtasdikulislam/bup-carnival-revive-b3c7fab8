import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/carnival/SiteLayout";

// Placeholder gallery — original site had admin-uploaded images stored in localStorage.
const PLACEHOLDER_IMAGES = Array.from({ length: 8 }, (_, i) => ({
  id: `p${i}`,
  src: `https://picsum.photos/seed/bupcarnival-${i}/900/620`,
  caption: `Moment ${i + 1}`,
}));

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — BUP CSE Tech Carnival 2.0" },
      { name: "description", content: "Photos from BUP CSE Tech Carnival events." },
      { property: "og:title", content: "Gallery — BUP CSE Tech Carnival 2.0" },
      { property: "og:description", content: "Moments from past programming contests and CTF nights." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const [active, setActive] = useState<null | (typeof PLACEHOLDER_IMAGES)[number]>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SiteLayout>
      <section className="section" style={{ paddingTop: 150 }}>
        <div className="sec-hdr">
          <span className="sec-num">// gallery --all</span>
          <h2 className="sec-title">
            From the <em>archives</em>
          </h2>
          <p className="sec-sub">Moments from past events.</p>
        </div>
        <div id="galleryGrid" className="simple-gallery-grid">
          {PLACEHOLDER_IMAGES.map((img, i) => (
            <button
              key={img.id}
              className="simple-gallery-item"
              type="button"
              onClick={() => setActive(img)}
              aria-label={`Open photo ${i + 1}`}
            >
              <img src={img.src} alt={img.caption} loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {active && (
        <div
          id="lightbox"
          className="open"
          role="dialog"
          aria-hidden="false"
          onClick={() => setActive(null)}
        >
          <button
            id="lightboxClose"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              setActive(null);
            }}
          >
            ×
          </button>
          <img id="lightboxImg" src={active.src} alt={active.caption} />
        </div>
      )}
    </SiteLayout>
  );
}
