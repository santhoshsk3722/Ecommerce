import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import PageTransition from '../components/PageTransition';
import noProductsImg from '../assets/no-products.png';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const [page, setPage] = useState(1);
    const limit = 12; // Items per page

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        let url = `${apiUrl}/api/products`;
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        params.append('page', page);
        params.append('limit', limit);

        if (params.toString()) url += `?${params.toString()}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') setProducts(data.data);
            });
    }, [search, category, page]);

    const [categories, setCategories] = useState(["All"]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        // Fetch Categories
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${apiUrl}/api/categories`)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setCategories(["All", ...data.data.slice(0, 10)]);
                }
            });

        // --- SMART RECOMMENDATIONS ---
        const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
        if (history.length > 0) {
            setRecommendedProducts(history);
        }
    }, []);

    const handleCategoryClick = (cat) => {
        if (cat === "All") {
            setSearchParams(params => {
                params.delete('category');
                return params;
            });
            setPage(1); // Reset page
            return;
        }

        if (category === cat) {
            setSearchParams(params => {
                params.delete('category');
                return params;
            });
            setPage(1);
        } else {
            setSearchParams(params => {
                params.set('category', cat);
                return params;
            });
            setPage(1);
        }
    };

    return (
        <PageTransition>
            {/* Hero Section */}
            {!search && !category && <HeroSlider />}

            <div className="container" style={{ paddingLeft: 0, paddingRight: 0, marginTop: '20px' }}>

                {/* Personalized Recommendations */}
                {!search && !category && recommendedProducts.length > 0 && (
                    <div style={{ marginBottom: '40px' }}>

                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                            Recently Viewed & Picked for You
                        </h2>
                        <div className="grid-products">
                            {recommendedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '20px', scrollbarWidth: 'none' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                background: (category === cat) || (cat === 'All' && !category) ? 'var(--primary)' : 'var(--surface)',
                                color: (category === cat) || (cat === 'All' && !category) ? 'white' : 'var(--text-main)',
                                border: '1px solid var(--border)',
                                whiteSpace: 'nowrap',
                                fontSize: '14px',
                                fontWeight: '600',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div>
                    {search && <h2 style={{ marginBottom: '20px' }}>Results for "{search}"</h2>}
                    {products.length === 0 ? (
                        <div style={{ background: 'var(--surface)', padding: '60px', textAlign: 'center', borderRadius: '12px' }}>
                            <img src={noProductsImg} alt="No Items" style={{ width: '200px', marginBottom: '20px', opacity: 0.8 }} />
                            <h3 style={{ color: 'var(--text-secondary)' }}>No products found</h3>
                            <p style={{ color: 'var(--text-light)' }}>Try searching for something else.</p>
                        </div>
                    ) : (
                        <div className="grid-products">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="btn btn-secondary"
                            style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            Previous
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>Page {page}</span>
                        <button
                            disabled={products.length < limit}
                            onClick={() => setPage(p => p + 1)}
                            className="btn btn-secondary"
                            style={{ opacity: products.length < limit ? 0.5 : 1, cursor: products.length < limit ? 'not-allowed' : 'pointer' }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Home;
