## Goal

Port the existing multi-page BUP Carnival site (raw HTML/CSS/JS at github.com/akmtasdikulislam/bup-carnival) into this project as a React application, preserving the original design and functionality.

## Stack mapping

Your requested stack maps to what's already scaffolded here:

- Vite + React 19 (already present, via TanStack Start on Vite 7)
- TailwindCSS v4 (already present in `src/styles.css`)
- Routing: React Router DOM (Latest version)
- Added libraries: `@tabler/icons-react`, `react-flip-clock-countdown`, `react-hook-form`, `prismjs`, `axios`

## Pages ported (one route per original HTML)

- `/` ← index.html (home, countdown, hero, events, sponsors, etc.)
- `/ctf` ← ctf.html
- `/hackathon` ← hackathon.html
- `/iupc` ← iupc.html
- `/faq` ← faq.html
- `/gallery` ← gallery.html
  &nbsp;
  I don't need admin portal right now. On the home page, I don't need the live stats.  
    
  I want to use the logo of sponsors using [logo.dev](http://logo.dev) api. Here's the sponsor list:  
  1. Robi — [robi.com.bd](http://robi.com.bd)
  2. Airtel — [bd.airtel.com](http://bd.airtel.com)
  3. Banglalink — [banglalink.net](http://banglalink.net)
  4. Teletalk — [teletalk.com.bd](http://teletalk.com.bd)
  5. Ryze — [ryze.live](http://ryze.live)
  6. Skitto — [skitto.com](http://skitto.com)
  7. Grameenphone — [grameenphone.com](http://grameenphone.com)
  8. Bkash — [bkash.com](http://bkash.com)
  9. Nagad — [nagad.com.bd](http://nagad.com.bd)
  11. DBBL — [dutchbanglabank.com](http://dutchbanglabank.com)
  12. Trust Bank PLC — [tblbd.com](http://tblbd.com)
  13. UCB Bank PLC — [ucb.com.bd](http://ucb.com.bd)
  14. Jamuna Bank PLC — [jamunabankbd.com](http://jamunabankbd.com)
  15. Walton — [waltonbd.com](http://waltonbd.com)
  16. Singer — [singerbd.com](http://singerbd.com)
  17. HP — [hp.com](http://hp.com)
  18. GigaByte — [gigabyte.com](http://gigabyte.com)
  19. Samsung — [samsung.com](http://samsung.com)
  20. Xiaomi — [mi.com](http://mi.com)
  21. Honor — [hihonor.com](http://hihonor.com)
  22. Oppo — [oppo.com](http://oppo.com)
  23. Vivo — [vivo.com](http://vivo.com)
  24. LG — [lg.com](http://lg.com)
  25. HAVIT — [havitsmart.com](http://havitsmart.com)
  26. DELL — [dell.com](http://dell.com)
  27. Prothom Alo — [prothomalo.com](http://prothomalo.com)
  28. Kaler Kontho — [kalerkantho.com](http://kalerkantho.com)
  29. TPLink — [tp-link.com](http://tp-link.com)
  30. DLink — [dlink.com](http://dlink.com)  
    
  Here's the landing page plan:  
  1. Landing Page — Section
  1. NavBar
  2. Hero
  3. Sponsorship Marquee
  4. Segment Showcase
  5. Event Timeline
  6. Earlier Events
  7. Gallery
  8. Sponsor Showcase
  9. Support
  - Footer

I don't want the NavBar to pull down and get pill shape on scroll down Rather keep it full width sticky navbar.

## What gets carried over verbatim

- The full `style.css` (8,435 lines) will be preserved and imported globally so the original look is unchanged. Tailwind is available on top for any new component work but existing classes and IDs from the HTML keep their styling.
- Static assets (favicon, robots.txt) copied to `public/`.
- Data module (`data.js`, `institutions.js`) ported to `src/data/`.
- `qr-lite.js` (1,265 lines) kept as-is and dynamically imported on pages that use QR features.
- `common.js` behavior (nav, theme, shared helpers) becomes a shared React layout + hooks.
- Page scripts (`home.js`, `ctf.js`, `hackathon.js`, `iupc.js`, `faq.js`, `gallery.js`, `status.js`, `admin.js`, `register.js`, `site-features.js`) ported into their respective React route components, using `useEffect` for DOM lifecycle bits.

## Library integrations

- `react-flip-clock-countdown` replaces the hand-rolled countdown on the home page.
- `react-hook-form` powers the registration form (previously in `register.js`).
- `axios` used for any HTTP calls previously done with `fetch`.
- `prismjs` used for code blocks (CTF/hackathon writeups if any).
- `@tabler/icons-react` replaces inline SVG/emoji icons in the nav, footer, and cards.

## Not included

- `secure_server.py` (Python backend) — not portable to this stack. If the site needs a backend, we can wire equivalent endpoints as TanStack server functions in a follow-up.
- Any pixel-level differences introduced by React's rendering model (e.g. hydration for interactive widgets) will be smoothed out but not re-audited pixel-by-pixel against the live site.

## Order of work

1. Install dependencies (`@tabler/icons-react`, `react-flip-clock-countdown`, `react-hook-form`, `prismjs`, `axios`).
2. Copy `style.css` and static assets into the project; import globally.
3. Port `data.js` / `institutions.js` to `src/data/`.
4. Build shared `Layout` (nav + footer) from `common.js` + repeated HTML markup.
5. Create routes for each page and port the corresponding page script.
6. Wire countdown, registration form.
7. Update root `head()` with real site metadata + per-route heads.
8. Add sitemap.xml + robots.txt.

## Heads-up on scope

This is a large port (~14K lines of source across 20+ files). I'll do it in one build pass and it will land as a working React app matching the original design and features, but expect small visual/behavioral polish to be needed after you review the preview. Confirm and I'll proceed.