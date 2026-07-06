"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, GripVertical, CheckCircle2, ArrowLeft, Loader2, GripHorizontal, FileText, Calendar, Mail, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ImageUploader } from '@/components/artists/ImageUploader';

const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Form',
    icon: FileText,
    fields: []
  },
  {
    id: 'artist',
    name: 'Artist Registration',
    icon: Sparkles,
    title: 'Artist Registration',
    description: 'Showcase your talent to the world. Join Magnevents and perform at premium venues.',
    design: { theme: 'dark-glass', glassmorphism: true, accentColor: '#10b981' },
    fields: [
      { field_type: 'text', label: 'Full Name', placeholder: 'e.g. Rahul Verma', is_required: true },
      { field_type: 'text', label: 'Phone Number', placeholder: '+91 9XXX-XXXXXX', is_required: true },
      { field_type: 'email', label: 'Email Address', placeholder: 'name@email.in', is_required: true },
      { field_type: 'select', label: 'Artist Category', options: 'Singer, DJ, Band, Magician, Other', is_required: true },
      { field_type: 'text', label: 'Portfolio / Social Link', placeholder: 'Instagram, YouTube or Website', is_required: false },
      { field_type: 'textarea', label: 'Bio & Experience', placeholder: 'Briefly describe your performances, experience...', is_required: true }
    ]
  },
  {
    id: 'booking',
    name: 'Client Event Booking',
    icon: Calendar,
    title: 'Book an Event',
    description: 'Provide details about your upcoming event so we can find the perfect artists for you.',
    design: { theme: 'light', glassmorphism: false, accentColor: '#4f46e5' },
    fields: [
      { field_type: 'text', label: 'Your Name', placeholder: 'John Doe', is_required: true },
      { field_type: 'email', label: 'Email Address', placeholder: 'john@example.com', is_required: true },
      { field_type: 'date', label: 'Event Date', is_required: true },
      { field_type: 'select', label: 'Event Type', options: 'Wedding, Corporate, Concert, Private Party', is_required: true },
      { field_type: 'text', label: 'Venue Location', placeholder: 'e.g. Mumbai', is_required: true },
      { field_type: 'textarea', label: 'Additional Details', placeholder: 'Any specific artist preferences or budget...', is_required: false }
    ]
  },
  {
    id: 'contact',
    name: 'Contact / Inquiry',
    icon: Mail,
    title: 'Contact Us',
    description: 'We would love to hear from you. Send us a message and we will get back to you shortly.',
    design: { theme: 'light', glassmorphism: false, accentColor: '#000000' },
    fields: [
      { field_type: 'text', label: 'Name', placeholder: 'Your Name', is_required: true },
      { field_type: 'email', label: 'Email Address', placeholder: 'Your Email', is_required: true },
      { field_type: 'text', label: 'Phone', placeholder: 'Your Phone Number', is_required: false },
      { field_type: 'textarea', label: 'Message', placeholder: 'How can we help you?', is_required: true }
    ]
  }
];

