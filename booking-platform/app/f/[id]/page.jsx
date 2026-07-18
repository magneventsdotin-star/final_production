/* eslint-disable @next/next/no-sync-scripts */
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@database/connection/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ClientFormPage({ params }) {
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const { id } = params;
  const router = useRouter();

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      try {
        const { data: formData, error: formError } = await supabase
          .from('custom_forms')
          .select('*')
          .eq('id', id)
          .single();

        if (formError) throw formError;
        setForm(formData);

        const { data: fieldsData, error: fieldsError } = await supabase
          .from('custom_form_fields')
          .select('*')
          .eq('form_id', id)
          .order('order_index', { ascending: true });

        if (fieldsError) throw fieldsError;
        setFields(fieldsData || []);
        
        // Initialize form data
        const initialData = {};
        fieldsData.forEach(f => {
          initialData[f.id] = f.field_type === 'checkbox' ? false : '';
        });
        setFormData(initialData);

      } catch (err) {
        console.error("Error fetching form:", err);
        setError("This form does not exist or has been removed.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic email validation as requested
    if (!email || !email.includes('@')) {
      alert("Please enter a valid email address containing '@'.");
      return;
    }

    // Validate required fields
    for (const field of fields) {
      if (field.is_required && !formData[field.id] && formData[field.id] !== false) {
        alert(`Please complete the required field: ${field.label}`);
        return;
      }
    }

    setSubmitting(true);
    
    try {
      // Fire and forget so the UI is instantly responsive
      supabase
        .from('custom_form_responses')
        .insert([{
          form_id: id,
          client_email: email,
          response_data: formData
        }]).then(({ error: submitError }) => {
          if (submitError) console.error("Submission error:", submitError);
        });
    } catch (err) {
      console.error("Unexpected error:", err);
    }

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'form',
        event_label: 'custom_form_submit'
      });
    }

    // Show success state immediately
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 400); // tiny delay so the button animation plays
  };

  if (loading) {
    return (
      <>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `tailwind.config = { corePlugins: { preflight: false } }` }}></script>
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
        </div>
      </>
    );
  }

  if (error || !form) {
    return (
      <>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `tailwind.config = { corePlugins: { preflight: false } }` }}></script>
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#0f172a] p-8 rounded-3xl border border-white/5 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Form Not Found</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <button onClick={() => window.location.href = '/'} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl w-full transition-all">
            Return to Home
          </button>
        </div>
      </div>
      </>
    );
  }

  // Parse design config
  const design = form.design_config || {};
  const accentColor = design.accentColor || '#D65050'; // Use Magnevents red/gold accent by default
  
  // Force Premium Dark Theme to match Magnevents website
  const bgClass = 'bg-[#050505]';
  const textTitleClass = 'text-white';
  const textDescClass = 'text-gray-400';
  const labelClass = 'text-gray-300';
  const inputClass = 'bg-[#111111]/60 border border-white/10 text-white placeholder:text-gray-600 focus:bg-[#1a1a1a] hover:border-white/20 focus:border-white/30';
  const containerClass = 'bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden';

  if (submitted) {
    return (
      <>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `tailwind.config = { corePlugins: { preflight: false } }` }}></script>
        <div className={`min-h-screen ${bgClass} flex flex-col items-center justify-center p-6 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px]" style={{ backgroundColor: `${accentColor}33` }}></div>
        
        <div className={`bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-10 rounded-3xl max-w-md w-full relative z-10`}>
          <div className="w-20 h-20 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(214,80,80,0.4)]" style={{ background: `linear-gradient(to top right, ${accentColor}, ${accentColor}dd)` }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className={`text-3xl font-black ${textTitleClass} mb-3 tracking-tight`}>Thank You!</h1>
          <p className={`${textDescClass} mb-8 leading-relaxed`}>Your responses have been successfully submitted to the Magnevents team. We will be in touch shortly.</p>
          <button onClick={() => window.location.href = '/'} className={`bg-white/5 text-white hover:bg-white/10 border border-white/10 font-bold py-3 px-8 rounded-xl w-full transition-all`}>
            Return to Home
          </button>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <script dangerouslySetInnerHTML={{ __html: `tailwind.config = { corePlugins: { preflight: false } }` }}></script>
      <div className={`min-h-screen ${bgClass} relative overflow-hidden`} style={{ selection: { backgroundColor: `${accentColor}4d` } }}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: `${accentColor}33` }}></div>

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        <div className="flex justify-center mb-10">
          <div className={`bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl relative h-20 w-40 flex items-center justify-center`}>
             <Image src="/logo.webp" alt="Magnevents Logo" fill sizes="(max-width: 768px) 150px, 150px" style={{objectFit: 'contain'}} className={`filter invert brightness-200`}  />
          </div>
        </div>

        <div className={containerClass}>
          {form.cover_image && (
            <div className="w-full h-48 md:h-64 relative border-b border-white/5">
              <Image src={form.cover_image} alt="Form Cover" fill sizes="(max-width: 768px) 100vw, 800px" style={{objectFit: 'cover'}} priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80"></div>
            </div>
          )}

          <div className={`p-8 md:p-12 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent`}>
            <h1 className={`text-3xl md:text-4xl font-black ${textTitleClass} tracking-tight mb-4`}>{form.title}</h1>
            {form.description && (
              <p className={`${textDescClass} leading-relaxed text-lg`}>{form.description}</p>
            )}
          </div>

          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className={`p-6 rounded-2xl border`} style={{ backgroundColor: `${accentColor}11`, borderColor: `${accentColor}33` }}>
                <label className="block text-sm font-bold uppercase tracking-widest mb-3" style={{ color: `${accentColor}ee` }}>Your Email Address <span className="text-rose-400">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Where should we contact you?"
                  className={`w-full rounded-xl px-5 py-4 font-medium focus:outline-none transition-all ${inputClass}`}
                  style={{ outlineColor: accentColor }}
                />
              </div>

              <div className={`w-full h-px my-8 bg-white/5`}></div>

              {fields.map(field => (
                <div key={field.id} className="space-y-3">
                  <label className={`block text-sm font-bold ${labelClass}`}>
                    {field.label}
                    {field.is_required && <span className="text-rose-500 ml-1.5">*</span>}
                  </label>
                  
                  {field.field_type === 'text' && (
                    <input
                      type="text"
                      required={field.is_required}
                      placeholder={field.placeholder || ''}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={`w-full rounded-xl px-5 py-3.5 focus:outline-none transition-all ${inputClass}`}
                      style={{ outlineColor: accentColor }}
                    />
                  )}
                  
                  {field.field_type === 'email' && (
                    <input
                      type="email"
                      required={field.is_required}
                      placeholder={field.placeholder || ''}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={`w-full rounded-xl px-5 py-3.5 focus:outline-none transition-all ${inputClass}`}
                      style={{ outlineColor: accentColor }}
                    />
                  )}

                  {field.field_type === 'textarea' && (
                    <textarea
                      required={field.is_required}
                      placeholder={field.placeholder || ''}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      rows={4}
                      className={`w-full rounded-xl px-5 py-3.5 focus:outline-none transition-all resize-none ${inputClass}`}
                      style={{ outlineColor: accentColor }}
                    />
                  )}

                  {field.field_type === 'date' && (
                    <input
                      type="date"
                      required={field.is_required}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={`w-full rounded-xl px-5 py-3.5 focus:outline-none transition-all ${inputClass}`}
                      style={{ outlineColor: accentColor }}
                    />
                  )}

                  {field.field_type === 'select' && (
                    <select
                      required={field.is_required}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className={`w-full rounded-xl px-5 py-3.5 focus:outline-none transition-all ${inputClass}`}
                      style={{ outlineColor: accentColor }}
                    >
                      <option value="" disabled className="bg-[#111]">Select an option...</option>
                      {field.options && JSON.parse(field.options).map((opt, i) => (
                        <option key={i} value={opt} className="bg-[#111]">{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.field_type === 'checkbox' && (
                    <label className={`flex items-center gap-4 cursor-pointer p-4 rounded-xl border transition-colors bg-white/5 hover:bg-white/10 border-white/10`}>
                      <input
                        type="checkbox"
                        required={field.is_required}
                        checked={formData[field.id]}
                        onChange={e => handleChange(field.id, e.target.checked)}
                        className={`w-5 h-5 rounded bg-transparent focus:ring-1 border-white/20`}
                        style={{ accentColor: accentColor }}
                      />
                      <span className={`text-slate-300 font-medium`}>Yes, I confirm this</span>
                    </label>
                  )}
                </div>
              ))}

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-white font-black text-sm tracking-widest uppercase py-5 rounded-2xl shadow-[0_10px_30px_rgba(214,80,80,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  {submitting ? (
                    <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Submitting...</>
                  ) : (
                    'Submit Response'
                  )}
                </button>
                <p className={`text-center text-xs font-bold uppercase tracking-widest mt-6 text-slate-500`}>
                  Powered by Magnevents
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
