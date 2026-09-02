import pool from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query(
        'SELECT * FROM public.de_gallery_photos ORDER BY sort_order ASC, created_at DESC'
      );
      const formatted = rows.map(r => ({
        id: r.id,
        title: r.title || 'Lookbook Photo',
        category: r.category || 'Streetwear',
        tag: r.tag || '',
        src: r.image || '',
        image: r.image || '',
        sortOrder: r.sort_order ?? 0,
        createdAt: r.created_at
      }));
      return res.status(200).json(formatted);
    }

    if (req.method === 'POST') {
      const p = req.body;
      const id = p.id ? String(p.id) : `photo-${Date.now()}`;
      const title = p.title || 'Lookbook Photo';
      const category = p.category || 'Streetwear';
      const image = p.src || p.image || '';
      const tag = p.tag || '';
      const sortOrder = p.sortOrder ?? 0;

      const query = `
        INSERT INTO public.de_gallery_photos (id, title, category, image, tag, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          image = EXCLUDED.image,
          tag = EXCLUDED.tag,
          sort_order = EXCLUDED.sort_order
        RETURNING *
      `;
      const values = [id, title, category, image, tag, sortOrder];
      const { rows } = await pool.query(query, values);
      const r = rows[0];
      return res.status(201).json({
        id: r.id,
        title: r.title,
        category: r.category,
        tag: r.tag,
        src: r.image,
        image: r.image,
        sortOrder: r.sort_order,
        createdAt: r.created_at
      });
    }

    if (req.method === 'PUT') {
      const p = req.body;
      const id = String(p.id);
      if (!id) return res.status(400).json({ error: 'Photo ID required' });

      const query = `
        UPDATE public.de_gallery_photos SET
          title = COALESCE($2, title),
          category = COALESCE($3, category),
          image = COALESCE($4, image),
          tag = COALESCE($5, tag),
          sort_order = COALESCE($6, sort_order)
        WHERE id = $1
        RETURNING *
      `;
      const values = [id, p.title, p.category, p.src || p.image, p.tag, p.sortOrder];
      const { rows } = await pool.query(query, values);
      if (rows.length === 0) return res.status(404).json({ error: 'Photo not found' });
      const r = rows[0];
      return res.status(200).json({
        id: r.id,
        title: r.title,
        category: r.category,
        tag: r.tag,
        src: r.image,
        image: r.image,
        sortOrder: r.sort_order,
        createdAt: r.created_at
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id === 'all') {
        await pool.query('DELETE FROM public.de_gallery_photos');
        return res.status(200).json({ success: true, cleared: true });
      }
      await pool.query('DELETE FROM public.de_gallery_photos WHERE id = $1', [String(id)]);
      return res.status(200).json({ success: true, id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error in gallery:', err);
    res.status(500).json({ error: err.message });
  }
}
