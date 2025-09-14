import { Button } from "../ui/button copy";
import { Link } from "react-router-dom";
import { Blocks, Bot, Database, FileSearch, Fingerprint, ShieldCheck, UploadCloud } from "lucide-react";
import Header from "../ui/Header.jsx";
 

export default function Index() {
  return (
    <div className="bg-white text-slate-900">
      <Header />

      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <Collaboration />
      <Dashboards />
      <Security />
      
    </div>
  );
}

function Glow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-blue-700/20 blur-3xl" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl" />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate">
      <Glow />
      <div className="container mx-auto px-4 pt-28 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-700" /> Authenticity Validator for Academia — Protecting Academic Integrity
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl">
          Stop fake certificates. Verify academic credentials instantly.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-slate-700">
          A secure web platform for employers, universities, and agencies to upload and validate academic certificates using OCR, AI anomaly detection, database cross-checking, cryptographic methods, and blockchain support.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="h-12 px-6 text-base bg-blue-700 text-white hover:bg-blue-800">
            <Link to="/upload-verification"><UploadCloud className="mr-2 h-5 w-5" /> Verify Document</Link>
          </Button>
          <Button asChild className="h-12 px-6 text-base bg-slate-100 text-slate-900 hover:bg-slate-200">
            <Link to="/admin/institutes">Institute Management</Link>
          </Button>

          
        </div>
        <div className="mt-10  flex flex-col items-center justify-center">
          <div className="text-sm pb-2 text-slate-500">Are you an institution or authority?</div>


          <div className="mt-4 sm:mt-0 sm:ml-3 flex gap-3">
          <Button asChild className="h-12 px-6 text-base bg-transparent border border-slate-300 text-slate-900 hover:bg-slate-100">
            <Link to="/institute/dashboard">Institute Panel</Link>
          </Button>
          <Button asChild className="h-12 px-6 text-base bg-transparent border border-blue-700 text-blue-700 hover:bg-blue-50">
            <Link to="/admin/dashboard">Admin Panel</Link>
          </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            "Legacy certificates",
            "ERP-generated PDFs",
            "University DBs",
            "Gov registries",
            "Cryptographic signatures",
            "Blockchain hashes",
          ].map((label) => (
            <div key={label} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Logos() {
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs uppercase tracking-wider text-slate-500">Built with trusted standards</p>
        <div className="mt-6 grid grid-cols-2 gap-6 opacity-70 sm:grid-cols-4">
          <Logo name="OCR" />
          <Logo name="AI/ML" />
          <Logo name="PKI" />
          <Logo name="Blockchain" />
        </div>
      </div>
    </section>
  );
}

function Logo({ name }) {
  return (
    <div className="flex h-16 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-900">
      {name}
    </div>
  );
}

function Features() {
  const items = [
    { icon: FileSearch, title: "OCR & metadata extraction", desc: "High-accuracy OCR parses names, dates, grades, seals, and hidden metadata." },
    { icon: Bot, title: "AI anomaly detection", desc: "Detects tampering: mismatched fonts, altered seals, inconsistent signatures, or edits." },
    { icon: Database, title: "Database cross-checks", desc: "Securely queries issuer databases and government registries to validate records." },
    { icon: Fingerprint, title: "Cryptographic verification", desc: "Validates PKI signatures and hashes to ensure document integrity and origin." },
    { icon: Blocks, title: "Blockchain support", desc: "Optional blockchain anchoring and hash lookups for immutable provenance." },
    { icon: ShieldCheck, title: "Legacy + modern support", desc: "Works with older scanned certificates and modern ERP-generated PDFs alike." },
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-4xl">Everything you need to trust credentials</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-700">
          A comprehensive pipeline combining computer vision, AI, cryptography, and registry checks.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700/10 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-700">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Upload", desc: "Employer/agency uploads PDF or image.", icon: UploadCloud },
    { title: "Extract", desc: "OCR parses text; signatures and seals detected.", icon: FileSearch },
    { title: "Validate", desc: "AI anomaly detection + database cross-checks + cryptographic checks.", icon: ShieldCheck },
    { title: "Result", desc: "Confidence score with explainable evidence and audit trail.", icon: Bot },
  ];
  return (
    <section id="how" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-4xl">How it works</h2>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ title, desc, icon: Icon }) => (
            <div key={title} className="relative rounded-xl border border-slate-200 bg-white p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-700/10 text-blue-700">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-700">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dashboards() {
  const cards = [
    { title: "Employers & Agencies", desc: "Verify candidates quickly, view confidence scores and evidence, export reports.", points: ["Single or bulk verification", "Explainable results", "Downloadable reports"] },
    { title: "Institutions", desc: "Bulk upload alumni records, manage issuers and keys, control access, publish verification endpoints.", points: ["Bulk CSV/PDF support", "Role-based access", "API & webhooks"] },
    { title: "Authorities", desc: "Admin console for oversight, audit logs, flagged cases, and registry management.", points: ["Jurisdiction-level view", "Tamper-evidence", "Compliance exports"] },
  ];
  return (
    <section id="dashboards" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Dashboards for every stakeholder</h2>
          <p className="mt-3 text-slate-700">Purpose-built workspaces designed for the way institutions and authorities operate.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{c.desc}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-800 list-disc list-inside">
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Collaboration() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Government & university collaboration</h2>
              <p className="mt-3 text-slate-700">Built to integrate with governmental registries and institutional ERPs. Supports bulk verification for authorities and trusted issuers.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-800 list-disc list-inside">
                <li>Secure API endpoints and webhooks</li>
                <li>Institution onboarding with key management</li>
                <li>Audit-ready evidence and logs</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-900">Gov Registry</div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-900">University ERP</div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-900">PKI Authority</div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-900">Blockchain Node</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    "Zero-knowledge options and data minimization",
    "Encryption in transit; configurable retention",
    "Granular access controls and audit trails",
    "Standards-based PKI and verifiable proofs",
  ];
  return (
    <section id="security" className="py-20">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Privacy and security by design</h2>
              <ul className="mt-4 grid gap-3 text-sm text-slate-800 md:grid-cols-2">
                {items.map((i) => (
                  <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-blue-700" /> {i}</li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-auto">
              <Button asChild className="w-full md:w-auto bg-slate-100 text-slate-900 hover:bg-slate-200">
                <Link to="/upload">Try a secure upload</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


