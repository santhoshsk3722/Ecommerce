import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const ReviewSection = ({ productId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(''); // New image state
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const hasReviewed = user && reviews.some(r => r.user_id === user.id);

    // Populate form if user wants to edit
    const handleEditClick = () => {
        const myReview = reviews.find(r => r.user_id === user.id);
        if (myReview) {
            setRating(myReview.rating);
            setComment(myReview.comment);
            setImage(myReview.image || ''); // Populate image
            setIsEditing(true);
        }
    };

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const fetchReviews = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/reviews/${productId}`)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setReviews(data.data);
                }
                setLoading(false);
            });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    // Resize to max 500x500 for reviews
                    const maxDim = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxDim) {
                            height *= maxDim / width;
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width *= maxDim / height;
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    setImage(resizedBase64);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to write a review");
            return;
        }
        setSubmitting(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(`${apiUrl}/api/reviews`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    product_id: productId,
                    rating: parseInt(rating),
                    comment,
                    image // Send image
                })
            });
            const data = await res.json();
            if (data.message === 'success') {
                setComment('');
                setImage('');
                setIsEditing(false); // Reset edit mode
                fetchReviews(); // Refresh list
            } else {
                alert(data.error || "Something went wrong");
            }
        } catch (err) {
            console.error("Failed to post review", err);
        }
        setSubmitting(false);
    };

    const averageRating = reviews.length
        ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviews.length).toFixed(1)
        : 0;



    return (
        <div style={{ marginTop: '50px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '30px' }}>Customer Reviews</h3>

            <div className="responsive-grid-reviews" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>

                {/* Visual Report */}
                <div style={{ background: 'var(--surface-hover)', padding: '30px', borderRadius: '16px', height: 'fit-content' }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: 1 }}>
                        {averageRating}
                        <span style={{ fontSize: '20px', color: 'var(--text-secondary)', marginLeft: '10px' }}>/ 5</span>
                    </div>
                    <div style={{ color: 'var(--warning)', fontSize: '20px', margin: '10px 0' }}>
                        {'★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating))}
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Based on {reviews.length} reviews</p>

                    {/* Add Review Form */}
                    {(user && !hasReviewed) || isEditing ? (
                        <form onSubmit={handleSubmit} style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                            <h4 style={{ marginBottom: '15px' }}>{isEditing ? 'Update your Review' : 'Write a Review'}</h4>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Rating</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            onClick={() => setRating(star)}
                                            style={{
                                                cursor: 'pointer',
                                                fontSize: '24px',
                                                color: star <= rating ? 'var(--warning)' : '#cbd5e1'
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', cursor: 'pointer', color: 'var(--accent)' }}>
                                    📷 Add Photo
                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                </label>
                                {image && (
                                    <div style={{ marginTop: '10px', position: 'relative', width: 'fit-content' }}>
                                        <img src={image} alt="Review Preview" style={{ maxHeight: '100px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        <button
                                            type="button"
                                            onClick={() => setImage('')}
                                            style={{
                                                position: 'absolute', top: '-5px', right: '-5px',
                                                background: 'red', color: 'white', borderRadius: '50%',
                                                width: '20px', height: '20px', border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    marginBottom: '15px',
                                    background: 'var(--surface)',
                                    color: 'var(--text-main)'
                                }}
                                rows="3"
                                required
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '10px' }}
                            >
                                {submitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Post Review')}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    style={{ width: '100%', marginTop: '10px', padding: '10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    ) : hasReviewed && !isEditing ? (
                        <div style={{ marginTop: '30px', padding: '15px', background: '#ecfdf5', color: '#047857', borderRadius: '8px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
                            <div>✅ You have already reviewed this product.</div>
                            <button
                                onClick={handleEditClick}
                                style={{
                                    marginTop: '10px',
                                    background: 'transparent',
                                    border: '1px solid #047857',
                                    color: '#047857',
                                    padding: '5px 15px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Edit Review
                            </button>
                        </div>
                    ) : (
                        <div style={{ marginTop: '20px', padding: '15px', background: 'var(--surface)', borderRadius: '8px', textAlign: 'center' }}>
                            <a href="/#/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</a> to write a review.
                        </div>
                    )}
                </div>

                {/* Review List */}
                <div>
                    {loading ? (
                        <p>Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '12px' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {reviews.map(review => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        padding: '20px',
                                        background: 'var(--surface)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '32px', height: '32px',
                                                borderRadius: '50%',
                                                background: 'var(--primary-gradient)',
                                                color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold', fontSize: '12px'
                                            }}>
                                                {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <strong>{review.user_name}</strong>
                                        </div>
                                        <div style={{ color: 'var(--warning)', fontSize: '14px' }}>
                                            {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '10px 0' }}>{review.comment}</p>
                                    {review.image && (
                                        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                                            <img src={review.image} alt="Review" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        </div>
                                    )}
                                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                        {new Date(review.date).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ReviewSection;

