import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  const { is_silent = false, logged_at = null } = req.body || {};
  try {
    const { rows } = await pool.query(
      `INSERT INTO farts (user_id, is_silent, logged_at)
       VALUES ($1, $2, COALESCE($3::timestamptz, now()))
       RETURNING id, user_id, logged_at, is_silent, created_at`,
      [req.userId, !!is_silent, logged_at]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'insert_failed' });
  }
});

router.delete('/reset', async (req, res) => {
  try {
    await pool.query(`DELETE FROM farts WHERE user_id = $1`, [req.userId]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'delete_failed' });
  }
});

export default router;
