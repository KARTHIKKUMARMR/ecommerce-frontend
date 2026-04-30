import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, X, Upload, Image } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [search, setSearch]           = useState('');
  const [uploading, setUploading]     = useState(false); // tracks upload in progress

  const [formData, setFormData] = useState({
    name: '', category: 'Sarees', price: '', originalPrice: '', stock: '', description: '',
    sizes: '', colors: '', tags: '',
    allowedPaymentMethods: ['COD', 'Online'], // default: both allowed
  });

  // Image state
  const [imageFiles, setImageFiles]     = useState([]);   // File objects chosen by user
  const [imagePreviews, setImagePreviews] = useState([]); // Preview URLs for display
  const fileInputRef = useRef(null);

  // ─── Fetch all products ────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoading(true);
    setFetchError(false);
    try {
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

  useEffect(() => { fetchProducts(); }, []);

  // ─── Open modal (add or edit) ──────────────────────────────────────────────
  const handleOpenModal = (product = null) => {
    setImageFiles([]);
    if (product) {
      setEditingId(product._id);
      setFormData({
        name:          product.name,
        category:      product.category,
        price:         product.price,
        originalPrice: product.originalPrice || '',
        stock:         product.stock,
        description:   product.description || '',
        // Internal state for sizes will be an array of {size, stock}
        sizes:         product.sizes || [],
        colors:        (product.colors || []).join(', '),
        tags:          (product.tags || []).join(', '),
        allowedPaymentMethods: product.allowedPaymentMethods?.length > 0
          ? product.allowedPaymentMethods
          : ['COD', 'Online'],
      });
      setImagePreviews(product.images || []);
    } else {
      setEditingId(null);
      setFormData({ name: '', category: 'Sarees', price: '', originalPrice: '', stock: '', description: '', sizes: [], colors: '', tags: '', allowedPaymentMethods: ['COD', 'Online'] });
      setImagePreviews([]);
    }
    setIsModalOpen(true);
  };

  // ─── Handle file selection ─────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageFiles(files);
    // Generate local blob preview URLs so the user sees the images before upload
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // ─── Remove a selected image preview ──────────────────────────────────────
  const removeImage = (index) => {
    const newFiles    = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Submit product form ───────────────────────────────────────────────────
  /**
   * HOW THIS WORKS:
   * 1. We create a FormData object (this is how browsers send files over HTTP).
   * 2. We append all text fields (name, price, etc.) as key-value pairs.
   * 3. We append each image File object — the browser handles the encoding.
   * 4. We send the FormData to the backend.
   * 5. On the backend, multer-storage-cloudinary picks up the files,
   *    uploads them to Cloudinary, and gives us back secure URLs.
   * 6. The backend saves those URLs in MongoDB.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim())        return toast.error('Product name is required');
    if (!formData.price)              return toast.error('Price is required');
    if (!formData.stock)              return toast.error('Stock is required');
    if (!formData.description.trim()) return toast.error('Description is required');
    if (!editingId && imageFiles.length === 0) {
      return toast.error('Please upload at least one product image');
    }

    setUploading(true);
    try {
      // Step 1: Build FormData
      const fd = new FormData();
      fd.append('name',          formData.name.trim());
      fd.append('category',      formData.category);
      fd.append('price',         formData.price);
      fd.append('originalPrice', formData.originalPrice || '0');
      fd.append('stock',         formData.stock);
      fd.append('description',   formData.description.trim());
      
      // Sizes as JSON string
      if (formData.sizes && formData.sizes.length > 0) {
        fd.append('sizes', JSON.stringify(formData.sizes));
      }
      if (formData.colors) fd.append('colors', formData.colors);
      if (formData.tags)   fd.append('tags',   formData.tags);

      // Validate payment methods — at least one must be selected
      if (!formData.allowedPaymentMethods || formData.allowedPaymentMethods.length === 0) {
        setUploading(false);
        return toast.error('Please allow at least one payment method');
      }
      fd.append('allowedPaymentMethods', JSON.stringify(formData.allowedPaymentMethods));

      // Step 2: Append each image file — the key must match upload.array('images', 5)
      imageFiles.forEach(file => fd.append('images', file));

      // Step 3: Send to backend
      // IMPORTANT: Do NOT set Content-Type header manually when using FormData.
      // The browser sets it automatically with the correct multipart boundary.
      if (editingId) {
        const { data } = await api.put(`/admin/products/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProducts(prev => prev.map(p => p._id === editingId ? data : p));
        toast.success('✅ Product updated successfully!');
      } else {
        const { data } = await api.post('/admin/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProducts(prev => [data, ...prev]);
        toast.success('✅ Product added successfully!');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Product save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  // ─── Delete product ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // ─── Loading state ─────────────────────────────────────────────────────────
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

  // ─── Error state ───────────────────────────────────────────────────────────
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

  // ─── Main render ───────────────────────────────────────────────────────────
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
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
          <button
            className="btn"
            style={{ background: 'transparent', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
            onClick={fetchProducts}
          >
            🔄 Refresh
          </button>
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
                const discount = p.originalPrice > p.price
                  ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                  : 0;
                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover', border: '1px solid var(--border)' }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 4, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image size={18} color="var(--text-muted)" />
                          </div>
                        )}
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

      {/* ─── Add / Edit Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="admin-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '620px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="icon-btn" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: 20, top: 20 }}>
              <X size={24} />
            </button>
            <h2 className="panel-title">{editingId ? 'Edit Product' : 'Add New Product'}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Product Name */}
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input required className="form-input" placeholder="e.g. Royal Banarasi Silk Saree"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              {/* Category + Stock */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option>Sarees</option>
                    <option>Kurtis</option>
                    <option>Earrings</option>
                    <option>Bangles</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Stock Quantity *</label>
                  <input required type="number" min="0" className="form-input" placeholder="e.g. 25"
                    value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                </div>
              </div>

              {/* Prices */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Original Price (₹) *</label>
                  <input required type="number" min="0" className="form-input" placeholder="e.g. 7999"
                    value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Sale / Discounted Price (₹) *</label>
                  <input required type="number" min="0" className="form-input" placeholder="e.g. 4999"
                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                  {formData.originalPrice && formData.price && Number(formData.originalPrice) > Number(formData.price) && (
                    <p style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: '6px' }}>
                      Discount: {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% OFF
                    </p>
                  )}
                </div>
              </div>

              {/* Sizes Management */}
              <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📏 Product Sizes & Stock</span>
                  <button type="button" className="btn btn-sm btn-outline" 
                    onClick={() => setFormData({ ...formData, sizes: [...formData.sizes, { size: '', stock: 0 }] })}>
                    <Plus size={14} /> Add Size
                  </button>
                </label>
                
                {formData.sizes.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '10px 0' }}>No sizes added yet. Click "Add Size" to begin.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {formData.sizes.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          className="form-input"
                          style={{ flex: 2 }}
                          placeholder="Size (e.g. S, M, XL)"
                          value={s.size}
                          onChange={e => {
                            const newSizes = [...formData.sizes];
                            newSizes[idx].size = e.target.value;
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                        />
                        <input
                          type="number"
                          className="form-input"
                          style={{ flex: 1 }}
                          placeholder="Stock"
                          value={s.stock}
                          onChange={e => {
                            const newSizes = [...formData.sizes];
                            newSizes[idx].stock = e.target.value;
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                        />
                        <button type="button" className="icon-btn" style={{ color: '#ff6b6b' }}
                          onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== idx) })}>
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                      💡 Total Stock: <strong>{formData.sizes.reduce((acc, s) => acc + Number(s.stock || 0), 0)}</strong> (will update automatically)
                    </p>
                  </div>
                )}
              </div>
 
               <div className="form-group">
                 <label className="form-label">Colors <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(comma separated)</span></label>
                 <input className="form-input" placeholder="Red, Blue, Green"
                   value={formData.colors} onChange={e => setFormData({ ...formData, colors: e.target.value })} />
               </div>

              <div className="form-group">
                <label className="form-label">Tags <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(comma separated)</span></label>
                <input className="form-input" placeholder="wedding, festive, traditional"
                  value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
              </div>

              {/* Image Upload — Uses FormData, NOT Base64 */}
              <div className="form-group">
                <label className="form-label">
                  Product Images {!editingId && <span style={{ color: '#ff6b6b' }}>*</span>}
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 8 }}>
                    (max 5 images, 5MB each — uploaded to Cloudinary)
                  </span>
                </label>

                {/* Drag-and-drop style upload button */}
                <label
                  htmlFor="product-images"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: '2px dashed var(--border)', borderRadius: 12, padding: '24px',
                    cursor: 'pointer', transition: 'border-color 0.2s',
                    background: 'var(--bg-secondary)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Upload size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click to select images</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>JPG, PNG, WebP — up to 5MB each</span>
                </label>
                <input
                  id="product-images"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />

                {/* Image previews with remove button */}
                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{
                            position: 'absolute', top: -6, right: -6,
                            width: 20, height: 20, borderRadius: '50%',
                            background: '#ff6b6b', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '12px', lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Info about existing images when editing */}
                {editingId && imageFiles.length === 0 && imagePreviews.length > 0 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    ℹ️ Existing images shown above. Select new files to replace them.
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea required className="form-input" rows="4" placeholder="Describe the product..."
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              {/* Payment Method Control — Admin sets this per product */}
              <div className="form-group" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <label className="form-label" style={{ marginBottom: 12 }}>
                  💳 Allowed Payment Methods *
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 8 }}>
                    (controls what customers can use at checkout)
                  </span>
                </label>
                <div style={{ display: 'flex', gap: 16 }}>
                  {['COD', 'Online'].map(method => {
                    const label = method === 'COD' ? '💰 Cash on Delivery' : '📱 Online Payment (UPI/Card)';
                    const checked = (formData.allowedPaymentMethods || []).includes(method);
                    return (
                      <label key={method} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 16px', border: `1px solid ${checked ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 8, background: checked ? 'rgba(201,168,76,0.08)' : 'transparent', flex: 1, transition: 'all 0.2s' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const current = formData.allowedPaymentMethods || [];
                            const updated = checked
                              ? current.filter(m => m !== method)
                              : [...current, method];
                            setFormData({ ...formData, allowedPaymentMethods: updated });
                          }}
                          style={{ accentColor: 'var(--gold)', width: 16, height: 16 }}
                        />
                        <span style={{ color: checked ? 'var(--gold)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: checked ? 600 : 400 }}>
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {(!formData.allowedPaymentMethods || formData.allowedPaymentMethods.length === 0) && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: 8 }}>⚠️ At least one payment method must be selected</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Uploading to Cloudinary...
                  </>
                ) : (
                  <>{editingId ? 'Save Changes' : 'Add Product'}</>
                )}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
