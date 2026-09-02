import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  products as initialProducts,
  categories as initialCategories,
  testimonials as initialTestimonials,
  heroSlides as initialHeroSlides,
  subscribers as initialSubscribers,
  initialGalleryPhotos,
  initialManifesto,
  adminCredentials
} from '../data/mockData';
import { supabase } from '../lib/supabaseClient';

const AppContext = createContext(null);

// Bridges de_products' snake_case DB columns to the camelCase fields the
// storefront and admin UI read (reviewCount, isNew, isFeatured, isBestseller,
// comparePrice), plus the category name lookup both callers need.
function formatDbProduct(p, categoryList) {
  return {
    ...p,
    category: p.category_id,
    categoryName: categoryList?.find(c => c.id === p.category_id)?.name || 'Uncategorized',
    comparePrice: p.compare_price,
    reviewCount: p.review_count,
    isNew: p.is_new,
    isFeatured: p.is_featured,
    isBestseller: p.is_bestseller,
    colorNames: p.color_names,
  };
}

// Inverse of formatDbProduct - maps an admin-form update (camelCase, plus the
// UI-only categoryName field) to real de_products columns. `images` is
// already a plain array of Storage URLs by the time it gets here.
const PRODUCT_FIELD_TO_COLUMN = {
  category: 'category_id',
  comparePrice: 'compare_price',
  reviewCount: 'review_count',
  isNew: 'is_new',
  isFeatured: 'is_featured',
  isBestseller: 'is_bestseller',
  colorNames: 'color_names',
};

// Product objects carry both raw snake_case DB fields (formatDbProduct
// spreads the row as-is) and the camelCase aliases above, and admin forms
// round-trip the whole object back on save - so anything not a real
// de_products column must be dropped here rather than mapped, or a single
// missed alias above 400s the entire update (as reviewCount once did).
const PRODUCT_DB_COLUMNS = new Set([
  'sku', 'name', 'category_id', 'price', 'compare_price', 'description',
  'colors', 'color_names', 'sizes', 'stock', 'is_new', 'is_featured',
  'is_bestseller', 'rating', 'review_count', 'images',
]);

function toDbProductFields(fields) {
  const dbFields = {};
  for (const [key, value] of Object.entries(fields)) {
    const column = PRODUCT_FIELD_TO_COLUMN[key] || key;
    if (!PRODUCT_DB_COLUMNS.has(column)) continue;
    dbFields[column] = value;
  }
  if ('category' in fields) dbFields.category_id = fields.category || null;
  return dbFields;
}

// Bridges de_hero_slides' snake_case DB columns to the camelCase fields the
// Hero carousel and admin form read.
function formatDbHeroSlide(s) {
  return {
    ...s,
    ctaSecondary: s.cta_secondary,
    sortOrder: s.sort_order,
    isActive: s.is_active,
  };
}

const HERO_SLIDE_FIELD_TO_COLUMN = {
  ctaSecondary: 'cta_secondary',
  sortOrder: 'sort_order',
  isActive: 'is_active',
};

function toDbHeroSlideFields(fields) {
  const dbFields = {};
  for (const [key, value] of Object.entries(fields)) {
    dbFields[HERO_SLIDE_FIELD_TO_COLUMN[key] || key] = value;
  }
  return dbFields;
}

