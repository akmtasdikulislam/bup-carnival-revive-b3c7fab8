import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUsers,
  IconUser,
  IconClipboardCheck,
  IconCreditCard,
  IconCamera,
  IconArrowLeft,
  IconArrowRight,
  IconBulb,
  IconCheck,
  IconReceipt2,
} from "@tabler/icons-react";
import { BD_INSTITUTIONS } from "@/data/institutions";
import { initSslczSession } from "@/lib/sslcommerz.functions";

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
  role: string;
  tshirt: string;
};

type Project = {
  title: string;
  pitch: string;
  problem: string;
  stack: string;
};

const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];
const YEAR_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "Graduate"];
const ROLE_OPTIONS = [
  "Team Lead",
  "Frontend",
  "Backend",
  "Full-stack",
  "Mobile",
  "AI / ML",
  "Designer",
  "Product / PM",
  "Other",
];
const FEE_PER_PERSON = 500;

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
  role: "",
  tshirt: "",
});

const emptyProject = (): Project => ({ title: "", pitch: "", problem: "", stack: "" });

const STEPS = [
  { id: 1, label: "Team", Icon: IconUsers },
  { id: 2, label: "Members", Icon: IconUser },
  { id: 3, label: "Project", Icon: IconBulb },
  { id: 4, label: "Review", Icon: IconClipboardCheck },
  { id: 5, label: "Payment", Icon: IconCreditCard },
] as const;

/* ============================================================
 * Component
 * ============================================================ */

