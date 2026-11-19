"use client";

import { useMemo, useState } from "react";

type ScanResult = {
  domain: string;
  score: number;
  grade: string;
  checks: { label: string; status: "pass" | "review" | "info"; detail: string }[];
};

function normalizeDomain(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
}

function inspectDomain(value: string): ScanResult | null {
  const domain = normalizeDomain(value);
  if (!/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)) return null;

  const hasHttps = /^https:\/\//i.test(value.trim());
  const parts = domain.split(".");
  const isCommonTld = ["com", "org", "net", "io", "ai", "in", "co", "dev"].includes(parts.at(-1) || "");
  const score = 52 + (hasHttps ? 18 : 0) + (isCommonTld ? 10 : 0) + (domain.length > 7 ? 8 : 0) + (parts.length >= 2 ? 7 : 0);
  const bounded = Math.min(score, 95);

  return {
    domain,
    score: bounded,
    grade: bounded >= 80 ? "Strong signals" : bounded >= 65 ? "Mixed signals" : "Needs review",
    checks: [
      { label: "Domain format", status: "pass", detail: "The supplied domain has a valid hostname format." },
      { label: "HTTPS supplied", status: hasHttps ? "pass" : "review", detail: hasHttps ? "You entered an HTTPS URL. The live certificate was not independently checked." : "Enter an HTTPS URL where available. A live TLS check is not performed in this demo." },
      { label: "Public suffix", status: isCommonTld ? "pass" : "info", detail: "Suffix recognition is a basic format signal, not proof of legitimacy." },
      { label: "Live reputation", status: "info", detail: "Not checked in this preview. Connect verified threat-intelligence and domain data sources for production." }
    ]
  };
}

const features = [
  { n: "01", title: "Trust Passport", text: "A structured profile for a business, website or AI service — with evidence, ownership claims and change history.", tag: "IDENTITY" },
  { n: "02", title: "Agent Identity", text: "Give AI agents a verifiable identity, declared capabilities and explicit permission boundaries.", tag: "AGENT LAYER" },
  { n: "03", title: "Trust Scanner", text: "Turn domain, security and transparency signals into a clear review workflow — never a fake guarantee.", tag: "INTELLIGENCE" },
  { n: "04", title: "Trust API", text: "Let developers request trust profiles and signed evidence from one integration point.", tag: "DEVELOPER PLATFORM" }
];

