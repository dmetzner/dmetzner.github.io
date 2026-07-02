import { useEffect, useRef } from "react";
import type { Lang } from "./config";
import { config } from "./config";

export type LegalKind = "impressum" | "privacy" | null;

// Austrian legal pages (ECG/Mediengesetz + GDPR). Bilingual: follows the site's
// EN/DE toggle. The German version is the legally binding one; English is a
// courtesy translation. (Kept here rather than config.ts because it's JSX-heavy.)
export default function Legal({
  kind,
  lang,
  onClose,
}: {
  kind: LegalKind;
  lang: Lang;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!kind) return;
    // Remember what had focus so we can restore it when the modal closes.
    const opener = document.activeElement as HTMLElement | null;
    // Move focus into the modal (the close button) on open.
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Trap Tab within the panel so focus can't escape behind the overlay.
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // Restore focus to the element that opened the modal.
      opener?.focus?.();
    };
  }, [kind, onClose]);

  if (!kind) return null;

  const de = lang === "de";
  return (
    <div className="legal-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        className="legal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={
          kind === "impressum"
            ? de
              ? "Impressum"
              : "Imprint"
            : de
              ? "Datenschutzerklärung"
              : "Privacy Policy"
        }
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="legal-close"
          onClick={onClose}
          aria-label={de ? "schließen" : "close"}
        >
          ✕
        </button>
        {kind === "impressum" ? <Impressum de={de} /> : <Privacy de={de} />}
      </div>
    </div>
  );
}

function Impressum({ de }: { de: boolean }) {
  const email = <a href={`mailto:${config.email}`}>{config.email}</a>;
  return de ? (
    <div className="legal-body">
      <h2>Impressum</h2>
      <p className="legal-dim">Offenlegung gemäß § 5 ECG und § 25 Mediengesetz.</p>
      <p>
        <b>Daniel Metzner</b>
        <br />
        Graz, Österreich
        <br />
        E-Mail: {email}
      </p>
      <p className="legal-dim">
        Diese Website ist ein persönliches Portfolio und dient der Darstellung der eigenen
        beruflichen Tätigkeit.
      </p>
    </div>
  ) : (
    <div className="legal-body">
      <h2>Imprint</h2>
      <p className="legal-dim">
        Disclosure pursuant to § 5 ECG and § 25 of the Austrian Media Act.
      </p>
      <p>
        <b>Daniel Metzner</b>
        <br />
        Graz, Austria
        <br />
        Email: {email}
      </p>
      <p className="legal-dim">
        This website is a personal portfolio presenting my professional work.
      </p>
    </div>
  );
}

