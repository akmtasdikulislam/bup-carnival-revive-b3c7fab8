import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";

const TARGET = new Date("2026-08-01T09:00:00+06:00").getTime();

export function Countdown() {
  return (
    <div className="countdown">
      <FlipClockCountdown
        to={TARGET}
        labels={["DAYS", "HOURS", "MINUTES", "SECONDS"]}
        labelStyle={{
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "var(--muted, #94a3b8)",
        }}
        digitBlockStyle={{
          width: 40,
          height: 56,
          fontSize: 30,
          background: "rgba(8, 21, 54, 0.85)",
          color: "var(--gold, #f2b705)",
        }}
        dividerStyle={{ color: "rgba(255,255,255,0.08)", height: 1 }}
        separatorStyle={{ color: "var(--gold, #f2b705)", size: "4px" }}
        duration={0.5}
      />
    </div>
  );
}
