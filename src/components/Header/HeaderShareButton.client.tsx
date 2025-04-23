'use client'

import React, { useEffect } from 'react'

export function HeaderShareButton() {
  useEffect(() => {
    const setupHeaderShare = () => {
      console.log('Setting up header share with overflow toggle');
      
      const headerButton = document.querySelector('.shareButton-header .articleShare');
      const headerMenu = document.getElementById('header-share');
      const blogHeader = document.querySelector('header.blog');
      
      if (headerButton && headerMenu && blogHeader) {
        console.log('Found all elements: button, menu, and blog header');
        
        const clickHandler = function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          headerMenu.classList.toggle('active');
          
          if (headerMenu.classList.contains('active')) {
            blogHeader.style.overflow = 'visible';
            console.log('Set header overflow to visible');
          } else {
            blogHeader.style.overflow = '';
            console.log('Reset header overflow');
          }
          
          document.querySelectorAll('.share-buttons').forEach(el => {
            if (el.id !== 'header-share') {
              el.classList.remove('active');
            }
          });
        };
        
        const documentClickHandler = function(e) {
          if (!e.target.closest('.shareButton-header') && 
              !e.target.closest('#header-share')) {
            headerMenu.classList.remove('active');
            blogHeader.style.overflow = '';
          }
        };
        
        const newButton = headerButton.cloneNode(true);
        headerButton.parentNode.replaceChild(newButton, headerButton);
        
        newButton.addEventListener('click', clickHandler);
        document.addEventListener('click', documentClickHandler);
        
        console.log('All handlers attached');
      } else {
        console.log('Could not find all required elements');
        if (!headerButton) console.log('Missing header button');
        if (!headerMenu) console.log('Missing header menu');
        if (!blogHeader) console.log('Missing blog header');
      }
    };
    
    setTimeout(setupHeaderShare, 1000);
    
  }, []);
  
  return null;
}

export default HeaderShareButton;