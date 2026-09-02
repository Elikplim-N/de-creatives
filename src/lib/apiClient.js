// Client helper to talk to backend serverless API endpoints (/api/*)
const API_BASE = '/api';

export const api = {
  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async createCategory(cat) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async updateCategory(cat) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Products
  async getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async createProduct(product) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async updateProduct(product) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Hero Slides
  async getHeroSlides() {
    const res = await fetch(`${API_BASE}/hero-slides`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async createHeroSlide(slide) {
    const res = await fetch(`${API_BASE}/hero-slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slide)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async updateHeroSlide(slide) {
    const res = await fetch(`${API_BASE}/hero-slides`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slide)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async deleteHeroSlide(id) {
    const res = await fetch(`${API_BASE}/hero-slides?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Testimonials
  async getTestimonials(all = false) {
    const res = await fetch(`${API_BASE}/testimonials?all=${all}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async createTestimonial(testimonial) {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testimonial)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async updateTestimonial(id, is_approved) {
    const res = await fetch(`${API_BASE}/testimonials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_approved })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async deleteTestimonial(id) {
    const res = await fetch(`${API_BASE}/testimonials?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Subscribers
  async getSubscribers() {
    const res = await fetch(`${API_BASE}/subscribers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async addSubscriber(email) {
    const res = await fetch(`${API_BASE}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async deleteSubscriber(id) {
    const res = await fetch(`${API_BASE}/subscribers?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Manifesto
  async getManifesto() {
    const res = await fetch(`${API_BASE}/manifesto`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async saveManifesto(content) {
    const res = await fetch(`${API_BASE}/manifesto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Gallery
  async getGalleryPhotos() {
    const res = await fetch(`${API_BASE}/gallery`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async createGalleryPhoto(photo) {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photo)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async updateGalleryPhoto(photo) {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photo)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  async deleteGalleryPhoto(id) {
    const res = await fetch(`${API_BASE}/gallery?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
};
