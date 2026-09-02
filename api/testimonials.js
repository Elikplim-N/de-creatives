import pool from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { all } = req.query;
      const query = all === 'true'
        ? 'SELECT * FROM public.de_testimonials ORDER BY created_at DESC'
        : 'SELECT * FROM public.de_testimonials WHERE is_approved = true ORDER BY created_at DESC LIMIT 12';
      const { rows } = await pool.query(query);
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { name, location, text, rating, is_approved } = req.body;
      const { rows } = await pool.query(
        'INSERT INTO public.de_testimonials (name, location, text, rating, is_approved) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, location || 'Accra, Ghana', text, rating || 5, is_approved ?? false]
      );
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id, is_approved } = req.body;
      const { rows } = await pool.query(
        'UPDATE public.de_testimonials SET is_approved = $2 WHERE id = $1 RETURNING *',
        [id, is_approved]
      );
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await pool.query('DELETE FROM public.de_testimonials WHERE id = $1', [id]);
      return res.status(200).json({ success: true, id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error in testimonials:', err);
    res.status(500).json({ error: err.message });
  }
}
