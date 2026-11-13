import 'dotenv/config';
import { db } from '../apps/api/src/lib/db.js';
import { ensureIndexReady, executeSearch } from '../apps/api/src/modules/search/service.js';

interface QueryGroundTruth {
  query: string;
  relevantKeywords: string[];
}

const testQueries: QueryGroundTruth[] = [
  {
    query: 'trí tuệ nhân tạo',
    relevantKeywords: ['trí tuệ nhân tạo', 'ai', 'mô hình ngôn ngữ', 'deepseek', 'học máy', 'generative ai'],
  },
  {
    query: 'học máy',
    relevantKeywords: ['học máy', 'machine learning', 'thuật toán', 'mô hình', 'dữ liệu', 'huấn luyện'],
  },
  {
    query: 'bán dẫn',
    relevantKeywords: ['bán dẫn', 'vi mạch', 'chip', 'semiconductor', 'nhà máy', 'sản xuất chip'],
  },
  {
    query: 'chuyển đổi số',
    relevantKeywords: ['chuyển đổi số', 'chính phủ số', 'hạ tầng số', 'dịch vụ công', 'số hóa'],
  },
  {
    query: 'an ninh mạng',
    relevantKeywords: ['an ninh mạng', 'bảo mật', 'tấn công mạng', 'mã độc', 'lừa đảo', 'an toàn thông tin'],
  },
];

function isRelevant(title: string, summary: string, keywords: string[]): boolean {
  const text = `${title} ${summary}`.toLowerCase();
  return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

async function runBenchmark() {
  console.log('--- Initializing Inverted Index from Database ---');
  await ensureIndexReady();
  console.log(`Index initialization complete.\n`);

  const modes = ['ilike', 'tfidf', 'bm25', 'hybrid'] as const;

  const results: Record<
    string,
    Record<
      string,
      {
        count: number;
        latencyMs: number;
        pAt5: number;
        rr: number;
        top1Title: string;
        top1Score: number;
      }
    >
  > = {};

  for (const qObj of testQueries) {
    const q = qObj.query;
    results[q] = {};

    for (const mode of modes) {
      // Warm up once
      await executeSearch({ q, mode, page: 1, pageSize: 5 }, 'benchmark-runner');

      // Measure 5 runs for stable average latency
      const latencies: number[] = [];
      let finalRes: Awaited<ReturnType<typeof executeSearch>> | null = null;
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        finalRes = await executeSearch({ q, mode, page: 1, pageSize: 5 }, 'benchmark-runner');
        latencies.push(performance.now() - start);
      }
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      const top5 = finalRes?.data ?? [];
      let relevantCount = 0;
      let rr = 0;

      top5.forEach((doc, rankIdx: number) => {
        const rel = isRelevant(doc.title, doc.summary, qObj.relevantKeywords);
        if (rel) {
          relevantCount++;
          if (rr === 0) {
            rr = 1 / (rankIdx + 1);
          }
        }
      });

      // Standard IR metric: Precision@K uses fixed denominator K = 5
      const pAt5 = relevantCount / 5;

      results[q][mode] = {
        count: finalRes?.total ?? 0,
        latencyMs: Number(avgLatency.toFixed(2)),
        pAt5: Number(pAt5.toFixed(2)),
        rr: Number(rr.toFixed(3)),
        top1Title: top5[0]?.title || 'None',
        top1Score: top5[0]?.score || 0,
      };
    }
  }

  console.log('=== COMPARATIVE INFORMATION RETRIEVAL BENCHMARK RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  // Compute Macro-Averages
  console.log('\n=== SUMMARY METRICS PER ALGORITHM ===');
  for (const mode of modes) {
    let totalLatency = 0;
    let totalP5 = 0;
    let totalRR = 0;
    let totalDocs = 0;

    for (const qObj of testQueries) {
      const m = results[qObj.query]?.[mode];
      if (!m) continue;
      totalLatency += m.latencyMs;
      totalP5 += m.pAt5;
      totalRR += m.rr;
      totalDocs += m.count;
    }

    const n = testQueries.length;
    console.log(
      `Mode: ${mode.toUpperCase().padEnd(6)} | Avg Latency: ${(totalLatency / n).toFixed(2)}ms | Mean P@5: ${(totalP5 / n).toFixed(2)} | MRR: ${(totalRR / n).toFixed(3)} | Avg Retrieved: ${(totalDocs / n).toFixed(1)}`
    );
  }

  await db.$disconnect();
}

runBenchmark().catch(console.error);
