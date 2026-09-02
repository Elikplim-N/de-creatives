import pool from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM public.de_hero_slides ORDER BY sort_order ASC, created_at ASC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const s = req.body;
      const id = s.id || `hero-${Date.now()}`;
      const query = `
        INSERT INTO public.de_hero_slides (id, eyebrow, heading, subheading, cta, cta_secondary, image, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        id, s.eyebrow || 'DE CREATIVES', s.heading || 'DEFINE YOUR CREATIVE', s.subheading || '',
        s.cta || 'Shop The Drop', s.cta_secondary || s.ctaSecondary || '', s.image || '',
        s.sort_order ?? s.sortOrder ?? 0, s.is_active ?? s.isActive ?? true
      ];
      const { rows } = await pool.query(query, values);
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const s = req.body;
      const id = s.id;
      if (!id) return res.status(400).json({ error: 'Hero slide ID required' });

      const query = `
        UPDATE public.de_hero_slides SET
          eyebrow = COALESCE($2, eyebrow),
          heading = COALESCE($3, heading),
          subheading = COALESCE($4, subheading),
          cta = COALESCE($5, cta),
          cta_secondary = COALESCE($6, cta_secondary),
          image = COALESCE($7, image),
          sort_order = COALESCE($8, sort_order),
          is_active = COALESCE($9, is_active)
        WHERE id = $1
        RETURNING *
      `;
      const values = [
        id, s.eyebrow, s.heading, s.subheading, s.cta, s.cta_secondary ?? s.ctaSecondary,
        s.image, s.sort_order ?? s.sortOrder, s.is_active ?? s.isActive
      ];
      const { rows } = await pool.query(query, values);
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await pool.query('DELETE FROM public.de_hero_slides WHERE id = $1', [id]);
      return res.status(200).json({ success: true, id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error in hero-slides:', err);
    res.status(500).json({ error: err.message });
  }
}
