import { createContext, useContext, useState, useCallback } from 'react';
import { products as initialProducts, categories as initialCategories, adminCredentials } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = useCallback((message, type = 'default', icon = null) => {
    setToast({ message, type, icon });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const adminLogin = useCallback((username, password) => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      setIsAdminLoggedIn(true);
      setLoginError('');
      return true;
    }
    setLoginError('Invalid credentials. Please try again.');
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
  }, []);

  const addProduct = useCallback((product) => {
    const newProduct = {
      ...product,
      id: `p-${Date.now()}`,
      sku: product.sku || `DC-${Date.now()}`,
      rating: 0, reviewCount: 0,
      isNew: true, isFeatured: false, isBestseller: false,
      images: product.imagePreview ? [product.imagePreview] : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
      colors: ['#1A1A1A'], colorNames: ['Default'],
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`"${product.name}" added successfully!`, 'success');
  }, [showToast]);

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Product updated successfully!', 'success');
  }, [showToast]);

  const deleteProduct = useCallback((id) => {
    const product = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(`"${product?.name}" removed.`, 'danger');
  }, [products, showToast]);

  const addCategory = useCallback((category) => {
    const newCat = {
      ...category,
      id: `cat-${Date.now()}`,
      count: 0,
    };
    setCategories(prev => [...prev, newCat]);
    showToast(`Category "${category.name}" added!`, 'success');
  }, [showToast]);

  const deleteCategory = useCallback((id) => {
    const cat = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast(`Category "${cat?.name}" removed.`, 'danger');
  }, [categories, showToast]);

  const addToCart = useCallback((product, size, color) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.size === size && i.color === color);
      if (existing) return prev.map(i =>
        i.id === product.id && i.size === size && i.color === color
          ? { ...i, qty: i.qty + 1 } : i
      );
      return [...prev, { ...product, size, color, qty: 1, cartId: `${product.id}-${size}-${color}` }];
    });
    showToast('Added to cart!', 'success');
  }, [showToast]);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        showToast('Removed from wishlist', 'default');
        return prev.filter(p => p.id !== product.id);
      }
      showToast('Added to wishlist!', 'success');
      return [...prev, product];
    });
  }, [showToast]);

  const isInWishlist = useCallback((id) => wishlist.some(p => p.id === id), [wishlist]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AppContext.Provider value={{
      isAdminLoggedIn, loginError, adminLogin, adminLogout,
      products, categories, cart, cartCount, wishlist, toast,
      activeCategory, setActiveCategory,
      searchQuery, setSearchQuery,
      filteredProducts, showToast,
      addProduct, updateProduct, deleteProduct,
      addCategory, deleteCategory,
      addToCart, toggleWishlist, isInWishlist,
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
