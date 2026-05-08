import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, X, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', description: '', offerText: '', type: 'Other', visibility: true,
    autoUpdateByCategory: '', autoUpdateByTag: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/collections');
      setCollections(data);
    } catch (err) {
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const handleOpenModal = (collection = null) => {
    setImageFile(null);
    if (collection) {
      setEditingId(collection._id);
      setFormData({
        name: collection.name,
        description: collection.description || '',
        offerText: collection.offerText || '',
        type: collection.type,
        visibility: collection.visibility,
        autoUpdateByCategory: collection.autoUpdateByCategory || '',
        autoUpdateByTag: collection.autoUpdateByTag || ''
      });
      setImagePreview(collection.bannerImage || collection.dynamicBannerImage || null);
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', offerText: '', type: 'Other', visibility: true,
        autoUpdateByCategory: '', autoUpdateByTag: ''
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Collection name is required');

    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('bannerImage', imageFile);

      if (editingId) {
        const { data } = await api.put(`/collections/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCollections(prev => prev.map(c => c._id === editingId ? data : c));
        toast.success('Collection updated successfully!');
      } else {
        const { data } = await api.post('/collections', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCollections(prev => [data, ...prev]);
        toast.success('Collection added successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save collection');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      await api.delete(`/collections/${id}`);
      setCollections(collections.filter(c => c._id !== id));
      toast.success('Collection deleted');
    } catch (err) {
      toast.error('Failed to delete collection');
    }
  };

  const filtered = collections.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="admin-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="admin-title">Collections</h1>
          <p className="admin-subtitle">Manage homepage collections and dynamic rules</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Collection
        </button>
      </div>

      <div className="admin-panel card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search collections..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
          <button className="btn" style={{ background: 'transparent', border: '1px solid var(--border)' }} onClick={fetchCollections}>🔄 Refresh</button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Collection</th>
                <th>Type</th>
                <th>Auto Update Rule</th>
                <th>Visibility</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {c.bannerImage || c.dynamicBannerImage ? (
                        <img src={c.bannerImage || c.dynamicBannerImage} alt={c.name} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 4, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={18} color="var(--text-muted)" />
                        </div>
                      )}
                      <span className="font-medium text-primary">{c.name}</span>
                    </div>
                  </td>
                  <td>{c.type}</td>
                  <td>
                    {c.autoUpdateByCategory ? <span className="status-badge processing">Category: {c.autoUpdateByCategory}</span> : null}
                    {c.autoUpdateByTag ? <span className="status-badge delivered" style={{ marginLeft: 8 }}>Tag: {c.autoUpdateByTag}</span> : null}
                    {(!c.autoUpdateByCategory && !c.autoUpdateByTag) ? <span className="text-muted">Manual</span> : null}
                  </td>
                  <td>
                    <span className={`status-badge ${c.visibility ? 'delivered' : 'cancelled'}`}>
                      {c.visibility ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="icon-btn" onClick={() => handleOpenModal(c)} style={{ color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                    <button className="icon-btn" onClick={() => handleDelete(c._id)} style={{ color: '#ff6b6b' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No collections found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '620px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="icon-btn" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: 20, top: 20 }}>
              <X size={24} />
            </button>
            <h2 className="panel-title">{editingId ? 'Edit Collection' : 'Add New Collection'}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Collection Name *</label>
                <input required className="form-input" placeholder="e.g. Festive Season Sale" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Type</label>
                  <select className="form-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option>Festival</option>
                    <option>Wedding</option>
                    <option>Trending</option>
                    <option>New Arrival</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Visibility</label>
                  <select className="form-input" value={formData.visibility} onChange={e => setFormData({ ...formData, visibility: e.target.value === 'true' })}>
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Offer Text</label>
                <input className="form-input" placeholder="e.g. Up to 50% OFF" value={formData.offerText} onChange={e => setFormData({ ...formData, offerText: e.target.value })} />
              </div>

              <div className="form-group" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px' }}>
                <h4 style={{ marginBottom: 12 }}>Dynamic Update Rules</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>Set rules to automatically pull the latest products into this collection.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">By Category</label>
                    <select className="form-input" value={formData.autoUpdateByCategory} onChange={e => setFormData({ ...formData, autoUpdateByCategory: e.target.value })}>
                      <option value="">-- None --</option>
                      <option value="Sarees">Sarees</option>
                      <option value="Dupattas">Dupattas</option>
                      <option value="Dress Materials">Dress Materials</option>
                      <option value="Running Fabric">Running Fabric</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">By Tag</label>
                    <input className="form-input" placeholder="e.g. festive" value={formData.autoUpdateByTag} onChange={e => setFormData({ ...formData, autoUpdateByTag: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image (Optional)</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>If not provided, the latest product image will be used dynamically.</p>
                
                <label htmlFor="collection-banner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: 12, padding: '24px', cursor: 'pointer', background: 'var(--bg-secondary)' }}>
                  <Upload size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Click to select banner</span>
                </label>
                <input id="collection-banner" ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />

                {imagePreview && (
                  <div style={{ position: 'relative', marginTop: 14, width: 'fit-content' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: 200, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <button type="button" onClick={removeImage} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ff6b6b', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={uploading}>
                {uploading ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Collection')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
