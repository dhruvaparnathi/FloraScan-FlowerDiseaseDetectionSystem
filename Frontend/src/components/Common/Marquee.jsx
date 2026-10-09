import React from 'react';

export default function Marquee({ text = 'NEUE FLORA • SPECIES DETECTION • PLANT PATHOLOGY • DEEP LEARNING MODEL • ', reverse = false }) {
  // Create an array of text to duplicate for seamless looping
  const repeatCount = 8;
  const content = Array(repeatCount).fill(text).join(' ');

  return (
    <div className="w-full overflow-hidden swiss-border-b py-6 bg-[var(--bg-color)] select-none transition-colors duration-500">
      <div className="relative flex max-w-full overflow-hidden">
        <div className={`flex whitespace-nowrap text-6xl md:text-8xl font-black uppercase tracking-tighter ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}>
          <span className="inline-block mr-4">{content}</span>
          <span className="inline-block mr-4">{content}</span>
        </div>
      </div>
    </div>
  );
}
