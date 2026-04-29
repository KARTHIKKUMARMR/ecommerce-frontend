import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const CATEGORIES = ['Sarees', 'Kurtis', 'Earrings', 'Bangles'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', '2.2', '2.4', '2.6', '2.8'];
const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    category: params.get('category') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    size: params.get('size') || '',
    search: params.get('search') || '',
    sale: params.get('sale') || '',
    featured: params.get('featured') || '',
    sort: '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) q.set(k, v); });
      q.set('page', page);
      q.set('limit', 12);
      const { data } = await api.get(`/products?${q.toString()}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch products');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', size: '', search: '', sale: '', featured: '', sort: '' });
    setPage(1);
  };

  const activeFiltersCount = Object.entries(filters).filter(([_, v]) => v).length;

  return (
    <div className="products-page">
      <div className="products-page-header">
        <div className="container">
          <h1 className="products-page-title">
            {filters.category ? filters.category : filters.search ? `Search: "${filters.search}"` : 'All Products'}
          </h1>
          <p className="products-page-count">{total} products found</p>
        </div>
      </div>

      <div className="container">
        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${filtersOpen ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              {activeFiltersCount > 0 && (
                <button className="clear-filters" onClick={clearFilters}>
                  Clear all ({activeFiltersCount})
                </button>
              )}
              <button className="filters-close hide-desktop" onClick={() => setFiltersOpen(false)}><X size={20} /></button>
            </div>

            {/* Category */}
            <div className="filter-group">
              <h4 className="filter-group-title">Category</h4>
              {CATEGORIES.map(cat => (
                <label key={cat} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === cat}
                    onChange={() => updateFilter('category', cat)}
                    className="filter-radio"
                  />
                  <span>{cat}</span>
                </label>
              ))}
              <label className="filter-option">
                <input type="radio" name="category" checked={!filters.category} onChange={() => updateFilter('category', '')} className="filter-radio" />
                <span>All Categories</span>
              </label>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <h4 className="filter-group-title">Price Range</h4>
              <div className="price-inputs">
                <input
                  type="number" placeholder="Min ₹"
                  value={filters.minPrice}
                  onChange={e => { setFilters(p => ({ ...p, minPrice: e.target.value })); setPage(1); }}
                  className="form-input price-input"
                />
                <span className="price-sep">–</span>
                <input
                  type="number" placeholder="Max ₹"
                  value={filters.maxPrice}
                  onChange={e => { setFilters(p => ({ ...p, maxPrice: e.target.value })); setPage(1); }}
                  className="form-input price-input"
                />
              </div>
              <div className="quick-prices">
                {[['Under ₹500', 0, 500], ['₹500-₹1,500', 500, 1500], ['₹1,500-₹5,000', 1500, 5000], ['₹5,000+', 5000, 99999]].map(([label, min, max]) => (
                  <button key={label}
                    className={`quick-price-btn ${filters.minPrice == min && filters.maxPrice == max ? 'active' : ''}`}
                    onClick={() => { setFilters(p => ({ ...p, minPrice: min, maxPrice: max })); setPage(1); }}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* Size (Only for Kurtis) */}
            {filters.category === 'Kurtis' && (
              <div className="filter-group">
                <h4 className="filter-group-title">Size</h4>
                <div className="size-grid">
                  {SIZES.map(s => (
                    <button key={s}
                      className={`size-filter-btn ${filters.size === s ? 'active' : ''}`}
                      onClick={() => updateFilter('size', s)}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Special */}
            <div className="filter-group">
              <h4 className="filter-group-title">Special</h4>
              <label className="filter-option">
                <input type="checkbox" checked={filters.sale === 'true'} onChange={e => { setFilters(p => ({ ...p, sale: e.target.checked ? 'true' : '' })); setPage(1); }} className="filter-check" />
                <span>On Sale</span>
              </label>
              <label className="filter-option">
                <input type="checkbox" checked={filters.featured === 'true'} onChange={e => { setFilters(p => ({ ...p, featured: e.target.checked ? 'true' : '' })); setPage(1); }} className="filter-check" />
                <span>Featured</span>
              </label>
            </div>
          </aside>

          {/* Products area */}
          <div className="products-main">
            {/* Toolbar */}
            <div className="products-toolbar">
              <button className="btn btn-outline btn-sm hide-desktop" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={16} /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
              <div className="toolbar-sort">
                <select
                  value={filters.sort}
                  onChange={e => { setFilters(p => ({ ...p, sort: e.target.value })); setPage(1); }}
                  className="form-input sort-select"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={16} className="sort-arrow" />
              </div>
            </div>

            {loading ? (
              <div className="products-grid-list">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="product-skeleton">
                    <div className="skeleton" style={{ aspectRatio: '3/4' }} />
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="skeleton" style={{ height: 12, width: '60%' }} />
                      <div className="skeleton" style={{ height: 16 }} />
                      <div className="skeleton" style={{ height: 20, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid-list">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {/* Pagination */}
                {total > 12 && (
                  <div className="pagination">
                    <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                    <span className="page-info">Page {page} of {Math.ceil(total / 12)}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
