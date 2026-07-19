import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  IconBrandGithub,
  IconBell,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { to: "/iupc", label: "IUPC" },
  { to: "/ctf", label: "CTF" },
  { to: "/hackathon", label: "Hackathon" },
  { to: "/gallery", label: "Gallery" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <div className="noise" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <nav id="nav" className="nav nav-static-full">
        <Link to="/" className="nav-logo">
          <span className="dot" />
          BUP<span className="dim">_</span>CSE<span className="dim">.</span>CARNIVAL
        </Link>
        <ul className="nav-links">
          {NAV_ITEMS.map((n) => (
            <li key={n.to}>
              <Link to={n.to} className={pathname === n.to ? "active" : ""}>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <button className="announcement-nav-btn" type="button" aria-label="Notifications">
          <IconBell size={18} />
        </button>
        <Link to="/" hash="tracks" className="nav-cta">
          register →
        </Link>
      </nav>

      {children}

      <footer id="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">
              BUP<span className="dim">_</span>CSE<span className="dim">.</span>CARNIVAL
            </span>
            <span className="footer-org">Organized by BUP CSE Society</span>
          </div>
          <ul className="footer-links">
            {NAV_ITEMS.map((n) => (
              <li key={n.to}>
                <Link to={n.to}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-bottom">
          <span>© 2026 BUP CSE Tech Carnival — All rights reserved</span>
          <span className="footer-tag">
            <IconBrandGithub size={14} style={{ verticalAlign: "middle" }} /> Built with React · Tailwind · TanStack
          </span>
        </div>
      </footer>
    </>
  );
}
