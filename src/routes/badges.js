import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT emoji, title_key AS "titleKey", description_key AS "descriptionKey",
              is_unlocked AS "isUnlocked"
       FROM badges
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'list_failed' });
  }
});

router.post('/', async (req, res) => {
  const { emoji, titleKey, descriptionKey, isUnlocked = false } = req.body || {};
  if (!emoji || !titleKey || !descriptionKey) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO badges (user_id, emoji, title_key, description_key, is_unlocked)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING emoji, title_key AS "titleKey", description_key AS "descriptionKey", is_unlocked AS "isUnlocked"`,
      [req.userId, emoji, titleKey, descriptionKey, !!isUnlocked]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'insert_failed' });
  }
});

export default router;
