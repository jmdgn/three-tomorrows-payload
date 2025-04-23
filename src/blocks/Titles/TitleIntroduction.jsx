'use client'

import React from 'react';
import AnimatedTitle from '@/components/HomeScripts/AnimatedTitle';

const TitleIntroduction = ({ heading, subheading, centerAlignment }) => {
  const alignmentClass = centerAlignment ? 'center' : '';
  
  return (
    <div className={`titleText ${alignmentClass}`}>
      <div className="titleContent-container">
        <h4 className="xlarge animate-title">{heading || 'Heading'}</h4>
      </div>
      <div className="txtContent-container">
        <p className="xlarge">
          <AnimatedTitle staggerDelay={0.02} duration={0.6}>
            {subheading || 'Description Subhead'}
          </AnimatedTitle>
        </p>
      </div>
    </div>
  );
};

export default TitleIntroduction;