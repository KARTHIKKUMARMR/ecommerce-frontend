import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Header.css';

export default function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const [marketing, setMarketing] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/marketing/settings');
        setMarketing(data);
      } catch (err) {
        console.error('Settings fetch failed', err);
      }
    };
    fetchSettings();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products?category=Sarees', label: 'Sarees' },
    { to: '/products?category=Kurtis', label: 'Kurtis' },
    { to: '/products?category=Earrings', label: 'Earrings' },
    { to: '/products?category=Bangles', label: 'Bangles' },
  ];

  return (
    <>
      {/* Top announcement bar */}
      {marketing?.banner?.enabled && (
        <div className="header-announcement">
          <p>{marketing.banner.text}</p>
        </div>
      )}

      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        {/* Decorative top border */}
        <div className="header-ornament-top" />

        <div className="container">
          <div className="header-inner">
            {/* Logo */}
            <Link to="/" className="logo">
              <img src="/logo.png" alt="Handkala Logo" className="logo-image" />
            </Link>

            {/* Desktop Nav */}
            <nav className="header-nav hide-mobile">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="nav-link">{link.label}</Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="header-actions">
              <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search size={20} />
              </button>

              <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
                <Heart size={20} />
              </Link>

              <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              {user ? (
                <div className="user-menu-wrap">
                  <button className="icon-btn" onClick={() => setUserMenu(!userMenu)}>
                    <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                  </button>
                  {userMenu && (
                    <div className="user-dropdown" onMouseLeave={() => setUserMenu(false)}>
                      <div className="user-dropdown-header">
                        <p className="user-name">{user?.name || 'User'}</p>
                        <p className="user-email">{user?.email || ''}</p>
                      </div>
                      <Link to="/profile" className="dropdown-item" onClick={() => setUserMenu(false)}>
                        <User size={14} /> Profile Settings
                      </Link>
                      <Link to="/profile" className="dropdown-item" onClick={() => setUserMenu(false)}>
                        <Settings size={14} /> Change Password
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setUserMenu(false)}>
                          <Package size={14} /> Admin Panel
                        </Link>
                      )}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={() => { logout(); setUserMenu(false); navigate('/'); }}>
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm hide-mobile">Sign In</Link>
              )}

              <button className="icon-btn hide-desktop" onClick={() => setMenuOpen(true)}>
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="header-ornament-bottom" />
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="logo-brand">Handkala</span>
              <button onClick={() => setMenuOpen(false)}><X size={24} /></button>
            </div>
            <nav className="mobile-nav">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{link.label}</Link>
              ))}
              {!user ? (
                <Link to="/login" className="btn btn-primary btn-full" onClick={() => setMenuOpen(false)}>Sign In</Link>
              ) : (
                <>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>My Profile</Link>
                  <button className="mobile-nav-link danger" onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}>
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="search-form">
              <Search size={22} className="search-icon" />
              <input
                autoFocus
                type="text"
                placeholder="Search kurtis, sarees, jewellery..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="search-input"
              />
              <button type="button" onClick={() => setSearchOpen(false)}><X size={22} /></button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
