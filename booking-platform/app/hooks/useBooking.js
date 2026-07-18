import { useState, useEffect } from 'react';

export const useBooking = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formType, setFormType] = useState('booking');
  const [initialArtist, setInitialArtist] = useState(null);
  const [initialPlan, setInitialPlan] = useState(null);
  const [initialService, setInitialService] = useState(null);
  
  const [selectedArtistTypes, setSelectedArtistTypes] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const handleOpenModal = (e) => {
      const type = e.detail?.type || 'booking';
      const artist = e.detail?.artist || null;
      const plan = e.detail?.pricingPlan || null;
      const service = e.detail?.service || null;

      setFormType(type);
      setInitialArtist(artist);
      setInitialPlan(plan);
      setInitialService(service);
      setIsOpen(true);
      setSubmitted(false);
      setFormError('');

      if (plan) {
        const planName = plan.name.toLowerCase();
        if (planName.includes('singer')) {
          setSelectedArtistTypes(['Singer']);
          setSelectedBudget('5k_10k');
        } else if (planName.includes('duo')) {
          setSelectedArtistTypes(['Singer', 'Musician']);
          setSelectedBudget('10k_20k');
        } else if (planName.includes('band')) {
          setSelectedArtistTypes(['Music Band']);
          setSelectedBudget('20k_35k');
        }
        setSelectedEventType('Live Booking');
      } else if (service) {
        setSelectedArtistTypes([]);
        setSelectedBudget('');
        setSelectedEventType(service.title);
      } else if (artist) {
        const tag = artist.category || '';
        if (tag) setSelectedArtistTypes([tag]);
        setSelectedBudget('');
        setSelectedEventType('Artist Booking');
      } else {
        setSelectedArtistTypes([]);
        setSelectedBudget('');
        setSelectedEventType('');
      }
    };

    window.addEventListener('open-contact-modal', handleOpenModal);
    return () => window.removeEventListener('open-contact-modal', handleOpenModal);
  }, []);

  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    formType,
    initialArtist,
    initialPlan,
    initialService,
    selectedArtistTypes,
    setSelectedArtistTypes,
    selectedBudget,
    setSelectedBudget,
    selectedEventType,
    setSelectedEventType,
    submitted,
    setSubmitted,
    formError,
    setFormError,
    closeModal
  };
};