export function AppProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(!!supabase);
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('de_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('de_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });
  const [orders, setOrders] = useState([]);
  const [testimonials, setTestimonials] = useState(() => {
    const saved = localStorage.getItem('de_testimonials');
    return saved ? JSON.parse(saved) : initialTestimonials;
  });
  const [subscribers, setSubscribers] = useState(() => {
    const saved = localStorage.getItem('de_subscribers');
    return saved ? JSON.parse(saved) : initialSubscribers;
  });
  const [heroSlides, setHeroSlides] = useState(() => {
    const saved = localStorage.getItem('de_hero_slides');
    return saved ? JSON.parse(saved) : initialHeroSlides;
  });
  const [galleryPhotos, setGalleryPhotos] = useState(() => {
    const saved = localStorage.getItem('de_gallery_photos');
    return saved ? JSON.parse(saved) : initialGalleryPhotos;
  });
  const [manifesto, setManifesto] = useState(() => {
    const saved = localStorage.getItem('de_manifesto');
    return saved ? JSON.parse(saved) : initialManifesto;
  });
  const [pendingTestimonials, setPendingTestimonials] = useState(() => {
    const saved = localStorage.getItem('de_pending_testimonials');
    return saved ? JSON.parse(saved) : [];
  });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = useCallback((message, type = 'default', icon = null) => {
    setToast({ message, type, icon });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch initial data from Supabase if available
  useEffect(() => {
    if (!supabase) return;

    const loadData = async () => {
      try {
        // Fetch Categories from de_categories
        const { data: catData, error: catError } = await supabase
          .from('de_categories')
          .select('*');
        if (catError) throw catError;
        if (catData) setCategories(catData);

        // Fetch Products from de_products
        const { data: prodData, error: prodError } = await supabase
          .from('de_products')
          .select('*');
        if (prodError) throw prodError;
        if (prodData) {
          setProducts(prodData.map(p => formatDbProduct(p, catData)));
        }

        // Fetch approved Testimonials from de_testimonials.
        // If the DB has 0 approved testimonials, keep the curated initialTestimonials
        // so the Good Report section is never left blank.
        const { data: testData, error: testError } = await supabase
          .from('de_testimonials')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(9);
        if (testError) throw testError;
        if (testData && testData.length > 0) {
          setTestimonials(testData);
        } else {
          setTestimonials(initialTestimonials);
        }

        // Fetch Hero Slides from de_hero_slides
        const { data: heroData, error: heroError } = await supabase
          .from('de_hero_slides')
          .select('*')
          .order('sort_order', { ascending: true });
        if (heroError) throw heroError;
        if (heroData) setHeroSlides(heroData.map(formatDbHeroSlide));

        // Fetch Subscribers if table exists
        try {
          const { data: subData } = await supabase
            .from('de_subscribers')
            .select('*')
            .order('created_at', { ascending: false });
          if (subData && subData.length > 0) {
            setSubscribers(subData);
          }
        } catch {
          // Table might not exist yet
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err.message);
        showToast('Connected but failed to fetch data from Supabase. Using mock data.', 'warning');
      }
    };

    loadData();

    // Listen for auth state changes to keep dashboard synced.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdminLoggedIn(!!session);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [showToast]);

  // Orders are RLS-gated to authenticated users, so they can only be fetched
  // once an admin session exists - refetch whenever login state flips on.
  useEffect(() => {
    if (!supabase || !isAdminLoggedIn) return;

    const loadOrders = async () => {
      const { data, error } = await supabase
        .from('de_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching orders from Supabase:', error.message);
        return;
      }
      if (data) setOrders(data);
    };

    loadOrders();
  }, [isAdminLoggedIn]);

  // Inactive hero slides are hidden from the public RLS policy, so an admin
  // session needs its own fetch to manage the full set, not just the live ones.
  useEffect(() => {
    if (!supabase || !isAdminLoggedIn) return;

    const loadAllHeroSlides = async () => {
      const { data, error } = await supabase
        .from('de_hero_slides')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) {
        console.error('Error fetching hero slides from Supabase:', error.message);
        return;
      }
      if (data) setHeroSlides(data.map(formatDbHeroSlide));
    };

    loadAllHeroSlides();
  }, [isAdminLoggedIn]);

  // Pending review moderation queue - same RLS gating as orders (the public
  // select policy only returns is_approved = true, so unapproved rows are
  // invisible until an admin session queries with the authenticated policy).
  const refreshPendingTestimonials = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('de_testimonials')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching pending testimonials:', error.message);
      return;
    }
    if (data) setPendingTestimonials(data);
  }, []);

  useEffect(() => {
    if (!supabase || !isAdminLoggedIn) return;
    refreshPendingTestimonials();
  }, [isAdminLoggedIn, refreshPendingTestimonials]);

  const adminLogin = useCallback(async (usernameOrEmail, password) => {
    setLoginError('');

    // With a real backend configured, Supabase auth is the only path: writes
    // are RLS-gated on an authenticated Supabase session, so a local-only
    // credential check would "log in" an admin whose every write then fails.
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: usernameOrEmail,
          password: password,
        });

        if (error) throw error;

        if (data?.user) {
          setIsAdminLoggedIn(true);
          showToast('Welcome back, Admin!', 'success');
          return true;
        }
      } catch (err) {
        console.error('Auth error:', err.message);
      }

      setLoginError('Invalid credentials. Please try again.');
      return false;
    }

    const normalizedUser = (usernameOrEmail || '').trim().toLowerCase();
    const isMatched = (
      (normalizedUser === adminCredentials.username.toLowerCase() ||
       normalizedUser === 'admin@decreatives.com' ||
       normalizedUser === 'admin') &&
      password === adminCredentials.password
    );

    if (isMatched) {
      setIsAdminLoggedIn(true);
      setAuthLoading(false);
      showToast('Welcome back, Admin!', 'success');
      return true;
    }

    setLoginError('Invalid credentials. Please try again.');
    return false;
  }, [showToast]);

  const adminLogout = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
        setIsAdminLoggedIn(false);
        showToast('Logged out successfully.', 'default');
      } catch (err) {
        console.error('Error signing out:', err.message);
      }
    } else {
      setIsAdminLoggedIn(false);
    }
  }, [showToast]);

  // Uploads real files to Supabase Storage and returns their public URLs, in
  // the same order given - order matters, since images[0] is the cover shown
  // on product cards and the storefront grid. Falls back to local data URLs
  // in mock mode, where there's no backend to actually store files in.
  const uploadProductImages = useCallback(async (files) => {
    if (!files || files.length === 0) return [];
    if (!supabase) {
      return Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })));
    }
    const urls = [];
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }, []);

  const addProduct = useCallback(async (product) => {
    if (supabase) {
      try {
        const id = `p-${Date.now()}`;
        const newProductDb = {
          ...toDbProductFields(product),
          id,
          sku: product.sku || `DE-${Date.now()}`,
          price: parseFloat(product.price),
          compare_price: product.comparePrice ? parseFloat(product.comparePrice) : null,
          stock: parseInt(product.stock) || 0,
          is_new: product.isNew ?? true,
          is_featured: product.isFeatured ?? false,
          is_bestseller: product.isBestseller ?? false,
          colors: product.colors?.length > 0 ? product.colors : ['#0A0A0A'],
          color_names: product.colorNames?.length > 0 ? product.colorNames : ['Default Jet Black'],
          sizes: product.sizes?.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'],
          images: product.images || [],
          rating: 5.0,
          review_count: 0
        };

        const { error } = await supabase.from('de_products').insert([newProductDb]);
        if (error) throw error;

        // update local state and localStorage
        const formatted = formatDbProduct(newProductDb, categories);
        setProducts(prev => {
          const next = [formatted, ...prev];
          localStorage.setItem('de_products', JSON.stringify(next));
          return next;
        });

        showToast(`"${product.name}" added to Supabase!`, 'success');
      } catch (err) {
        console.error('Error adding product:', err.message);
        showToast(`Failed to add product: ${err.message}`, 'danger');
      }
    } else {
      // Mock mode
      const newProduct = {
        ...product,
        id: `p-${Date.now()}`,
        sku: product.sku || `DE-${Date.now()}`,
        rating: 0, reviewCount: 0,
        isNew: product.isNew ?? true,
        isFeatured: product.isFeatured ?? false,
        isBestseller: product.isBestseller ?? false,
        images: product.images || [],
        colors: product.colors?.length > 0 ? product.colors : ['#1A1A1A'],
        colorNames: product.colorNames?.length > 0 ? product.colorNames : ['Default'],
      };
      setProducts(prev => {
        const next = [newProduct, ...prev];
        localStorage.setItem('de_products', JSON.stringify(next));
        return next;
      });
      showToast(`"${product.name}" added successfully!`, 'success');
    }
  }, [categories, showToast]);

  const updateProduct = useCallback(async (id, updates) => {
    if (supabase) {
      try {
        const dbUpdates = toDbProductFields(updates);

        const { error } = await supabase.from('de_products').update(dbUpdates).eq('id', id);
        if (error) throw error;

        setProducts(prev => {
          const next = prev.map(p => {
            if (p.id === id) {
              const merged = { ...p, ...updates };
              if ('category' in updates) {
                merged.categoryName = categories.find(c => c.id === updates.category)?.name || 'Uncategorized';
              }
              return merged;
            }
            return p;
          });
          localStorage.setItem('de_products', JSON.stringify(next));
          return next;
        });
        showToast('Product updated in Supabase!', 'success');
      } catch (err) {
        console.error('Error updating product:', err.message);
        showToast(`Failed to update product: ${err.message}`, 'danger');
      }
    } else {
      setProducts(prev => {
        const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
        localStorage.setItem('de_products', JSON.stringify(next));
        return next;
      });
      showToast('Product updated successfully!', 'success');
    }
  }, [categories, showToast]);

  const deleteProduct = useCallback(async (id) => {
    const product = products.find(p => p.id === id);
    if (supabase) {
      try {
        const { error } = await supabase.from('de_products').delete().eq('id', id);
        if (error) throw error;

        setProducts(prev => {
          const next = prev.filter(p => p.id !== id);
          localStorage.setItem('de_products', JSON.stringify(next));
          return next;
        });
        showToast(`"${product?.name}" removed from Supabase.`, 'danger');
      } catch (err) {
        console.error('Error deleting product:', err.message);
        showToast(`Failed to delete product: ${err.message}`, 'danger');
      }
    } else {
      setProducts(prev => {
        const next = prev.filter(p => p.id !== id);
        localStorage.setItem('de_products', JSON.stringify(next));
        return next;
      });
      showToast(`"${product?.name}" removed.`, 'danger');
    }
  }, [products, showToast]);

  const addCategory = useCallback(async (category) => {
    if (supabase) {
      try {
        const id = `cat-${Date.now()}`;
        const newCat = {
          id,
          name: category.name,
          slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
          description: category.description,
          image: category.image || null,
        };

        const { error } = await supabase.from('de_categories').insert([newCat]);
        if (error) throw error;

        setCategories(prev => {
          const next = [...prev, newCat];
          localStorage.setItem('de_categories', JSON.stringify(next));
          return next;
        });
        showToast(`Category "${category.name}" added to Supabase!`, 'success');
      } catch (err) {
        console.error('Error adding category:', err.message);
        showToast(`Failed to add category: ${err.message}`, 'danger');
      }
    } else {
      const newCat = {
        ...category,
        id: `cat-${Date.now()}`,
        count: 0,
      };
      setCategories(prev => {
        const next = [...prev, newCat];
        localStorage.setItem('de_categories', JSON.stringify(next));
        return next;
      });
      showToast(`Category "${category.name}" added!`, 'success');
    }
  }, [showToast]);

  const updateCategory = useCallback(async (id, updates) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('de_categories').update(updates).eq('id', id);
        if (error) throw error;

        setCategories(prev => {
          const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
          localStorage.setItem('de_categories', JSON.stringify(next));
          return next;
        });
        showToast('Category updated!', 'success');
      } catch (err) {
        console.error('Error updating category:', err.message);
        showToast(`Failed to update category: ${err.message}`, 'danger');
      }
    } else {
      setCategories(prev => {
        const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
        localStorage.setItem('de_categories', JSON.stringify(next));
        return next;
      });
      showToast('Category updated!', 'success');
    }
  }, [showToast]);

  const deleteCategory = useCallback(async (id) => {
    const cat = categories.find(c => c.id === id);
    if (supabase) {
      try {
        const { error } = await supabase.from('de_categories').delete().eq('id', id);
        if (error) throw error;

        setCategories(prev => {
          const next = prev.filter(c => c.id !== id);
          localStorage.setItem('de_categories', JSON.stringify(next));
          return next;
        });
        showToast(`Category "${cat?.name}" removed from Supabase.`, 'danger');
      } catch (err) {
        console.error('Error deleting category:', err.message);
        showToast(`Failed to delete category: ${err.message}`, 'danger');
      }
    } else {
      setCategories(prev => {
        const next = prev.filter(c => c.id !== id);
        localStorage.setItem('de_categories', JSON.stringify(next));
        return next;
      });
      showToast(`Category "${cat?.name}" removed.`, 'danger');
    }
  }, [categories, showToast]);

  const addHeroSlide = useCallback(async (slide) => {
    const sortOrder = heroSlides.length > 0 ? Math.max(...heroSlides.map(s => s.sortOrder ?? 0)) + 1 : 0;
    if (supabase) {
      try {
        const id = `hero-${Date.now()}`;
        const newSlide = {
          id,
          eyebrow: slide.eyebrow || '',
          heading: slide.heading,
          subheading: slide.subheading || '',
          cta: slide.cta || '',
          cta_secondary: slide.ctaSecondary || '',
          image: slide.image || null,
          sort_order: sortOrder,
          is_active: slide.isActive ?? true,
        };

        const { error } = await supabase.from('de_hero_slides').insert([newSlide]);
        if (error) throw error;

        setHeroSlides(prev => {
          const next = [...prev, formatDbHeroSlide(newSlide)];
          localStorage.setItem('de_hero_slides', JSON.stringify(next));
          return next;
        });
        showToast('Hero slide added!', 'success');
      } catch (err) {
        console.error('Error adding hero slide:', err.message);
        showToast(`Failed to add hero slide: ${err.message}`, 'danger');
      }
    } else {
      const newSlide = { ...slide, id: `hero-${Date.now()}`, sortOrder, isActive: slide.isActive ?? true };
      setHeroSlides(prev => {
        const next = [...prev, newSlide];
        localStorage.setItem('de_hero_slides', JSON.stringify(next));
        return next;
      });
      showToast('Hero slide added!', 'success');
    }
  }, [heroSlides, showToast]);

  const updateHeroSlide = useCallback(async (id, updates) => {
    if (supabase) {
      try {
        const dbUpdates = toDbHeroSlideFields(updates);
        const { error } = await supabase.from('de_hero_slides').update(dbUpdates).eq('id', id);
        if (error) throw error;

        setHeroSlides(prev => {
          const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
          localStorage.setItem('de_hero_slides', JSON.stringify(next));
          return next;
        });
        showToast('Hero slide updated!', 'success');
      } catch (err) {
        console.error('Error updating hero slide:', err.message);
        showToast(`Failed to update hero slide: ${err.message}`, 'danger');
      }
    } else {
      setHeroSlides(prev => {
        const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
        localStorage.setItem('de_hero_slides', JSON.stringify(next));
        return next;
      });
      showToast('Hero slide updated!', 'success');
    }
  }, [showToast]);

  const deleteHeroSlide = useCallback(async (id) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('de_hero_slides').delete().eq('id', id);
        if (error) throw error;

        setHeroSlides(prev => {
          const next = prev.filter(s => s.id !== id);
          localStorage.setItem('de_hero_slides', JSON.stringify(next));
          return next;
        });
        showToast('Hero slide removed.', 'danger');
      } catch (err) {
        console.error('Error deleting hero slide:', err.message);
        showToast(`Failed to delete hero slide: ${err.message}`, 'danger');
      }
    } else {
      setHeroSlides(prev => {
        const next = prev.filter(s => s.id !== id);
        localStorage.setItem('de_hero_slides', JSON.stringify(next));
        return next;
      });
      showToast('Hero slide removed.', 'danger');
    }
  }, [showToast]);

  // Swaps sort_order with the adjacent slide (by current array position) to
  // move a slide up (-1) or down (+1) in the homepage carousel.
  const reorderHeroSlide = useCallback(async (id, direction) => {
    const sorted = [...heroSlides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const index = sorted.findIndex(s => s.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return;

    const current = sorted[index];
    const target = sorted[targetIndex];
    const currentOrder = current.sortOrder ?? 0;
    const targetOrder = target.sortOrder ?? 0;

    if (supabase) {
      try {
        const { error: err1 } = await supabase.from('de_hero_slides').update({ sort_order: targetOrder }).eq('id', current.id);
        if (err1) throw err1;
        const { error: err2 } = await supabase.from('de_hero_slides').update({ sort_order: currentOrder }).eq('id', target.id);
        if (err2) throw err2;

        setHeroSlides(prev => {
          const next = prev.map(s => {
            if (s.id === current.id) return { ...s, sortOrder: targetOrder };
            if (s.id === target.id) return { ...s, sortOrder: currentOrder };
            return s;
          });
          localStorage.setItem('de_hero_slides', JSON.stringify(next));
          return next;
        });
      } catch (err) {
        console.error('Error reordering hero slides:', err.message);
        showToast(`Failed to reorder: ${err.message}`, 'danger');
      }
    } else {
      setHeroSlides(prev => {
        const next = prev.map(s => {
          if (s.id === current.id) return { ...s, sortOrder: targetOrder };
          if (s.id === target.id) return { ...s, sortOrder: currentOrder };
          return s;
        });
        localStorage.setItem('de_hero_slides', JSON.stringify(next));
        return next;
      });
    }
  }, [heroSlides, showToast]);

  const resetProductsToDefault = useCallback(() => {
    localStorage.removeItem('de_products');
    setProducts(initialProducts);
    showToast('Products restored to default.', 'default');
  }, [showToast]);

  const resetCategoriesToDefault = useCallback(() => {
    localStorage.removeItem('de_categories');
    setCategories(initialCategories);
    showToast('Categories restored to default.', 'default');
  }, [showToast]);

  const resetHeroSlidesToDefault = useCallback(() => {
    localStorage.removeItem('de_hero_slides');
    setHeroSlides(initialHeroSlides);
    showToast('Hero slides restored to default.', 'default');
  }, [showToast]);

  // Public - any visitor can submit a review.
  const submitTestimonial = useCallback(async ({ name, location, text, rating }) => {
    const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');

    const newTestimonial = {
      id: generatedId,
      name,
      location: location || null,
      text,
      rating: Number(rating) || 5,
      is_approved: false,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('de_testimonials').insert([{
          id: generatedId,
          name,
          location: location || null,
          text,
          rating: Number(rating) || 5,
          is_approved: false,
        }]);
        if (error) console.warn('Supabase testimonial insert warning:', error.message);
      } catch (err) {
        console.warn('Supabase testimonial insert error:', err.message);
      }
    }

    setPendingTestimonials(prev => {
      const updated = [newTestimonial, ...prev];
      localStorage.setItem('de_pending_testimonials', JSON.stringify(updated));
      return updated;
    });

    showToast('Thanks for sharing! Your review will appear once approved.', 'success');
    return true;
  }, [showToast]);

  // Admin-only moderation actions.
  const approveTestimonial = useCallback(async (id) => {
    const idStr = String(id);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);

    if (supabase && isUuid) {
      try {
        const { error } = await supabase.from('de_testimonials').update({ is_approved: true }).eq('id', id);
        if (error) console.warn('Supabase testimonial update warning:', error.message);
      } catch (err) {
        console.warn('Supabase testimonial update error:', err.message);
      }
    }

    setPendingTestimonials(prev => {
      const target = prev.find(t => String(t.id) === idStr);
      const remaining = prev.filter(t => String(t.id) !== idStr);
      localStorage.setItem('de_pending_testimonials', JSON.stringify(remaining));
      if (target) {
        setTestimonials(tList => {
          const updated = [{ ...target, is_approved: true }, ...tList];
          localStorage.setItem('de_testimonials', JSON.stringify(updated));
          return updated;
        });
      }
      return remaining;
    });

    showToast('Review approved and now live.', 'success');
  }, [showToast]);

  // Handles both rejecting a pending review and removing an already-live one.
  const rejectTestimonial = useCallback(async (id) => {
    const idStr = String(id);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr);

    if (supabase && isUuid) {
      try {
        const { error } = await supabase.from('de_testimonials').delete().eq('id', id);
        if (error) console.warn('Supabase testimonial delete warning:', error.message);
      } catch (err) {
        console.warn('Supabase testimonial delete error:', err.message);
      }
    }

    setPendingTestimonials(prev => {
      const updated = prev.filter(t => String(t.id) !== idStr);
      localStorage.setItem('de_pending_testimonials', JSON.stringify(updated));
      return updated;
    });

    setTestimonials(prev => {
      const updated = prev.filter(t => String(t.id) !== idStr);
      localStorage.setItem('de_testimonials', JSON.stringify(updated));
      return updated;
    });

    showToast('Review removed.', 'default');
  }, [showToast]);

  const resetTestimonials = useCallback(() => {
    setTestimonials(initialTestimonials);
    setPendingTestimonials([]);
    localStorage.removeItem('de_testimonials');
    localStorage.removeItem('de_pending_testimonials');
    showToast('Reviews reset to default.', 'default');
  }, [showToast]);

  // Newsletter / Clan Subscriptions
  const subscribeToClan = useCallback(async (email, type = 'all') => {
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return false;
    }

    const newSub = {
      id: `sub-${Date.now()}`,
      email: email.trim().toLowerCase(),
      type: type || 'all',
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await supabase.from('de_subscribers').insert([{
          email: newSub.email,
          type: newSub.type,
        }]);
        if (error && !error.message?.includes('duplicate')) {
          console.warn('Supabase subscription warning:', error.message);
        }
      }

      setSubscribers(prev => {
        const exists = prev.some(s => s.email === newSub.email);
        const updated = exists ? prev : [newSub, ...prev];
        localStorage.setItem('de_subscribers', JSON.stringify(updated));
        return updated;
      });

      return true;
    } catch (err) {
      console.error('Subscribe error:', err);
      // Still store locally
      setSubscribers(prev => {
        const exists = prev.some(s => s.email === newSub.email);
        const updated = exists ? prev : [newSub, ...prev];
        localStorage.setItem('de_subscribers', JSON.stringify(updated));
        return updated;
      });
      return true;
    }
  }, [showToast]);

  const deleteSubscriber = useCallback(async (id, email) => {
    try {
      if (supabase && email) {
        await supabase.from('de_subscribers').delete().eq('email', email);
      }
      setSubscribers(prev => {
        const updated = prev.filter(s => s.id !== id && s.email !== email);
        localStorage.setItem('de_subscribers', JSON.stringify(updated));
        return updated;
      });
      showToast('Subscriber removed.', 'default');
    } catch (err) {
      console.error('Delete subscriber error:', err.message);
      showToast('Failed to delete subscriber.', 'danger');
    }
  }, [showToast]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const addToCart = useCallback((product, size, color, fit = 'Regular Fit', priceOverride = null) => {
    const finalPrice = priceOverride !== null ? priceOverride : (fit === 'Drop Shoulder Fit' ? 250 : product.price);
    const cartId = `${product.id}-${size}-${color}-${fit}`;

    setCart(prev => {
      const existing = prev.find(i => i.cartId === cartId);
      if (existing) {
        return prev.map(i =>
          i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, {
        ...product,
        size,
        color,
        fit,
        price: finalPrice,
        qty: 1,
        cartId
      }];
    });
    setIsCartOpen(true); // Auto-open cart drawer
    showToast('Added to bag!', 'success');
  }, [showToast]);

  const removeFromCart = useCallback((cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
    showToast('Removed from bag', 'default');
  }, [showToast]);

  const updateCartQty = useCallback((cartId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, qty: newQty } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        showToast('Removed from wishlist', 'default');
        return prev.filter(p => p.id !== product.id);
      }
      setIsWishlistOpen(true); // Auto-open wishlist drawer
      showToast('Added to wishlist!', 'success');
      return [...prev, product];
    });
  }, [showToast]);

  const isInWishlist = useCallback((id) => wishlist.some(p => p.id === id), [wishlist]);

  // Store operates in Ghana Cedis (GH₵)
  const formatPrice = useCallback((priceInGhs) => {
    return `GH₵ ${(Number(priceInGhs) || 0).toFixed(2)}`;
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const sortedHeroSlides = [...heroSlides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Gallery Management
  const addGalleryPhoto = useCallback((photo) => {
    setGalleryPhotos(prev => {
      const newPhotos = [{ ...photo, id: Date.now() }, ...prev];
      localStorage.setItem('de_gallery_photos', JSON.stringify(newPhotos));
      return newPhotos;
    });
    showToast('Photo added to The Gallery of DE!', 'success');
  }, [showToast]);

  const updateGalleryPhoto = useCallback((id, updatedFields) => {
    setGalleryPhotos(prev => {
      const newPhotos = prev.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      localStorage.setItem('de_gallery_photos', JSON.stringify(newPhotos));
      return newPhotos;
    });
    showToast('Gallery photo updated!', 'success');
  }, [showToast]);

  const deleteGalleryPhoto = useCallback((id) => {
    setGalleryPhotos(prev => {
      const newPhotos = prev.filter(p => p.id !== id);
      localStorage.setItem('de_gallery_photos', JSON.stringify(newPhotos));
      return newPhotos;
    });
    showToast('Gallery photo removed.', 'default');
  }, [showToast]);

  const resetGalleryPhotos = useCallback(() => {
    setGalleryPhotos(initialGalleryPhotos);
    localStorage.removeItem('de_gallery_photos');
    showToast('Gallery reset to default.', 'default');
  }, [showToast]);

  // Manifesto / Clan of DE Management
  const updateManifesto = useCallback((newManifestoData) => {
    setManifesto(newManifestoData);
    localStorage.setItem('de_manifesto', JSON.stringify(newManifestoData));
    showToast('Clan of DE content updated successfully!', 'success');
  }, [showToast]);

  const resetManifesto = useCallback(() => {
    setManifesto(initialManifesto);
    localStorage.removeItem('de_manifesto');
    showToast('Clan of DE reset to default.', 'default');
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      isAdminLoggedIn, authLoading, loginError, adminLogin, adminLogout,
      products, categories, orders, cart, cartCount, wishlist, toast,
      testimonials, pendingTestimonials, submitTestimonial, approveTestimonial, rejectTestimonial, resetTestimonials,
      refreshPendingTestimonials,
      subscribers, subscribeToClan, deleteSubscriber,
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery,
      filteredProducts, showToast,
      addProduct, updateProduct, deleteProduct, uploadProductImages, resetProductsToDefault,
      addCategory, updateCategory, deleteCategory, resetCategoriesToDefault,
      heroSlides: sortedHeroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlide, resetHeroSlidesToDefault,
      galleryPhotos, addGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto, resetGalleryPhotos,
      manifesto, updateManifesto, resetManifesto,
      addToCart, toggleWishlist, isInWishlist,
      removeFromCart, updateCartQty, clearCart,
      formatPrice,
      isCartOpen, setIsCartOpen,
      isWishlistOpen, setIsWishlistOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
