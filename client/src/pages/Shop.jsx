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

  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
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
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearch('');
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
            <button type="button" className="shop-mobile-filter-open" onClick={() => setMobileFilterOpen(true)}>
              <span>Filter Catalog</span>
            </button>
            <button type="button" className="shop-reset-filters" onClick={clearFilters}>
              <span>Reset All</span>
            </button>
          </div>

          <div className="shop-catalog-layout">
            <aside className={`shop-filters-panel ${mobileFilterOpen ? 'is-open' : ''}`}>
              <div className="shop-filters-panel-head">
                <span className="shop-filters-panel-title">Filters</span>
                <button type="button" className="shop-mobile-filters-close" onClick={() => setMobileFilterOpen(false)}>
                  ×
                </button>
              </div>

              <div className="shop-filter-block">
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

              <div className="shop-filter-block shop-filter-block--bordered">
                <h4 className="shop-filter-heading">Brand</h4>
                <div className="shop-category-list">
                  <button type="button" className="shop-category-btn is-active">Lidya Lifestyle</button>
                  <button type="button" className="shop-category-btn">Artisan Partners</button>
                </div>
              </div>

              <div className="shop-filter-block shop-filter-block--bordered">
                <h4 className="shop-filter-heading">Price Limit</h4>
                <div className="shop-price-range">
                  <input type="number" className="shop-price-input" placeholder="Min" min="0" />
                  <span className="shop-price-sep">-</span>
                  <input type="number" className="shop-price-input" placeholder="Max" min="0" />
                </div>
              </div>

              <div className="shop-filter-block shop-filter-block--bordered">
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
          
          {mobileFilterOpen && (
            <div className="shop-mobile-filters-overlay" onClick={() => setMobileFilterOpen(false)} />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
