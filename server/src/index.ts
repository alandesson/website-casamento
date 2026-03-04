import express from 'express';
import cors from 'cors';
import { initDb } from './db';

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

let dbPromise = initDb();

app.post('/rsvp', async (req, res) => {
  const { names, name, attending } = req.body;

  // Accept either `names` (array) or legacy `name` (string)
  const guestNames: string[] = Array.isArray(names)
    ? names
    : typeof name === 'string'
    ? [name]
    : [];

  if (!guestNames.length || typeof attending !== 'boolean') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const db = await dbPromise;
  for (const guestName of guestNames) {
    const trimmed = guestName.trim();
    if (trimmed) {
      const existing = await db.get(
        'SELECT id FROM rsvps WHERE LOWER(name) = LOWER(?)',
        trimmed
      );
      if (!existing) {
        await db.run(
          'INSERT INTO rsvps (name, attending) VALUES (?, ?)',
          trimmed,
          attending ? 1 : 0
        );
      }
    }
  }
  res.status(201).json({ message: 'Recorded' });
});

// Check which names are already registered
// GET /rsvp/check?names=Name1,Name2
app.get('/rsvp/check', async (req, res) => {
  const raw = typeof req.query.names === 'string' ? req.query.names : '';
  const names = raw.split(',').map(n => n.trim()).filter(Boolean);
  if (!names.length) return res.json({ alreadyConfirmed: [], notConfirmed: [] });

  const db = await dbPromise;
  const alreadyConfirmed: string[] = [];
  const notConfirmed: string[] = [];

  for (const name of names) {
    const row = await db.get(
      'SELECT id FROM rsvps WHERE LOWER(name) = LOWER(?)',
      name
    );
    if (row) alreadyConfirmed.push(name);
    else notConfirmed.push(name);
  }

  res.json({ alreadyConfirmed, notConfirmed });
});

app.get('/rsvps', async (req, res) => {
  const db = await dbPromise;
  const rows = await db.all('SELECT * FROM rsvps');
  res.json(rows);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
