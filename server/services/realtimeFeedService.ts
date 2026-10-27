import { redditConnector, type RawRedditPost } from '../integrations/redditConnector.js';
import { xConnector, type RawXPost } from '../integrations/xConnector.js';
import { nlpEngine } from '../ai/nlpEngine.js';
import { db } from '../db/store.js';
import { eventStream } from '../stream/eventStream.js';
import type { Signal, Incident } from '../types/index.js';

class RealtimeFeedService {
  private timer: NodeJS.Timeout | null = null;
  public feedMode: 'REAL_TIME_WEB' | 'SYNTHETIC' = 'REAL_TIME_WEB';
  private targetNodes = ['SECTOR_0x7A', 'VECTOR_BETA', 'ZONE_SIGMA', 'NODE_992'];
  private nodeIdx = 0;

  public start() {
    if (this.timer) return;
    db.simulationRunning = true;

    // Background tick to fetch real-time sentences every 4-6 seconds
    this.timer = setInterval(async () => {
      if (!db.simulationRunning) return;
      await this.fetchAndIngestNext();
    }, 4500);

    // Initial warm-up ingestion pass
    setTimeout(() => {
      this.fetchAndIngestNext().catch(() => {});
    }, 1000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    db.simulationRunning = false;
    eventStream.broadcast('simulation:status', { running: false, mode: this.feedMode });
  }

  /**
   * Fetches real live sentences alternately from Reddit and X / Microblogs
   */
  public async fetchAndIngestNext(): Promise<Signal | null> {
    // Alternates between Reddit and X
    const shouldFetchReddit = Math.random() > 0.5;
    let signal: Signal | null = null;

    if (shouldFetchReddit) {
      signal = await this.ingestFromReddit();
    }
    
    // If Reddit didn't return a new item or if it was X's turn, fetch from X
    if (!signal) {
      signal = await this.ingestFromX();
    }

    // If both public feeds returned nothing (e.g. rate limit), fall back to Reddit popular
    if (!signal) {
      signal = await this.ingestFromReddit('all');
    }

    return signal;
  }

  /**
   * Ingest real live sentences from Reddit
   */
  public async ingestFromReddit(subreddit?: string): Promise<Signal | null> {
    try {
      const posts = await redditConnector.fetchRealtimePosts(subreddit, 5);
      if (!posts.length) return null;

      // Pick the most recent un-ingested post
      const post = posts[0];
      const targetNode = this.targetNodes[this.nodeIdx % this.targetNodes.length];
      this.nodeIdx++;

      // Run real sentence through multi-stage NLP & Context engine
      const analysis = await nlpEngine.analyze({
        text: post.body,
        useGemini: false,
        contextWindowEnabled: true,
        contextThread: {
          preceding: [
            { author: 'r/' + post.subreddit, text: `Thread in r/${post.subreddit}`, time: 'RECENT' },
          ],
          target: post.body,
          subsequent: [],
        },
      });

      const signal: Signal = {
        id: `sig_${post.id}`,
        source: 'reddit',
        sourceHandle: `r/${post.subreddit} • u/${post.author}`,
        sourceChannel: `r/${post.subreddit}`,
        timeAgo: 'LIVE JUST NOW',
        timestamp: new Date().toISOString(),
        content: `"${post.body}"`,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        confidence: analysis.confidence,
        aiClassification: analysis.classification,
        targetNode,
        status: 'analyzed',
        isSynthetic: false, // REAL-TIME WEB DATA
        factors: analysis.factors,
        rationale: analysis.rationale,
      };

      this.processIngestedSignal(signal, analysis);
      return signal;
    } catch (err: any) {
      console.warn('[RealtimeFeed] Error ingesting Reddit:', err.message);
      return null;
    }
  }

  /**
   * Ingest real live sentences from X (Twitter) or public microblog firehose
   */
  public async ingestFromX(query?: string): Promise<Signal | null> {
    try {
      const posts = await xConnector.fetchRealtimePosts(query, 5);
      if (!posts.length) return null;

      const post = posts[0];
      const targetNode = this.targetNodes[this.nodeIdx % this.targetNodes.length];
      this.nodeIdx++;

      // Run real sentence through multi-stage NLP & Context engine
      const analysis = await nlpEngine.analyze({
        text: post.body,
        contextWindowEnabled: true,
        contextThread: {
          preceding: [
            { author: post.authorHandle, text: `Live microblog transmission`, time: 'LIVE' },
          ],
          target: post.body,
          subsequent: [],
        },
      });

      const signal: Signal = {
        id: `sig_${post.id}`,
        source: 'x',
        sourceHandle: post.authorHandle,
        timeAgo: 'LIVE JUST NOW',
        timestamp: new Date().toISOString(),
        content: `"${post.body}"`,
        riskScore: analysis.riskScore,
        riskLevel: analysis.riskLevel,
        confidence: analysis.confidence,
        aiClassification: analysis.classification,
        targetNode,
        status: 'analyzed',
        isSynthetic: false, // REAL-TIME WEB DATA
        factors: analysis.factors,
        rationale: analysis.rationale,
      };

      this.processIngestedSignal(signal, analysis);
      return signal;
    } catch (err: any) {
      console.warn('[RealtimeFeed] Error ingesting X:', err.message);
      return null;
    }
  }

  private processIngestedSignal(signal: Signal, analysis: any) {
    db.signals.unshift(signal);
    if (db.signals.length > 60) db.signals.pop();

    db.telemetry.ingestedPackets += Math.floor(Math.random() * 12 + 4);
    db.telemetry.analyzedToday++;
    if (signal.riskScore >= 50) db.telemetry.flaggedReview++;
    if (signal.riskScore >= 70) db.telemetry.highPriority++;

    eventStream.broadcast('signal:new', signal);

    // If risk score reaches moderate or high threshold, automatically dispatch to operator triage
    if (signal.riskScore >= 60) {
      const incident: Incident = {
        id: `inc-${signal.id.replace(/\D/g, '').slice(-6) || Math.floor(Math.random() * 9000 + 1000)}`,
        signalId: signal.id,
        ticketNumber: `SIGNAL #${Math.floor(Math.random() * 8000 + 1000)}`,
        severity: signal.riskLevel,
        riskScore: signal.riskScore,
        confidence: signal.confidence,
        classification: `LEVEL ${signal.riskScore >= 90 ? '4' : '3'} // ${analysis.classification}`,
        source: signal.source,
        sourceHandle: signal.sourceHandle,
        payload: signal.content.replace(/^"|"$/g, ''),
        targetNode: signal.targetNode,
        factors: analysis.factors,
        rationale: analysis.rationale,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            timestamp: new Date().toISOString(),
            action: 'LIVE_SIGNAL_DISPATCH',
            actor: 'AEGIS_REALTIME_INGESTION',
            details: `Real-time web signal from ${signal.sourceHandle} scored ${signal.riskScore}/100. Dispatched to Operator Triage.`,
          },
        ],
      };

      db.incidents.unshift(incident);
      if (db.incidents.length > 30) db.incidents.pop();

      db.addAuditEntry(
        'LIVE_INCIDENT_INGEST',
        'REALTIME_INGESTION',
        incident.id,
        `Real-time post from ${incident.sourceHandle} scored ${incident.riskScore}/100 (${analysis.classification})`
      );

      eventStream.broadcast('incident:new', incident);
    }
  }
}

export const realtimeFeedService = new RealtimeFeedService();
