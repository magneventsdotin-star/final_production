import React from 'react';
import { motion } from 'framer-motion';

export default function SuccessView({ view, setIsOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="lux-modal-success"
    >
      <div className="lux-success-ring" style={{ borderColor: view === 'artist' ? '#00d4ff' : '#FFE032' }}>
         <div className="lux-success-check" style={{ color: view === 'artist' ? '#00d4ff' : '#FFE032' }}>✓</div>
      </div>
      <h4>{view === 'artist' ? 'Application Received!' : 'Booking Requested!'}</h4>
      <p>
        {view === 'artist' 
          ? 'Thank you for joining Magnevents. Our artist relations team will review your portfolio and contact you within 48 hours.'
          : 'Your event details have been securely sent. A booking concierge will reach out to you within 24 hours.'}
      </p>
      <button onClick={() => setIsOpen(false)} className="btn-submit-premium" style={{ marginTop: '24px' }}>
        <span className="btn-text">Close Window</span>
      </button>
    </motion.div>
  );
}
