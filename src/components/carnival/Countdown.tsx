import { useEffect, useState } from "react";

const TARGET = new Date("2026-08-01T09:00:00+06:00").getTime();

function pad(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

export function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, TARGET - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff / 3_600_000) % 24);
  const m = Math.floor((diff / 60_000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return (
    <div className="countdown">
      <div className="cd-unit">
        <span className="cd-num">{pad(d)}</span>
        <span className="cd-label">days</span>
      </div>
      <div className="cd-sep">:</div>
      <div className="cd-unit">
        <span className="cd-num">{pad(h)}</span>
        <span className="cd-label">hrs</span>
      </div>
      <div className="cd-sep">:</div>
      <div className="cd-unit">
        <span className="cd-num">{pad(m)}</span>
        <span className="cd-label">min</span>
      </div>
      <div className="cd-sep">:</div>
      <div className="cd-unit">
        <span className="cd-num">{pad(s)}</span>
        <span className="cd-label">sec</span>
      </div>
    </div>
  );
}
