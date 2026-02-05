import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/weekly', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      WITH bounds AS (
        SELECT
          (date_trunc('week', now())::date + 1) AS start_monday,
          (date_trunc('week', now())::date + 7) AS next_monday
      )
      SELECT EXTRACT(ISODOW FROM f.logged_at)::int AS isodow, COUNT(*)::int AS cnt
      FROM farts f, bounds b
      WHERE f.user_id = $1
        AND f.logged_at >= b.start_monday
        AND f.logged_at <  b.next_monday
      GROUP BY isodow
      `,
      [req.userId]
    );

    const dailyCounts = Array(7).fill(0);
    let totalWeek = 0;

    for (const r of rows) {
      const idx = r.isodow - 1;
      dailyCounts[idx] = r.cnt;
      totalWeek += r.cnt;
    }

    const { rows: todayRows } = await pool.query(
      `SELECT COUNT(*)::int AS c
       FROM farts
       WHERE user_id = $1
         AND DATE(logged_at AT TIME ZONE 'UTC') = CURRENT_DATE`,
      [req.userId]
    );
    const todayCount = todayRows[0]?.c ?? 0;

    res.json({ dailyCounts, totalWeek, todayCount });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'stats_failed' });
  }
});

export default router;