export default function Home() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const year = useMemo(() => new Date().getFullYear(), []);

  function runScan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = inspectDomain(domain);
    if (!found) {
      setError("Enter a valid domain, for example https://example.com");
      setResult(null);
      return;
    }
    setError("");
    setResult(found);
  }

  return (
    <main>
      <div className="announcement"><span className="pulse" /> BUILDING THE TRUST LAYER FOR THE AI INTERNET <span className="announce-right">EARLY ACCESS · {year}</span></div>
      <header className="nav shell">
        <a className="brand" href="#" aria-label="Trustgrid home"><span className="brand-mark"><i /><i /><i /><i /></span><span>TRUST<span className="brand-light">GRID</span></span></a>
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? "CLOSE" : "MENU"}</button>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
          <a href="#scanner" onClick={() => setMenuOpen(false)}>Trust scanner</a>
          <a href="#developers" onClick={() => setMenuOpen(false)}>Developers</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        </nav>
        <a className="nav-cta" href="#scanner">Explore platform <span>↗</span></a>
      </header>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> DIGITAL TRUST, RE-ENGINEERED</div>
          <h1>The internet needs<br />a <span>trust layer.</span></h1>
          <p className="hero-sub">A new foundation for a world where people, businesses and AI agents interact. Discover identity. Inspect signals. Make better-informed decisions.</p>
          <div className="hero-actions"><a className="button button-primary" href="#scanner">Try trust scanner <span>↗</span></a><a className="text-link" href="#platform">Explore the architecture <span>↓</span></a></div>
          <div className="hero-proof"><div className="proof-avatars"><b>H</b><b>A</b><b>B</b></div><span>Built for human + agent commerce</span><span className="proof-sep">/</span><span className="live-dot" /> <span>Preview environment</span></div>
        </div>
        <div className="hero-visual" aria-label="Abstract network visualization">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
          <div className="visual-grid" />
          <div className="node node-a"><span className="node-icon">◎</span><small>IDENTITY</small></div>
          <div className="node node-b"><span className="node-icon">⌘</span><small>AGENTS</small></div>
          <div className="node node-c"><span className="node-icon">◇</span><small>BUSINESS</small></div>
          <div className="node node-d"><span className="node-icon">↗</span><small>DATA</small></div>
          <div className="core"><div className="core-inner"><span className="core-symbol">✳</span><strong>TG</strong><small>TRUST CORE</small></div></div>
          <div className="visual-caption"><span className="live-dot" /> NETWORK CONCEPT / 001 <span>NOT LIVE DATA</span></div>
          <div className="floating-card"><span className="mini-label">TRUST PROTOCOL</span><strong>One layer.<br />Many connections.</strong><div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
        </div>
        <div className="hero-bottom"><span>01 — A MORE ACCOUNTABLE INTERNET</span><span>SCROLL TO EXPLORE ↓</span><span>INDEPENDENT TRUST INFRASTRUCTURE</span></div>
      </section>

      <section className="signal-strip"><div className="shell signal-inner"><span>IDENTITY</span><b>✳</b><span>TRANSPARENCY</span><b>✳</b><span>PERMISSIONS</span><b>✳</b><span>ACCOUNTABILITY</span><b>✳</b><span>INTEROPERABILITY</span></div></section>

      <section className="section shell" id="platform">
        <div className="section-heading"><div><div className="eyebrow">01 / THE PLATFORM</div><h2>Trust should be<br /><span>inspectable.</span></h2></div><p>Trust is not a badge you simply claim. It is a collection of signals, evidence and permissions that people and machines can inspect.</p></div>
        <div className="feature-grid">{features.map((f) => <article className="feature-card" key={f.n}><div className="feature-top"><span>{f.n} / 04</span><span className="feature-arrow">↗</span></div><div className="feature-icon">{f.n === "01" ? "◎" : f.n === "02" ? "⌘" : f.n === "03" ? "⌕" : "⟡"}</div><div className="feature-tag">{f.tag}</div><h3>{f.title}</h3><p>{f.text}</p></article>)}</div>
      </section>

      <section className="scanner-section" id="scanner"><div className="shell scanner-layout"><div className="scanner-copy"><div className="eyebrow">02 / INTERACTIVE PREVIEW</div><h2>Look closer.<br /><span>Know more.</span></h2><p>Start with a domain. This local preview validates its format and illustrates how a transparent trust review could look.</p><div className="scanner-note"><span>i</span><p>This preview does not contact the domain, inspect certificates, query threat feeds or establish whether a business is legitimate.</p></div></div>
        <div className="scanner-panel"><div className="panel-head"><div><span className="panel-kicker">TRUSTGRID / SCAN MODULE</span><h3>Domain signal check</h3></div><span className="panel-status"><i /> DEMO MODE</span></div><form onSubmit={runScan} className="scan-form"><label htmlFor="domain">WEBSITE DOMAIN</label><div className="input-row"><input id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="https://yourwebsite.com" autoComplete="url" /><button type="submit">ANALYZE <span>↗</span></button></div>{error && <p className="form-error">{error}</p>}</form>
          {!result ? <div className="empty-state"><div className="empty-radar"><span /><span /><span /><b>◎</b></div><strong>Awaiting a domain</strong><p>Enter a website above to generate a sample signal report.</p></div> : <div className="result-state"><div className="score-row"><div><span className="panel-kicker">SAMPLE SIGNAL SCORE</span><div className="score-number">{result.score}<small>/100</small></div><strong>{result.grade}</strong></div><div className="score-ring" style={{ background: `conic-gradient(#a7f3d0 ${result.score * 3.6}deg, #25312f 0deg)` }}><div>{result.score}</div></div></div><div className="result-domain">{result.domain}</div><div className="check-list">{result.checks.map((c) => <div className="check-item" key={c.label}><span className={`check-icon ${c.status}`}>{c.status === "pass" ? "✓" : c.status === "review" ? "!" : "i"}</span><div><strong>{c.label}</strong><p>{c.detail}</p></div></div>)}</div><button className="reset-scan" onClick={() => { setResult(null); setDomain(""); }}>CLEAR REPORT ↺</button></div>}
          <div className="panel-foot"><span>LOCAL DEMO · NO EXTERNAL REQUESTS</span><span>TRUST IS EVIDENCE, NOT A PROMISE</span></div>
        </div></div></section>

      <section className="section shell developer-section" id="developers"><div className="developer-visual"><div className="code-window"><div className="code-top"><span /><span /><span /><small>trustgrid.request</small></div><pre><code><span className="code-purple">const</span> trust = <span className="code-blue">await</span> fetch(<span className="code-green">"/v1/trust/domain"</span>, {"{"}{'\n'}  method: <span className="code-green">"POST"</span>,{'\n'}  headers: {"{"} Authorization: token {"}"}{'\n'}{"}"});{'\n'}<span className="code-purple">const</span> profile = <span className="code-blue">await</span> trust.json();{'\n'}<span className="code-muted">// inspect evidence, not promises</span></code></pre><div className="code-bottom"><span>API CONCEPT</span><span>COMING SOON</span></div></div><div className="developer-orbit">⟡</div></div><div className="developer-copy"><div className="eyebrow">03 / FOR BUILDERS</div><h2>Trust, built<br />into your <span>stack.</span></h2><p>Build products that can reason about digital identity, evidence and agent permissions. A developer-first API is on the roadmap.</p><a className="button button-outline" href="mailto:hello@trustgrid.example?subject=TRUSTGRID%20Developer%20Access">Request developer updates <span>↗</span></a><small>Illustrative API only. No public API is available yet.</small></div></section>

      <section className="pricing-section" id="pricing"><div className="shell"><div className="section-heading pricing-heading"><div><div className="eyebrow">04 / ACCESS</div><h2>Start with <span>clarity.</span></h2></div><p>Explore the concept today. Paid plans will be introduced only when the underlying verification services are production-ready.</p></div><div className="pricing-card"><div><span className="feature-tag">EARLY EXPLORER</span><h3>Free preview</h3><p>Explore the interface and try local domain-format checks.</p></div><div className="price">₹0 <small>/ for now</small></div><ul><li>Interactive demo scanner</li><li>Platform and API roadmap</li><li>Early product announcements</li><li> No live verification or certification</li></ul><a className="button button-primary" href="#scanner">Explore the preview <span>↗</span></a></div></div></section>

      <section className="final-cta shell"><div className="eyebrow">THE NEXT INTERNET DESERVES BETTER FOUNDATIONS</div><h2>Make trust<br /><span>something you can verify.</span></h2><a className="button button-primary" href="mailto:hello@trustgrid.example?subject=TRUSTGRID%20Early%20Access">Get in touch <span>↗</span></a><div className="cta-watermark">TG</div></section>
      <footer className="footer"><div className="shell footer-main"><a className="brand" href="#"><span className="brand-mark"><i /><i /><i /><i /></span><span>TRUST<span className="brand-light">GRID</span></span></a><p>The trust layer for a more accountable AI internet.</p><div className="footer-links"><a href="#platform">Platform</a><a href="#scanner">Scanner</a><a href="#developers">Developers</a><a href="#pricing">Access</a></div></div><div className="shell footer-bottom"><span>© {year} TRUSTGRID. CONCEPT PREVIEW.</span><span>NO CERTIFICATION OR SECURITY GUARANTEE IS IMPLIED.</span><a href="mailto:hello@trustgrid.example">CONTACT ↗</a></div></footer>
    </main>
  );
}
