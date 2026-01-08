import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

    // Feature 7: Advanced Filters State
    const [sortBy, setSortBy] = useState('');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        let url = `${apiUrl}/api/products`;
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        params.append('page', page);
        params.append('limit', limit);

        // Advanced Filters
        if (sortBy) params.append('sortBy', sortBy);
        if (priceRange.min > 0) params.append('minPrice', priceRange.min);
        if (priceRange.max < 2000) params.append('maxPrice', priceRange.max); // 2000 is default max

        if (params.toString()) url += `?${params.toString()}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') setProducts(data.data);
            });
    }, [search, category, page, sortBy, priceRange.min, priceRange.max]); // Re-fetch on filter change

    const [categories, setCategories] = useState(["All"]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        // Fetch Categories
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
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
            <Helmet>
                <title>TechOrbit - Electronics, Fashion & More</title>
                <meta name="description" content="Shop the best electronics, fashion, and home goods at TechOrbit. Fast shipping and great deals!" />
            </Helmet>
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

                {/* --- Advanced Filters & Sort Controls --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span>⚙️</span> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                        >
                            <option value="">Default</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest Arrivals</option>
                        </select>
                    </div>
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                    <div style={{
                        background: 'var(--surface-hover)',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '30px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        border: '1px solid var(--border)'
                    }}>
                        <div>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Price Range</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                    style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                    style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                />
                            </div>
                        </div>
                        {/* Future filters can go here (Ratings, Brands, etc.) */}
                    </div>
                )}

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

