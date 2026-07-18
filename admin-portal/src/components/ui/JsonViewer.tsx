"use client";

import React, { useState } from 'react';
import { Copy, Check, ChevronRight, ChevronDown } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  initiallyExpanded?: boolean;
}

const JsonNode: React.FC<{ keyName: string; value: any; isLast: boolean; initiallyExpanded: boolean }> = ({
  keyName,
  value,
  isLast,
  initiallyExpanded
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const toggleExpand = () => setExpanded(!expanded);

  if (!isObject) {
    let valueColor = 'text-green-500'; // string
    if (typeof value === 'number') valueColor = 'text-orange-500';
    else if (typeof value === 'boolean') valueColor = 'text-blue-500';
    else if (value === null) valueColor = 'text-gray-400';

    return (
      <div className="pl-4 font-mono text-sm leading-6">
        <span className="text-pink-500">"{keyName}"</span>
        <span className="text-slate-400 mr-1">:</span>
        <span className={valueColor}>
          {typeof value === 'string' ? `"${value}"` : String(value)}
        </span>
        {!isLast && <span className="text-slate-400">,</span>}
      </div>
    );
  }

  const isEmpty = Object.keys(value).length === 0;

  return (
    <div className="pl-4 font-mono text-sm leading-6">
      <div className="flex items-center cursor-pointer group" onClick={toggleExpand}>
        {!isEmpty && (
          <span className="mr-1 text-slate-400 group-hover:text-slate-200">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {isEmpty && <span className="mr-1 w-[14px]" />}
        
        {keyName && (
          <>
            <span className="text-pink-500">"{keyName}"</span>
            <span className="text-slate-400 mr-1">:</span>
          </>
        )}
        <span className="text-slate-400">{isArray ? '[' : '{'}</span>
        {!expanded && !isEmpty && (
          <span className="text-slate-500 text-xs px-1">...</span>
        )}
        {!expanded && <span className="text-slate-400">{isArray ? ']' : '}'}{!isLast && ','}</span>}
      </div>

      {expanded && !isEmpty && (
        <div className="pl-2 border-l border-slate-700/50 ml-1.5">
          {Object.entries(value).map(([k, v], i) => (
            <JsonNode
              key={k}
              keyName={isArray ? '' : k}
              value={v}
              isLast={i === Object.keys(value).length - 1}
              initiallyExpanded={initiallyExpanded}
            />
          ))}
        </div>
      )}
      {expanded && !isEmpty && (
        <div className="pl-4">
          <span className="text-slate-400">{isArray ? ']' : '}'}{!isLast && ','}</span>
        </div>
      )}
    </div>
  );
};

export function JsonViewer({ data, initiallyExpanded = true }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#0F172A] border border-slate-800 shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">JSON Response</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar">
        {data === undefined ? (
          <span className="text-slate-500 text-sm italic">undefined</span>
        ) : (
          <JsonNode 
            keyName="" 
            value={data} 
            isLast={true} 
            initiallyExpanded={initiallyExpanded} 
          />
        )}
      </div>
    </div>
  );
}
