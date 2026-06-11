import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { getProducts, getCategories } from '../api';
import './shop.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState(['collection']);

  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const featured = searchParams.get('featured') || '';
  const availability = searchParams.get('availability') || 'in-stock';
  const brand = searchParams.get('brand') || 'lidya-lifestyle';

  useEffect(() => {
    getCategories().then(setCategories).catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (category && category !== 'all') params.category = category;
    if (featured) params.featured = featured;
    if (searchParams.get('search')) params.search = searchParams.get('search');

    getProducts(params)
      .then((data) => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [searchParams, category, page, featured]);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search) next.set('search', search);
    else next.delete('search');
    next.delete('page');
    setSearchParams(next);
  };

  const setCategory = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug);
    else next.delete('category');
    next.delete('page');
    setSearchParams(next);
    setMobileFilterOpen(false);
  };

  const setAvailability = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val !== 'in-stock') next.set('availability', val);
    else next.delete('availability');
    next.delete('page');
    setSearchParams(next);
    setMobileFilterOpen(false);
  };

  const setBrand = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val !== 'lidya-lifestyle') next.set('brand', val);
    else next.delete('brand');
    next.delete('page');
    setSearchParams(next);
    setMobileFilterOpen(false);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearch('');
    setMobileFilterOpen(false);
  };

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <>
      <Navbar />
      <div className="shop-page">
        <div className="shop-container">
          <div className="shop-page-header">
            <div className="shop-page-heading">
              <span className="shop-eyebrow">Shop Lidya Lifestyle</span>
              <h1 className="shop-page-title">Your Style. Your Rules.</h1>
            </div>

            <form className="shop-search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search pieces..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>

          <div className="shop-mobile-filter-bar">
            <button type="button" className="shop-mobile-filter-open" onClick={() => setMobileFilterOpen(!mobileFilterOpen)}>
              <span>Filter Catalog</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={mobileFilterOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
              </svg>
            </button>
            <button type="button" className="shop-reset-filters" onClick={clearFilters}>
              <span>Reset</span>
            </button>
          </div>

          <div className="shop-catalog-layout">
            {/* Desktop Sidebar - always visible */}
            <aside className="shop-filters-panel">
              <div className="shop-filter-section">
                <h4 className="shop-filter-heading">Collection</h4>
                <div className="shop-category-list">
                  <button
                    type="button"
                    className={`shop-category-btn ${!category || category === 'all' ? 'is-active' : ''}`}
                    onClick={() => setCategory('all')}
                  >
                    All
                  </button>
                  {categories.filter((c) => !c.parent_id).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`shop-category-btn ${category === cat.slug ? 'is-active' : ''}`}
                      onClick={() => setCategory(cat.slug)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shop-filter-section">
                <h4 className="shop-filter-heading">Availability</h4>
                <div className="shop-category-list">
                  <button
                    type="button"
                    className={`shop-category-btn ${availability === 'in-stock' ? 'is-active' : ''}`}
                    onClick={() => setAvailability('in-stock')}
                  >
                    In Stock
                  </button>
                  <button
                    type="button"
                    className={`shop-category-btn ${availability === 'preorder' ? 'is-active' : ''}`}
                    onClick={() => setAvailability('preorder')}
                  >
                    Preorder
                  </button>
                </div>
              </div>

              <div className="shop-filter-section">
                <h4 className="shop-filter-heading">Brand</h4>
                <div className="shop-category-list">
                  <button
                    type="button"
                    className={`shop-category-btn ${brand === 'lidya-lifestyle' ? 'is-active' : ''}`}
                    onClick={() => setBrand('lidya-lifestyle')}
                  >
                    Lidya Lifestyle
                  </button>
                  <button
                    type="button"
                    className={`shop-category-btn ${brand === 'artisan-partners' ? 'is-active' : ''}`}
                    onClick={() => setBrand('artisan-partners')}
                  >
                    Artisan Partners
                  </button>
                </div>
              </div>

              <div className="shop-filter-section">
                <h4 className="shop-filter-heading">Minimum Rating</h4>
                <div className="shop-rating-list">
                  <button type="button" className="shop-rating-btn">
                    <span className="shop-rating-stars">★★★★★</span>
                    <span>4.8+ Stars</span>
                  </button>
                  <button type="button" className="shop-rating-btn">
                    <span className="shop-rating-stars">★★★★★</span>
                    <span>4.5+ Stars</span>
                  </button>
                  <button type="button" className="shop-rating-btn">
                    <span className="shop-rating-stars">★★★★☆</span>
                    <span>4.0+ Stars</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Backdrop */}
            <div className={`shop-filter-backdrop ${mobileFilterOpen ? 'is-open' : ''}`} onClick={() => setMobileFilterOpen(false)}></div>

            {/* Mobile Filter Drawer - below navbar */}
            <div className={`shop-filters-panel shop-filters-drawer ${mobileFilterOpen ? 'is-open' : ''}`}>
              <div className="shop-filters-drawer-header">
                <h3>Filters</h3>
                <button type="button" className="shop-filters-drawer-close" onClick={() => setMobileFilterOpen(false)}>
                  &times;
                </button>
              </div>
              <div className="shop-filter-section">
                <h4 className="shop-filter-heading">Collection</h4>
                <div className="shop-category-list">
                  <button
                    type="button"
                    className={`shop-category-btn ${!category || category === 'all' ? 'is-active' : ''}`}
                    onClick={() => setCategory('all')}
                  >
                    All
                  </button>
                  {categories.filter((c) => !c.parent_id).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`shop-category-btn ${category === cat.slug ? 'is-active' : ''}`}
                      onClick={() => setCategory(cat.slug)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="shop-filter-section">
                <h4 className="shop-filter-heading">Availability</h4>
                <div className="shop-category-list">
                  <button
                    type="button"
                    className={`shop-category-btn ${availability === 'in-stock' ? 'is-active' : ''}`}
                    onClick={() => setAvailability('in-stock')}
                  >
                    In Stock
                  </button>
                  <button
                    type="button"
                    className={`shop-category-btn ${availability === 'preorder' ? 'is-active' : ''}`}
                    onClick={() => setAvailability('preorder')}
                  >
                    Preorder
                  </button>
                </div>
              </div>

              <div className="shop-filter-section">
                <h4 className="shop-filter-heading">Brand</h4>
                <div className="shop-category-list">
                  <button
                    type="button"
                    className={`shop-category-btn ${brand === 'lidya-lifestyle' ? 'is-active' : ''}`}
                    onClick={() => setBrand('lidya-lifestyle')}
                  >
                    Lidya Lifestyle
                  </button>
                  <button
                    type="button"
                    className={`shop-category-btn ${brand === 'artisan-partners' ? 'is-active' : ''}`}
                    onClick={() => setBrand('artisan-partners')}
                  >
                    Artisan Partners
                  </button>
                </div>
              </div>

              <div className="shop-filter-section">
                <h4 className="shop-filter-heading">Minimum Rating</h4>
                <div className="shop-rating-list">
                  <button type="button" className="shop-rating-btn">
                    <span className="shop-rating-stars">★★★★★</span>
                    <span>4.8+ Stars</span>
                  </button>
                  <button type="button" className="shop-rating-btn">
                    <span className="shop-rating-stars">★★★★★</span>
                    <span>4.5+ Stars</span>
                  </button>
                  <button type="button" className="shop-rating-btn">
                    <span className="shop-rating-stars">★★★★☆</span>
                    <span>4.0+ Stars</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="shop-catalog-main">
              <p className="shop-count">Showing {products.length} of {total} products</p>

              <ProductGrid products={products} loading={loading} emptyMessage="No products match your search." />

              {totalPages > 1 && (
                <div className="shop-pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(page - 1));
                      setSearchParams(next);
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ padding: '0.5rem' }}>Page {page} of {totalPages}</span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(page + 1));
                      setSearchParams(next);
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
