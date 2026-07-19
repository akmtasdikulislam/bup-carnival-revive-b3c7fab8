import { SPONSORS, sponsorLogo } from "@/data/sponsors";

export function SponsorMarquee() {
  const loop = [...SPONSORS, ...SPONSORS];
  return (
    <section className="sponsor-marquee" aria-label="Event sponsors">
      <div className="sponsor-marquee-viewport">
        <div className="sponsor-marquee-track" style={{ animation: "marquee 60s linear infinite" }}>
          {loop.map((s, i) => (
            <a
              key={`${s.name}-${i}`}
              href={`https://${s.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-marquee-item"
              title={s.name}
            >
              <img
                src={sponsorLogo(s.domain)}
                alt={`${s.name} logo`}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <span>{s.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SponsorShowcase() {
  const title = SPONSORS[0];
  const rest = SPONSORS.slice(1);
  return (
    <section className="section sponsor-showcase-section" id="sponsors">
      <div className="sec-hdr">
        <span className="sec-num">// powered.by.partners</span>
        <h2 className="sec-title">
          Sponsors &amp; <em>partners</em>
        </h2>
        <p className="sec-sub">Together, we make the carnival possible.</p>
      </div>

      <a
        className="title-sponsor-card"
        href={`https://${title.domain}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="sponsor-tier-badge">{title.tier}</span>
        <span className="title-sponsor-logo-panel">
          <img src={sponsorLogo(title.domain, 400)} alt={`${title.name} logo`} />
          <span className="title-sponsor-wordmark">{title.name}</span>
        </span>
      </a>

      <div className="co-sponsor-heading">
        <span>Co-sponsors &amp; partners</span>
        <span className="co-sponsor-line" />
      </div>

      <div className="co-sponsor-grid">
        {rest.map((s) => (
          <a
            key={s.name}
            className="co-sponsor-card"
            href={`https://${s.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            title={s.name}
          >
            <img
              src={sponsorLogo(s.domain)}
              alt={`${s.name} logo`}
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.style.display = "none";
                img.nextElementSibling?.classList.add("show");
              }}
            />
            <span className="co-sponsor-name">{s.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
