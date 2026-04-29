import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const inWish = isInWishlist(product._id);

  const discountPct = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card fade-in">
      <div className="product-img-wrap">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'}
            alt={product.name}
            className="product-img"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="product-badges">
          {discountPct > 0 && <span className="badge badge-maroon">{discountPct}% OFF</span>}
          {product.isFeatured && <span className="badge badge-gold">Featured</span>}
          {product.stock === 0 && <span className="badge badge-maroon">Sold Out</span>}
          {product.stock > 0 && product.stock <= 5 && <span className="badge badge-gold" style={{ background: '#ff9900', color: '#fff', border: 'none' }}>Only {product.stock} Left!</span>}
        </div>

        {/* Hover actions */}
        <div className="product-hover-actions">
          <button
            type="button"
            className={`wish-btn ${inWish ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            aria-label="Toggle wishlist"
          >
            <Heart size={18} fill={inWish ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            className="cart-quick-btn"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1, product.sizes?.[0] || '', product.colors?.[0] || ''); }}
            disabled={product.stock === 0}
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <Link to={`/products/${product._id}`} className="product-name">{product.name}</Link>

        <div className="product-rating">
          <div className="stars">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={12} fill={s <= Math.round(product.ratings) ? 'currentColor' : 'none'}
                className={s <= Math.round(product.ratings) ? 'star' : 'star empty'} />
            ))}
          </div>
          <span className="rating-count">({product.numReviews})</span>
        </div>

        <div className="product-price">
          <span className="price-current">₹{product.price?.toLocaleString() || product.price}</span>
          {product.originalPrice > product.price && (
            <span className="price-original">₹{product.originalPrice?.toLocaleString() || product.originalPrice}</span>
          )}
        </div>

        {product.sizes?.length > 0 && (
          <div className="product-sizes">
            {product.sizes.slice(0, 4).map(s => (
              <span key={s} className="size-chip">{s}</span>
            ))}
            {product.sizes.length > 4 && <span className="size-chip">+{product.sizes.length - 4}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
