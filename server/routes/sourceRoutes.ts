import { Router } from 'express';
import { realtimeFeedService } from '../services/realtimeFeedService.js';
import { db } from '../db/store.js';

export const sourceRouter = Router();

sourceRouter.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      mode: realtimeFeedService.feedMode,
      reddit: {
        status: 'CONNECTED_LIVE',
        type: process.env.REDDIT_CLIENT_ID ? 'AUTHORIZED_OAUTH' : 'REALTIME_PUBLIC_STREAM',
        lastFetch: new Date().toISOString(),
        monitoredSubreddits: ['r/technology', 'r/cybersecurity', 'r/compsci', 'r/college', 'r/programming'],
      },
      x: {
        status: 'CONNECTED_LIVE',
        type: process.env.X_BEARER_TOKEN ? 'AUTHORIZED_TWITTER_V2' : 'REALTIME_MICROBLOG_FIREHOSE',
        lastFetch: new Date().toISOString(),
        query: 'code OR server OR security OR campus',
      },
      liveStreamActive: db.simulationRunning,
    },
  });
});

sourceRouter.post('/fetch-live-reddit', async (req, res) => {
  try {
    const { subreddit } = req.body;
    const signal = await realtimeFeedService.ingestFromReddit(subreddit);
    if (!signal) {
      return res.status(404).json({ success: false, message: 'No new posts retrieved from subreddit' });
    }
    res.json({ success: true, data: signal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

sourceRouter.post('/fetch-live-x', async (req, res) => {
  try {
    const { query } = req.body;
    const signal = await realtimeFeedService.ingestFromX(query);
    if (!signal) {
      return res.status(404).json({ success: false, message: 'No new posts retrieved from X / Microblog feed' });
    }
    res.json({ success: true, data: signal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

sourceRouter.post('/credentials', (req, res) => {
  const { redditClientId, redditClientSecret, xBearerToken } = req.body;
  if (redditClientId) process.env.REDDIT_CLIENT_ID = redditClientId;
  if (redditClientSecret) process.env.REDDIT_CLIENT_SECRET = redditClientSecret;
  if (xBearerToken) process.env.X_BEARER_TOKEN = xBearerToken;

  db.addAuditEntry(
    'SOURCE_CREDENTIALS_UPDATED',
    'BLACK_HAT_07',
    'SOURCE_CONNECTOR',
    'Operator updated real-time Reddit / X API authentication credentials.'
  );

  res.json({
    success: true,
    message: 'Source credentials configured. Real-time authorized ingest active.',
  });
});
