import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [step, setStep]         = useState(1);
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const startCooldown = () => {
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', formData);
      toast.success(`✉️ OTP sent to ${formData.email}! Check your inbox.`);
      setStep(2);
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/send-otp', formData);
      toast.success('New OTP sent! Check your inbox.');
      setOtp('');
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter the 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email: formData.email, otp });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('🎉 Registration successful! Welcome to HASHTHAKALA!');
      window.location.href = '/profile';
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      toast.error(msg);
      if (msg.includes('expired')) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card">
        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Join us to experience heritage fashion' : `Enter the code sent to ${formData.email}`}
        </p>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step >= s ? 'var(--gold)' : 'var(--border)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" required placeholder="Enter your name"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" required placeholder="Enter your email"
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Optional)</span></label>
              <input type="tel" className="form-input" placeholder="+91 00000 00000"
                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password * <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(min. 6 chars)</span></label>
              <input type="password" className="form-input" required placeholder="Create a password" minLength={6}
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending OTP...' : '✉️ Send Verification Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                📧 Verification code sent to<br />
                <strong style={{ color: 'var(--gold)' }}>{formData.email}</strong>
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Enter 6-Digit OTP</label>
              <input
                type="text" className="form-input" required maxLength={6} inputMode="numeric"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="— — — — — —"
                style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.4rem', fontWeight: 700 }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : '✅ Verify & Create Account'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              {cooldown > 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Resend in <strong style={{ color: 'var(--gold)' }}>{cooldown}s</strong>
                </p>
              ) : (
                <button type="button" onClick={handleResend} disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                  Didn't receive it? Resend OTP
                </button>
              )}
            </div>
            <button type="button" className="btn btn-outline btn-full" onClick={() => setStep(1)} style={{ marginTop: 8 }}>
              ← Change Email
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="auth-switch">
            Already have an account? <Link to="/login" className="text-gold">Sign in here</Link>
          </p>
        )}
      </div>
    </div>
  );
}
