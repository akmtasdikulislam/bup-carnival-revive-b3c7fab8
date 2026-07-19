import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUsers,
  IconUser,
  IconClipboardCheck,
  IconCreditCard,
  IconCamera,
  IconArrowLeft,
  IconArrowRight,
  IconChalkboard,
} from "@tabler/icons-react";
import { BD_INSTITUTIONS } from "@/data/institutions";

/* ============================================================
 * Types
 * ============================================================ */

type Member = {
  photo: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  year: string;
  tshirt: string;
};

type Coach = {
  photo: string;
  fullName: string;
  designation: string;
  institution: string;
  department: string;
  tshirt: string;
};

const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];
const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "Graduate"];
const FEE_PER_PERSON = 500; // BDT
const TEAM_SIZE = 3;
const FEE = FEE_PER_PERSON * TEAM_SIZE;


const emailRe = /^\S+@\S+\.\S+$/;
const digits = (v: string) => v.replace(/\D/g, "");

const emptyMember = (institution = ""): Member => ({
  photo: "",
  fullName: "",
  email: "",
  phone: "",
  institution,
  department: "",
  year: "",
  tshirt: "",
});

const emptyCoach = (institution = ""): Coach => ({
  photo: "",
  fullName: "",
  designation: "",
  institution,
  department: "",
  tshirt: "",
});

const STEPS = [
  { id: 1, label: "Team", Icon: IconUsers },
  { id: 2, label: "Members", Icon: IconUser },
  { id: 3, label: "Coach", Icon: IconChalkboard },
  { id: 4, label: "Review", Icon: IconClipboardCheck },
  { id: 5, label: "Payment", Icon: IconCreditCard },
] as const;

/* ============================================================
 * Component
 * ============================================================ */

