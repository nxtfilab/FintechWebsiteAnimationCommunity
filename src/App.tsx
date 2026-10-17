import { useEffect, useRef, useState } from "react"

type IconName = "person" | "coin" | "route" | "shield" | "exchange" | "check" | "provider" | "rail" | "merchant" | "arrow" | "pause" | "play" | "reset"

type IconProps = {
  name: IconName
  className?: string
}

function Icon({ name, className = "" }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    person: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21v-3a7 7 0 0 1 14 0v3" />
      </>
    ),
    coin: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M7 7h10M12 7v11M8 10c0 2 8 2 8 0M8 10v2c0 2 8 2 8 0v-2" />
      </>
    ),
    route: (
      <>
        <path d="M5 19V7a3 3 0 0 1 3-3h10m-4-3 4 3-4 3M5 12h10a3 3 0 0 1 3 3v5m-3-3 3 3 3-3" />
        <circle cx="5" cy="20" r="2" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    exchange: (
      <>
        <path d="M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4" />
      </>
    ),
    check: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="m8 11 3 3 5-6M9 18h6" />
      </>
    ),
    provider: (
      <>
        <path d="m3 9 9-6 9 6H3ZM5 10v8m7-8v8m7-8v8M3 21h18M3 18h18" />
      </>
    ),
    rail: (
      <>
        <path d="M4 7h16M4 17h16M7 4v16M17 4v16M9 12h6m-3-3 3 3-3 3" />
      </>
    ),
    merchant: (
      <>
        <path d="M4 10v11h16V10M3 10l2-7h14l2 7M3 10c0 4 5 4 5 0 0 4 4 4 4 0 0 4 4 4 4 0 0 4 5 4 5 0M9 21v-6h6v6" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    pause: (
      <>
        <path d="M9 5v14M15 5v14" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7V5Z" />,
    reset: (
      <>
        <path d="M4 9a8 8 0 1 1 0 6M4 4v5h5" />
      </>
    ),
  }
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const functions = [
  {
    icon: "route",
    label: "Payment Routing",
    action: "Route",
    detail: "The right path, every payment",
  },
  {
    icon: "shield",
    label: "Compliance / Risk",
    action: "Risk Check",
    detail: "Coordinate partner checks",
  },
  {
    icon: "check",
    label: "Transaction Monitoring",
    action: "Monitor",
    detail: "Coordinate transaction signals",
  },
  {
    icon: "exchange",
    label: "FX / Conversion",
    action: "FX",
    detail: "Connect conversion partners",
  },
  {
    icon: "check",
    label: "Reconciliation",
    action: "Reconcile",
    detail: "Keep every step in sync",
  },
] as const
const stages = [
  "Customer",
  "Crypto payment",
  "Route",
  "Risk Check",
  "Monitor",
  "FX",
  "Reconcile",
  "Payment provider",
  "Local fiat rail",
  "Merchant",
]

function Overview() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const [details, setDetails] = useState(false)
  const [points, setPoints] = useState<{
    x: number
    y: number
  }[]>([])
  const diagramRef = useRef<HTMLDivElement>(null)
  const anchors = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(
      () => setStep((previous) => (previous + 1) % stages.length),
      1500,
    )
    return () => window.clearInterval(timer)
  }, [playing])

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const change = () => {
      if (preference.matches) setPlaying(false)
    }
    preference.addEventListener("change", change)
    const measure = () => {
      const bounds = diagramRef.current?.getBoundingClientRect()
      if (!bounds) return
      setPoints(
        anchors.current.map((anchor) => {
          const rect = anchor?.getBoundingClientRect()
          return rect
            ? {
                x: rect.left - bounds.left + rect.width / 2,
                y: rect.top - bounds.top + rect.height / 2,
              }
            : { x: 0, y: 0 }
        }),
      )
    }
    const observer = new ResizeObserver(measure)
    if (diagramRef.current) observer.observe(diagramRef.current)
    measure()
    return () => {
      observer.disconnect()
      preference.removeEventListener("change", change)
    }
  }, [])

  const anchor = (index: number) => (
    <span
      className="particle-anchor"
      ref={(element) => {
        anchors.current[index] = element
      }}
    />
  )
  const node = (
    index: number,
    icon: IconName,
    label: string,
    caption: string,
    extraClass = "",
  ) => (
    <div
      className={`flow-node ${step === index ? "node-active" : ""} ${
        step > index ? "node-complete" : ""
      } ${extraClass}`}
    >
      <div className="node-icon">
        <Icon name={icon} />
        {anchor(index)}
      </div>
      <div className="node-label">{label}</div>
      <div className="node-caption">{caption}</div>
    </div>
  )

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="NxtFi home">
          <span className="brand-logo">
            <img
              src="/nxtfi-wordmark.png"
              alt="NxtFi"
              width="860"
              height="270"
            />
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <button
            onClick={() => setDetails(!details)}
            aria-expanded={details}
            aria-controls="architecture-details"
          >
            Our role
          </button>
        </nav>
        <a className="header-cta" href="#/architecture">
          Explore the architecture <Icon name="arrow" />
        </a>
      </header>

      <main>
        <section
          className="infrastructure-section"
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <div className="launch-badge">
              <span />
              MVP <b>•</b> PRE-LAUNCH <b>•</b> UAE
            </div>
            <h1 id="hero-title" tabIndex={-1}>
              Accept Crypto. <span className="fiat-word">Settle in Fiat.</span>
            </h1>
            <p>
              Non-custodial payment orchestration connecting crypto payments
              <br className="desktop-break" /> with local fiat infrastructure.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#payment-flow">
                Explore the Platform <Icon name="arrow" />
              </a>
              <a className="secondary-action" href="#current-stage">
                Talk to NxtFi
              </a>
            </div>
          </div>

          <div className="architecture" id="payment-flow">
            <div className="diagram-meta">
              <div>
                <span className="meta-line" /> A PAYMENT, END TO END
              </div>
              <span className="example-tag">
                ILLUSTRATIVE · NOT LIVE <span>USDT → AED</span>
              </span>
            </div>
            <div
              className="flow-diagram"
              ref={diagramRef}
              aria-label="Payment flow: customer, crypto payment, NxtFi routing, compliance and risk, FX conversion, reconciliation, payment provider, local fiat rail, merchant settlement"
            >
              <div className="flow-backbone" aria-hidden="true" />
              {node(
                0,
                "person",
                "Customer",
                "Starts the payment",
                "customer-node",
              )}
              {node(
                1,
                "coin",
                "Crypto Payment",
                "Customer-authorized",
                "crypto-node",
              )}
              <div
                className={`orchestration ${
                  step >= 2 && step <= 6 ? "orchestration-active" : ""
                }`}
              >
                <div className="core-top">
                  <div className="core-brand">
                    <span className="core-logo">
                      <img
                        src="/nxtfi-wordmark.png"
                        alt="NxtFi"
                        width="860"
                        height="270"
                      />
                    </span>
                  </div>
                  <span className="core-badge">
                    <span />
                    NON-CUSTODIAL
                  </span>
                </div>
                <div className="core-title">Orchestration Layer</div>
                <div className="core-subtitle">
                  One integration. A coordinated journey.
                </div>
                <div className="function-grid">
                  {functions.map((item, index) => (
                    <div
                      key={item.label}
                      className={`function-tile ${
                        step === index + 2 ? "function-active" : ""
                      } ${step > index + 2 ? "function-complete" : ""}`}
                    >
                      <Icon name={item.icon} />
                      <div>
                        <div className="function-label">{item.label}</div>
                        <div className="function-description">
                          {item.detail}
                        </div>
                      </div>
                      {anchor(index + 2)}
                    </div>
                  ))}
                </div>
                <div className="core-footer">
                  <span className="core-footer-mark" />
                  Coordinates. Never custodies.
                </div>
              </div>
              {node(
                7,
                "provider",
                "Payment Provider",
                "Regulated partner",
                "provider-node",
              )}
              {node(
                8,
                "rail",
                "Local Fiat Rail",
                "Partner-led settlement",
                "rail-node",
              )}
              {node(
                9,
                "merchant",
                "Merchant",
                "Receives local fiat",
                "merchant-node",
              )}
              {points[step] && (
                <span
                  className={`transaction-particle ${
                    step === 0 ? "particle-reset" : ""
                  }`}
                  aria-hidden="true"
                  style={{
                    transform: `translate(${points[step].x}px, ${points[step].y}px)`,
                  }}
                />
              )}
              <div className="boundary-label boundary-in">CRYPTO IN</div>
              <div className="boundary-label boundary-out">LOCAL FIAT OUT</div>
            </div>
            <div className="playback-bar">
              <div className="transaction-summary">
                <span className="summary-token">1,000 USDT</span>
                <Icon name="arrow" />
                <span>NxtFi</span>
                <Icon name="arrow" />
                <span className="summary-token">AED Settlement</span>
                <Icon name="arrow" />
                <span>Merchant</span>
              </div>
              <div className="playback-controls">
                <span className="step-indicator">
                  <span />
                  {stages[step]}
                </span>
                <span className="control-divider" />
                <button
                  aria-label={playing ? "Pause animation" : "Play animation"}
                  onClick={() => setPlaying(!playing)}
                >
                  <Icon name={playing ? "pause" : "play"} />
                </button>
                <button
                  aria-label="Restart payment flow"
                  onClick={() => setStep(0)}
                >
                  <Icon name="reset" />
                </button>
              </div>
            </div>
          </div>

          <div className="architecture-note">
            <Icon name="shield" />
            <p>
              NxtFi coordinates the flow. Regulated partners handle applicable
              payment and fiat settlement activities.
            </p>
          </div>
        </section>
        {details && (
          <section className="role-details" id="architecture-details">
            <div>
              <div className="eyebrow">
                CLEAR ROLES. CONNECTED INFRASTRUCTURE.
              </div>
              <h2>Orchestration, not custody.</h2>
              <p>
                NxtFi coordinates routing, compliance and risk workflows,
                conversion, and reconciliation. Applicable payment processing
                and fiat settlement are handled by regulated partners.
              </p>
            </div>
            <button
              className="detail-close"
              onClick={() => setDetails(false)}
              aria-label="Close architecture details"
            >
              ×
            </button>
          </section>
        )}
        <div className="overview-content">
          <section
            className="narrative-grid"
            aria-label="The problem and solution"
          >
            <article className="narrative-card problem-card">
              <div className="section-index">01 / THE PROBLEM</div>
              <h2>
                Crypto payments are global.
                <br />
                <span>Fiat settlement is fragmented.</span>
              </h2>
              <p>
                Merchants must navigate multiple layers across payment
                processing, compliance and risk, FX and conversion, payment
                providers, local rails, and reconciliation.
              </p>
              <div className="fragment-stack" aria-hidden="true">
                {[
                  "Payment processing",
                  "Compliance / Risk",
                  "FX / Conversion",
                  "Local rails",
                  "Reconciliation",
                ].map((label, index) => (
                  <span
                    key={label}
                    style={{ "--offset": index } as React.CSSProperties}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </article>
            <article className="narrative-card solution-card">
              <div className="section-index">02 / THE SOLUTION</div>
              <h2>
                One orchestration layer
                <br />
                <span>between crypto and fiat.</span>
              </h2>
              <p>
                NxtFi is designed to coordinate relevant providers and
                infrastructure through one connected workflow—not replace every
                participant.
              </p>
              <div className="solution-line">
                <span>CRYPTO</span>
                <i />
                <strong>NxtFi</strong>
                <i />
                <span>LOCAL FIAT</span>
              </div>
            </article>
          </section>

          <section
            className="how-section"
            id="how-it-works"
            aria-labelledby="how-title"
          >
            <div className="section-heading">
              <div>
                <div className="eyebrow">03 / HOW NXTFI WORKS</div>
                <h2 id="how-title">
                  A connected path from payment to settlement.
                </h2>
              </div>
              <p>
                One coordinated workflow with clearly defined participant roles.
              </p>
            </div>
            <div className="step-grid">
              {[
                {
                  title: "Create Payment",
                  text: "Merchant creates a crypto payment request.",
                  icon: "merchant",
                },
                {
                  title: "Customer Pays",
                  text: "Customer completes the crypto payment.",
                  icon: "coin",
                },
                {
                  title: "Orchestration",
                  text: "NxtFi coordinates transaction, compliance, risk, conversion, and payment-provider processes.",
                  icon: "route",
                },
                {
                  title: "Settlement",
                  text: "Connected regulated payment infrastructure handles applicable local fiat settlement.",
                  icon: "rail",
                },
                {
                  title: "Reconciliation",
                  text: "Merchant tracks payment status, references, and settlement information.",
                  icon: "check",
                },
              ].map((item, index) => (
                <article className="step-card" key={item.title}>
                  <div className="step-card-top">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Icon name={item.icon as IconName} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="stack-section" aria-labelledby="stack-title">
            <div className="section-heading">
              <div>
                <div className="eyebrow">04 / ARCHITECTURE</div>
                <h2 id="stack-title">
                  Connected infrastructure. Distinct roles.
                </h2>
              </div>
              <a className="text-link" href="#/architecture">
                Explore the architecture <Icon name="arrow" />
              </a>
            </div>
            <div className="stack-diagram">
              <div className="asset-layer">
                <span className="layer-label">CRYPTO ASSETS</span>
                <div>
                  {["BTC", "ETH", "USDT", "BNB"].map((asset) => (
                    <span key={asset}>{asset}</span>
                  ))}
                </div>
              </div>
              <div className="stack-connector">
                <span />
              </div>
              <div className="nxtfi-layer">
                <div className="nxtfi-layer-head">
                  <span className="core-logo">
                    <img
                      src="/nxtfi-wordmark.png"
                      alt="NxtFi"
                      width="860"
                      height="270"
                    />
                  </span>
                  <span>ORCHESTRATION LAYER</span>
                </div>
                <div className="layer-capabilities">
                  {functions.map((item) => (
                    <span key={item.label}>{item.label}</span>
                  ))}
                </div>
                <p>
                  Coordinates workflows and information. Does not custody funds.
                </p>
              </div>
              <div className="stack-connector">
                <span />
              </div>
              <div className="partner-chain">
                {[
                  ["Payment Providers", "Applicable regulated partners"],
                  ["Local Fiat Rails", "Connected payment infrastructure"],
                  ["Merchant", "Receives partner-led settlement"],
                ].map(([title, detail], index) => (
                  <div className="partner-node" key={title}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{title}</strong>
                    <small>{detail}</small>
                  </div>
                ))}
              </div>
              <div className="partner-boundary">
                <Icon name="shield" />
                Payment and settlement activities are handled by applicable
                regulated partners.
              </div>
            </div>
          </section>

          <section
            className="corridor-section"
            aria-labelledby="corridor-title"
          >
            <div className="corridor-copy">
              <div className="eyebrow">05 / INITIAL CORRIDOR</div>
              <h2 id="corridor-title">Starting with UAE ↔ India</h2>
              <p>
                NxtFi’s initial focus is the UAE–India corridor, with additional
                corridors planned over time as connected provider and regulatory
                infrastructure develops.
              </p>
            </div>
            <div className="corridor-visual" aria-label="AED to INR corridor">
              <div>
                <span>UAE</span>
                <strong>AED</strong>
              </div>
              <div className="corridor-route">
                <span />
                <Icon name="arrow" />
              </div>
              <div>
                <span>INDIA</span>
                <strong>INR</strong>
              </div>
              <small>INITIAL FOCUS · PRE-LAUNCH</small>
            </div>
          </section>

          <section
            className="segments-section"
            aria-labelledby="segments-title"
          >
            <div className="section-heading">
              <div>
                <div className="eyebrow">06 / CUSTOMER SEGMENTS</div>
                <h2 id="segments-title">Built for borderless businesses.</h2>
              </div>
              <p>
                Designed for merchants and platforms serving global customers.
              </p>
            </div>
            <div className="segment-grid">
              {[
                ["E-commerce", "merchant"],
                ["Cross-border Commerce", "exchange"],
                ["Digital Businesses", "check"],
                ["Fintech Platforms", "provider"],
                [
                  "International Businesses serving crypto-native customers",
                  "coin",
                ],
              ].map(([label, icon]) => (
                <article key={label}>
                  <Icon name={icon as IconName} />
                  <span>{label}</span>
                  <Icon name="arrow" />
                </article>
              ))}
            </div>
          </section>

          <section
            className="stage-section"
            id="current-stage"
            aria-labelledby="stage-title"
          >
            <div className="stage-copy">
              <div className="launch-badge">
                <span />
                MVP <b>•</b> PRE-LAUNCH <b>•</b> UAE
              </div>
              <h2 id="stage-title">
                MVP built. Partnerships and compliance infrastructure are next.
              </h2>
              <p>
                NxtFi is currently preparing its connected provider, compliance,
                regulatory, and merchant pilot foundations.
              </p>
            </div>
            <div className="readiness-list">
              {[
                ["MVP developed", "complete"],
                ["PSP connectivity in progress", "active"],
                ["Compliance architecture", "active"],
                ["KYC / KYB / AML workflows", "planned"],
                ["UAE regulatory pathway", "planned"],
                ["Merchant pilot preparation", "planned"],
              ].map(([label, status], index) => (
                <div key={label}>
                  <span className={`readiness-dot ${status}`} />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{label}</strong>
                  <small>
                    {status === "complete"
                      ? "BUILT"
                      : status === "active"
                        ? "IN PROGRESS"
                        : "NEXT"}
                  </small>
                </div>
              ))}
            </div>
          </section>

          <section className="validation-section" id="validation">
            <div className="validation-mark">
              <Icon name="check" />
            </div>
            <div>
              <span>VALIDATION</span>
              <h2>BNB Chain & Binance Ignyte Challenge 2026 Finalist</h2>
              <p>
                Recognition does not represent a commercial partnership or
                endorsement.
              </p>
            </div>
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <span>CRYPTO TO FIAT. WITHOUT THE FRAGMENTATION.</span>
        <div>
          <span>Non-custodial by design</span>
          <span className="footer-dot" />
          <span>Connected by NxtFi</span>
        </div>
      </footer>
    </div>
  )
}

const architectureStages: {
  title: string
  icon: IconName
  owner: string
  description: string
  input: string
  output: string
  coordination: string
}[] = [
  {
    title: "Customer",
    icon: "person",
    owner: "Customer",
    description:
      "The journey begins with a customer choosing to pay a merchant in crypto. The flow is illustrative and does not represent a live transaction.",
    input: "Merchant payment request",
    output: "Customer payment instruction",
    coordination:
      "The customer initiates the payment. NxtFi does not hold a customer wallet balance.",
  },
  {
    title: "Crypto Payment",
    icon: "coin",
    owner: "Customer & applicable partners",
    description:
      "The crypto payment enters the configured payment workflow. Payment information connects the customer’s instruction to the merchant’s request.",
    input: "Customer crypto payment instruction",
    output: "Payment information for routing",
    coordination:
      "The crypto payment is coordinated without NxtFi taking custody of customer funds.",
  },
  {
    title: "NxtFi Orchestration",
    icon: "route",
    owner: "NxtFi",
    description:
      "The orchestration layer connects the stages of the journey: payment routing, compliance and risk workflows, FX and conversion coordination, and reconciliation.",
    input: "Payment information & requirements",
    output: "Coordinated partner workflow",
    coordination:
      "NxtFi coordinates instructions and payment information. It does not hold funds or directly settle fiat.",
  },
  {
    title: "Compliance / Risk",
    icon: "shield",
    owner: "Applicable regulated partners",
    description:
      "Applicable compliance and risk checks are coordinated with the relevant partners. Requirements and outcomes depend on the payment, jurisdiction, and partner arrangement.",
    input: "Information required for checks",
    output: "Partner check outcome",
    coordination:
      "NxtFi connects the workflow; applicable regulated partners carry out the checks required for their activities.",
  },
  {
    title: "FX / Conversion",
    icon: "exchange",
    owner: "Applicable conversion partners",
    description:
      "The workflow connects to an applicable partner for crypto-to-fiat conversion into the merchant’s applicable local currency.",
    input: "Crypto payment & conversion requirements",
    output: "Fiat payment instruction",
    coordination:
      "Conversion is performed by the applicable partner. No exchange rate, fee, or settlement amount is promised by this illustration.",
  },
  {
    title: "Payment Provider",
    icon: "provider",
    owner: "Regulated payment partner",
    description:
      "A regulated payment provider handles the applicable payment activity and connects the fiat payment instruction to the appropriate local infrastructure.",
    input: "Fiat payment instruction",
    output: "Instruction to local fiat infrastructure",
    coordination:
      "The regulated partner handles applicable payment processing. NxtFi coordinates the handoff and associated information.",
  },
  {
    title: "Local Fiat Rail",
    icon: "rail",
    owner: "Applicable payment infrastructure",
    description:
      "The applicable local fiat rail carries the payment toward the merchant without representing a specific bank or payment network.",
    input: "Local fiat payment instruction",
    output: "Partner-led local fiat settlement",
    coordination:
      "Local payment infrastructure and applicable partners handle the fiat movement—not NxtFi.",
  },
  {
    title: "Merchant Settlement",
    icon: "merchant",
    owner: "Merchant & regulated settlement partner",
    description:
      "The merchant receives local fiat through the applicable partner arrangement. NxtFi coordinates payment information and reconciliation across the journey.",
    input: "Partner-led local fiat settlement",
    output: "Merchant receives local fiat",
    coordination:
      "The regulated partner handles settlement. NxtFi helps connect the payment’s records, not custody or movement of fiat.",
  },
]

function ArchitecturePage() {
  const [selected, setSelected] = useState(2)
  const [playing, setPlaying] = useState(false)
  const stage = architectureStages[selected]
  const selectStage = (index: number) => {
    setPlaying(false)
    setSelected(index)
  }
  const goTo = (id: string) => {
    const target = document.getElementById(id)
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    })
    target?.focus({ preventScroll: true })
  }

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(
      () =>
        setSelected((previous) => (previous + 1) % architectureStages.length),
      1500,
    )
    return () => window.clearInterval(timer)
  }, [playing])

  return (
    <div className="site-shell architecture-page">
      <header className="site-header">
        <a className="wordmark" href="#/" aria-label="NxtFi overview">
          <span className="brand-logo">
            <img
              src="/nxtfi-wordmark.png"
              alt="NxtFi"
              width="860"
              height="270"
            />
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#/">Overview</a>
          <button onClick={() => goTo("partner-responsibilities")}>
            Roles & responsibilities
          </button>
        </nav>
        <a className="header-cta" href="#/">
          <Icon className="back-arrow" name="arrow" /> Back to overview
        </a>
      </header>

      <main className="architecture-content">
        <div className="breadcrumbs">
          <a href="#/">Overview</a>
          <span>/</span>
          <span>Architecture</span>
        </div>
        <section
          className="architecture-hero"
          aria-labelledby="architecture-title"
        >
          <div>
            <div className="eyebrow">
              <span />
              THE NXTFi ARCHITECTURE
            </div>
            <h1 id="architecture-title" tabIndex={-1}>
              Connected infrastructure.
              <br />
              <span className="fiat-word">Clearly defined roles.</span>
            </h1>
            <p>
              Explore how NxtFi coordinates a crypto-to-fiat payment—from the
              customer’s instruction to partner-led merchant settlement.
            </p>
          </div>
          <div className="example-payment">
            <div className="example-payment-label">AN ILLUSTRATIVE JOURNEY</div>
            <div className="example-payment-amount">
              <span>
                Crypto <small>Customer payment</small>
              </span>
              <Icon name="arrow" />
              <span>
                Local fiat <small>Partner settlement</small>
              </span>
            </div>
            <div className="example-payment-rule" />
            <div className="example-payment-note">
              <Icon name="shield" />
              <span>
                Coordinated by NxtFi.
                <br />
                Payment and settlement handled by partners.
              </span>
            </div>
          </div>
        </section>

        <nav
          className="architecture-section-nav"
          aria-label="Architecture sections"
        >
          <button onClick={() => goTo("flow-explorer")}>
            01 <span>Flow explorer</span>
          </button>
          <button onClick={() => goTo("partner-responsibilities")}>
            02 <span>Roles & boundaries</span>
          </button>
          <button onClick={() => goTo("architecture-questions")}>
            03 <span>Common questions</span>
          </button>
        </nav>

        <section
          className="explorer-section"
          aria-labelledby="flow-explorer-title"
        >
          <div className="architecture-section-heading">
            <div>
              <div className="eyebrow">01 / FOLLOW THE PAYMENT</div>
              <h2 id="flow-explorer-title">One journey. Every handoff.</h2>
              <p>Select a stage to see what happens and who is responsible.</p>
            </div>
            <span className="illustration-badge">
              ILLUSTRATIVE · NOT LIVE DATA
            </span>
          </div>
          <div className="explorer-layout" id="flow-explorer" tabIndex={-1}>
            <aside className="explorer-stages" aria-label="Payment stages">
              <div className="explorer-stages-label">CRYPTO → LOCAL FIAT</div>
              <ol>
                {architectureStages.map((item, index) => (
                  <li key={item.title}>
                    <button
                      className={`explorer-stage ${
                        selected === index ? "explorer-stage-selected" : ""
                      } ${index === 2 ? "explorer-stage-core" : ""}`}
                      onClick={() => selectStage(index)}
                      aria-current={selected === index ? "step" : undefined}
                      aria-controls="stage-detail"
                    >
                      <span className="stage-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Icon name={item.icon} />
                      <span>{item.title}</span>
                      {selected === index && (
                        <span className="selected-stage-dot" />
                      )}
                    </button>
                  </li>
                ))}
              </ol>
              <div className="explorer-controls">
                <button
                  onClick={() => {
                    setSelected(0)
                    setPlaying(false)
                  }}
                  aria-label="Reset architecture walkthrough"
                >
                  <Icon name="reset" />
                </button>
                <button
                  className="walkthrough-play"
                  onClick={() => setPlaying(!playing)}
                >
                  <Icon name={playing ? "pause" : "play"} />
                  {playing ? "Pause walkthrough" : "Play walkthrough"}
                </button>
              </div>
            </aside>

            <div
              className="stage-detail"
              id="stage-detail"
              aria-live={playing ? "off" : "polite"}
            >
              <div className="stage-detail-top">
                <span>STAGE {String(selected + 1).padStart(2, "0")} / 08</span>
                <span
                  className={`owner-badge ${
                    selected === 2 ? "owner-nxtfi" : ""
                  }`}
                >
                  {selected === 2 ? "ORCHESTRATION LAYER" : "PAYMENT ECOSYSTEM"}
                </span>
              </div>
              <div className="stage-detail-body" key={selected}>
                <div className="stage-detail-icon">
                  <Icon name={stage.icon} />
                </div>
                <h3>{stage.title}</h3>
                <p className="stage-description">{stage.description}</p>
                <div className="handoff-grid">
                  <div>
                    <span>INPUT</span>
                    <p>{stage.input}</p>
                  </div>
                  <Icon name="arrow" />
                  <div>
                    <span>OUTPUT</span>
                    <p>{stage.output}</p>
                  </div>
                </div>
                {selected === 2 && (
                  <div className="orchestration-capabilities">
                    {functions.map((item) => (
                      <div key={item.label}>
                        <Icon name={item.icon} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="stage-responsibility">
                  <div>
                    <Icon name="shield" />
                    <span>RESPONSIBILITY</span>
                  </div>
                  <strong>{stage.owner}</strong>
                  <p>{stage.coordination}</p>
                </div>
              </div>
              <div className="stage-detail-footer">
                <span>
                  {selected + 1} of {architectureStages.length} stages
                </span>
                <div>
                  <button
                    disabled={selected === 0}
                    onClick={() => selectStage(selected - 1)}
                  >
                    <Icon className="back-arrow" name="arrow" /> Previous
                  </button>
                  <button
                    disabled={selected === architectureStages.length - 1}
                    onClick={() => selectStage(selected + 1)}
                  >
                    Next stage <Icon name="arrow" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="responsibilities-section"
          id="partner-responsibilities"
          tabIndex={-1}
          aria-labelledby="responsibilities-title"
        >
          <div className="architecture-section-heading">
            <div>
              <div className="eyebrow">02 / ROLES & BOUNDARIES</div>
              <h2 id="responsibilities-title">Coordination is not custody.</h2>
              <p>A connected experience, with distinct responsibilities.</p>
            </div>
          </div>
          <div className="responsibility-cards">
            <article className="responsibility-card nxtfi-responsibility">
              <span className="responsibility-label">NXTFi</span>
              <h3>The coordination layer.</h3>
              <p>
                Connects payment information and workflows across the ecosystem.
              </p>
              <ul>
                <li>
                  <Icon name="route" />
                  Payment routing coordination
                </li>
                <li>
                  <Icon name="shield" />
                  Compliance & risk workflow coordination
                </li>
                <li>
                  <Icon name="exchange" />
                  FX & conversion partner coordination
                </li>
                <li>
                  <Icon name="check" />
                  Reconciliation across the payment journey
                </li>
              </ul>
              <div className="responsibility-footnote">
                No custody of customer funds. No direct fiat settlement.
              </div>
            </article>
            <article className="responsibility-card">
              <span className="responsibility-label">
                APPLICABLE REGULATED PARTNERS
              </span>
              <h3>The payment & settlement layer.</h3>
              <p>
                Handle applicable regulated activities within their respective
                roles.
              </p>
              <ul>
                <li>
                  <Icon name="shield" />
                  Applicable compliance and risk checks
                </li>
                <li>
                  <Icon name="exchange" />
                  Applicable crypto-to-fiat conversion
                </li>
                <li>
                  <Icon name="provider" />
                  Payment processing and local rail access
                </li>
                <li>
                  <Icon name="merchant" />
                  Fiat settlement to the merchant
                </li>
              </ul>
              <div className="responsibility-footnote">
                Activities depend on jurisdiction and partner arrangements.
              </div>
            </article>
          </div>
        </section>

        <section
          className="architecture-faq"
          id="architecture-questions"
          tabIndex={-1}
          aria-labelledby="questions-title"
        >
          <div>
            <div className="eyebrow">03 / COMMON QUESTIONS</div>
            <h2 id="questions-title">
              The details
              <br />
              that matter.
            </h2>
            <p>
              Understanding the boundaries
              <br />
              of the orchestration layer.
            </p>
          </div>
          <div className="faq-list">
            <details>
              <summary>
                Does NxtFi hold customer funds?
                <Icon name="arrow" />
              </summary>
              <p>
                No. NxtFi is a non-custodial orchestration platform. It
                coordinates the payment flow rather than holding customer funds
                or maintaining customer wallet balances.
              </p>
            </details>
            <details>
              <summary>
                Who handles fiat settlement?
                <Icon name="arrow" />
              </summary>
              <p>
                Applicable regulated partners handle payment and fiat settlement
                activities. NxtFi coordinates the associated workflow and
                information; it does not directly hold or settle fiat.
              </p>
            </details>
            <details>
              <summary>
                Does this flow represent a real payment?
                <Icon name="arrow" />
              </summary>
              <p>
                No. This is an illustrative architecture walkthrough, not a live
                transaction. No amount, currency, rate, fee, settlement time, or
                partner is implied.
              </p>
            </details>
            <details>
              <summary>
                Are all payment journeys identical?
                <Icon name="arrow" />
              </summary>
              <p>
                No. The applicable partners, checks, conversion process, and
                local payment infrastructure depend on the jurisdiction and
                arrangement. The diagram shows the platform’s coordination
                model, not a guarantee of a specific payment path.
              </p>
            </details>
          </div>
        </section>
        <div className="architecture-closing">
          <Icon name="shield" />
          <p>
            NxtFi coordinates the flow. Regulated partners handle applicable
            payment and fiat settlement activities.
          </p>
          <a href="#/">
            Back to the overview <Icon name="arrow" />
          </a>
        </div>
      </main>
      <footer className="site-footer">
        <span>CRYPTO TO FIAT. WITHOUT THE FRAGMENTATION.</span>
        <div>
          <span>Non-custodial by design</span>
          <span className="footer-dot" />
          <span>Connected by NxtFi</span>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  const [architecture, setArchitecture] = useState(
    () => window.location.hash === "#/architecture",
  )
  useEffect(() => {
    const navigate = () =>
      setArchitecture(window.location.hash === "#/architecture")
    window.addEventListener("hashchange", navigate)
    return () => window.removeEventListener("hashchange", navigate)
  }, [])
  useEffect(() => {
    document.title = architecture
      ? "Architecture | NxtFi"
      : "NxtFi | Crypto-to-fiat orchestration"
    if (architecture || window.location.hash === "#/") {
      window.scrollTo({ top: 0, behavior: "instant" })
      const frame = window.requestAnimationFrame(() =>
        document
          .getElementById(architecture ? "architecture-title" : "hero-title")
          ?.focus({ preventScroll: true }),
      )
      return () => window.cancelAnimationFrame(frame)
    }
  }, [architecture])
  return architecture ? <ArchitecturePage /> : <Overview />
}
