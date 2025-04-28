'use client'

import React, { useEffect, useRef, useState } from 'react';

const AnimatedTitle = ({ 
  children, 
  staggerDelay = 0.03, // Reduced for quicker successive animations
  duration = 0.7,      // Slightly faster animation
  threshold = 0.2, 
  className = '',
  component = 'span'
}) => {
  const titleRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [words, setWords] = useState([]);
  
  // Use a more pronounced easing curve like the Altermind site
  const easing = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
  
  useEffect(() => {
    if (typeof children === 'string') {
      setWords(children.split(' ').filter(word => word.length > 0));
    } else if (children) {
      const text = React.Children.toArray(children).join('');
      setWords(text.split(' ').filter(word => word.length > 0));
    }
  }, [children]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    const titleElement = titleRef.current;
    if (titleElement) {
      observer.observe(titleElement);
    }

    return () => {
      if (titleElement) {
        observer.unobserve(titleElement);
      }
    };
  }, [threshold]);

  const Container = component;
  
  return (
    <Container 
      ref={titleRef} 
      className={`animated-title-container ${className}`}
      style={{
        maxWidth: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {words.map((word, wordIndex) => (
        <span 
          key={`word-${wordIndex}`} 
          className="word-wrapper"
          style={{ 
            display: 'inline-block', 
            marginRight: '0.3em',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <span
            className="word-inner"
            style={{
              display: 'block',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {word.split('').map((char, charIndex) => {
              const globalCharIndex = words
                .slice(0, wordIndex)
                .reduce((sum, w) => sum + w.length, 0) + charIndex;
                
              return (
                <span
                  key={`${char}-${wordIndex}-${charIndex}`}
                  className="animated-character"
                  style={{
                    display: 'inline-block',
                    transform: isVisible
                      ? 'translateY(0) scale(1)'
                      : 'translateY(100%) scale(0.9)',
                    opacity: isVisible ? 1 : 0,
                    transition: `transform ${duration}s ${easing}, 
                                opacity ${duration}s ${easing}`,
                    transitionDelay: `${globalCharIndex * staggerDelay}s`,
                    transformOrigin: 'center bottom',
                    verticalAlign: 'baseline',
                    willChange: 'transform, opacity',
                  }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        </span>
      ))}
      {/* Add a space at the end to prevent layout shift */}
      <span>&nbsp;</span>
    </Container>
  );
};

export default AnimatedTitle;