import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:5000/api/wishlist/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'success') setWishlist(data.data);
                });
        }
    }, [user]);

    if (!user) return <div className="container">Please login to view wishlist.</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>My Wishlist ({wishlist.length})</h2>
            {wishlist.length === 0 && <div style={{ marginTop: '20px' }}>Your wishlist is empty.</div>}

            <div className="grid-products" style={{ marginTop: '20px' }}>
                {wishlist.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
