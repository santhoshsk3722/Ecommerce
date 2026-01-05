import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StarRating = ({ rating, setRating, editable = false }) => {
    return (
        <div style={{ display: 'flex' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    onClick={() => editable && setRating(star)}
                    style={{
                        cursor: editable ? 'pointer' : 'default',
                        fontSize: '20px',
                        color: star <= rating ? '#388e3c' : '#ccc',
                        marginRight: '2px'
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

const ReviewSection = ({ productId }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchReviews = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${apiUrl}/api/reviews/${productId}`)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') setReviews(data.data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const submitReview = () => {
        if (!user) return showToast('Please login to review', 'error');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${apiUrl}/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, product_id: productId, rating: newRating, comment })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    showToast('Review submitted!');
                    setComment('');
                    fetchReviews(); // Refresh
                } else {
                    showToast('Failed to submit review', 'error');
                }
            });
    };

    return (
        <div style={{ padding: '20px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Ratings & Reviews</h3>

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                {reviews.length === 0 ? <div>No reviews yet. Be the first to review!</div> : null}
                {reviews.map(review => (
                    <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <div style={{ background: review.rating >= 4 ? '#388e3c' : '#ff9f00', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {review.rating} ★
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{review.comment}</div>
                        </div>
                        <div style={{ color: '#878787', fontSize: '12px', marginTop: '5px' }}>
                            {review.user_name} <span style={{ margin: '0 5px' }}>•</span> {new Date(review.date).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Review Form */}
            {user ? (
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
                    <h4>Rate this product</h4>
                    <div style={{ margin: '10px 0' }}>
                        <StarRating rating={newRating} setRating={setNewRating} editable={true} />
                    </div>
                    <textarea
                        placeholder="Write a review..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', marginBottom: '10px' }}
                    />
                    <button onClick={submitReview} className="btn btn-primary" style={{ padding: '10px 20px' }}>Submit Review</button>
                </div>
            ) : (
                <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
                    Please login to rate and review.
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