export function IupcRegistration() {
  const [step, setStep] = useState(1);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }));
  const touchAll = (keys: string[]) =>
    setTouched((t) => keys.reduce((acc, k) => ({ ...acc, [k]: true }), t));

  // Team
  const [teamName, setTeamName] = useState("");
  const [institution, setInstitution] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [instSuggest, setInstSuggest] = useState<string[]>([]);

  // Members / Coach
  const [members, setMembers] = useState<Member[]>(() =>
    Array.from({ length: TEAM_SIZE }, () => emptyMember()),
  );
  const [coach, setCoach] = useState<Coach>(() => emptyCoach());

  // Agreements
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreeInfo, setAgreeInfo] = useState(false);
  const [agreeMedia, setAgreeMedia] = useState(false);

  // Payment
  const [payMethod, setPayMethod] = useState<"bkash" | "nagad" | "card">("bkash");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const teamCodeRef = useRef<string>("");

  const setMember = (i: number, patch: Partial<Member>) =>
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  function onInstitutionInput(v: string) {
    setInstitution(v);
    // Auto-fill members that were prefilled from a previous institution value
    setMembers((prev) =>
      prev.map((m) => (m.institution === "" || m.institution === institution ? { ...m, institution: v } : m)),
    );
    setCoach((c) => (c.institution === "" || c.institution === institution ? { ...c, institution: v } : c));
    const q = v.trim().toLowerCase();
    if (q.length < 2) return setInstSuggest([]);
    setInstSuggest(BD_INSTITUTIONS.filter((i) => i.toLowerCase().includes(q)).slice(0, 6));
  }

  /* --------- validation --------- */
  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!teamName.trim()) e["teamName"] = "Team name is required";
    if (!institution.trim()) e["institution"] = "Institution is required";
    if (!emailRe.test(leaderEmail)) e["leaderEmail"] = "Enter a valid email";
    if (digits(leaderPhone).length < 10) e["leaderPhone"] = "Enter a valid phone";

    members.forEach((m, i) => {
      const p = `m${i}.`;
      if (!m.photo) e[p + "photo"] = "Photo required";
      if (!m.fullName.trim()) e[p + "fullName"] = "Full name required";
      if (!emailRe.test(m.email)) e[p + "email"] = "Valid email required";
      if (digits(m.phone).length < 10) e[p + "phone"] = "Valid phone required";
      if (!m.institution.trim()) e[p + "institution"] = "Institution required";
      if (!m.department.trim()) e[p + "department"] = "Department required";
      if (!m.year) e[p + "year"] = "Select year";
      if (!m.tshirt) e[p + "tshirt"] = "Select size";
    });

    if (!coach.photo) e["c.photo"] = "Photo required";
    if (!coach.fullName.trim()) e["c.fullName"] = "Coach name required";
    if (!coach.designation.trim()) e["c.designation"] = "Designation required";
    if (!coach.institution.trim()) e["c.institution"] = "Institution required";
    if (!coach.department.trim()) e["c.department"] = "Department required";
    if (!coach.tshirt) e["c.tshirt"] = "Select size";

    return e;
  }, [teamName, institution, leaderEmail, leaderPhone, members, coach]);

  const stepKeys = (s: number): string[] => {
    if (s === 1) return ["teamName", "institution", "leaderEmail", "leaderPhone"];
    if (s === 2)
      return members.flatMap((_, i) =>
        ["photo", "fullName", "email", "phone", "institution", "department", "year", "tshirt"].map(
          (k) => `m${i}.${k}`,
        ),
      );
    if (s === 3)
      return ["c.photo", "c.fullName", "c.designation", "c.institution", "c.department", "c.tshirt"];
    return [];
  };

  const stepHasErrors = (s: number) => stepKeys(s).some((k) => errors[k]);
  const err = (k: string) => (touched[k] ? errors[k] : undefined);

  function next() {
    if (stepHasErrors(step)) {
      touchAll(stepKeys(step));
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handlePay() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    teamCodeRef.current = "IUPC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    try {
      const key = "bcc_registrations";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({
        id: teamCodeRef.current,
        event: "iupc",
        teamName,
        institution,
        leaderEmail,
        leaderPhone,
        members,
        coach,
        payMethod,
        fee: FEE,
        createdAt: Date.now(),
      });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setSubmitting(false);
    setDone(true);
  }

  return (
    <div className="wiz-wrap">
      <div>
        <StepBar step={step} />
        <div className="wiz-card">
          <AnimatePresence mode="wait">
            {done ? (
              <SuccessPanel key="done" code={teamCodeRef.current} teamName={teamName} />
            ) : step === 1 ? (
              <StepTeam
                key="s1"
                teamName={teamName}
                setTeamName={setTeamName}
                institution={institution}
                onInstitutionInput={onInstitutionInput}
                instSuggest={instSuggest}
                setInstSuggest={setInstSuggest}
                pickInstitution={(v) => {
                  setInstitution(v);
                  setInstSuggest([]);
                  setMembers((prev) => prev.map((m) => ({ ...m, institution: m.institution || v })));
                  setCoach((c) => ({ ...c, institution: c.institution || v }));
                }}
                leaderEmail={leaderEmail}
                setLeaderEmail={setLeaderEmail}
                leaderPhone={leaderPhone}
                setLeaderPhone={setLeaderPhone}
                err={err}
                touch={touch}
              />
            ) : step === 2 ? (
              <StepMembers key="s2" members={members} setMember={setMember} err={err} touch={touch} />
            ) : step === 3 ? (
              <StepCoach
                key="s3"
                coach={coach}
                setCoach={(patch) => setCoach((c) => ({ ...c, ...patch }))}
                err={err}
                touch={touch}
              />
            ) : step === 4 ? (
              <StepReview
                key="s4"
                teamName={teamName}
                institution={institution}
                leaderEmail={leaderEmail}
                leaderPhone={leaderPhone}
                members={members}
                coach={coach}
              />
            ) : (
              <StepPayment
                key="s5"
                payMethod={payMethod}
                setPayMethod={setPayMethod}
                submitting={submitting}
                onPay={handlePay}
              />
            )}
          </AnimatePresence>

          {!done && (
            <div className="wiz-nav">
              <button
                type="button"
                className="wiz-btn ghost"
                onClick={back}
                disabled={step === 1}
              >
                <IconArrowLeft size={14} /> Back
              </button>
              {step < 5 && (
                <button type="button" className="wiz-btn primary" onClick={next}>
                  {step === 4 ? "Continue to payment" : "Continue"}
                  <IconArrowRight size={14} />
                </button>
              )}
              {step === 5 && (
                <button
                  type="button"
                  className="wiz-btn mint"
                  onClick={handlePay}
                  disabled={submitting}
                >
                  {submitting ? "Processing…" : `Pay ৳${FEE}`}
                  <IconCreditCard size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <SummaryAside
        teamName={teamName}
        institution={institution}
        members={members}
        coach={coach}
        fee={FEE}
      />
    </div>
  );
}

/* ============================================================
 * Step bar
 * ============================================================ */

function StepBar({ step }: { step: number }) {
  return (
    <div className="wiz-stepbar" role="list" aria-label="Registration steps">
      {STEPS.map((s, i) => {
        const state = step > s.id ? "done" : step === s.id ? "current" : "";
        return (
          <div key={s.id} className="wiz-step-wrap" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span className={`wiz-step ${state}`} role="listitem" aria-current={step === s.id ? "step" : undefined}>
              <span className="wiz-step-idx">{s.id}</span>
              <s.Icon size={13} />
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span className="wiz-step-sep" aria-hidden />}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Shared field helpers
 * ============================================================ */

function fadeMotion() {
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`wiz-field ${error ? "err" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <span className="wiz-err-msg">{error}</span>}
    </label>
  );
}

function PhoneInput({
  value,
  onChange,
  onBlur,
  error,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  label: string;
}) {
  return (
    <Field label={label} error={error}>
      <span className="wiz-phone">
        <span className="wiz-phone-prefix">+880</span>
        <input
          type="tel"
          placeholder="1XXXXXXXXX"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      </span>
    </Field>
  );
}

function PhotoUploader({
  value,
  onChange,
  error,
  onBlur,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
  error?: string;
  onBlur?: () => void;
}) {
  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }
  return (
    <div className={`wiz-field ${error ? "err" : ""}`}>
      <span>Photo</span>
      <div className="wiz-photo">
        <div
          className="wiz-photo-thumb"
          style={value ? { backgroundImage: `url(${value})` } : undefined}
        >
          {!value && <IconCamera size={22} />}
        </div>
        <div className="wiz-photo-actions">
          <label className="wiz-photo-btn">
            {value ? "Change" : "Upload"}
            <input type="file" accept="image/*" onChange={handleFile} onBlur={onBlur} />
          </label>
          <span className="wiz-photo-hint">JPG or PNG · square recommended</span>
        </div>
      </div>
      {error && <span className="wiz-err-msg">{error}</span>}
    </div>
  );
}

/* ============================================================
 * Step 1 – Team
 * ============================================================ */

function StepTeam(props: {
  teamName: string;
  setTeamName: (v: string) => void;
  institution: string;
  onInstitutionInput: (v: string) => void;
  instSuggest: string[];
  setInstSuggest: (v: string[]) => void;
  pickInstitution: (v: string) => void;
  leaderEmail: string;
  setLeaderEmail: (v: string) => void;
  leaderPhone: string;
  setLeaderPhone: (v: string) => void;
  err: (k: string) => string | undefined;
  touch: (k: string) => void;
}) {
  const {
    teamName, setTeamName, institution, onInstitutionInput, instSuggest, setInstSuggest,
    pickInstitution, leaderEmail, setLeaderEmail, leaderPhone, setLeaderPhone, err, touch,
  } = props;

  return (
    <motion.div {...fadeMotion()}>
      <h3>Team details</h3>
      <p className="wiz-card-sub">
        Register your IUPC squad — a fixed team of {TEAM_SIZE} students plus one coach.
      </p>

      <div className="wiz-grid cols-2">
        <Field label="Team name" error={err("teamName")}>
          <input
            type="text"
            placeholder="e.g. Binary Brigade"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onBlur={() => touch("teamName")}
          />
        </Field>

        <div className={`wiz-field ${err("institution") ? "err" : ""}`} style={{ position: "relative" }}>
          <span>University / Institution</span>
          <input
            type="text"
            placeholder="Start typing…"
            autoComplete="off"
            value={institution}
            onChange={(e) => onInstitutionInput(e.target.value)}
            onBlur={() => {
              touch("institution");
              setTimeout(() => setInstSuggest([]), 150);
            }}
          />
          {instSuggest.length > 0 && (
            <div
              role="listbox"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 20,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                marginTop: 4,
                overflow: "hidden",
              }}
            >
              {instSuggest.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickInstitution(s);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    background: "transparent",
                    border: 0,
                    color: "var(--text)",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "var(--fm)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {err("institution") && <span className="wiz-err-msg">{err("institution")}</span>}
        </div>

        <Field label="Leader email" error={err("leaderEmail")}>
          <input
            type="email"
            placeholder="leader@example.com"
            value={leaderEmail}
            onChange={(e) => setLeaderEmail(e.target.value)}
            onBlur={() => touch("leaderEmail")}
          />
        </Field>

        <PhoneInput
          label="Leader phone"
          value={leaderPhone}
          onChange={setLeaderPhone}
          onBlur={() => touch("leaderPhone")}
          error={err("leaderPhone")}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <span className="wiz-badge">Fixed team size · {TEAM_SIZE} students + 1 coach</span>
      </div>
    </motion.div>
  );
}

/* ============================================================
 * Step 2 – Members
 * ============================================================ */

function StepMembers({
  members,
  setMember,
  err,
  touch,
}: {
  members: Member[];
  setMember: (i: number, patch: Partial<Member>) => void;
  err: (k: string) => string | undefined;
  touch: (k: string) => void;
}) {
  return (
    <motion.div {...fadeMotion()}>
      <h3>Team members</h3>
      <p className="wiz-card-sub">Fill in details for all {TEAM_SIZE} contestants.</p>

      {members.map((m, i) => {
        const p = `m${i}.`;
        return (
          <div key={i} className="wiz-member-card">
            <div className="wiz-member-head">
              <strong>Member {i + 1}</strong>
              {i === 0 && <span className="wiz-badge">Team leader</span>}
            </div>

            <div className="wiz-grid cols-2" style={{ marginBottom: 14 }}>
              <PhotoUploader
                value={m.photo}
                onChange={(v) => setMember(i, { photo: v })}
                onBlur={() => touch(p + "photo")}
                error={err(p + "photo")}
              />
              <Field label="Full name" error={err(p + "fullName")}>
                <input
                  type="text"
                  value={m.fullName}
                  onChange={(e) => setMember(i, { fullName: e.target.value })}
                  onBlur={() => touch(p + "fullName")}
                />
              </Field>
            </div>

            <div className="wiz-grid cols-2">
              <Field label="Email" error={err(p + "email")}>
                <input
                  type="email"
                  value={m.email}
                  onChange={(e) => setMember(i, { email: e.target.value })}
                  onBlur={() => touch(p + "email")}
                />
              </Field>
              <PhoneInput
                label="Phone"
                value={m.phone}
                onChange={(v) => setMember(i, { phone: v })}
                onBlur={() => touch(p + "phone")}
                error={err(p + "phone")}
              />
              <Field label="University / Institution" error={err(p + "institution")}>
                <input
                  type="text"
                  value={m.institution}
                  onChange={(e) => setMember(i, { institution: e.target.value })}
                  onBlur={() => touch(p + "institution")}
                />
              </Field>
              <Field label="Department" error={err(p + "department")}>
                <input
                  type="text"
                  placeholder="e.g. CSE"
                  value={m.department}
                  onChange={(e) => setMember(i, { department: e.target.value })}
                  onBlur={() => touch(p + "department")}
                />
              </Field>
              <Field label="Year of study" error={err(p + "year")}>
                <select
                  value={m.year}
                  onChange={(e) => setMember(i, { year: e.target.value })}
                  onBlur={() => touch(p + "year")}
                >
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y} year</option>
                  ))}
                </select>
              </Field>
              <Field label="T-shirt size" error={err(p + "tshirt")}>
                <select
                  value={m.tshirt}
                  onChange={(e) => setMember(i, { tshirt: e.target.value })}
                  onBlur={() => touch(p + "tshirt")}
                >
                  <option value="">Select size</option>
                  {TSHIRT_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

/* ============================================================
 * Step 3 – Coach
 * ============================================================ */

function StepCoach({
  coach,
  setCoach,
  err,
  touch,
}: {
  coach: Coach;
  setCoach: (patch: Partial<Coach>) => void;
  err: (k: string) => string | undefined;
  touch: (k: string) => void;
}) {
  return (
    <motion.div {...fadeMotion()}>
      <h3>Team coach</h3>
      <p className="wiz-card-sub">Faculty or mentor accompanying the team on contest day.</p>

      <div className="wiz-member-card">
        <div className="wiz-grid cols-2" style={{ marginBottom: 14 }}>
          <PhotoUploader
            value={coach.photo}
            onChange={(v) => setCoach({ photo: v })}
            onBlur={() => touch("c.photo")}
            error={err("c.photo")}
          />
          <Field label="Full name" error={err("c.fullName")}>
            <input
              type="text"
              value={coach.fullName}
              onChange={(e) => setCoach({ fullName: e.target.value })}
              onBlur={() => touch("c.fullName")}
            />
          </Field>
        </div>
        <div className="wiz-grid cols-2">
          <Field label="Designation" error={err("c.designation")}>
            <input
              type="text"
              placeholder="e.g. Assistant Professor"
              value={coach.designation}
              onChange={(e) => setCoach({ designation: e.target.value })}
              onBlur={() => touch("c.designation")}
            />
          </Field>
          <Field label="University / Institution" error={err("c.institution")}>
            <input
              type="text"
              value={coach.institution}
              onChange={(e) => setCoach({ institution: e.target.value })}
              onBlur={() => touch("c.institution")}
            />
          </Field>
          <Field label="Department" error={err("c.department")}>
            <input
              type="text"
              placeholder="e.g. CSE"
              value={coach.department}
              onChange={(e) => setCoach({ department: e.target.value })}
              onBlur={() => touch("c.department")}
            />
          </Field>
          <Field label="T-shirt size" error={err("c.tshirt")}>
            <select
              value={coach.tshirt}
              onChange={(e) => setCoach({ tshirt: e.target.value })}
              onBlur={() => touch("c.tshirt")}
            >
              <option value="">Select size</option>
              {TSHIRT_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
 * Step 4 – Review
 * ============================================================ */

function StepReview({
  teamName,
  institution,
  leaderEmail,
  leaderPhone,
  members,
  coach,
}: {
  teamName: string;
  institution: string;
  leaderEmail: string;
  leaderPhone: string;
  members: Member[];
  coach: Coach;
}) {
  return (
    <motion.div {...fadeMotion()}>
      <h3>Review &amp; confirm</h3>
      <p className="wiz-card-sub">Double-check everything before you head to payment.</p>

      <div className="wiz-review-block">
        <h5>// team</h5>
        <dl className="wiz-review-grid">
          <dt>Team name</dt><dd>{teamName || "—"}</dd>
          <dt>Institution</dt><dd>{institution || "—"}</dd>
          <dt>Leader email</dt><dd>{leaderEmail || "—"}</dd>
          <dt>Leader phone</dt><dd>{leaderPhone ? `+880 ${leaderPhone}` : "—"}</dd>
        </dl>
      </div>

      {members.map((m, i) => (
        <div key={i} className="wiz-review-block">
          <h5>// member {i + 1}{i === 0 ? " · leader" : ""}</h5>
          <dl className="wiz-review-grid">
            <dt>Full name</dt><dd>{m.fullName || "—"}</dd>
            <dt>Email</dt><dd>{m.email || "—"}</dd>
            <dt>Phone</dt><dd>{m.phone ? `+880 ${m.phone}` : "—"}</dd>
            <dt>Institution</dt><dd>{m.institution || "—"}</dd>
            <dt>Department</dt><dd>{m.department || "—"}</dd>
            <dt>Year</dt><dd>{m.year || "—"}</dd>
            <dt>T-shirt</dt><dd>{m.tshirt || "—"}</dd>
          </dl>
        </div>
      ))}

      <div className="wiz-review-block">
        <h5>// coach</h5>
        <dl className="wiz-review-grid">
          <dt>Full name</dt><dd>{coach.fullName || "—"}</dd>
          <dt>Designation</dt><dd>{coach.designation || "—"}</dd>
          <dt>Institution</dt><dd>{coach.institution || "—"}</dd>
          <dt>Department</dt><dd>{coach.department || "—"}</dd>
          <dt>T-shirt</dt><dd>{coach.tshirt || "—"}</dd>
        </dl>
      </div>
    </motion.div>
  );
}

/* ============================================================
 * Step 5 – Payment
 * ============================================================ */

function StepPayment({
  payMethod,
  setPayMethod,
  submitting,
  onPay,
}: {
  payMethod: "bkash" | "nagad" | "card";
  setPayMethod: (v: "bkash" | "nagad" | "card") => void;
  submitting: boolean;
  onPay: () => void;
}) {
  return (
    <motion.div {...fadeMotion()}>
      <h3>Payment</h3>
      <p className="wiz-card-sub">
        Choose a payment method. Registration is confirmed once payment succeeds.
      </p>

      <div className="wiz-pay-methods" role="radiogroup" aria-label="Payment method">
        {(
          [
            { id: "bkash", name: "bKash", hint: "Mobile wallet" },
            { id: "nagad", name: "Nagad", hint: "Mobile wallet" },
            { id: "card", name: "Card", hint: "Visa · Mastercard" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={payMethod === m.id}
            className={`wiz-pay-method ${payMethod === m.id ? "active" : ""}`}
            onClick={() => setPayMethod(m.id)}
          >
            <strong>{m.name}</strong>
            <span>{m.hint}</span>
          </button>
        ))}
      </div>

      <div className="wiz-review-block" style={{ marginTop: 20 }}>
        <h5>// summary</h5>
        <dl className="wiz-review-grid">
          <dt>Registration fee</dt><dd>৳{FEE}</dd>
          <dt>Method</dt><dd style={{ textTransform: "capitalize" }}>{payMethod}</dd>
          <dt>Total due</dt><dd style={{ color: "var(--gold)", fontWeight: 700 }}>৳{FEE}</dd>
        </dl>
      </div>

      <p className="wiz-card-sub" style={{ marginTop: 16, marginBottom: 0 }}>
        No card data ever touches our servers — payment happens on the gateway.
      </p>
      {submitting && <p className="wiz-card-sub">Processing your payment…</p>}
      <div style={{ display: "none" }}>{onPay.toString().length}</div>
    </motion.div>
  );
}

/* ============================================================
 * Success
 * ============================================================ */

function SuccessPanel({ code, teamName }: { code: string; teamName: string }) {
  return (
    <motion.div {...fadeMotion()} className="wiz-success">
      <div className="wiz-tick">✓</div>
      <h3>Team registered</h3>
      <p>Payment received. <strong style={{ color: "var(--text)" }}>{teamName}</strong> is officially in the IUPC.</p>
      <div className="wiz-team-code">{code}</div>
      <p>Save this team code — you'll need it for the pre-contest briefing.</p>
    </motion.div>
  );
}

/* ============================================================
 * Aside summary
 * ============================================================ */

function SummaryAside({
  teamName,
  institution,
  members,
  coach,
  fee,
}: {
  teamName: string;
  institution: string;
  members: Member[];
  coach: Coach;
  fee: number;
}) {
  const filledMembers = members.filter((m) => m.fullName.trim()).length;
  return (
    <aside className="wiz-aside">
      <h4>// order summary</h4>
      <div className="wiz-aside-row"><span>Event</span><span>IUPC 2026</span></div>
      <div className="wiz-aside-row"><span>Team</span><span>{teamName || "—"}</span></div>
      <div className="wiz-aside-row"><span>Institution</span><span style={{ textAlign: "right", maxWidth: 180 }}>{institution || "—"}</span></div>
      <div className="wiz-aside-row"><span>Members</span><span>{filledMembers}/{TEAM_SIZE}</span></div>
      <div className="wiz-aside-row"><span>Coach</span><span>{coach.fullName ? "✓" : "—"}</span></div>
      <div className="wiz-aside-row"><span>Format</span><span>ACM-ICPC</span></div>
      <div className="wiz-aside-total">
        <span>Total</span>
        <strong>৳{fee}</strong>
      </div>
    </aside>
  );
}
