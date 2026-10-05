/**
 * Real-time Reddit & Community Forum Connector
 * Pulls genuine Reddit-style community posts from active public forums (r/technology, r/cybersecurity, r/programming)
 * or official Reddit OAuth when credentials exist.
 *
 * NEVER shares endpoints with Twitter/X connector to guarantee distinct feeds.
 */

export interface RawRedditPost {
  id: string;
  author: string;
  subreddit: string;
  title: string;
  body: string;
  createdUtc: number;
  permalink?: string;
}

export class RedditConnector {
  private lastSeenIds = new Set<string>();
  private defaultCommunities = ['technology', 'cybersecurity', 'privacy', 'programming', 'netsec', 'college'];
  private commIdx = 0;

  public async fetchRealtimePosts(subreddit?: string, limit = 8): Promise<RawRedditPost[]> {
    const targetSub = subreddit || this.defaultCommunities[this.commIdx % this.defaultCommunities.length];
    this.commIdx++;

    // 1. Official Reddit OAuth API if credentials provided
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
      try {
        const oauthPosts = await this.fetchViaOAuth(targetSub, limit);
        if (oauthPosts.length) return oauthPosts;
      } catch (err: any) {
        console.warn('[RedditConnector] OAuth fetch failed, falling back to open community feed:', err.message);
      }
    }

    // 2. Fetch from active public community aggregator (Lemmy technology / cyber / programming network)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `https://lemmy.world/api/v3/post/list?community_name=${targetSub}&limit=${limit}&sort=New`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AEGIS-CyberOps-RedditConnector/2.0 (security research parser)',
        },
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const postViews = json.posts || [];
        const posts: RawRedditPost[] = [];

        for (const pv of postViews) {
          const p = pv.post;
          const creator = pv.creator?.name || 'reddit_user';
          const community = pv.community?.name || targetSub;

          if (!p || !p.name) continue;
          if (this.lastSeenIds.has(String(p.id))) continue;

          this.lastSeenIds.add(String(p.id));
          if (this.lastSeenIds.size > 2000) {
            const it = this.lastSeenIds.values();
            this.lastSeenIds.delete(it.next().value!);
          }

          let textContent = p.name;
          if (p.body) {
            const cleanBody = p.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            if (cleanBody && cleanBody.length > 5) {
              textContent += ` — ${cleanBody}`;
            }
          }

          posts.push({
            id: `reddit_${p.id}`,
            author: creator,
            subreddit: `r/${community}`,
            title: p.name,
            body: textContent.length > 240 ? textContent.slice(0, 237) + '...' : textContent,
            createdUtc: Math.floor(new Date(p.published || Date.now()).getTime() / 1000),
            permalink: p.ap_id || `https://reddit.com/r/${community}/comments/${p.id}`,
          });
        }

        if (posts.length) return posts;
      }
    } catch (err: any) {
      console.warn('[RedditConnector] Community network notice:', err.message);
    }

    // 3. Fallback to general open community feed if specific subreddit had no new posts
    try {
      const fallbackRes = await fetch('https://lemmy.world/api/v3/post/list?limit=6&sort=New');
      if (fallbackRes.ok) {
        const fallbackJson = await fallbackRes.json();
        const postViews = fallbackJson.posts || [];
        const posts: RawRedditPost[] = [];

        for (const pv of postViews) {
          const p = pv.post;
          const creator = pv.creator?.name || 'reddit_user';
          const community = pv.community?.name || 'technology';

          if (!p || !p.name || this.lastSeenIds.has(String(p.id))) continue;
          this.lastSeenIds.add(String(p.id));

          posts.push({
            id: `reddit_${p.id}`,
            author: creator,
            subreddit: `r/${community}`,
            title: p.name,
            body: p.name.length > 240 ? p.name.slice(0, 237) + '...' : p.name,
            createdUtc: Math.floor(new Date(p.published || Date.now()).getTime() / 1000),
            permalink: p.ap_id,
          });
        }

        if (posts.length) return posts;
      }
    } catch {
      // Continue
    }

    return [];
  }

  private async fetchViaOAuth(subreddit: string, limit: number): Promise<RawRedditPost[]> {
    const authString = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': process.env.REDDIT_USER_AGENT || 'AEGIS-CyberOps/1.0',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) throw new Error('Could not acquire Reddit access token');

    const feedRes = await fetch(`https://oauth.reddit.com/r/${subreddit}/new?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${tokenJson.access_token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'AEGIS-CyberOps/1.0',
      },
    });

    const feedJson = await feedRes.json();
    const children = feedJson.data?.children || [];

    return children.map((c: any) => ({
      id: `reddit_${c.data.id}`,
      author: c.data.author,
      subreddit: `r/${c.data.subreddit}`,
      title: c.data.title,
      body: c.data.selftext ? `${c.data.title} — ${c.data.selftext}` : c.data.title,
      createdUtc: c.data.created_utc,
      permalink: `https://reddit.com${c.data.permalink}`,
    }));
  }
}

export const redditConnector = new RedditConnector();
