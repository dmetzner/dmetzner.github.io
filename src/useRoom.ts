import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "./config";

// A floating emoji reaction in flight. `x` is a 0..1 fraction of the viewport
// width so positions translate across any screen size.
export type Reaction = { id: string; emoji: string; x: number };

export type Room = {
  available: boolean; // config present → the dock is allowed to show at all
  joined: boolean;
  connecting: boolean;
  count: number; // people currently in the room (incl. you)
  reactions: Reaction[];
  join: () => void;
  leave: () => void;
  send: (emoji: string) => void;
};

// How long a reaction stays mounted; CSS drives the matching float-up animation.
const REACTION_MS = 3800;
const CHANNEL = "portfolio";

// Live presence + emoji reactions over a Supabase Realtime channel. The whole
// point is privacy by opt-in: nothing connects until join() is called, so a
// visitor's IP only reaches Supabase once they explicitly enter. Everything is
// ephemeral — broadcast + presence, no tables, no localStorage (persistSession
// is off so the client sets no cookies/storage).
export function useRoom(): Room {
  const available = Boolean(config.room.url && config.room.anonKey);
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [count, setCount] = useState(0);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  // Realtime channel + client kept in refs; they live outside React's render
  // cycle and must survive re-renders without re-subscribing.
  // biome-ignore lint/suspicious/noExplicitAny: supabase types are loaded lazily
  const channelRef = useRef<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: supabase types are loaded lazily
  const clientRef = useRef<any>(null);
  // Tracks intent across the async import: if the visitor hits leave() while the
  // supabase chunk is still downloading, this flips false and join() bails out
  // instead of opening an orphan connection.
  const wantedRef = useRef(false);

  const addReaction = useCallback((emoji: string, x: number) => {
    const id = crypto.randomUUID();
    setReactions((r) => [...r, { id, emoji, x }]);
    setTimeout(() => {
      setReactions((r) => r.filter((reaction) => reaction.id !== id));
    }, REACTION_MS);
  }, []);

  const leave = useCallback(() => {
    wantedRef.current = false;
    channelRef.current?.unsubscribe();
    clientRef.current?.removeAllChannels?.();
    channelRef.current = null;
    clientRef.current = null;
    setJoined(false);
    setConnecting(false);
    setCount(0);
    setReactions([]);
  }, []);

  const join = useCallback(async () => {
    if (channelRef.current || !available) return;
    wantedRef.current = true;
    setConnecting(true);
    // Lazy chunk: supabase-js is only fetched when a visitor opts in, so it
    // never weighs on the initial bundle (same approach as the AI model).
    const { createClient } = await import("@supabase/supabase-js");
    // Bail if the visitor left again before the chunk finished loading.
    if (!wantedRef.current) return;

    const client = createClient(config.room.url, config.room.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }, // no cookies/storage
    });
    const channel = client.channel(CHANNEL, {
      config: { presence: { key: crypto.randomUUID() }, broadcast: { self: false } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        setCount(Object.keys(channel.presenceState()).length);
      })
      // biome-ignore lint/suspicious/noExplicitAny: broadcast payload is untyped
      .on("broadcast", { event: "reaction" }, ({ payload }: any) => {
        if (payload?.emoji) addReaction(String(payload.emoji), Number(payload.x) || 0.5);
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          channel.track({ at: Date.now() });
          setConnecting(false);
          setJoined(true);
        }
      });
    clientRef.current = client;
    channelRef.current = channel;
  }, [available, addReaction]);

  const send = useCallback(
    (emoji: string) => {
      const x = Math.random();
      addReaction(emoji, x); // optimistic: show mine instantly, broadcast to others
      channelRef.current?.send({ type: "broadcast", event: "reaction", payload: { emoji, x } });
    },
    [addReaction],
  );

  // Tear the connection down if the component unmounts while joined.
  useEffect(() => () => leave(), [leave]);

  return { available, joined, connecting, count, reactions, join, leave, send };
}
