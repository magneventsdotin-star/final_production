"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import PricingCard from '@/app/components/pricing/PricingCard'
import FaqSection from '@/app/components/home/FaqSection'
import { PRICING_PLANS } from '@/app/constants'
import { supabase } from '@database/connection/supabase'
import '@/app/styles/pages/PricingPage.css'

export default function PricingPage() {
  const [plans, setPlans] = useState(PRICING_PLANS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('pricing_plans')
          .select('*')
          .eq('is_live', true)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching plans:', error);
        } else {
          const formattedPlans = (data || []).map(p => ({
            name: p.name,
            tagline: p.copy,
            price: `₹${p.price}`,
            originalPrice: p.original_price ? `₹${p.original_price}` : null,
            features: p.points || [],
            popular: p.featured || false
          }));
          setPlans(formattedPlans);
        }
      } catch (err) {
        console.error('Error fetching pricing plans:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  return (
    <main className="pricing-pg">
      <div className="pricing-shell">
        <header className="pricing-header">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pricing-title"
          >
            Book Top Singers <br />
            <span className="accent-text">Starting At Just ...</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pricing-subtitle"
          >
            Select the perfect ensemble to elevate your event. From intimate whispers to <br />
            grand stadium energy
          </motion.p>
        </header>

        <div className="pricing-grid">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={`skeleton-${i}`} 
                className="pricing-card" 
                style={{ background: '#0a0a0a', borderColor: 'rgba(255,255,255,0.05)', padding: '40px 30px', display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div className="skeleton-pulse" style={{ height: '28px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '8px' }}></div>
                <div className="skeleton-pulse" style={{ height: '14px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '40px' }}></div>
                
                <div className="skeleton-pulse" style={{ height: '120px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '30px' }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={`li-${j}`} className="skeleton-pulse" style={{ height: '16px', width: `${60 + (j * 7) % 30}%`, background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                  ))}
                </div>
                
                <div className="skeleton-pulse" style={{ height: '52px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: 'auto' }}></div>
              </div>
            ))
          ) : (
            plans.map((plan, i) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                index={i}
              />
            ))
          )}
        </div>

        <FaqSection
          eyebrow="💡 Common Questions"
          title="Everything you need to know"
          titleGradient={true}
        />
      </div>
    </main>
  )
}
