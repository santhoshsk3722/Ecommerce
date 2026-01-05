import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import PageTransition from '../components/PageTransition';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    useEffect(() => {
        let url = 'http://localhost:5000/api/products';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);

        if (params.toString()) url += `?${params.toString()}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') setProducts(data.data);
            });
    }, [search, category]);

    const categories = ["All", "Electronics", "Fashion", "Home", "Gaming", "Audio"];

    const handleCategoryClick = (cat) => {
        if (cat === "All") {
            setSearchParams(params => {
                params.delete('category');
                return params;
            });
            return;
        }

        if (category === cat) {
            setSearchParams(params => {
                params.delete('category');
                return params;
            });
        } else {
            setSearchParams(params => {
                params.set('category', cat);
                return params;
            });
        }
    };

    return (
        <PageTransition>
            {/* Hero Section - Only show on home without specific search/filter if desired, but here we show always for impact */}
            {!search && !category && <HeroSlider />}

            <div className="container" style={{ paddingLeft: 0, paddingRight: 0 }}>
                {/* Category Pills */}
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '20px', scrollbarWidth: 'none' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '50px',
                                background: (category === cat) || (cat === 'All' && !category) ? 'var(--primary)' : 'white',
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
                        <div style={{ background: 'white', padding: '60px', textAlign: 'center', borderRadius: '12px' }}>
                            <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="No Items" style={{ width: '200px', marginBottom: '20px', opacity: 0.5 }} />
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
                </div>
            </div>
        </PageTransition>
    );
};

export default Home;