export function HackathonRegistration() {
  const [teamSize, setTeamSize] = useState<number | null>(null);
  const fee = FEE_PER_PERSON * (teamSize ?? 0);

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

  // Members / Project
  const [members, setMembers] = useState<Member[]>([]);
  const [project, setProject] = useState<Project>(() => emptyProject());

  // Agreements
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreeInfo, setAgreeInfo] = useState(false);
  const [agreeMedia, setAgreeMedia] = useState(false);

  // Payment
  const [payMethod, setPayMethod] = useState<"bkash" | "nagad" | "card">("bkash");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const teamCodeRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const status = p.get("payment");
    if (!status) return;
    if (status === "success") {
      teamCodeRef.current = p.get("tran_id") || "HACK-CONFIRMED";
      setDone(true);
      setStep(5);
    }
    const url = window.location.pathname + window.location.hash;
    window.history.replaceState(null, "", url);
  }, []);

  function chooseTeamSize(n: number) {
    setTeamSize(n);
    setMembers(Array.from({ length: n }, () => emptyMember()));
    setStep(1);
  }

  const setMember = (i: number, patch: Partial<Member>) =>
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  function onInstitutionInput(v: string) {
    const prevInst = institution;
    setInstitution(v);
    setMembers((prev) =>
      prev.map((m) =>
        m.institution === "" || m.institution === prevInst ? { ...m, institution: v } : m,
      ),
    );
    const q = v.trim().toLowerCase();
    if (q.length < 2) return setInstSuggest([]);
    setInstSuggest(BD_INSTITUTIONS.filter((i) => i.toLowerCase().includes(q)).slice(0, 6));
  }

  function pickInstitution(v: string) {
    const prevInst = institution;
    setMembers((prev) =>
      prev.map((m) =>
        m.institution === "" || m.institution === prevInst ? { ...m, institution: v } : m,
      ),
    );
    setInstitution(v);
    setInstSuggest([]);
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
      if (!m.role) e[p + "role"] = "Select role";
      if (!m.tshirt) e[p + "tshirt"] = "Select size";
    });

    if (!project.title.trim()) e["p.title"] = "Working title required";
    if (project.pitch.trim().length < 40) e["p.pitch"] = "Give at least a short paragraph (40+ chars)";
    if (project.problem.trim().length < 20) e["p.problem"] = "Describe the problem (20+ chars)";
    if (!project.stack.trim()) e["p.stack"] = "List your tech stack";

    return e;
  }, [teamName, institution, leaderEmail, leaderPhone, members, project]);

  const stepKeys = (s: number): string[] => {
    if (s === 1) return ["teamName", "institution", "leaderEmail", "leaderPhone"];
    if (s === 2)
      return members.flatMap((_, i) =>
        ["photo", "fullName", "email", "phone", "institution", "department", "year", "role", "tshirt"].map(
          (k) => `m${i}.${k}`,
        ),
      );
    if (s === 3) return ["p.title", "p.pitch", "p.problem", "p.stack"];
    return [];
  };

  const stepHasErrors = (s: number) => stepKeys(s).some((k) => errors[k]);
  const err = (k: string) => (touched[k] ? errors[k] : undefined);

  function next() {
    if (stepHasErrors(step)) {
      touchAll(stepKeys(step));
      return;
    }
    if (step === 4 && !(agreeRules && agreeInfo && agreeMedia)) return;
    setStep((s) => Math.min(5, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  const [payError, setPayError] = useState<string | null>(null);

  async function handlePay() {
    setSubmitting(true);
    setPayError(null);
    const localCode = "HACK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    teamCodeRef.current = localCode;
    try {
      const key = "bcc_registrations_pending";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({
        id: localCode,
        event: "hackathon",
        teamName,
        institution,
        leaderEmail,
        leaderPhone,
        members,
        project,
        payMethod,
        fee: fee,
        createdAt: Date.now(),
      });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      /* ignore */
    }
    try {
      const { gatewayUrl } = await initSslczSession({
        data: {
          amount: fee,
          teamName,
          institution,
          leaderEmail,
          leaderPhone: "+880" + digits(leaderPhone),
          event: "hackathon",
        },
      });
      window.location.href = gatewayUrl;
    } catch (e) {
      setSubmitting(false);
      setPayError(e instanceof Error ? e.message : "Payment initiation failed");
    }
  }

  if (teamSize === null && !done) {
    return <TeamSizeChooser onPick={chooseTeamSize} />;
  }

  const size = teamSize ?? 1;

  return (
    <div className="wiz-wrap">
      <div>
        <StepBar step={step} />
        <div className="wiz-card">
          <FeeBanner feePerPerson={FEE_PER_PERSON} teamSize={size} total={fee} />
          <AnimatePresence mode="wait">
            {done ? (
              <SuccessPanel key="done" code={teamCodeRef.current} teamName={teamName} />
            ) : step === 1 ? (
              <StepTeam
                key="s1"
                teamSize={size}
                onChangeTeamSize={() => setTeamSize(null)}
                teamName={teamName}
                setTeamName={setTeamName}
                institution={institution}
                onInstitutionInput={onInstitutionInput}
                instSuggest={instSuggest}
                setInstSuggest={setInstSuggest}
                pickInstitution={pickInstitution}
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
              <StepProject
                key="s3"
                project={project}
                setProject={(patch) => setProject((p) => ({ ...p, ...patch }))}
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
                project={project}
                agreeRules={agreeRules}
                setAgreeRules={setAgreeRules}
                agreeInfo={agreeInfo}
                setAgreeInfo={setAgreeInfo}
                agreeMedia={agreeMedia}
                setAgreeMedia={setAgreeMedia}
              />
            ) : (
              <StepPayment
                key="s5"
                payMethod={payMethod}
                setPayMethod={setPayMethod}
                submitting={submitting}
                onPay={handlePay}
                fee={fee}
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
                <button
                  type="button"
                  className="wiz-btn primary"
                  onClick={next}
                  disabled={step === 4 && !(agreeRules && agreeInfo && agreeMedia)}
                >
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
                  {submitting ? "Processing…" : `Pay ৳${fee}`}
                  <IconCreditCard size={14} />
                </button>
              )}
            </div>
          )}
          {payError && (
            <p style={{ color: "var(--coral)", fontSize: 13, marginTop: 12 }}>
              Payment error: {payError}
            </p>
          )}
        </div>

        <div className="wiz-side-notes">
          <div className="wiz-note-box">
            <h6>Secure checkout</h6>
            <p>
              Payment gateway integrates on submit — bKash, Nagad, cards. No card data ever
              touches our servers.
            </p>
          </div>
          <div className="wiz-note-box">
            <h6>Need help?</h6>
            <p>
              Email <a href="mailto:hackathon@bupcsecarnival.dev">hackathon@bupcsecarnival.dev</a> or
              reach the ops desk on the segment page.
            </p>
          </div>
        </div>
      </div>

      <SummaryAside
        teamName={teamName}
        institution={institution}
        members={members}
        project={project}
        fee={fee}
      />
    </div>
  );
}

