import { useEffect } from "react";
import { config } from "./config";

export type LegalKind = "impressum" | "privacy" | null;

// Austrian legal pages (ECG/Mediengesetz + GDPR). German on purpose — these are
// the legally relevant texts. Edit the address line below to taste.
export default function Legal({ kind, onClose }: { kind: LegalKind; onClose: () => void }) {
  useEffect(() => {
    if (!kind) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kind, onClose]);

  if (!kind) return null;

  return (
    <div className="legal-overlay" onClick={onClose}>
      <div
        className="legal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={kind === "impressum" ? "Impressum" : "Datenschutzerklärung"}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="legal-close" onClick={onClose} aria-label="schließen">
          ✕
        </button>
        {kind === "impressum" ? <Impressum /> : <Privacy />}
      </div>
    </div>
  );
}

function Impressum() {
  return (
    <div className="legal-body">
      <h2>Impressum</h2>
      <p className="legal-dim">Offenlegung gemäß § 5 ECG und § 25 Mediengesetz.</p>
      <p>
        <b>Daniel Metzner</b>
        <br />
        Graz, Österreich
        <br />
        E-Mail: <a href={`mailto:${config.email}`}>{config.email}</a>
      </p>
      <p className="legal-dim">
        Diese Website ist ein persönliches Portfolio und dient der Darstellung der eigenen
        beruflichen Tätigkeit.
      </p>
    </div>
  );
}

function Privacy() {
  return (
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

      <h3>Lokale Speicherung — keine Cookies, kein Tracking</h3>
      <p>
        Theme-, Sprach- und im „root"-Modus vorgenommene Textänderungen werden ausschließlich lokal
        in deinem Browser (localStorage) gespeichert. Es werden keine Cookies gesetzt und keine
        Analyse- oder Tracking-Dienste eingesetzt.
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

      <h3>Deine Rechte &amp; Kontakt</h3>
      <p>
        Auskunft, Berichtigung und Löschung: <a href={`mailto:${config.email}`}>{config.email}</a>.
        Durch den Betreiber selbst werden keine personenbezogenen Daten gespeichert.
      </p>
    </div>
  );
}
