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
export function useTil(limit = 3): { posts: TilPost[] } {
  const [posts, setPosts] = useState<TilPost[]>([]);

  useEffect(() => {
    let alive = true;
    fetch(config.blog.feed)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("feed"))))
      .then((data: TilPost[]) => {
        // sanitize feed URLs — defends the rendered <a href> against a tampered feed
        const clean = data.slice(0, limit).map((p) => ({ ...p, url: safeUrl(p.url) }));
        if (alive) setPosts(clean);
      })
      .catch(() => {
        if (alive) setPosts([]);
      });
    return () => {
      alive = false;
    };
  }, [limit]);

  return { posts };
}
