import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/carnival/SiteLayout";
import { Countdown } from "@/components/carnival/Countdown";
import { Reveal } from "@/components/carnival/Reveal";
import { SponsorMarquee, SponsorShowcase } from "@/components/carnival/Sponsors";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BUP CSE Tech Carnival 2.0" },
      {
        name: "description",
        content:
          "BUP CSE Tech Carnival 2.0 — IUPC, CTF Championship & Hackathon at Bangladesh University of Professionals.",
      },
      { property: "og:title", content: "BUP CSE Tech Carnival 2.0" },
      {
        property: "og:description",
        content: "Three tracks. One weekend. Compile your ambition.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="terminal">
          <div className="term-bar">
            <span className="term-dot r" />
            <span className="term-dot y" />
            <span className="term-dot g" />
            <span className="term-path">bup@cse-carnival:~$</span>
          </div>
          <div className="term-body">
            <p className="term-line">
              <span className="prompt">&gt;</span> booting BUP_CSE_TECH_CARNIVAL.exe ...
              <span className="cursor">▍</span>
            </p>
            <div className="hero-title-wrap">
              <p className="eyebrow">
                <span className="ping" />
                Bangladesh University of Professionals — Dept. of CSE
              </p>
              <h1 className="title">
                <span className="line1">BUP CSE</span>
                <span className="line2" data-text="TECH CARNIVAL">
                  TECH CARNIVAL
                </span>
                <span className="line3">2.0</span>
              </h1>
              <p className="tagline">
                Three tracks. One weekend. <em>Compile your ambition.</em>
              </p>
            </div>
            <div className="hero-bottom">
              <Countdown />
              <div className="hero-actions">
                <Link to="/" hash="tracks" className="btn-primary">
                  ./register --team=your_squad
                </Link>
                <Link to="/faq" className="btn-ghost">
                  cat faq.md
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPONSOR MARQUEE */}
      <SponsorMarquee />

      {/* TRACKS / SEGMENT SHOWCASE */}
      <section className="section" id="tracks">
        <div className="sec-hdr">
          <span className="sec-num">// core_tracks[3]</span>
          <h2 className="sec-title">
            Choose your <em>process</em>
          </h2>
          <p className="sec-sub">Three independent competitions, each with its own registration.</p>
        </div>

        <div
          className="track-card"
          style={{ ["--tc-bg" as any]: "#123a8c", ["--tc-fg" as any]: "#eef2ff" }}
        >
          <div className="track-info">
            <div className="track-tag">
              <span className="tc-num">01</span>
              <span className="tc-status">Registration Opens Soon</span>
            </div>
            <h3 className="track-title">IUPC</h3>
            <p className="track-desc">
              Inter-University Programming Contest — a 5-hour ICPC-style algorithmic battle. Teams of
              three take on ranked problem sets under ACM rules.
            </p>
            <ul className="track-meta">
              <li>Team size: 3</li>
              <li>Duration: 5 hrs</li>
              <li>Format: ACM-ICPC</li>
            </ul>
            <Link to="/iupc" className="track-link">
              Explore &amp; register →
            </Link>
          </div>
        </div>

        <div
          className="track-card"
          style={{ ["--tc-bg" as any]: "#f2b705", ["--tc-fg" as any]: "#092763" }}
        >
          <div className="track-info">
            <div className="track-tag">
              <span className="tc-num">02</span>
              <span className="tc-status">Registration Opens Soon</span>
            </div>
            <h3 className="track-title">
              CTF
              <br />
              Championship
            </h3>
            <p className="track-desc">
              Capture the Flag across pwn, crypto, web, reversing and forensics. Break it, decode it,
              prove it — every flag is a proof of exploit.
            </p>
            <ul className="track-meta">
              <li>Team size: 1–4</li>
              <li>Duration: 8 hrs</li>
              <li>Format: Jeopardy-style</li>
            </ul>
            <Link to="/ctf" className="track-link">
              Explore &amp; register →
            </Link>
          </div>
        </div>

        <div
          className="track-card"
          style={{ ["--tc-bg" as any]: "#073a46", ["--tc-fg" as any]: "#eef2ff" }}
        >
          <div className="track-info">
            <div className="track-tag">
              <span className="tc-num">03</span>
              <span className="tc-status">Registration Opens Soon</span>
            </div>
            <h3 className="track-title">Hackathon</h3>
            <p className="track-desc">
              24 hours to design, build and pitch something real. Teams of up to four ship a working
              prototype and defend it in front of industry judges.
            </p>
            <ul className="track-meta">
              <li>Team size: up to 4</li>
              <li>Duration: 24 hrs</li>
              <li>Format: Build &amp; pitch</li>
            </ul>
            <Link to="/hackathon" className="track-link">
              Explore &amp; register →
            </Link>
          </div>
        </div>
      </section>

      {/* EVENT TIMELINE */}
      <section className="section alt" id="timeline">
        <div className="sec-hdr">
          <span className="sec-num">// event.log</span>
          <h2 className="sec-title">
            Boot <em>sequence</em>
          </h2>
          <p className="sec-sub">The road from registration to grand finale.</p>
        </div>
        <div className="log-list">
          {[
            ["T-minus 6w", "Registration Opens", "Team formation, portal live for all 3 tracks."],
            ["T-minus 3w", "Registration Closes", "Slot confirmation & payment deadline."],
            ["T-minus 1w", "Eligible List Published", "Selected teams announced on each event page."],
            ["Day 01", "Opening Ceremony + Contest Day 1", "IUPC & CTF begin."],
            ["Day 02", "Hackathon Finale + Closing", "Demos, judging, prize distribution."],
          ].map(([t, title, desc]) => (
            <div className="log-row" key={t}>
              <span className="log-time">{t}</span>
              <span className="log-dash" />
              <span className="log-title">{title}</span>
              <span className="log-desc">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* EARLIER EVENTS / LEGACY */}
      <section className="section" id="legacy">
        <div className="sec-hdr">
          <span className="sec-num">// history --all</span>
          <h2 className="sec-title">
            Building on the <em>first carnival</em>
          </h2>
          <p className="sec-sub">
            Tech Carnival 2.0 grows out of BUP CSE's earlier programming and CTF events.
          </p>
        </div>
        <div className="legacy-grid">
          <div className="legacy-card">
            <span className="legacy-year">v1.0</span>
            <h4>BUP Tech Carnival</h4>
            <p>
              The first edition — a single-day programming contest that brought BUP's competitive
              programmers together.
            </p>
          </div>
          <div className="legacy-card">
            <span className="legacy-year">B14k_F14g</span>
            <h4>Campus CTF Nights</h4>
            <p>
              Informal capture-the-flag rounds run by the CTF community, the seed for this year's full
              CTF track.
            </p>
          </div>
          <div className="legacy-card">
            <span className="legacy-year">RunTimeTerror</span>
            <h4>Inter-Team Scrims</h4>
            <p>
              Regular practice contests among BUP's competitive programming squads, sharpening the
              talent Carnival 2.0 now showcases.
            </p>
          </div>
        </div>
      </section>

      {/* GALLERY TEASER */}
      <section className="section alt">
        <div className="sec-hdr">
          <span className="sec-num">// gallery --preview</span>
          <h2 className="sec-title">
            Moments from <em>past editions</em>
          </h2>
          <p className="sec-sub">Photos from previous programming contests and CTF nights.</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link to="/gallery" className="btn-primary">
            Open Gallery →
          </Link>
        </div>
      </section>

      {/* SPONSOR SHOWCASE */}
      <SponsorShowcase />

      {/* SUPPORT / CTA */}
      <section className="cta-section" id="register">
        <div className="cta-inner">
          <span className="eyebrow center">
            <span className="ping" />
            Seats are limited
          </span>
          <h2 className="cta-title">
            Ready to <em>push --force</em>?
          </h2>
          <p className="cta-sub">Pick your track above and lock in a slot before registration closes.</p>
          <Link to="/" hash="tracks" className="btn-primary big">
            ./choose --track
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
