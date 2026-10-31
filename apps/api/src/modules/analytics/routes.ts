import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { db } from '../../lib/db.js';
import { requirePermission } from '../../middleware/security.js';
import { dateRange, filtersSchema } from '../documents/service.js';
export const analytics = Router();
analytics.get('/overview', requirePermission('analytics.read'), async (req, res) => {
  const f = filtersSchema.parse(req.query);
  const range = dateRange(f.from, f.to);
  const where = { timestamp: range };
  const [views, searches, clicks, topQueries, groupedDocs, trends] = await Promise.all([
    db.documentView.count({ where: { viewedAt: range } }),
    db.searchClickLog.count({ where: { ...where, eventType: 'SEARCH' } }),
    db.searchClickLog.count({ where: { ...where, eventType: 'CLICK' } }),
    db.searchClickLog.groupBy({
      by: ['queryString'],
      where: { ...where, eventType: 'SEARCH' },
      _count: { _all: true },
      orderBy: { _count: { queryString: 'desc' } },
      take: 10,
    }),
    db.documentView.groupBy({
      by: ['documentId'],
      where: { viewedAt: range },
      _count: { _all: true },
      orderBy: { _count: { documentId: 'desc' } },
      take: 10,
    }),
    db.$queryRaw<{ day: Date; searches: bigint; clicks: bigint }[]>(
      Prisma.sql`SELECT date_trunc('day', timestamp AT TIME ZONE 'UTC') AS day, count(*) FILTER (WHERE event_type = 'SEARCH') AS searches, count(*) FILTER (WHERE event_type = 'CLICK') AS clicks FROM search_click_logs WHERE timestamp >= ${range.gte ?? new Date(0)} AND timestamp <= ${range.lte ?? new Date()} GROUP BY day ORDER BY day DESC LIMIT 90`,
    ),
  ]);
  const docs = await db.document.findMany({
    where: { id: { in: groupedDocs.map((d) => d.documentId) } },
    select: { id: true, title: true, slug: true },
  });
  res.json({
    data: {
      views,
      searches,
      clicks,
      ctr: searches ? (clicks / searches) * 100 : 0,
      ctrDefinition: 'clicks per search (%)',
      topQueries: topQueries.map((q) => ({ query: q.queryString, searches: q._count._all })),
      topDocuments: groupedDocs.map((d) => ({
        ...docs.find((x) => x.id === d.documentId),
        views: d._count._all,
      })),
      trends: trends
        .reverse()
        .map((t) => ({
          day: t.day.toISOString().slice(0, 10),
          searches: Number(t.searches),
          clicks: Number(t.clicks),
        })),
    },
  });
});
