import pool from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM public.de_categories ORDER BY created_at ASC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { id, name, slug, description, image } = req.body;
      const catId = id || `cat-${Date.now()}`;
      const { rows } = await pool.query(
        'INSERT INTO public.de_categories (id, name, slug, description, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [catId, name, slug || name.toLowerCase().replace(/\s+/g, '-'), description || '', image || '']
      );
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id, name, slug, description, image } = req.body;
      const { rows } = await pool.query(
        'UPDATE public.de_categories SET name = COALESCE($2, name), slug = COALESCE($3, slug), description = COALESCE($4, description), image = COALESCE($5, image) WHERE id = $1 RETURNING *',
        [id, name, slug, description, image]
      );
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await pool.query('DELETE FROM public.de_categories WHERE id = $1', [id]);
      return res.status(200).json({ success: true, id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error in categories:', err);
    res.status(500).json({ error: err.message });
  }
}
