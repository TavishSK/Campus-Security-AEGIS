/**
 * Real-time X (Twitter) & Public Microblog Data Connector
 * Pulls live microblog dispatches from official Twitter API v2 or live public federated timelines.
 *
 * Exclusively handles tweet-style microblogs with @handles, hashtags, and short dispatches.
 * NEVER shares endpoints with Reddit connector.
 */

export interface RawXPost {
  id: string;
  author: string;
  authorHandle: string;
  body: string;
  createdUtc: number;
  url?: string;
  source: 'x';
}

export class XConnector {
  private lastSeenIds = new Set<string>();

  public async fetchRealtimePosts(query = 'security OR server OR code', limit = 8): Promise<RawXPost[]> {
    // 1. Official Twitter / X API v2 when X_BEARER_TOKEN is configured
    if (process.env.X_BEARER_TOKEN) {
      try {
        const xPosts = await this.fetchFromOfficialX(query, limit);
        if (xPosts.length) return xPosts;
      } catch (err: any) {
        console.warn('[XConnector] Official X API fetch notice:', err.message);
      }
    }

    // 2. Real-time Live Public Microblog Firehose (Fosstodon / Mastodon federated network)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://fosstodon.org/api/v1/timelines/public?limit=${limit}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AEGIS-CyberOps-XConnector/2.0 (security research parser)',
        },
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const rawItems = await res.json();
        const posts: RawXPost[] = [];

        for (const item of rawItems) {
          if (!item.content) continue;
          if (this.lastSeenIds.has(String(item.id))) continue;

          this.lastSeenIds.add(String(item.id));
          if (this.lastSeenIds.size > 2000) {
            const it = this.lastSeenIds.values();
            this.lastSeenIds.delete(it.next().value!);
          }

          // Strip HTML tags and clean up tweet text
          const plainText = item.content
            .replace(/<[^>]+>/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();

          if (plainText.length < 12) continue;

          const username = item.account?.username || 'tweet_user';

          posts.push({
            id: `x_${item.id}`,
            author: item.account?.display_name || username,
            authorHandle: `@${username}`,
            body: plainText.length > 240 ? plainText.slice(0, 237) + '...' : plainText,
            createdUtc: Math.floor(new Date(item.created_at || Date.now()).getTime() / 1000),
            url: item.url,
            source: 'x',
          });
        }

        if (posts.length) return posts;
      }
    } catch (err: any) {
      console.warn('[XConnector] Microblog stream notice:', err.message);
    }

    // 3. Fallback to alternative public microblog firehose
    try {
      const fallbackRes = await fetch('https://mastodon.world/api/v1/timelines/public?limit=6');
      if (fallbackRes.ok) {
        const items = await fallbackRes.json();
        const posts: RawXPost[] = [];

        for (const item of items) {
          if (!item.content || this.lastSeenIds.has(String(item.id))) continue;
          this.lastSeenIds.add(String(item.id));

          const plainText = item.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (plainText.length < 12) continue;

          posts.push({
            id: `x_${item.id}`,
            author: item.account?.display_name || item.account?.username || 'x_feed',
            authorHandle: `@${item.account?.username || 'x_feed'}`,
            body: plainText.length > 240 ? plainText.slice(0, 237) + '...' : plainText,
            createdUtc: Math.floor(new Date(item.created_at || Date.now()).getTime() / 1000),
            url: item.url,
            source: 'x',
          });
        }

        if (posts.length) return posts;
      }
    } catch {
      // Continue
    }

    return [];
  }

  private async fetchFromOfficialX(query: string, limit: number): Promise<RawXPost[]> {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=${encoded}&max_results=${Math.max(10, Math.min(100, limit))}&tweet.fields=created_at,author_id`, {
      headers: {
        'Authorization': `Bearer ${process.env.X_BEARER_TOKEN}`,
      },
    });

    if (!res.ok) {
      throw new Error(`X API responded with ${res.status}`);
    }

    const json = await res.json();
    const data = json.data || [];

    return data.map((t: any) => ({
      id: `x_${t.id}`,
      author: t.author_id ? `User ${t.author_id.slice(-4)}` : 'X User',
      authorHandle: `@x_feed_${t.id.slice(-4)}`,
      body: t.text,
      createdUtc: Math.floor(new Date(t.created_at || Date.now()).getTime() / 1000),
      url: `https://x.com/i/web/status/${t.id}`,
      source: 'x' as const,
    }));
  }
}

export const xConnector = new XConnector();
