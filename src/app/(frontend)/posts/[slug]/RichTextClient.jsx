'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the RichText component with SSR disabled
const DynamicRichText = dynamic(
  () => import('@/components/RichText'),
  { 
    ssr: false,
    loading: () => (
      <div className="paragraph-block">
        <p className="loading-content">Loading content...</p>
      </div>
    )
  }
);

// Client component that handles rendering rich text with blog styling
export default function RichTextClient({ content }) {
  if (!content) {
    return (
      <div className="paragraph-block">
        <p>No content available for this post.</p>
      </div>
    );
  }

  return (
    <div className="rich-text-wrapper">
      <DynamicRichText data={content} enableGutter={false} />
    </div>
  );
}