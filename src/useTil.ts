import { useEffect, useState } from "react";
import { config } from "./config";
import { safeUrl } from "./url";

export type TilPost = {
  title: string;
  description: string;
  pubDate: string;
  url: string;
  tags: string[];
};

// Fetches the latest notes from the TIL blog's posts.json (CORS-enabled).
// Fails silently — the Writing section just doesn't render if the feed is down.
export function useTil(limit = 3): { loading: boolean; posts: TilPost[] } {
  const [state, setState] = useState<{ loading: boolean; posts: TilPost[] }>({
    loading: true,
    posts: [],
  });

  useEffect(() => {
    let alive = true;
    fetch(config.blog.feed)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("feed"))))
      .then((posts: TilPost[]) => {
        // sanitize feed URLs — defends the rendered <a href> against a tampered feed
        const clean = posts.slice(0, limit).map((p) => ({ ...p, url: safeUrl(p.url) }));
        if (alive) setState({ loading: false, posts: clean });
      })
      .catch(() => {
        if (alive) setState({ loading: false, posts: [] });
      });
    return () => {
      alive = false;
    };
  }, [limit]);

  return state;
}
