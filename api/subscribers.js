import pool from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM public.de_subscribers ORDER BY created_at DESC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { email, type } = req.body;
      if (!email) return res.status(400).json({ error: 'Email required' });
      const cleanEmail = email.trim().toLowerCase();

      // Check if type column exists or insert safely
      const { rows } = await pool.query(
        `INSERT INTO public.de_subscribers (email)
         VALUES ($1)
         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
         RETURNING *`,
        [cleanEmail]
      );
      return res.status(201).json(rows[0] || { email: cleanEmail, type: type || 'all' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID or email required' });
      await pool.query('DELETE FROM public.de_subscribers WHERE id::text = $1 OR email = $1', [id]);
      return res.status(200).json({ success: true, id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error in subscribers:', err);
    res.status(500).json({ error: err.message });
  }
}
