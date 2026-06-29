import { AnimatePresence, motion } from "framer-motion";
import { config, type Lang } from "./config";
import { useRoom } from "./useRoom";

// On-brand: the rubber duck rides along with the usual reactions.
const EMOJI = ["👋", "❤️", "🎉", "🔥", "🦆"];

// The live "room": an opt-in presence counter + shared floating emoji reactions.
// Renders nothing at all unless a Supabase channel is configured (config.room),
// and never connects until the visitor clicks "enter the room".
export default function Room({ lang }: { lang: Lang }) {
  const room = useRoom();
  const t = config.copy[lang];

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

      <div className="room-dock mono">
        {room.joined ? (
          <>
            <span className="room-count" title={t.roomHint}>
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
          </>
        ) : (
          <button
            type="button"
            className="room-join"
            onClick={room.join}
            disabled={room.connecting}
            title={t.roomHint}
          >
            <i className="room-dot" />
            {room.connecting ? t.roomConnecting : t.roomJoin}
          </button>
        )}
      </div>
    </>
  );
}
