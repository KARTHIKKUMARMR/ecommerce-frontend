import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Could not reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card">
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-subtitle">Enter your new password below</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Saving...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