function Privacy({ de }: { de: boolean }) {
  const email = <a href={`mailto:${config.email}`}>{config.email}</a>;
  return de ? (
    <div className="legal-body">
      <h2>Datenschutzerklärung</h2>
      <p className="legal-dim">Stand: Juni 2026</p>

      <h3>Hosting</h3>
      <p>
        Diese Seite wird über GitHub Pages (GitHub, Inc.) ausgeliefert. Beim Aufruf verarbeitet
        GitHub technisch notwendige Zugriffsdaten (u. a. die IP-Adresse) in Server-Logfiles.
      </p>

      {config.analytics.goatcounter && (
        <>
          <h3>Reichweitenmessung</h3>
          <p>
            Zur anonymen, cookielosen Reichweitenmessung wird GoatCounter eingesetzt. Erfasst werden
            aggregierte Seitenaufrufe sowie anonyme Nutzungs-Ereignisse (z. B. welche
            Terminal-Befehle verwendet werden) — ohne Cookies, ohne websiteübergreifendes Tracking
            und ohne personenbezogene Profile. Rechtsgrundlage: berechtigtes Interesse an einer
            datensparsamen Statistik (Art. 6 Abs. 1 lit. f DSGVO).
          </p>
        </>
      )}

      <h3>Lokale Speicherung — keine Cookies</h3>
      <p>
        Theme-, Sprach- und im „root"-Modus vorgenommene Textänderungen werden ausschließlich lokal
        in deinem Browser (localStorage) gespeichert. Es werden keine Cookies gesetzt.
        {!config.analytics.goatcounter &&
          " Darüber hinaus werden keine Analyse- oder Tracking-Dienste eingesetzt."}
      </p>

      <h3>Optionale Terminal-Funktionen</h3>
      <p>
        <b>whoami</b> fragt auf deine Eingabe hin deine IP-Adresse bei ipwho.is ab; das Ergebnis
        wird nur dir angezeigt.
        <br />
        <b>ai</b> lädt auf deine Eingabe hin ein KI-Modell von huggingface.co — dabei wird deine
        IP-Adresse an den Anbieter übertragen. Das Modell läuft anschließend vollständig lokal in
        deinem Browser; deine Eingaben verlassen dein Gerät nicht.
      </p>

      {config.room.url && config.room.anonKey && (
        <>
          <h3>Live-Raum (optional)</h3>
          <p>
            Erst auf deine Eingabe hin („Raum betreten“) baut dein Browser eine Echtzeit-Verbindung
            zu Supabase (EU-Region) auf; dabei wird deine IP-Adresse an Supabase übertragen. Solange
            du im Raum bist, sehen gleichzeitig Anwesende eine anonyme Anwesenheitszahl und die
            Emoji-Reaktionen, die du auslöst. Es werden keine Inhalte gespeichert, keine Cookies
            gesetzt und keine personenbezogenen Profile gebildet; die Verbindung endet, sobald du
            den Raum verlässt oder die Seite schließt. Rechtsgrundlage: deine Einwilligung durch
            aktives Beitreten (Art. 6 Abs. 1 lit. a DSGVO).
          </p>
        </>
      )}

      <h3>Deine Rechte &amp; Kontakt</h3>
      <p>
        Auskunft, Berichtigung und Löschung: {email}. Durch den Betreiber selbst werden keine
        personenbezogenen Daten gespeichert.
      </p>
    </div>
  ) : (
    <div className="legal-body">
      <h2>Privacy Policy</h2>
      <p className="legal-dim">Last updated: June 2026 · The German version is legally binding.</p>

      <h3>Hosting</h3>
      <p>
        This site is served via GitHub Pages (GitHub, Inc.). On access, GitHub processes technically
        necessary access data (including your IP address) in server log files.
      </p>

      {config.analytics.goatcounter && (
        <>
          <h3>Analytics</h3>
          <p>
            GoatCounter is used for anonymous, cookieless analytics. Aggregated page views and
            anonymous usage events (e.g. which terminal commands are used) are recorded — without
            cookies, without cross-site tracking, and without personal profiles. Legal basis:
            legitimate interest in privacy-friendly statistics (Art. 6(1)(f) GDPR).
          </p>
        </>
      )}

      <h3>Local storage — no cookies</h3>
      <p>
        Theme, language and any text edited in “root” mode are stored only locally in your browser
        (localStorage). No cookies are set.
        {!config.analytics.goatcounter && " No analytics or tracking services are used."}
      </p>

      <h3>Optional terminal features</h3>
      <p>
        <b>whoami</b> fetches your IP address from ipwho.is on your request; the result is shown
        only to you.
        <br />
        <b>ai</b> loads an AI model from huggingface.co on your request — this transmits your IP
        address to the provider. The model then runs entirely locally in your browser; your inputs
        never leave your device.
      </p>

      {config.room.url && config.room.anonKey && (
        <>
          <h3>Live room (optional)</h3>
          <p>
            Only on your request (“enter the room”) does your browser open a realtime connection to
            Supabase (EU region); this transmits your IP address to Supabase. While you are in the
            room, others present at the same time see an anonymous presence count and the emoji
            reactions you trigger. No content is stored, no cookies are set, and no personal
            profiles are built; the connection ends as soon as you leave the room or close the page.
            Legal basis: your consent by actively joining (Art. 6(1)(a) GDPR).
          </p>
        </>
      )}

      <h3>Your rights &amp; contact</h3>
      <p>
        Access, rectification and erasure: {email}. The operator itself stores no personal data.
      </p>
    </div>
  );
}
