import React, { useRef, useState } from 'react';
import { bookingService } from '@/app/services/bookingService';
import { validateName, validateEmail, validatePhone } from '@helpers/validation';

export default function ArtistForm({ copyToClipboard, setSubmitted }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    portfolio: '',
    price: '',
    bio: '',
    customCity: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const finalCity = selectedCity === 'Other' ? formData.customCity : selectedCity;
    const submissionData = {
      ...formData,
      city: finalCity || ''
    };

    const nameErr = validateName(submissionData.name);
    if (nameErr) return setFormError(nameErr);
    const emailErr = validateEmail(submissionData.email);
    if (emailErr) return setFormError(emailErr);
    const phoneErr = validatePhone(submissionData.phone);
    if (phoneErr) return setFormError(phoneErr);
    if (!submissionData.city) return setFormError("Please select or enter your city.");

    setIsSubmitting(true);
    try {
      await bookingService.submitRequest({ ...submissionData, type: 'artist_registration' });
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (error) {
      console.error("Artist registration error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="lux-modal-header" style={{ marginBottom: '16px', position: 'relative', paddingTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p className="header-badge" style={{ background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', margin: 0 }}>JOIN THE ELITE</p>
          <button 
            type="button"
            onClick={() => copyToClipboard('/register/artist')}
            style={{ background: 'transparent', border: '1px solid rgba(0, 212, 255, 0.3)', color: '#00d4ff', borderRadius: '12px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'; e.currentTarget.style.borderColor = '#00d4ff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Copy Link
          </button>
        </div>
        <h3 className="lux-modal-title" style={{ marginTop: '12px' }}>Artist Registration</h3>
        <p className="lux-modal-desc">Showcase your talent to the world. Join Magnevents and perform at premium venues.</p>
      </div>

      <form className="lux-modal-form" onSubmit={handleArtistSubmit}>
        {formError && (
          <div style={{ color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(255, 77, 79, 0.2)' }} role="alert">
            {formError}
          </div>
        )}
        <div className="lux-form-row">
          <div className="lux-form-group">
            <label htmlFor="art-name">FULL NAME</label>
            <input
              id="art-name"
              name="name"
              type="text" required placeholder="e.g. Rahul Verma"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>
          <div className="lux-form-group">
            <label htmlFor="art-phone">PHONE NUMBER</label>
            <input
              id="art-phone"
              name="phone"
              type="tel" required placeholder="+91 9XXX-XXXXXX"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="lux-form-group">
          <label htmlFor="art-email">EMAIL ADDRESS</label>
          <input
            id="art-email"
            name="email"
            type="email" required placeholder="name@email.in"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div className="lux-form-row">
          <div className="lux-form-group">
            <label htmlFor="art-category">ARTIST CATEGORY</label>
            <select
              id="art-category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="singer">Singer</option>
              <option value="band">Music Band</option>
              <option value="dj">DJ</option>
              <option value="musician">Musician</option>
              <option value="comedian">Comedian</option>
              <option value="anchor">Anchor</option>
              <option value="dancer">Dancer</option>
              <option value="magician">Magician</option>
            </select>
          </div>
          <div className="lux-form-group">
            <label htmlFor="art-city">CITY</label>
            <select
              id="art-city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              required
            >
              <option value="">Select City</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Surat">Surat</option>
              <option value="Pune">Pune</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Kanpur">Kanpur</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Indore">Indore</option>
              <option value="Thane">Thane</option>
              <option value="Bhopal">Bhopal</option>
              <option value="Visakhapatnam">Visakhapatnam</option>
              <option value="Pimpri-Chinchwad">Pimpri-Chinchwad</option>
              <option value="Patna">Patna</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Ghaziabad">Ghaziabad</option>
              <option value="Ludhiana">Ludhiana</option>
              <option value="Agra">Agra</option>
              <option value="Nashik">Nashik</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Other">Other (Add Custom)</option>
            </select>
          </div>
        </div>

        {selectedCity === 'Other' && (
          <div className="lux-form-group">
            <label htmlFor="art-customcity">ENTER CUSTOM CITY</label>
            <input
              id="art-customcity"
              name="customCity"
              type="text" required placeholder="e.g. Jaipur"
              value={formData.customCity}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="lux-form-row">
          <div className="lux-form-group">
            <label htmlFor="art-portfolio">PORTFOLIO / SOCIAL LINK</label>
            <input
              id="art-portfolio"
              name="portfolio"
              type="url" required placeholder="Instagram, YouTube or Website"
              value={formData.portfolio}
              onChange={handleChange}
              autoComplete="url"
            />
          </div>
          <div className="lux-form-group">
            <label htmlFor="art-price">PERFORMANCE PRICE (INR)</label>
            <input
              id="art-price"
              name="price"
              type="text" required placeholder="e.g. 10000 - 20000"
              value={formData.price}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="lux-form-group">
          <label htmlFor="art-bio">BIO & EXPERIENCE</label>
          <textarea
            id="art-bio"
            name="bio"
            rows="3" required
            placeholder="Briefly describe your performances, experience, and what makes you unique..."
            value={formData.bio}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-submit-premium" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0072ff 100%)', boxShadow: '0 4px 15px rgba(0, 212, 255, 0.2)' }} disabled={isSubmitting}>
          <span className="btn-text">{isSubmitting ? 'Processing...' : 'Register as Artist'}</span>
        </button>
      </form>
    </>
  );
}
