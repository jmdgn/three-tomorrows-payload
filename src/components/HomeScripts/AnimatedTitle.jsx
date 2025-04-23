'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react';

const AnimatedTitle = ({ 
  children, 
  staggerDelay = 0.05, 
  duration = 0.8,
  threshold = 0.2, 
  className = '',
  component = 'span'
}) => {
  const titleRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [words, setWords] = useState([]);
  
  const easing = 'ease-out';
  
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
        width: '100%'
      }}
    >
      {words.map((word, wordIndex) => (
        <span key={`word-${wordIndex}`} className="word-wrapper">
          {word.split('').map((char, charIndex) => {
            const globalCharIndex = words
              .slice(0, wordIndex)
              .reduce((sum, w) => sum + w.length, 0) + charIndex;
              
            const microOffset = charIndex % 2 === 0 ? 0.005 : 0;
            
            return (
              <span
                key={`${char}-${wordIndex}-${charIndex}`}
                className="animated-character"
                style={{
                  display: 'inline-block',
                  transform: isVisible
                    ? 'translateY(0)'
                    : 'translateY(24px)',
                  opacity: isVisible ? 1 : 0,
                  transition: `transform ${duration}s ease, 
                              opacity ${duration}s ease`,
                  transitionDelay: `${globalCharIndex * staggerDelay}s`,
                  transformOrigin: 'bottom',
                  verticalAlign: 'baseline',
                  willChange: 'transform, opacity',
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </Container>
  );
};

export default AnimatedTitle;