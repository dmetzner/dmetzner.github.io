import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { config, type Lang } from "./config";
import { useRoom } from "./useRoom";

// On-brand: the rubber duck rides along with the usual reactions.
const EMOJI = ["👋", "❤️", "🎉", "🔥", "🦆"];

// The live "room": an opt-in presence counter + shared floating emoji reactions.
// Renders nothing at all unless a Supabase channel is configured (config.room),
// and never connects until the visitor clicks "Join the room".
//
// UI is a quiet bottom-right pill that, at rest, only reads "·) live". Hover,
// focus or tap expands it into a card that explains the feature before asking
// the visitor to join — subtle when idle, self-explanatory on intent.
export default function Room({ lang }: { lang: Lang }) {
  const room = useRoom();
  const t = config.copy[lang];
  // Touch devices have no hover, so tapping the pill toggles the explainer open.
  // Desktop also gets it via :hover / :focus-within (see .room-fab in App.css).
  const [open, setOpen] = useState(false);

  if (!room.available) return null;

  return (
    <>
      {/* full-viewport overlay the reactions float up through (click-through) */}
      <div className="room-sky" aria-hidden>
        <AnimatePresence>
          {room.reactions.map((r) => (
            <motion.span
              key={r.id}
              className="room-react"
              style={{ left: `${r.x * 100}%` }}
              initial={{ opacity: 0, y: 24, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 0], y: "-42vh", scale: [0.4, 1.15, 1, 0.9] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.6, ease: "easeOut", times: [0, 0.12, 0.7, 1] }}
            >
              {r.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {room.joined ? (
        <div className="room-dock room-joined mono">
          <span className="room-count">
            <i className="room-dot" /> {room.count} {t.roomOnline}
          </span>
          <span className="room-emojis">
            {EMOJI.map((e) => (
              <button
                key={e}
                type="button"
                className="room-emoji"
                onClick={() => room.send(e)}
                aria-label={`send ${e}`}
              >
                {e}
              </button>
            ))}
          </span>
          <button
            type="button"
            className="room-leave"
            onClick={room.leave}
            aria-label={t.roomLeave}
            title={t.roomLeave}
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="room-fab mono" data-open={open || undefined}>
          <button
            type="button"
            className="room-pill"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={t.roomTitle}
          >
            <i className="room-dot" />
            <span className="room-pill-label">{t.roomIdle}</span>
          </button>
          <div className="room-card" role="dialog" aria-label={t.roomTitle}>
            <p className="room-card-title">
              <i className="room-dot" /> {t.roomTitle}
            </p>
            <p className="room-card-body">{t.roomBody}</p>
            <p className="room-card-hint">{t.roomHint}</p>
            <button
              type="button"
              className="room-join"
              onClick={room.join}
              disabled={room.connecting}
            >
              {room.connecting ? t.roomConnecting : t.roomJoin}
              {!room.connecting && <span aria-hidden> →</span>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
