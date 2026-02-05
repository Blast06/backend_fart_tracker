import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fartsRouter from './routes/farts.js';
import statsRouter from './routes/stats.js';
import badgesRouter from './routes/badges.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const uid = req.header('x-user-id');
  if (!uid) return res.status(401).json({ error: 'Missing x-user-id' });
  req.userId = uid;
  next();
});

app.use('/api/v1/farts', fartsRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/badges', badgesRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));
