import Link from "next/link";
import { ru } from "@/lib/i18n/ru";

const FEATURES = [
  {
    icon: "🔒",
    title: ru.landing.features.privacy.title,
    desc: ru.landing.features.privacy.desc,
  },
  {
    icon: "⚡",
    title: ru.landing.features.speed.title,
    desc: ru.landing.features.speed.desc,
  },
  {
    icon: "🛡️",
    title: ru.landing.features.safety.title,
    desc: ru.landing.features.safety.desc,
  },
];

const SCENARIOS = [
  { icon: "🚧", label: "Блокирует проезд" },
  { icon: "🪟", label: "Открыто окно" },
  { icon: "🔔", label: "Сигнализация" },
  { icon: "🚨", label: "Срочно: ДТП" },
  { icon: "✉️", label: "Своё сообщение" },
  { icon: "⭐", label: "Хочу такую же" },
];

const FAQ = [
  {
    q: "Кто может отправить мне сообщение?",
    a: "Любой, кто отсканирует QR с вашего авто. Регистрация для сканирующего не нужна.",
  },
  {
    q: "Увидит ли кто-то мой номер телефона?",
    a: "Нет. По умолчанию все контакты скрыты. Вы сами выбираете, что показывать.",
  },
  {
    q: "Что если меня беспокоит спам?",
    a: "Встроенный rate-limit: не более 3 сообщений с одного IP за 5 минут. Вы можете приостановить QR в любой момент.",
  },
  {
    q: "Как получить стикер?",
    a: "Оставьте заявку — мы свяжемся и организуем доставку или выдачу у партнёра.",
  },
];

export default function LandingPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="container">
        <div className="hero stack-md">
          <span className="chip">{ru.landing.hero.chip}</span>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, lineHeight: 1.15 }}>
            {ru.landing.hero.title}
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "1.05rem", maxWidth: "540px" }}>
            {ru.landing.hero.subtitle}
          </p>
          <div className="actions">
            <a className="btn btn-cta" href="#buy">
              {ru.landing.hero.buyCta}
            </a>
            <Link className="btn btn-secondary" href="/activate/enter">
              {ru.landing.hero.activateCta}
            </Link>
          </div>

          {/* Demo link */}
          <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            <Link href="/qr/demo" style={{ color: "var(--cyan)" }}>
              Посмотреть демо публичной страницы →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="container" aria-label="Преимущества">
        <div className="cards-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="card stack-sm">
              <div style={{ fontSize: "1.8rem" }}>{f.icon}</div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>{f.title}</h2>
              <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Scenarios preview ── */}
      <section className="container" aria-label="Сценарии">
        <h2 style={{ marginBottom: "1rem", fontSize: "1.3rem", fontWeight: 700 }}>
          {ru.landing.scenarios.title}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {SCENARIOS.map((s) => (
            <div key={s.label} className="card" style={{ textAlign: "center", padding: "1rem" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>{s.icon}</div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-2)", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="container" aria-label="FAQ">
        <h2 style={{ marginBottom: "1rem", fontSize: "1.3rem", fontWeight: 700 }}>
          {ru.landing.faq.title}
        </h2>
        <div className="stack-sm">
          {FAQ.map((item) => (
            <details key={item.q} className="card" style={{ cursor: "pointer" }}>
              <summary style={{ fontWeight: 600, fontSize: "0.9rem", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {item.q} <span style={{ color: "var(--muted)" }}>›</span>
              </summary>
              <p style={{ marginTop: "0.75rem", color: "var(--text-2)", fontSize: "0.875rem" }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="buy" className="container">
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(34,211,238,0.08) 100%)",
            border: "1px solid rgba(124,58,237,0.3)",
            textAlign: "center",
            padding: "2.5rem 2rem",
          }}
        >
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            {ru.landing.cta.title}
          </h2>
          <p style={{ color: "var(--text-2)", marginBottom: "1.5rem" }}>
            {ru.landing.cta.subtitle}
          </p>
          <a
            href="mailto:hello@birlinq.com?subject=Заявка на birlinq Move"
            className="btn btn-cta"
          >
            {ru.landing.cta.btn}
          </a>
        </div>
      </section>
    </main>
  );
}

