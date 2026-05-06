import React, { useState } from 'react';
import { Ruler, CheckCircle, Info, Calculator, RefreshCw } from 'lucide-react';
import './InfoPages.css';

const SizeGuide = () => {
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    length: ''
  });
  const [recommendedSize, setRecommendedSize] = useState(null);

  const sizes = [
    { size: 'S', minChest: 36, maxChest: 38, minWaist: 30, maxWaist: 32, length: 27 },
    { size: 'M', minChest: 38, maxChest: 40, minWaist: 32, maxWaist: 34, length: 28 },
    { size: 'L', minChest: 40, maxChest: 42, minWaist: 34, maxWaist: 36, length: 29 },
    { size: 'XL', minChest: 42, maxChest: 44, minWaist: 36, maxWaist: 38, length: 30 },
    { size: 'XXL', minChest: 44, maxChest: 46, minWaist: 38, maxWaist: 40, length: 31 },
  ];

  const handleCalculate = (e) => {
    e.preventDefault();
    const chest = parseFloat(measurements.chest);
    
    if (!chest) return;

    // Basic logic: Find size where chest fits
    const found = sizes.find(s => chest <= s.maxChest);
    setRecommendedSize(found ? found.size : 'XXL (Custom)');
  };

  const handleReset = () => {
    setMeasurements({ chest: '', waist: '', length: '' });
    setRecommendedSize(null);
  };

  return (
    <div className="info-page fade-in">
      <div className="info-container">
        <header className="info-header">
          <h1 className="info-title">Size Guide</h1>
          <p className="section-subtitle">Find your perfect fit with our detailed measurement guide.</p>
        </header>

        {/* --- NEW INTERACTIVE CALCULATOR --- */}
        <section className="info-section calculator-section">
          <h3><Calculator size={24} /> Find Your Perfect Fit</h3>
          <div className="info-content">
            <p className="mb-24">Enter your body measurements below, and we'll recommend the best size for you.</p>
            
            <form className="fit-form" onSubmit={handleCalculate}>
              <div className="fit-inputs">
                <div className="form-group">
                  <label className="form-label">Chest (inches)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 38"
                    value={measurements.chest}
                    onChange={(e) => setMeasurements({...measurements, chest: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Waist (inches)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 32"
                    value={measurements.waist}
                    onChange={(e) => setMeasurements({...measurements, waist: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Desired Length</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 28"
                    value={measurements.length}
                    onChange={(e) => setMeasurements({...measurements, length: e.target.value})}
                  />
                </div>
              </div>

              <div className="fit-actions">
                <button type="submit" className="btn btn-primary">Calculate My Size</button>
                <button type="button" className="btn btn-outline" onClick={handleReset}>
                  <RefreshCw size={16} /> Reset
                </button>
              </div>
            </form>

            {recommendedSize && (
              <div className="recommendation-result fade-in">
                <div className="result-badge">
                  <span>Recommended Size:</span>
                  <strong>{recommendedSize}</strong>
                </div>
                <p className="text-sm mt-8">Based on your chest measurement, this size should provide the most comfortable fit.</p>
              </div>
            )}
          </div>
        </section>

        <section className="info-section">
          <h3><Ruler size={24} /> Standard Size Chart</h3>
          <div className="info-content">
            <p>Measurements are shown in inches. For the best fit, we recommend measuring a similar garment you already own and love.</p>
            
            <div className="size-chart-wrapper">
              <table className="size-chart">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (inches)</th>
                    <th>Waist (inches)</th>
                    <th>Length (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((item) => (
                    <tr key={item.size}>
                      <td><strong>{item.size}</strong></td>
                      <td>{item.minChest}-{item.maxChest}"</td>
                      <td>{item.minWaist}-{item.maxWaist}"</td>
                      <td>{item.length}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3><Info size={24} /> How to Measure</h3>
          <div className="info-content">
            <div className="visual-guide">
              <img 
                src="/images/how-to-measure.png" 
                alt="How to measure guide" 
                className="measure-image"
              />
            </div>
            <div className="measure-grid">
              <div className="measure-item">
                <div className="measure-icon">1</div>
                <h4>Chest</h4>
                <p>Measure around the fullest part of your chest, keeping the tape horizontal.</p>
              </div>
              <div className="measure-item">
                <div className="measure-icon">2</div>
                <h4>Waist</h4>
                <p>Measure around the narrowest part (typically where your body bends side to side).</p>
              </div>
              <div className="measure-item">
                <div className="measure-icon">3</div>
                <h4>Length</h4>
                <p>Measure from the highest point of the shoulder down to the hem.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="highlight-box">
          <CheckCircle className="text-gold" size={24} />
          <div>
            <p>Unsure about your size?</p>
            <span className="text-sm">If you're between sizes, we generally recommend sizing up for a more comfortable fit.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
