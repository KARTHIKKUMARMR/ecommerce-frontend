import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Tag, Star, Truck, Shield, RefreshCw, HeadphonesIcon } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

// ── FALLBACK IMAGES (only used when database has ZERO products) ──────────────
const FALLBACK_HERO_SLIDES = [
  { title: 'Royal Heritage', subtitle: 'Kanjivaram & Banarasi Sarees', tag: 'New Collection', bg: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600', link: '/products?category=Sarees' },
  { title: 'Elegant Dupattas', subtitle: 'Banarasi, Silk & Cotton', tag: 'Festive Special', bg: 'https://images.unsplash.com/photo-1583391733958-d25e07fac661?w=1600', link: '/products?category=Dupattas' },
  { title: 'Premium Dress Materials', subtitle: 'Unstitched Suits & Sets', tag: 'Handcrafted', bg: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600', link: '/products?category=Dress Materials' },
  { title: 'Authentic Fabrics', subtitle: 'Ikat, Kalamkari & More', tag: 'Exclusive', bg: 'https://images.unsplash.com/photo-1605001068864-4e2a3922f2b3?w=1600', link: '/products?category=Running Fabric' },
];

const FALLBACK_CATEGORY_IMAGES = {
  'Sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
  'Dupattas': 'https://images.unsplash.com/photo-1583391733958-d25e07fac661?w=600',
  'Dress Materials': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
  'Running Fabric': 'https://images.unsplash.com/photo-1605001068864-4e2a3922f2b3?w=600',
};

const CATEGORY_META = [
  { name: 'Sarees', icon: '🥻', desc: 'Silk, Cotton & Designer' },
  { name: 'Dupattas', icon: '🧣', desc: 'Banarasi, Silk & Cotton' },
  { name: 'Dress Materials', icon: '👗', desc: 'Unstitched Suits & Sets' },
  { name: 'Running Fabric', icon: '🧵', desc: 'Ikat, Kalamkari & More' },
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
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState(
    CATEGORY_META.map(c => ({ ...c, img: FALLBACK_CATEGORY_IMAGES[c.name] }))
  );
  const [heroSlides, setHeroSlides] = useState(FALLBACK_HERO_SLIDES);
  const [heroSlide, setHeroSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Auto-rotate hero slides ────────────────────────────────────────────────
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const interval = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // ── Fetch ALL dynamic data ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const t = Date.now(); // cache-buster

        // Use Promise.allSettled so one failure doesn't break everything
        const [heroRes, catRes, featRes, saleRes, colRes] = await Promise.allSettled([
          api.get(`/products/hero?_t=${t}`),
          api.get(`/products/latest-by-category?_t=${t}`),
          api.get(`/products?featured=true&limit=8&_t=${t}`),
          api.get(`/products?sale=true&limit=4&_t=${t}`),
          api.get(`/collections/public?_t=${t}`),
        ]);

        // ── 1. DYNAMIC HERO SLIDER ──────────────────────────────────────────
        if (heroRes.status === 'fulfilled') {
          const heroProducts = heroRes.value.data.heroProducts || [];
          console.log('[HomePage] Hero products received:', heroProducts.length, heroProducts.map(p => p.name));

          if (heroProducts.length > 0) {
            const dynamicSlides = heroProducts.map(p => ({
              title: p.name,
              subtitle: p.category,
              tag: p.isFeatured ? 'Featured Pick' : 'New Arrival',
              bg: p.image, // already filtered to Cloudinary URLs by backend
              link: `/products/${p._id}`,
            }));
            setHeroSlides(dynamicSlides);
            setHeroSlide(0); // Reset to first slide
            console.log('[HomePage] Dynamic hero slides set:', dynamicSlides.map(s => s.title));
          } else {
            console.log('[HomePage] No dynamic hero products found, using fallback slides');
            setHeroSlides(FALLBACK_HERO_SLIDES);
          }
        } else {
          console.error('[HomePage] Hero API failed:', heroRes.reason);
        }

        // ── 2. DYNAMIC CATEGORY IMAGES (strict category matching) ───────────
        if (catRes.status === 'fulfilled') {
          const catData = catRes.value.data.categories || {};
          console.log('[HomePage] Category images received:', Object.keys(catData));

          const dynamicCategories = CATEGORY_META.map(meta => {
            const dbCat = catData[meta.name];
            const img = dbCat?.image || FALLBACK_CATEGORY_IMAGES[meta.name];
            console.log(`[HomePage] ${meta.name} → ${dbCat ? dbCat.name : 'FALLBACK'} → ${img?.substring(0, 60)}...`);
            return { ...meta, img };
          });
          setCategories(dynamicCategories);
        } else {
          console.error('[HomePage] Category API failed:', catRes.reason);
        }

        // ── 3. FEATURED PRODUCTS ────────────────────────────────────────────
        setFeatured(featRes.status === 'fulfilled' ? (featRes.value.data.products || []) : []);

        // ── 4. SALE PRODUCTS ────────────────────────────────────────────────
        setSale(saleRes.status === 'fulfilled' ? (saleRes.value.data.products || []) : []);

        // ── 5. DYNAMIC COLLECTIONS ──────────────────────────────────────────
        setCollections(colRes.status === 'fulfilled' ? (colRes.value.data || []) : []);

      } catch (err) {
        console.error('[HomePage] Fatal error during data fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const slide = heroSlides.length > 0 ? heroSlides[heroSlide] : null;

  return (
    <div className="home-page">
      {/* ===== HERO SECTION ===== */}
      {heroSlides.length > 0 && (
        <section className="hero">
          {/* Background Images Crossfade */}
          {heroSlides.map((s, i) => (
            <div 
              key={`hero-bg-${i}-${s.bg}`}
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
            <span className="hero-tag fade-in" key={`tag-${heroSlide}`}><Sparkles size={14} /> {slide?.tag}</span>
            <h1 className="hero-title" key={`title-${heroSlide}`}>{slide?.title}</h1>
            <div className="hero-divider" key={`div-${heroSlide}`}>⬥ ⬦ ⬥ ⬦ ⬥</div>
            <p className="hero-subtitle" key={`sub-${heroSlide}`}>{slide?.subtitle}</p>
            <p className="hero-desc font-crimson" key={`desc-${heroSlide}`}>
              ApsarasFashions brings you the finest Indian ethnic hand art on textiles. We have firmly established ourselves with premium sarees, dupattas, dress materials and running fabrics. ApsarasFashions is committed to providing eco-friendly swadeshi products.
            </p>
            <div className="hero-ctas" key={`cta-${heroSlide}`}>
              <Link to={slide?.link || '/products'} className="btn btn-primary btn-lg">Shop Now <ChevronRight size={18} /></Link>
              <Link to="/products" className="btn btn-outline btn-lg">Explore All</Link>
            </div>
          </div>

          {/* Slide dots */}
          <div className="hero-dots">
            {heroSlides.map((_, i) => (
              <button key={i} className={`hero-dot ${i === heroSlide ? 'active' : ''}`} onClick={() => setHeroSlide(i)} />
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="hero-scroll">
            <div className="scroll-line" />
            <span>Scroll</span>
          </div>
        </section>
      )}

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

      {/* ===== CATEGORIES (Our Collections) ===== */}
      <section className="section temple-pattern">
        <div className="container">
          <p className="section-eyebrow">Shop By</p>
          <h2 className="section-title">Our Collections</h2>
          <div className="ornament-divider">⬥ ⬦ ⬥ ⬦ ⬥</div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.name}`} className="category-card">
                <div className="cat-img-wrap">
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="cat-img" 
                    loading="lazy" 
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_CATEGORY_IMAGES[cat.name]; }} 
                  />
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

      {/* ===== DYNAMIC COLLECTIONS ===== */}
      {collections.length > 0 && (
        <section className="offer-banner">
          <div className="container">
            <div className="offer-grid">
              {collections.map((col, idx) => {
                const bgImage = col.bannerImage || col.dynamicBannerImage || '';
                const linkUrl = col.autoUpdateByCategory 
                  ? `/products?category=${col.autoUpdateByCategory}` 
                  : col.autoUpdateByTag 
                    ? `/products?search=${col.autoUpdateByTag}` 
                    : `/products`;

                return (
                  <div key={col._id} className={`offer-card offer-card-${(idx % 2) + 1}`} style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'white' } : {}}>
                    {bgImage && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.4))', zIndex: 0 }} />}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {col.type && col.type !== 'Other' && <div className="offer-badge"><Tag size={14} /> {col.type}</div>}
                      <h3>{col.name}</h3>
                      {col.offerText && <p className="offer-discount"><span>{col.offerText}</span></p>}
                      {col.description && <p className="offer-desc" style={{ color: 'rgba(255,255,255,0.9)' }}>{col.description}</p>}
                      <Link to={linkUrl} className={`btn ${idx % 2 === 0 ? 'btn-primary' : 'btn-outline'} btn-sm`} style={bgImage && idx % 2 !== 0 ? { borderColor: 'white', color: 'white' } : {}}>
                        Explore
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
              <p>No featured products yet. Mark products as featured from the admin panel!</p>
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
