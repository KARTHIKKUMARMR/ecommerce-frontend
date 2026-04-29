import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Tag, Star, Truck, Shield, RefreshCw, HeadphonesIcon } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const CATEGORIES = [
  { name: 'Sarees', icon: '🥻', desc: 'Silk, Cotton & Designer', gradient: 'from-maroon', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400' },
  { name: 'Kurtis', icon: '👗', desc: 'Anarkali, Straight & More', gradient: 'from-brown', img: '/images/cat_kurti.png' },
  { name: 'Earrings', icon: '💎', desc: 'Kundan, Jhumka & Pearl', gradient: 'from-gold', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' },
  { name: 'Bangles', icon: '⭕', desc: 'Lac, Gold-Plated & More', gradient: 'from-terracotta', img: '/images/cat_bangles.png' },
];

const FEATURES = [
  { icon: <Truck size={28} />, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: <Shield size={28} />, title: 'Authentic Products', desc: '100% genuine & certified' },
  { icon: <RefreshCw size={28} />, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: <HeadphonesIcon size={28} />, title: '24/7 Support', desc: 'Always here to help' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [sale, setSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);

  const HERO_SLIDES = [
    { title: 'Royal Heritage', subtitle: 'Kanjivaram & Banarasi Sarees', tag: 'New Collection', bg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600', link: '/products?category=Sarees' },
    { title: 'Artisan Kurtis', subtitle: 'Embroidered & Mirror Work', tag: 'Festive Special', bg: '/images/hero_kurti.png', link: '/products?category=Kurtis' },
    { title: 'Temple Jewels', subtitle: 'Kundan, Meenakari & More', tag: 'Handcrafted Earrings', bg: '/images/hero_earrings.png', link: '/products?category=Earrings' },
    { title: 'Elegant Bangles', subtitle: 'Lac, Gold-Plated & Designer', tag: 'Bridal Exclusive', bg: '/images/hero_bangles.png', link: '/products?category=Bangles' },
  ];

  useEffect(() => {
    const interval = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, saleRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products?sale=true&limit=4'),
        ]);
        setFeatured(featRes.data.products);
        setSale(saleRes.data.products);
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const slide = HERO_SLIDES[heroSlide];

  return (
    <div className="home-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        {/* Background Images Crossfade */}
        {HERO_SLIDES.map((s, i) => (
          <div 
            key={i}
            className="hero-bg-layer"
            style={{ 
              backgroundImage: `url(${s.bg})`,
              opacity: i === heroSlide ? 1 : 0
            }}
          />
        ))}
        
        <div className="hero-overlay" />
        <div className="hero-pattern" />
        {/* Elephant SVG decorations */}
        <div className="hero-deco hero-deco-left">🐘</div>
        <div className="hero-deco hero-deco-right">🐘</div>

        <div className="container hero-content">
          <span className="hero-tag fade-in" key={`tag-${heroSlide}`}><Sparkles size={14} /> {slide.tag}</span>
          <h1 className="hero-title" key={`title-${heroSlide}`}>{slide.title}</h1>
          <div className="hero-divider" key={`div-${heroSlide}`}>⬥ ⬦ ⬥ ⬦ ⬥</div>
          <p className="hero-subtitle" key={`sub-${heroSlide}`}>{slide.subtitle}</p>
          <p className="hero-desc font-crimson" key={`desc-${heroSlide}`}>
            Srikalahasthikala is an ancient Indian ethnic hand art on textiles. Tiny wonder we have firmly established ourselves in srikalahasthi. Our collections are premium sarees, Duppattas, dress materials and running fabrics. Srikalahasthikala is vowed to provide eco-friendly swadeshi products
          </p>
          <div className="hero-ctas" key={`cta-${heroSlide}`}>
            <Link to={slide.link} className="btn btn-primary btn-lg">Shop Now <ChevronRight size={18} /></Link>
            <Link to="/products" className="btn btn-outline btn-lg">Explore All</Link>
          </div>
        </div>

        {/* Slide dots */}
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot ${i === heroSlide ? 'active' : ''}`} onClick={() => setHeroSlide(i)} />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ===== FEATURES BAR ===== */}
      <section className="features-bar">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-item">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <p className="feature-title">{f.title}</p>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section temple-pattern">
        <div className="container">
          <p className="section-eyebrow">Shop By</p>
          <h2 className="section-title">Our Collections</h2>
          <div className="ornament-divider">⬥ ⬦ ⬥ ⬦ ⬥</div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.name}`} className="category-card">
                <div className="cat-img-wrap">
                  <img src={cat.img} alt={cat.name} className="cat-img" loading="lazy" />
                  <div className="cat-overlay" />
                </div>
                <div className="cat-info">
                  <span className="cat-icon">{cat.icon}</span>
                  <h3 className="cat-name">{cat.name}</h3>
                  <p className="cat-desc">{cat.desc}</p>
                  <span className="cat-cta">Explore <ChevronRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OFFER BANNER ===== */}
      <section className="offer-banner">
        <div className="container">
          <div className="offer-grid">
            <div className="offer-card offer-card-1">
              <div className="offer-badge"><Tag size={14} /> Limited Time</div>
              <h3>Festive Season Sale</h3>
              <p className="offer-discount">Up to <span>50% OFF</span></p>
              <p className="offer-desc">On selected Sarees & Kurtis</p>
              <Link to="/products?sale=true" className="btn btn-primary btn-sm">Shop Sale</Link>
            </div>
            <div className="offer-card offer-card-2">
              <div className="offer-badge"><Sparkles size={14} /> New Arrival</div>
              <h3>Wedding Collection</h3>
              <p className="offer-discount">Starting at <span>₹1,299</span></p>
              <p className="offer-desc">Premium Kanjivaram & Banarasi</p>
              <Link to="/products?category=Sarees" className="btn btn-outline btn-sm">Explore</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section">
        <div className="container">
          <p className="section-eyebrow">Handpicked For You</p>
          <h2 className="section-title">Featured Products</h2>
          <div className="ornament-divider">⬥ ⬦ ⬥ ⬦ ⬥</div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton" style={{ aspectRatio: '3/4' }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                    <div className="skeleton" style={{ height: 16 }} />
                    <div className="skeleton" style={{ height: 20, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p>Start your server and seed the database to see products here!</p>
              <p className="text-muted text-sm">Run: cd backend → npm run seed</p>
            </div>
          )}

          <div className="section-cta">
            <Link to="/products" className="btn btn-outline btn-lg">View All Products <ChevronRight size={18} /></Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section temple-pattern section-testimonials">
        <div className="container">
          <p className="section-eyebrow">What Our Customers Say</p>
          <h2 className="section-title">Royal Reviews</h2>
          <div className="ornament-divider">⬥ ⬦ ⬥ ⬦ ⬥</div>
          <div className="testimonials-grid">
            {[
              { name: 'Priya Sharma', city: 'Jaipur', rating: 5, text: 'Absolutely stunning Banarasi saree! The quality is exceptional, exactly as described. Will definitely order again.' },
              { name: 'Meena Iyer', city: 'Chennai', rating: 5, text: 'The Kanjivaram saree I ordered was breathtaking. Authentic, beautifully packaged and delivered on time!' },
              { name: 'Asha Patel', city: 'Ahmedabad', rating: 4, text: 'Beautiful kundan earrings that match my wedding lehenga perfectly. Great craftsmanship and fast delivery!' },
            ].map((t, i) => (
              <div key={i} className="testimonial-card card">
                <div className="stars" style={{ marginBottom: 12 }}>
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={14} fill={s < t.rating ? 'currentColor' : 'none'} className={s < t.rating ? 'star' : 'star empty'} />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-city">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SALE PICKS ===== */}
      {sale.length > 0 && (
        <section className="section">
          <div className="container">
            <p className="section-eyebrow">Don't Miss Out</p>
            <h2 className="section-title">Sale Picks</h2>
            <div className="ornament-divider">⬥ ⬦ ⬥ ⬦ ⬥</div>
            <div className="products-grid products-grid-4">
              {sale.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            <div className="section-cta">
              <Link to="/products?sale=true" className="btn btn-maroon btn-lg">View All Sale Items <Tag size={18} /></Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
