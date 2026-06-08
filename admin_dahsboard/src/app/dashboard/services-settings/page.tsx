"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';

export default function ServicesSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: '',
    hero_title: '',
    hero_subtitle: '',
    hero_bg_image: '',
    hero_bg_video: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('service_page_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('service_page_settings')
          .update({
            hero_title: settings.hero_title,
            hero_subtitle: settings.hero_subtitle,
            hero_bg_image: settings.hero_bg_image,
            hero_bg_video: settings.hero_bg_video
          })
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('service_page_settings')
          .insert([settings])
          .select();
        if (error) throw error;
        if (data) setSettings(data[0]);
      }
      toast({ title: 'Success', description: 'Services page settings updated.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div className="section-header">
        <span className="section-label">Frontend Control</span>
        <h1 className="section-title text-slate-900">Services Page Settings</h1>
        <p className="text-body mt-1 max-w-2xl font-medium">Update the hero content dynamically.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label>Hero Title</Label>
            <textarea
              value={settings.hero_title || ''}
              onChange={(e) => setSettings({...settings, hero_title: e.target.value})}
              className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200"
              placeholder="e.g. Book Premium Singers, DJs & Live Bands"
            />
          </div>

          <div className="space-y-2">
            <Label>Hero Subtitle</Label>
            <Input
              value={settings.hero_subtitle || ''}
              onChange={(e) => setSettings({...settings, hero_subtitle: e.target.value})}
              placeholder="e.g. Discover verified performers..."
            />
          </div>

          <div className="space-y-2">
            <Label>Hero Background Image URL (Optional)</Label>
            <Input
              value={settings.hero_bg_image || ''}
              onChange={(e) => setSettings({...settings, hero_bg_image: e.target.value})}
              placeholder="https://..."
            />
            <p className="text-xs text-slate-500 mt-1">If provided, this image will override the background video.</p>
          </div>

          <div className="space-y-2">
            <Label>Hero Background Video URL (MP4 or YouTube)</Label>
            <Input
              value={settings.hero_bg_video || ''}
              onChange={(e) => setSettings({...settings, hero_bg_video: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <Button type="submit" disabled={saving} className="bg-slate-900 text-white mt-4">
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
            Save Settings
          </Button>
        </form>
      </div>
    </div>
  );
}
