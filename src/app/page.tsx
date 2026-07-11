import Link from "next/link";
import { ru } from "@/lib/i18n/ru";

export default function LandingPage() {
  return (
    <main className="container stack-lg">
      <header className="hero stack-md">
        <p className="chip">{ru.brand}</p>
        <h1>{ru.landing.title}</h1>
        <p>{ru.landing.subtitle}</p>
        <div className="actions">
          <a className="btn" href="#buy">
            {ru.landing.buyCta}
          </a>
          <Link className="btn btn-secondary" href="/activate/demo-qr">
            {ru.landing.activateCta}
          </Link>
        </div>
      </header>

      <section className="cards-grid" aria-label="Преимущества">
        <article className="card">{ru.landing.sections.privacy}</article>
        <article className="card">{ru.landing.sections.speed}</article>
        <article className="card">{ru.landing.sections.safety}</article>
      </section>

      <section id="buy" className="card stack-sm">
        <h2>Готовы подключить birlinq Move?</h2>
        <p>Оставьте заявку, чтобы получить партию QR-стикеров и доступ к кабинету.</p>
        <Link className="btn" href="/qr/demo-qr">
          Открыть демо QR-страницу
        </Link>
      </section>
    </main>
  );
}