export default function CreateFormPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showFieldSuccess, setShowFieldSuccess] = useState(false);
  
  // Design states
  const [coverImage, setCoverImage] = useState<string>('');
  const [theme, setTheme] = useState('light');
  const [glassmorphism, setGlassmorphism] = useState(false);
  const [accentColor, setAccentColor] = useState('#4f46e5');

  const router = useRouter();
  const { toast } = useToast();

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setTitle(template.title || '');
    setDescription(template.description || '');
    if (template.design) {
      setTheme(template.design.theme);
      setGlassmorphism(template.design.glassmorphism);
      setAccentColor(template.design.accentColor);
    }
    setFields(template.fields.map(f => ({
      ...f,
      id: Math.random().toString(36).substr(2, 9),
      options: f.options || ''
    })));
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Math.random().toString(36).substr(2, 9),
        field_type: 'text',
        label: '',
        placeholder: '',
        is_required: false,
        options: '',
      }
    ]);
    toast({
      title: 'Field Added',
      description: 'A new field has been added to your form.',
      variant: 'default',
    });
    
    setShowFieldSuccess(true);
    setTimeout(() => {
      setShowFieldSuccess(false);
    }, 3000);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: string, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;
    
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    setFields(newFields);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Form title is required' });
      return;
    }
    if (fields.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Add at least one field' });
      return;
    }
    
    for (const f of fields) {
      if (!f.label.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'All fields must have a label' });
        return;
      }
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const design_config = {
        theme,
        glassmorphism,
        accentColor
      };

      // 1. Create form
      const { data: formData, error: formError } = await supabase
        .from('custom_forms')
        .insert([{ 
          title, 
          description,
          cover_image: coverImage || null,
          design_config,
          created_by: userId || null 
        }])
        .select()
        .single();

      if (formError) throw formError;

      // 2. Create fields
      const dbFields = fields.map((f, i) => ({
        form_id: formData.id,
        field_type: f.field_type,
        label: f.label,
        placeholder: f.placeholder || null,
        is_required: f.is_required,
        options: f.field_type === 'select' || f.field_type === 'radio' ? JSON.stringify(f.options.split(',').map((o: string) => o.trim()).filter(Boolean)) : null,
        order_index: i
      }));

      const { error: fieldsError } = await supabase
        .from('custom_form_fields')
        .insert(dbFields);

      if (fieldsError) throw fieldsError;

      toast({ title: 'Success', description: 'Form created successfully!' });
      router.push('/dashboard/forms');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to save form' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/dashboard/forms')}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Form</h1>
          <p className="text-sm font-medium text-slate-500">Design a custom form to collect information from clients.</p>
        </div>
      </div>

      {/* TEMPLATES */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Start from a Template</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className="flex flex-col items-center justify-center p-6 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-2xl transition-all group"
            >
              <t.icon size={28} className="text-slate-400 group-hover:text-indigo-600 mb-3 transition-colors" />
              <span className="text-xs font-bold text-slate-700 text-center">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT COL: Design Settings */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Design & Theme</h2>
            
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2"><ImageIcon size={14}/> Cover / Background Image</label>
              <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden relative group flex items-center justify-center">
                {coverImage ? (
                  <>
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    <button onClick={() => setCoverImage('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase tracking-wider">Remove</button>
                  </>
                ) : (
                  <div className="w-full p-2 h-full flex items-center justify-center">
                    <ImageUploader 
                      images={coverImage ? [coverImage] : []} 
                      onChange={(urls) => setCoverImage(urls[0] || '')} 
                      maxImages={1} 
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Theme Style</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setTheme('light')}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${theme === 'light' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Light Mode
                </button>
                <button 
                  onClick={() => setTheme('dark-glass')}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${theme === 'dark-glass' ? 'border-indigo-600 bg-slate-900 text-white shadow-xl' : 'border-slate-200 text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
                >
                  Dark Glass
                </button>
              </div>
            </div>

            {theme === 'dark-glass' && (
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <input 
                    type="checkbox" 
                    checked={glassmorphism}
                    onChange={e => setGlassmorphism(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Enable Glassmorphism</span>
                    <span className="text-[10px] text-slate-500">Adds premium blurred effect to form cards</span>
                  </div>
                </label>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Accent Color</label>
              <div className="flex gap-2">
                {['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#000000', '#ffffff'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setAccentColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COL: Form Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Form Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Wedding Requirements Form"
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide some context for the client filling out this form..."
                rows={3}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner resize-none" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Form Fields</h2>
              <div className="flex items-center gap-4">
                {showFieldSuccess && (
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg animate-in fade-in slide-in-from-right-2">
                    <CheckCircle2 size={16} className="inline mr-1 mb-0.5" /> Field Added
                  </span>
                )}
                <button 
                  onClick={addField}
                  className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
                >
                  <Plus size={16} /> Add Field
                </button>
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="py-16 bg-slate-50 rounded-[32px] border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
                <CheckCircle2 size={40} className="mb-4 text-slate-300" strokeWidth={1} />
                <p className="font-bold text-slate-700 mb-1">Your form is empty</p>
                <p className="text-sm">Add fields to start building your form.</p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div key={field.id} className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm flex gap-4 group">
                  <div className="flex flex-col gap-1 pt-2">
                    <button onClick={() => moveField(index, 'up')} disabled={index === 0} className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-30"><GripHorizontal size={20} className="rotate-90" /></button>
                    <button onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1} className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-30"><GripHorizontal size={20} className="rotate-90" /></button>
                  </div>
                  
                  <div className="flex-grow space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Question Label</label>
                        <input 
                          type="text" 
                          value={field.label}
                          onChange={e => updateField(field.id, 'label', e.target.value)}
                          placeholder="e.g. What is your event date?"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Field Type</label>
                        <select 
                          value={field.field_type}
                          onChange={e => updateField(field.id, 'field_type', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                        >
                          <option value="text">Short Text</option>
                          <option value="textarea">Long Text</option>
                          <option value="email">Email Address</option>
                          <option value="date">Date Picker</option>
                          <option value="select">Dropdown Menu</option>
                          <option value="checkbox">Checkbox (Yes/No)</option>
                        </select>
                      </div>
                    </div>

                    {(field.field_type === 'text' || field.field_type === 'textarea' || field.field_type === 'email') && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Placeholder Text</label>
                        <input 
                          type="text" 
                          value={field.placeholder || ''}
                          onChange={e => updateField(field.id, 'placeholder', e.target.value)}
                          placeholder="e.g. Enter your details here..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all" 
                        />
                      </div>
                    )}

                    {field.field_type === 'select' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Dropdown Options (Comma separated)</label>
                        <input 
                          type="text" 
                          value={field.options || ''}
                          onChange={e => updateField(field.id, 'options', e.target.value)}
                          placeholder="e.g. Option 1, Option 2, Option 3"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all" 
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={field.is_required}
                          onChange={e => updateField(field.id, 'is_required', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Required Field</span>
                      </label>
                      
                      <button 
                        onClick={() => removeField(field.id)}
                        className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-8">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-14 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3 disabled:opacity-50"
            >
              {saving ? <><Loader2 size={20} className="animate-spin" /> Saving Form...</> : <><Save size={20} /> Save Form & Publish</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
