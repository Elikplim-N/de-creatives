import pool from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT content FROM public.de_manifesto WHERE id = $1', ['main']);
      if (rows.length > 0) {
        return res.status(200).json(rows[0].content);
      }
      return res.status(200).json(null);
    }

    if (req.method === 'POST') {
      const content = req.body;
      const { rows } = await pool.query(
        'INSERT INTO public.de_manifesto (id, content, updated_at) VALUES ($1, $2, now()) ON CONFLICT (id) DO UPDATE SET content = $2, updated_at = now() RETURNING *',
        ['main', JSON.stringify(content)]
      );
      return res.status(200).json(rows[0].content);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error in manifesto:', err);
    res.status(500).json({ error: err.message });
  }
}
