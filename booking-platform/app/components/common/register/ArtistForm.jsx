import React, { useRef, useState } from 'react';
import { bookingService } from '@/app/services/bookingService';
import { validateName, validateEmail, validatePhone } from '@helpers/validation';

export default function ArtistForm({ copyToClipboard, setSubmitted }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const categoryRef = useRef(null);
  const portfolioRef = useRef(null);
  const priceRef = useRef(null);
  const bioRef = useRef(null);
  const customCityRef = useRef(null);

  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    const finalCity = selectedCity === 'Other' ? customCityRef.current?.value : selectedCity;
    const submissionData = {
      name: nameRef.current?.value || '',
      phone: phoneRef.current?.value || '',
      email: emailRef.current?.value || '',
      category: categoryRef.current?.value || '',
      portfolio: portfolioRef.current?.value || '',
      price: priceRef.current?.value || '',
      bio: bioRef.current?.value || '',
      city: finalCity || ''
    };

    const nameErr = validateName(submissionData.name);
    if (nameErr) return alert(nameErr);
    const emailErr = validateEmail(submissionData.email);
    if (emailErr) return alert(emailErr);
    const phoneErr = validatePhone(submissionData.phone);
    if (phoneErr) return alert(phoneErr);
    if (!submissionData.city) return alert("Please select or enter your city.");

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
        <div className="lux-form-row">
          <div className="lux-form-group">
            <label>FULL NAME</label>
            <input
              ref={nameRef}
              type="text" required placeholder="e.g. Rahul Verma"
              defaultValue=""
            />
          </div>
          <div className="lux-form-group">
            <label>PHONE NUMBER</label>
            <input
              ref={phoneRef}
              type="tel" required placeholder="+91 9XXX-XXXXXX"
              defaultValue=""
            />
          </div>
        </div>

        <div className="lux-form-group">
          <label>EMAIL ADDRESS</label>
          <input
            ref={emailRef}
            type="email" required placeholder="name@email.in"
            defaultValue=""
          />
        </div>

        <div className="lux-form-row">
          <div className="lux-form-group">
            <label>ARTIST CATEGORY</label>
            <select
              ref={categoryRef}
              required
              defaultValue=""
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
            <label>CITY</label>
            <select
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
            <label>ENTER CUSTOM CITY</label>
            <input
              ref={customCityRef}
              type="text" required placeholder="e.g. Jaipur"
            />
          </div>
        )}

        <div className="lux-form-row">
          <div className="lux-form-group">
            <label>PORTFOLIO / SOCIAL LINK</label>
            <input
              ref={portfolioRef}
              type="url" required placeholder="Instagram, YouTube or Website"
              defaultValue=""
            />
          </div>
          <div className="lux-form-group">
            <label>PERFORMANCE PRICE (INR)</label>
            <input
              ref={priceRef}
              type="text" required placeholder="e.g. 10000 - 20000"
              defaultValue=""
            />
          </div>
        </div>

        <div className="lux-form-group">
          <label>BIO & EXPERIENCE</label>
          <textarea
            ref={bioRef}
            rows="3" required
            placeholder="Briefly describe your performances, experience, and what makes you unique..."
            defaultValue=""
          />
        </div>

        <button type="submit" className="btn-submit-premium" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0072ff 100%)', boxShadow: '0 4px 15px rgba(0, 212, 255, 0.2)' }} disabled={isSubmitting}>
          <span className="btn-text">{isSubmitting ? 'Processing...' : 'Register as Artist'}</span>
        </button>
      </form>
    </>
  );
}
