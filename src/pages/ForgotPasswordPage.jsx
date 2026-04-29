import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      toast.success('Password reset link sent to your email.');
    } catch (err) {
      toast.error(err.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">Enter your email to receive a reset link</p>
        
        {success ? (
          <div className="text-center" style={{ padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>✓</div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)' }}>Check your email</h3>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <Link to="/login" className="btn btn-primary btn-full">Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="Enter your registered email"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!success && (
          <p className="auth-switch">
            Remember your password? <Link to="/login" className="text-gold">Sign in here</Link>
          </p>
        )}
      </div>
    </div>
  );
}
