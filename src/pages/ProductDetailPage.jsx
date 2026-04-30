import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronRight, Check, Minus, Plus } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        // Find first available size
        setSelectedSize('');
        setSelectedColor(data.colors?.[0] || '');
      } catch { 
        toast.error('Product not found'); 
      }
      finally { setLoading(false); }
    };
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/${id}`);
        setReviews(data);
      } catch {
        console.error('Failed to load reviews');
      }
    };
    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      toast.error('Please select a size');
      return;
    }
    
    // Validate stock for selected size
    const sizeData = product.sizes?.find(s => (typeof s === 'string' ? s : s.size) === selectedSize);
    if (sizeData && typeof sizeData === 'object' && sizeData.stock < qty) {
      toast.error(`Only ${sizeData.stock} items left in size ${selectedSize}`);
      return;
    }

    addToCart(product, qty, selectedSize, selectedColor);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/reviews/${id}`, reviewForm);
      setReviews(prev => [data, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error('Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="container" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!product) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <h2>Product not found</h2>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Products</Link>
    </div>
  );

  const inWish = isInWishlist(product._id);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={14} />
          <Link to="/products">Products</Link> <ChevronRight size={14} />
          <Link to={`/products?category=${product.category}`}>{product.category}</Link> <ChevronRight size={14} />
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="main-img-wrap">
              <img
                src={product.images?.[selectedImg] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'}
                alt={product.name}
                className="main-product-img"
              />
              {discount > 0 && <div className="detail-badge">{discount}% OFF</div>}
            </div>
            {product.images?.length > 1 && (
              <div className="thumbnails">
                {product.images.map((img, i) => (
                  <button key={i} className={`thumb-btn ${selectedImg === i ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info-panel">
            <span className="detail-category">{product.category}</span>
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-rating">
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} fill={s <= Math.round(product.ratings) ? 'currentColor' : 'none'}
                    className={s <= Math.round(product.ratings) ? 'star' : 'star empty'} />
                ))}
              </div>
              <span className="detail-rating-text">{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>

            <div className="detail-price">
              <span className="detail-price-current">₹{product.price?.toLocaleString() || product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="detail-price-original">₹{product.originalPrice?.toLocaleString() || product.originalPrice}</span>
                  <span className="badge badge-maroon">{discount}% OFF</span>
                </>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="detail-selector">
                <p className="selector-label">Size: <strong>{selectedSize}</strong></p>
                <div className="selector-options">
                  {product.sizes.map(s => {
                    const sizeLabel = typeof s === 'string' ? s : s.size;
                    const isOOS = typeof s === 'object' && s.stock <= 0;
                    return (
                      <button key={sizeLabel}
                        className={`selector-btn ${selectedSize === sizeLabel ? 'active' : ''} ${isOOS ? 'out-of-stock' : ''}`}
                        onClick={() => !isOOS && setSelectedSize(sizeLabel)}
                        disabled={isOOS}
                      >
                        {sizeLabel}
                        {isOOS && <span className="oos-label">Out of Stock</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="detail-selector">
                <p className="selector-label">Color: <strong>{selectedColor}</strong></p>
                <div className="selector-options">
                  {product.colors.map(c => (
                    <button key={c}
                      className={`color-btn ${selectedColor === c ? 'active' : ''}`}
                      onClick={() => setSelectedColor(c)}
                    >
                      {selectedColor === c && <Check size={12} />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty & CTA */}
            <div className="detail-actions">
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={16} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}><Plus size={16} /></button>
              </div>
              <button type="button" className="btn btn-primary btn-lg flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button type="button" className={`wish-detail-btn ${inWish ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
                <Heart size={20} fill={inWish ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="stock-info" style={{ marginTop: '16px', fontWeight: '500', fontSize: '1.05rem' }}>
              {(() => {
                if (product.sizes?.length > 0) {
                  const sizeData = product.sizes.find(s => (typeof s === 'string' ? s : s.size) === selectedSize);
                  if (!sizeData) return <span style={{ color: 'var(--text-muted)' }}>Select a size to see availability</span>;
                  
                  // If it's the old string format, we just say "In Stock" if total stock > 0
                  if (typeof sizeData === 'string') {
                    return product.stock > 0 ? <><Check size={16} className="text-gold" style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> <span style={{ color: 'var(--maroon-light)' }}>In stock — Order now!</span></> : <span style={{ color: '#d9534f' }}>❌ Out of stock</span>;
                  }

                  if (sizeData.stock <= 0) return <span style={{ color: '#d9534f' }}>❌ Size {selectedSize} is currently out of stock</span>;
                  if (sizeData.stock <= 5) return <span style={{ color: '#d9534f' }}>⚠️ Hurry! Only {sizeData.stock} left in {selectedSize}!</span>;
                  return <><Check size={16} className="text-gold" style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> <span style={{ color: 'var(--maroon-light)' }}>Size {selectedSize} is in stock — Order now!</span></>;
                }
                
                // Fallback for products without sizes
                if (product.stock > 0) {
                  return product.stock <= 5
                    ? <span style={{ color: '#d9534f' }}>⚠️ Hurry! Only {product.stock} left in stock!</span>
                    : <><Check size={16} className="text-gold" style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> <span style={{ color: 'var(--maroon-light)' }}>{product.stock} in stock — Order now!</span></>;
                }
                return <span style={{ color: '#d9534f' }}>❌ Currently out of stock</span>;
              })()}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="detail-tags">
                {product.tags.map(t => <span key={t} className="detail-tag">#{t}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="section-title" style={{ fontSize: '1.6rem' }}>Customer Reviews</h2>
          <div className="ornament-divider">⬥ ⬦ ⬥</div>

          {/* Write a review */}
          {user && (
            <form onSubmit={handleReviewSubmit} className="review-form card">
              <h4>Write a Review</h4>
              <div className="star-rating-input">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: s }))}>
                    <Star size={24} fill={s <= reviewForm.rating ? 'currentColor' : 'none'}
                      className={s <= reviewForm.rating ? 'star' : 'star empty'} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Share your experience with this product..."
                value={reviewForm.comment}
                onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                className="form-input review-textarea"
                required rows={4}
              />
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>No reviews yet. Be the first to review!</p>
          ) : (
            <div className="reviews-list">
              {reviews.map(r => (
                <div key={r._id} className="review-item card">
                  <div className="review-header">
                    <div className="review-avatar">{r.userName?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className="review-author">{r.userName}</p>
                      <div className="stars">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} fill={s <= r.rating ? 'currentColor' : 'none'}
                            className={s <= r.rating ? 'star' : 'star empty'} />
                        ))}
                      </div>
                    </div>
                    <span className="review-date text-muted text-sm" style={{ marginLeft: 'auto' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="review-text">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
