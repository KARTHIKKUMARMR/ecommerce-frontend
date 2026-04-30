import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [step, setStep]         = useState(1);       // 1 = form, 2 = OTP input
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [cooldown, setCooldown] = useState(0);       // resend countdown in seconds
  const [devOtp, setDevOtp]     = useState('');      // OTP shown in dev mode
  const [previewUrl, setPreviewUrl] = useState('');  // Ethereal preview URL (dev)
  const timerRef  = useRef(null);

  // ── 60-second resend cooldown timer ────────────────────────────────────
  const startCooldown = () => {
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Step 1: Send OTP ────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!formData.name.trim())    return toast.error('Please enter your full name');
    if (!formData.email.trim())   return toast.error('Please enter your email');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    setDevOtp('');
    setPreviewUrl('');

    try {
      const { data } = await api.post('/auth/send-otp', formData);

      // Dev mode: backend returns the OTP directly so you can test without email
      if (data.devOtp) {
        setDevOtp(data.devOtp);
        setOtp(data.devOtp); // auto-fill the OTP field
        if (data.previewUrl) setPreviewUrl(data.previewUrl);
        toast('🛠️ Dev mode: OTP auto-filled below', { icon: '⚠️', duration: 5000 });
      } else {
        toast.success(`✉️ OTP sent to ${formData.email}! Check your inbox (and spam).`);
      }

      setStep(2);
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-otp', formData);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
        setOtp(data.devOtp);
        if (data.previewUrl) setPreviewUrl(data.previewUrl);
        toast('🛠️ New OTP auto-filled (dev mode)', { icon: '⚠️', duration: 4000 });
      } else {
        toast.success('New OTP sent! Check your inbox.');
      }
      startCooldown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP & auto-login ────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Please enter the complete 6-digit OTP');

    setLoading(true);
    try {
      // Backend verifies OTP hash + expiry, returns JWT if valid
      const { data } = await api.post('/auth/verify-otp', { email: formData.email, otp });

      // Store credentials — user is now logged in
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      toast.success('🎉 Account verified! Welcome to Handkala!');
      // Full reload to re-initialize AuthContext with the new user
      window.location.href = '/';
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(msg);
      // If OTP expired, send them back to refill
      if (msg.toLowerCase().includes('expired')) {
        setStep(1);
        setOtp('');
        setDevOtp('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card">
        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-subtitle">
          {step === 1
            ? 'Join us to experience heritage fashion'
            : `Enter the 6-digit code sent to ${formData.email}`}
        </p>

        {/* ── Progress bar ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 4,
              background: step >= s ? 'var(--gold)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* ══════════════════════ STEP 1: Registration Form ══════════════════════ */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" required placeholder="Enter your full name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" required placeholder="Enter your email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 6 }}>(Optional)</span>
              </label>
              <input type="tel" className="form-input" placeholder="+91 00000 00000"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password *
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 6 }}>(min. 6 characters)</span>
              </label>
              <input type="password" className="form-input" required placeholder="Create a strong password" minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending OTP...' : '✉️ Send Verification Code'}
            </button>

            <p className="auth-switch">
              Already have an account?{' '}
              <Link to="/login" className="text-gold">Sign in here</Link>
            </p>
          </form>
        )}

        {/* ══════════════════════ STEP 2: OTP Verification ══════════════════════ */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">

            {/* Email sent notice */}
            <div style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', borderRadius: 10, padding: 16, marginBottom: 20, textAlign: 'center' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                📧 Verification code sent to<br />
                <strong style={{ color: 'var(--gold)' }}>{formData.email}</strong>
              </p>
              <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Check your inbox and spam folder
              </p>
            </div>

            {/* ⚠️ Dev mode banner — shows OTP and Ethereal preview link */}
            {devOtp && (
              <div style={{ background: 'rgba(255,193,7,0.12)', border: '1px solid #ffc107', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <p style={{ margin: '0 0 6px', color: '#ffc107', fontWeight: 700, fontSize: '0.82rem' }}>
                  🛠️ DEV MODE — Email Not Configured
                </p>
                <p style={{ margin: '0 0 8px', color: '#d4b800', fontSize: '0.82rem' }}>
                  Your OTP (auto-filled): <strong style={{ fontSize: '1.1rem', letterSpacing: 4 }}>{devOtp}</strong>
                </p>
                <p style={{ margin: 0, color: '#a89000', fontSize: '0.75rem' }}>
                  To send real emails: add <code>EMAIL_USER</code> and <code>EMAIL_PASS</code> to your <code>.env</code> file.
                </p>
                {previewUrl && (
                  <a href={previewUrl} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-block', marginTop: 8, color: '#ffc107', fontSize: '0.78rem', textDecoration: 'underline' }}>
                    📬 View email preview (Ethereal) →
                  </a>
                )}
              </div>
            )}

            {/* OTP input */}
            <div className="form-group">
              <label className="form-label">Enter 6-Digit OTP</label>
              <input
                type="text"
                className="form-input"
                required
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="— — — — — —"
                style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.5rem', fontWeight: 700 }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : '✅ Verify & Create Account'}
            </button>

            {/* Resend / cooldown */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              {cooldown > 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Resend code in <strong style={{ color: 'var(--gold)' }}>{cooldown}s</strong>
                </p>
              ) : (
                <button type="button" onClick={handleResend} disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0 }}>
                  Didn't receive it? Resend OTP
                </button>
              )}
            </div>

            <button type="button" className="btn btn-outline btn-full"
              onClick={() => { setStep(1); setOtp(''); setDevOtp(''); setPreviewUrl(''); }}
              style={{ marginTop: 10 }}>
              ← Change Email / Start Over
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
