"use client";

import React from 'react';
import Link from 'next/link';

import { footerSeoKeywords as keywords } from '@/app/constants/seoKeywords';

export default function SeoKeywordFooter() {
  return (
    <div className="seo-keyword-footer">
      <div className="seo-keyword-container">
        {keywords.map((keyword, index) => (
          <React.Fragment key={index}>
            <Link href={`/${keyword.replace(/ /g, '-')}`} className="seo-keyword">
              {keyword}
            </Link>
            {index < keywords.length - 1 && <span className="seo-separator">|</span>}
          </React.Fragment>
        ))}
      </div>
      <style jsx>{`
        .seo-keyword-footer {
          background-color: #050505;
          padding: 30px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: center;
        }
        .seo-keyword-container {
          max-width: 1400px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 8px 12px;
          line-height: 1.8;
          text-align: center;
        }
        .seo-keyword {
          color: rgba(255, 255, 255, 0.3);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: color 0.3s ease;
          cursor: default;
        }
        .seo-keyword:hover {
          color: rgba(255, 255, 255, 0.7);
        }
        .seo-separator {
          color: rgba(255, 255, 255, 0.1);
          font-size: 10px;
          user-select: none;
        }
        @media (max-width: 768px) {
          .seo-keyword-footer {
            padding: 20px 15px;
          }
          .seo-keyword-container {
            gap: 6px 8px;
          }
          .seo-keyword {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
