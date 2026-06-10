import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { getProducts, getCategories } from '../api';
import './shop.css';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    getCategories()
      .then((cats) => {
        const cat = cats.find((c) => c.slug === slug);
        setCategoryName(cat?.name || slug.replace(/-/g, ' '));
      })
      .catch(() => setCategoryName(slug.replace(/-/g, ' ')));

    setLoading(true);
    getProducts({ category: slug, limit: 50 })
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <Navbar />
      <div className="shop-page">
        <div className="shop-container">
          <nav className="shop-breadcrumb">
            <Link to="/shop">Shop</Link> &rsaquo; {categoryName}
          </nav>
          <div className="shop-header">
            <h1>{categoryName}</h1>
          </div>
          <ProductGrid
            products={products}
            loading={loading}
            emptyMessage="No products in this category yet."
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
