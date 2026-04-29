import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = (e) => {
    e.preventDefault();
    // Simulate sending OTP
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      toast.success('OTP sent to your email! (Test OTP: 123456)');
    }, 1000);
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otp !== '123456') {
      toast.error('Invalid OTP. Please try again.');
      return;
    }
    
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      toast.success('Registration successful! Welcome!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.message || 'Failed to register account');
      setStep(1); // Go back if email exists
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card">
        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Join us to experience heritage fashion' : 'Verify your email address'}
        </p>
        
        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input 
                type="tel" 
                className="form-input" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                placeholder="Enter your phone number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
                placeholder="Create a password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="auth-form">
            <div className="form-group">
              <label className="form-label">Enter OTP sent to {formData.email}</label>
              <input 
                type="text" 
                className="form-input" 
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                required 
                placeholder="Enter 6-digit OTP (123456)"
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.2rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>
            <button type="button" className="btn btn-outline btn-full" onClick={() => setStep(1)} style={{ marginTop: '12px' }}>
              Back
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
