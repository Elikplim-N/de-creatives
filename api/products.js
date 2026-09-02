import pool from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM public.de_products ORDER BY created_at DESC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const p = req.body;
      const id = p.id || `p-${Date.now()}`;
      const sku = p.sku || `DE-${Date.now()}`;
      const colors = Array.isArray(p.colors) ? p.colors : ['#0A0A0A'];
      const colorNames = Array.isArray(p.color_names || p.colorNames) ? (p.color_names || p.colorNames) : ['Default'];
      const sizes = Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'];
      const images = Array.isArray(p.images) ? p.images : [];

      const query = `
        INSERT INTO public.de_products 
        (id, sku, name, category_id, price, compare_price, description, colors, color_names, sizes, stock, is_new, is_featured, is_bestseller, rating, review_count, images)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;
      const values = [
        id, sku, p.name, p.category_id || p.category, p.price || 200, p.compare_price || p.comparePrice || null,
        p.description || '', colors, colorNames, sizes, p.stock || 50,
        p.is_new ?? p.isNew ?? true, p.is_featured ?? p.isFeatured ?? false, p.is_bestseller ?? p.isBestseller ?? false,
        p.rating || 5.0, p.review_count || p.reviewCount || 0, images
      ];

      const { rows } = await pool.query(query, values);
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const p = req.body;
      const id = p.id;
      if (!id) return res.status(400).json({ error: 'Product ID required' });

      const query = `
        UPDATE public.de_products SET
          name = COALESCE($2, name),
          category_id = COALESCE($3, category_id),
          price = COALESCE($4, price),
          compare_price = COALESCE($5, compare_price),
          description = COALESCE($6, description),
          colors = COALESCE($7, colors),
          color_names = COALESCE($8, color_names),
          sizes = COALESCE($9, sizes),
          stock = COALESCE($10, stock),
          is_new = COALESCE($11, is_new),
          is_featured = COALESCE($12, is_featured),
          is_bestseller = COALESCE($13, is_bestseller),
          images = COALESCE($14, images)
        WHERE id = $1
        RETURNING *
      `;
      const values = [
        id, p.name, p.category_id || p.category, p.price, p.compare_price ?? p.comparePrice,
        p.description, p.colors, p.color_names || p.colorNames, p.sizes, p.stock,
        p.is_new ?? p.isNew, p.is_featured ?? p.isFeatured, p.is_bestseller ?? p.isBestseller, p.images
      ];

      const { rows } = await pool.query(query, values);
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await pool.query('DELETE FROM public.de_products WHERE id = $1', [id]);
      return res.status(200).json({ success: true, id });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error in products:', err);
    res.status(500).json({ error: err.message });
  }
}
