'use client'

import React from 'react';
import AnimatedTitle from '@/components/HomeScripts/AnimatedTitle';

const TitleIntroduction = ({ heading, headingColor, subheading, centerAlignment, enableTextIndent }) => {
  const alignmentClass = centerAlignment ? 'center' : '';
  const indentClass = enableTextIndent ? '' : 'no-indent';
  const containerAlignmentClass = centerAlignment ? '' : 'left-align';
  
  return (
    <div className={`titleText ${alignmentClass}`}>
      <div className="titleContent-container">
        <h4 
          className="xlarge animate-title" 
          style={{ color: headingColor || '#171744' }}
        >
          {heading || 'Heading'}
        </h4>
      </div>
      <div className={`txtContent-container ${containerAlignmentClass}`}>
        <p className={`xlarge ${indentClass}`}>
          <AnimatedTitle staggerDelay={0.02} duration={0.6}>
            {subheading || 'Description Subhead'}
          </AnimatedTitle>
        </p>
      </div>
    </div>
  );
};

export default TitleIntroduction;