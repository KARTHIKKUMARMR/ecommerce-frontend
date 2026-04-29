import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Mock data in case DB is offline
const MOCK_PRODUCTS = [
  { _id: '1', name: 'Royal Banarasi Silk Saree', category: 'Sarees', price: 4999, originalPrice: 7999, stock: 15, images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'] },
  { _id: '2', name: 'Anarkali Floral Kurti', category: 'Kurtis', price: 1299, originalPrice: 1999, stock: 50, images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=100'] },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '', category: 'Sarees', price: '', originalPrice: '', stock: '', description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      // Use /admin/products (authenticated) for accurate admin data
      const { data } = await api.get('/admin/products');
      setProducts(Array.isArray(data) ? data : (data.products || []));
    } catch (err) {
      console.error('Load products error:', err);
      setFetchError(true);
      toast.error(err.response?.data?.message || 'Failed to load products. The server may be waking up — please retry in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleOpenModal = (product = null) => {
    setImageFiles([]);
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice || '',
        stock: product.stock,
        description: product.description || ''
      });
      setImagePreviews(product.images || []);
    } else {
      setEditingId(null);
      setFormData({ name: '', category: 'Sarees', price: '', originalPrice: '', stock: '', description: '' });
      setImagePreviews([]);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    // Generate preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert image files to Base64 to send to live backend
      const base64Images = await Promise.all(imageFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }));

      const finalImages = base64Images.length > 0 ? base64Images : imagePreviews.length > 0 ? imagePreviews : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'];

      // Ensure explicit parsing of numerical fields
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
        stock: Number(formData.stock),
        images: finalImages
      };

      if (editingId) {
        const { data } = await api.put(`/admin/products/${editingId}`, payload);
        setProducts(prev => prev.map(p => p._id === editingId ? data : p));
        toast.success('Product updated successfully!');
      } else {
        const { data } = await api.post('/admin/products', payload);
        setProducts(prev => [data, ...prev]);
        toast.success('Product added successfully!');
      }
      
      setIsModalOpen(false);
    } catch (err) {
      console.error('Product save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Loading state
  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
          <div style={{ width: 48, height: 48, border: '4px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="admin-page">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem' }}>⚠️</p>
          <h3 style={{ color: 'var(--text-primary)' }}>Failed to load products</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>
            The server may be waking up (this can take ~30 seconds on the free plan).<br/>Please wait a moment and try again.
          </p>
          <button className="btn btn-primary" onClick={fetchProducts}>🔄 Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="admin-title">Products</h1>
          <p className="admin-subtitle">Manage your catalog, prices, and inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="admin-panel card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
          <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem' }} onClick={fetchProducts}>🔄 Refresh</button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price (Discounted)</th>
                <th>Original Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const discount = p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={p.images?.[0]} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                        <span className="font-medium text-primary">{p.name}</span>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td><span className="text-gold font-medium">₹{Number(p.price).toLocaleString()}</span></td>
                    <td>
                      {p.originalPrice > p.price ? (
                        <div>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{Number(p.originalPrice).toLocaleString()}</span>
                          <span className="status-badge delivered" style={{ marginLeft: 8 }}>{discount}% OFF</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${p.stock > 10 ? 'delivered' : p.stock > 0 ? 'processing' : 'shipped'}`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" onClick={() => handleOpenModal(p)} style={{ color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(p._id)} style={{ color: '#ff6b6b' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="admin-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="icon-btn" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: 20, top: 20 }}><X size={24} /></button>
            <h2 className="panel-title">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Sarees</option>
                    <option>Kurtis</option>
                    <option>Earrings</option>
                    <option>Bangles</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Stock Quantity</label>
                  <input required type="number" className="form-input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Original Price (₹)</label>
                  <input required type="number" className="form-input" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Discounted/Sale Price (₹)</label>
                  <input required type="number" className="form-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  {formData.originalPrice && formData.price && Number(formData.originalPrice) > Number(formData.price) && (
                    <p style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '6px' }}>
                      Discount applied: {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% OFF
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Images</label>
                <input type="file" multiple accept="image/*" className="form-input" onChange={handleImageChange} style={{ padding: '8px' }} />
                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {imagePreviews.map((src, idx) => (
                      <img key={idx} src={src} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea required className="form-input" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '10px' }}>
                {editingId ? 'Save Changes' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
