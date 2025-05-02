'use client'

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const AnimatedTitle = ({ 
  children, 
  staggerDelay = 0.25,
  duration = 2,
  initialDelay = 0.3,
  threshold = 0,
  rootMargin = '0px 0px 0px 0px',
  debounceDelay = 1000,
  className = '',
  component = 'span'
}) => {
  const titleRef = useRef(null);
  const [words, setWords] = useState([]);
  const wordRefs = useRef([]);
  const lastPlayed = useRef(0);
  const debounceTimeout = useRef(null);
  const hasFullyExited = useRef(true);
  const lastScrollY = useRef(window.scrollY);

  useEffect(() => {
    if (typeof children === 'string') {
      setWords(children.split(' ').filter(Boolean));
    } else if (children) {
      const text = React.Children.toArray(children).join('');
      setWords(text.split(' ').filter(Boolean));
    }
  }, [children]);

  useEffect(() => {
    if (!words.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const now = Date.now();
        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
        lastScrollY.current = currentScrollY;

        const rect = entry.target.getBoundingClientRect();

        const isFarBelowViewport = rect.top > window.innerHeight + 500;
        const isFarAboveViewport = rect.bottom < -500;

        // Reset if fully out of view
        if (!entry.isIntersecting && ((scrollDirection === 'down' && isFarBelowViewport) || (scrollDirection === 'up' && isFarAboveViewport))) {
          hasFullyExited.current = true;
          resetWords();
        }

        // Animate when re-entering from full exit
        if (entry.isIntersecting && hasFullyExited.current) {
          const timeSinceLast = now - lastPlayed.current;
          if (timeSinceLast > debounceDelay) {
            clearTimeout(debounceTimeout.current);
            debounceTimeout.current = setTimeout(() => {
              animateWords();
              lastPlayed.current = Date.now();
              hasFullyExited.current = false;
            }, 100);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    return () => {
      if (titleRef.current) observer.unobserve(titleRef.current);
      clearTimeout(debounceTimeout.current);
    };
  }, [words, threshold, rootMargin, debounceDelay]);

  const animateWords = () => {
    gsap.fromTo(
      wordRefs.current,
      { y: '120%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        ease: 'cubic-bezier(0.19, 1, 0.22, 1)',
        duration,
        stagger: staggerDelay,
        delay: initialDelay,
      }
    );
  };

  const resetWords = () => {
    gsap.set(wordRefs.current, {
      y: '120%',
      opacity: 0,
    });
  };

  const Container = component;

  return (
    <Container
      ref={titleRef}
      className={`animated-title-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {words.map((word, i) => (
        <span
          key={`word-${i}`}
          ref={(el) => (wordRefs.current[i] = el)}
          style={{
            display: 'inline-block',
            marginRight: '0.3em',
            transform: 'translateY(120%)',
            opacity: 0,
            whiteSpace: 'pre',
          }}
        >
          {word}
        </span>
      ))}
    </Container>
  );
};

export default AnimatedTitle;