/* ============================================================
 * Step bar
 * ============================================================ */

function StepBar({ step }: { step: number }) {
  const total = STEPS.length;
  const currentIdx = Math.min(step, total);
  const progress = ((currentIdx - 1) / (total - 1)) * 100;
  return (
    <div className="wiz-stepbar" role="list" aria-label="Registration steps">
      <div className="wiz-stepbar-track" aria-hidden>
        <div className="wiz-stepbar-fill" style={{ width: `${progress}%` }} />
      </div>
      {STEPS.map((s) => {
        const state = step > s.id ? "done" : step === s.id ? "current" : "";
        return (
          <div
            key={s.id}
            className={`wiz-step ${state}`}
            role="listitem"
            aria-current={step === s.id ? "step" : undefined}
          >
            <span className="wiz-step-node">
              {step > s.id ? <IconCheck size={14} strokeWidth={3} /> : <s.Icon size={14} />}
            </span>
            <span className="wiz-step-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function FeeBanner({
  feePerPerson,
  teamSize,
  total,
}: {
  feePerPerson: number;
  teamSize: number;
  total: number;
}) {
  return (
    <div className="wiz-fee-banner" role="note">
      <span className="wiz-fee-banner-icon" aria-hidden>
        <IconReceipt2 size={18} />
      </span>
      <div className="wiz-fee-banner-body">
        <span className="wiz-fee-banner-label">Registration fee</span>
        <span className="wiz-fee-banner-value">
          ৳{feePerPerson} <em>/person</em> · Team of {teamSize} · <strong>৳{total} total</strong>
        </span>
      </div>
      <span className="wiz-fee-banner-hint">Paid at checkout</span>
    </div>
  );
}

/* ============================================================
 * Shared helpers
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
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB.");
      e.target.value = "";
      return;
    }
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
          <span className="wiz-photo-hint">JPG / PNG · square · max 2 MB · min 400×400 px</span>
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
  teamSize: number;
  onChangeTeamSize: () => void;
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
    teamSize,
    onChangeTeamSize,
    teamName,
    setTeamName,
    institution,
    onInstitutionInput,
    instSuggest,
    setInstSuggest,
    pickInstitution,
    leaderEmail,
    setLeaderEmail,
    leaderPhone,
    setLeaderPhone,
    err,
    touch,
  } = props;

  const isSolo = teamSize === 1;

  return (
    <motion.div {...fadeMotion()}>
      <h3>{isSolo ? "Solo builder details" : "Team details"}</h3>
      <p className="wiz-card-sub">
        {isSolo
          ? "Register as a solo hackathon builder."
          : `Register your hackathon squad — a team of ${teamSize} builders.`}
      </p>


      <div className="wiz-grid cols-2">
        <Field label="Team name" error={err("teamName")}>
          <input
            type="text"
            placeholder="e.g. Kernel Panic"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onBlur={() => touch("teamName")}
          />
        </Field>

        <div
          className={`wiz-field ${err("institution") ? "err" : ""}`}
          style={{ position: "relative" }}
        >
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

      <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span className="wiz-badge">
          {isSolo ? "Solo builder" : `Team of ${teamSize}`}
        </span>
        <button
          type="button"
          onClick={onChangeTeamSize}
          className="wiz-btn ghost"
          style={{ padding: "6px 14px", fontSize: 10 }}
        >
          Change
        </button>
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
  const count = members.length;
  return (
    <motion.div {...fadeMotion()}>
      <h3>{count === 1 ? "Your details" : "Team members"}</h3>
      <p className="wiz-card-sub">
        {count === 1 ? "Fill in your builder profile." : `Fill in details for all ${count} builders.`}
      </p>

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
                    <option key={y} value={y}>
                      {y} year
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Role on team" error={err(p + "role")}>
                <select
                  value={m.role}
                  onChange={(e) => setMember(i, { role: e.target.value })}
                  onBlur={() => touch(p + "role")}
                >
                  <option value="">Select role</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
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
                    <option key={s} value={s}>
                      {s}
                    </option>
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
 * Step 3 – Project idea
 * ============================================================ */

function StepProject({
  project,
  setProject,
  err,
  touch,
}: {
  project: Project;
  setProject: (patch: Partial<Project>) => void;
  err: (k: string) => string | undefined;
  touch: (k: string) => void;
}) {
  return (
    <motion.div {...fadeMotion()}>
      <h3>Project idea</h3>
      <p className="wiz-card-sub">
        A rough direction is fine — you can iterate during the 24 hours. Judges use this to route
        mentors your way.
      </p>

      <div className="wiz-member-card">
        <div className="wiz-grid" style={{ marginBottom: 14 }}>
          <Field label="Working title" error={err("p.title")}>
            <input
              type="text"
              placeholder="e.g. GreenRoute — city routing that prices carbon"
              value={project.title}
              onChange={(e) => setProject({ title: e.target.value })}
              onBlur={() => touch("p.title")}
            />
          </Field>
        </div>

        <div className="wiz-grid" style={{ marginBottom: 14 }}>
          <Field label="One-paragraph pitch" error={err("p.pitch")}>
            <textarea
              rows={4}
              placeholder="What are you building, for whom, and why is it interesting?"
              value={project.pitch}
              onChange={(e) => setProject({ pitch: e.target.value })}
              onBlur={() => touch("p.pitch")}
            />
          </Field>
        </div>

        <div className="wiz-grid" style={{ marginBottom: 14 }}>
          <Field label="Problem statement" error={err("p.problem")}>
            <textarea
              rows={3}
              placeholder="What specific pain point are you tackling?"
              value={project.problem}
              onChange={(e) => setProject({ problem: e.target.value })}
              onBlur={() => touch("p.problem")}
            />
          </Field>
        </div>

        <div className="wiz-grid">
          <Field label="Tech stack" error={err("p.stack")}>
            <input
              type="text"
              placeholder="e.g. React, FastAPI, Postgres, OpenAI"
              value={project.stack}
              onChange={(e) => setProject({ stack: e.target.value })}
              onBlur={() => touch("p.stack")}
            />
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
  project,
  agreeRules,
  setAgreeRules,
  agreeInfo,
  setAgreeInfo,
  agreeMedia,
  setAgreeMedia,
}: {
  teamName: string;
  institution: string;
  leaderEmail: string;
  leaderPhone: string;
  members: Member[];
  project: Project;
  agreeRules: boolean;
  setAgreeRules: (v: boolean) => void;
  agreeInfo: boolean;
  setAgreeInfo: (v: boolean) => void;
  agreeMedia: boolean;
  setAgreeMedia: (v: boolean) => void;
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
          <div className="wiz-review-photo-row">
            <div
              className="wiz-review-photo"
              style={m.photo ? { backgroundImage: `url(${m.photo})` } : undefined}
              aria-label={`${m.fullName || "member"} photo`}
            >
              {!m.photo && <IconCamera size={20} />}
            </div>
            <dl className="wiz-review-grid" style={{ flex: 1 }}>
              <dt>Full name</dt><dd>{m.fullName || "—"}</dd>
              <dt>Email</dt><dd>{m.email || "—"}</dd>
              <dt>Phone</dt><dd>{m.phone ? `+880 ${m.phone}` : "—"}</dd>
              <dt>Institution</dt><dd>{m.institution || "—"}</dd>
              <dt>Department</dt><dd>{m.department || "—"}</dd>
              <dt>Year</dt><dd>{m.year || "—"}</dd>
              <dt>Role</dt><dd>{m.role || "—"}</dd>
              <dt>T-shirt</dt><dd>{m.tshirt || "—"}</dd>
            </dl>
          </div>
        </div>
      ))}

      <div className="wiz-review-block">
        <h5>// project</h5>
        <dl className="wiz-review-grid">
          <dt>Title</dt><dd>{project.title || "—"}</dd>
          <dt>Pitch</dt><dd>{project.pitch || "—"}</dd>
          <dt>Problem</dt><dd>{project.problem || "—"}</dd>
          <dt>Stack</dt><dd>{project.stack || "—"}</dd>
        </dl>
      </div>

      <div className="wiz-agreements">
        <label className="wiz-agree">
          <input
            type="checkbox"
            checked={agreeRules}
            onChange={(e) => setAgreeRules(e.target.checked)}
          />
          <span>
            I confirm all team members agree to the <strong>hackathon rules &amp; code of conduct</strong>,
            including originality of work and organizer decisions being final.
          </span>
        </label>
        <label className="wiz-agree">
          <input
            type="checkbox"
            checked={agreeInfo}
            onChange={(e) => setAgreeInfo(e.target.checked)}
          />
          <span>
            All information provided is accurate. I understand false details may lead to
            <strong> disqualification</strong> without refund.
          </span>
        </label>
        <label className="wiz-agree">
          <input
            type="checkbox"
            checked={agreeMedia}
            onChange={(e) => setAgreeMedia(e.target.checked)}
          />
          <span>
            I consent to photos/videos captured during the event being used for
            <strong> promotional purposes</strong> by BUP CSE Society.
          </span>
        </label>
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
  fee,
}: {
  payMethod: "bkash" | "nagad" | "card";
  setPayMethod: (v: "bkash" | "nagad" | "card") => void;
  submitting: boolean;
  onPay: () => void;
  fee: number;
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
          <dt>Registration fee</dt><dd>৳{fee}</dd>
          <dt>Method</dt><dd style={{ textTransform: "capitalize" }}>{payMethod}</dd>
          <dt>Total due</dt><dd style={{ color: "var(--gold)", fontWeight: 700 }}>৳{fee}</dd>
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
      <p>
        Payment received.{" "}
        <strong style={{ color: "var(--text)" }}>{teamName}</strong> is officially in the Hackathon.
      </p>
      <div className="wiz-team-code">{code}</div>
      <p>Save this team code — you'll need it for kickoff check-in.</p>
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
  project,
  fee,
}: {
  teamName: string;
  institution: string;
  members: Member[];
  project: Project;
  fee: number;
}) {
  const filledMembers = members.filter((m) => m.fullName.trim()).length;
  const [previewSize, setPreviewSize] = useState<string>("M");
  return (
    <div className="wiz-aside-col">
      <aside className="wiz-aside">
        <h4>// order summary</h4>
        <div className="wiz-aside-row"><span>Event</span><span>Hackathon 2026</span></div>
        <div className="wiz-aside-row"><span>Team</span><span>{teamName || "—"}</span></div>
        <div className="wiz-aside-row">
          <span>Institution</span>
          <span style={{ textAlign: "right", maxWidth: 180 }}>{institution || "—"}</span>
        </div>
        <div className="wiz-aside-row"><span>Members</span><span>{filledMembers}/{members.length}</span></div>
        <div className="wiz-aside-row">
          <span>Project</span>
          <span style={{ textAlign: "right", maxWidth: 180 }}>
            {project.title ? project.title : "—"}
          </span>
        </div>
        <div className="wiz-aside-row"><span>Format</span><span>24-hour sprint</span></div>
        <div className="wiz-aside-total">
          <span>Total</span>
          <strong>৳{fee}</strong>
        </div>
      </aside>

      <aside className="wiz-aside wiz-aside-size">
        <SizeChart size={previewSize} onSize={setPreviewSize} />
      </aside>
    </div>
  );
}

/* ============================================================
 * Size chart
 * ============================================================ */

const SIZE_SPECS: Record<string, { chest: string; length: string }> = {
  S:   { chest: '38" / 96 cm',  length: '27" / 68 cm' },
  M:   { chest: '40" / 102 cm', length: '28" / 71 cm' },
  L:   { chest: '42" / 107 cm', length: '29" / 74 cm' },
  XL:  { chest: '44" / 112 cm', length: '30" / 76 cm' },
  XXL: { chest: '46" / 117 cm', length: '31" / 79 cm' },
};

function SizeChart({ size, onSize }: { size: string; onSize: (s: string) => void }) {
  const spec = SIZE_SPECS[size] ?? SIZE_SPECS.M;
  return (
    <div className="wiz-size-chart">
      <div className="wiz-size-head">
        <span>// size chart</span>
        <span className="wiz-size-tag">UNISEX · FLAT</span>
      </div>
      <div className="wiz-size-preview" aria-hidden>
        <svg viewBox="0 0 220 180" width="100%" height="150" fill="none">
          <path
            d="M70 22 L52 34 L22 52 L34 76 L58 64 L58 158 L162 158 L162 64 L186 76 L198 52 L168 34 L150 22 C144 36 132 44 110 44 C88 44 76 36 70 22 Z"
            stroke="var(--gold)"
            strokeWidth="1.6"
            fill="rgba(242,183,5,0.05)"
            strokeLinejoin="round"
          />
          <line x1="58" y1="88" x2="162" y2="88" stroke="var(--mint)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          <text x="110" y="83" textAnchor="middle" fill="var(--mint)" fontSize="9" fontFamily="var(--fm)" fontWeight="700">
            chest {spec.chest}
          </text>
          <line x1="172" y1="64" x2="172" y2="158" stroke="var(--mint)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          <text x="178" y="115" fill="var(--mint)" fontSize="9" fontFamily="var(--fm)" fontWeight="700" transform="rotate(90 178 115)" textAnchor="middle">
            len {spec.length}
          </text>
          <text x="110" y="115" textAnchor="middle" fill="var(--gold)" fontSize="28" fontFamily="var(--fm)" fontWeight="800" opacity="0.85">
            {size}
          </text>
        </svg>
      </div>
      <div className="wiz-size-pills" role="radiogroup" aria-label="Preview t-shirt size">
        {TSHIRT_SIZES.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={size === s}
            className={`wiz-size-pill ${size === s ? "active" : ""}`}
            onClick={() => onSize(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="wiz-size-specs">
        <div><span>Chest</span><strong>{spec.chest}</strong></div>
        <div><span>Length</span><strong>{spec.length}</strong></div>
      </div>
      <p className="wiz-size-hint">
        Tap a size to preview. Between two? Pick the larger for a relaxed fit. 180 GSM combed cotton.
      </p>
    </div>
  );
}

/* ============================================================
 * Team size chooser (gate step)
 * ============================================================ */

function TeamSizeChooser({ onPick }: { onPick: (n: number) => void }) {
  const options = [
    { n: 1, title: "Solo builder", desc: "Ship it alone — one hacker, one machine.", tag: "Just me" },
    { n: 2, title: "Duo", desc: "Two-person team. Pair-programming energy.", tag: "2 members" },
    { n: 3, title: "Trio", desc: "Balanced squad for full-stack builds.", tag: "3 members" },
    { n: 4, title: "Full squad", desc: "Maximum team size — go all in.", tag: "4 members" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="wiz-card"
      style={{ maxWidth: 780, margin: "0 auto" }}
    >
      <h3>How are you joining?</h3>
      <p className="wiz-card-sub">
        Hackathon teams can be 1 to 4 builders. Pick your setup — you can change this later.
      </p>
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginTop: 8,
        }}
      >
        {options.map((o) => (
          <button
            key={o.n}
            type="button"
            onClick={() => onPick(o.n)}
            className="wiz-pay-method"
            style={{ alignItems: "flex-start" }}
          >
            <span className="wiz-badge" style={{ marginBottom: 8 }}>{o.tag}</span>
            <strong style={{ fontSize: 16 }}>{o.title}</strong>
            <span style={{ marginTop: 4 }}>{o.desc}</span>
            <span
              style={{
                marginTop: 10,
                fontFamily: "var(--fm)",
                color: "var(--gold)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              ৳{FEE_PER_PERSON * o.n} total
            </span>
          </button>
        ))}
      </div>
      <p className="wiz-card-sub" style={{ marginTop: 18, marginBottom: 0, fontSize: 12 }}>
        Registration fee is ৳{FEE_PER_PERSON} per person, paid at checkout.
      </p>
    </motion.div>
  );
}
