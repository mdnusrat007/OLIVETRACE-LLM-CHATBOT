import InferenceLog from '../models/InferenceLog.js';
import Conversation from '../models/Conversation.js';

function parseDateRange(range) {
  const units = { h: 3600000, d: 86400000 };
  const match = range.match(/^(\d+)([hd])$/);
  if (!match) return new Date(Date.now() - 86400000);
  return new Date(Date.now() - parseInt(match[1]) * units[match[2]]);
}

export async function getSummary(req, res, next) {
  try {
    const since = parseDateRange(req.query.range || '24h');
    const [agg, active] = await Promise.all([
      InferenceLog.aggregate([
        { $match: { requestTimestamp: { $gte: since } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
            errorCount: { $sum: { $cond: [{ $ne: ['$status', 'success'] }, 1, 0] } },
            avgLatency: { $avg: '$latencyMs' },
            totalTokens: { $sum: '$totalTokens' },
            totalCost: { $sum: '$estimatedCostUsd' },
            latencies: { $push: '$latencyMs' },
          },
        },
      ]),
      Conversation.countDocuments({ status: 'active' }),
    ]);

    const stats = agg[0] || {};
    const latencies = (stats.latencies || []).sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);

    res.json({
      success: true,
      data: {
        totalRequests: stats.totalRequests || 0,
        successRate: stats.totalRequests ? ((stats.successCount / stats.totalRequests) * 100).toFixed(1) : 100,
        avgLatencyMs: Math.round(stats.avgLatency || 0),
        p95LatencyMs: latencies[p95Index] || 0,
        totalTokens: stats.totalTokens || 0,
        totalCostUsd: parseFloat((stats.totalCost || 0).toFixed(4)),
        errorCount: stats.errorCount || 0,
        activeConversations: active,
      },
    });
  } catch (err) { next(err); }
}

export async function getLatency(req, res, next) {
  try {
    const { range = '24h' } = req.query;
    const since = parseDateRange(range);
    const data = await InferenceLog.aggregate([
      { $match: { requestTimestamp: { $gte: since }, status: 'success' } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%dT%H:00:00Z',
              date: '$requestTimestamp',
            },
          },
          avgLatency: { $avg: '$latencyMs' },
          count: { $sum: 1 },
          latencies: { $push: '$latencyMs' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = data.map((d) => {
      const sorted = d.latencies.sort((a, b) => a - b);
      return {
        time: d._id,
        avgLatency: Math.round(d.avgLatency),
        p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
        count: d.count,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getThroughput(req, res, next) {
  try {
    const { range = '24h' } = req.query;
    const since = parseDateRange(range);
    const data = await InferenceLog.aggregate([
      { $match: { requestTimestamp: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%dT%H:00:00Z', date: '$requestTimestamp' } },
          requests: { $sum: 1 },
          tokens: { $sum: '$totalTokens' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getErrors(req, res, next) {
  try {
    const { range = '24h' } = req.query;
    const since = parseDateRange(range);
    const data = await InferenceLog.aggregate([
      { $match: { requestTimestamp: { $gte: since }, status: { $ne: 'success' } } },
      {
        $group: {
          _id: { provider: '$provider', errorCode: '$errorCode' },
          count: { $sum: 1 },
          lastSeen: { $max: '$requestTimestamp' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getProviders(req, res, next) {
  try {
    const since = parseDateRange('7d');
    const data = await InferenceLog.aggregate([
      { $match: { requestTimestamp: { $gte: since } } },
      {
        $group: {
          _id: '$provider',
          totalRequests: { $sum: 1 },
          successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          avgLatency: { $avg: '$latencyMs' },
          totalCost: { $sum: '$estimatedCostUsd' },
          totalTokens: { $sum: '$totalTokens' },
        },
      },
    ]);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}
