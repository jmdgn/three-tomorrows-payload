'use client'

import { useEffect } from 'react'

export function BlogEffects() {
  useEffect(() => {
    let isMounted = true;
    
    const timeouts = [];
    const eventListeners = [];
    
    let isInitialized = false;
    
    const initializeShareButtons = () => {
      if (!isMounted || isInitialized) return;
      
      console.log('Initializing share buttons');
      
      const shareButtons = document.querySelectorAll('.articleShare');
      console.log('Found share buttons:', shareButtons.length);
      
      if (shareButtons && shareButtons.length > 0) {
        shareButtons.forEach(button => {
          const clickHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const menuId = this.getAttribute('data-menu');
            const menu = document.getElementById(menuId);
            
            console.log('Share button clicked:', menuId);
            
            if (menu) {
              menu.classList.toggle('active');
              console.log('Menu toggled:', menuId, menu.classList.contains('active'));
            } else {
              console.log('Menu not found:', menuId);
            }
            
            document.querySelectorAll('.share-buttons').forEach(el => {
              if (el.id !== menuId) {
                el.classList.remove('active');
              }
            });
          };
          
          const isHeaderButton = button.closest('.shareButton-header') !== null;
          if (isHeaderButton) {
            console.log('Setting up header share button in BlogEffects');
          }
          
          button.removeEventListener('click', clickHandler);
          
          button.addEventListener('click', clickHandler);
          eventListeners.push({ element: button, event: 'click', handler: clickHandler });
        });
      }
      
      const copyButtons = document.querySelectorAll('.copyLink');
      
      if (copyButtons && copyButtons.length > 0) {
        copyButtons.forEach(button => {
          const clickHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
              const paragraph = this.querySelector('p');
              if (paragraph) {
                const originalText = paragraph.textContent;
                paragraph.textContent = 'Copied!';
                
                const timeoutId = setTimeout(() => {
                  if (!isMounted) return;
                  paragraph.textContent = originalText;
                }, 2000);
                
                timeouts.push(timeoutId);
              }
            }).catch(err => {
              console.error('Could not copy text: ', err);
            });
          };
          
          const isHeaderCopy = button.id === 'copy-link-header';
          if (isHeaderCopy) {
            console.log('Setting up header copy button in BlogEffects');
          }
          
          button.removeEventListener('click', clickHandler);
          
          button.addEventListener('click', clickHandler);
          eventListeners.push({ element: button, event: 'click', handler: clickHandler });
        });
      }
      
      const documentClickHandler = function(e) {
        if (!e.target.closest('.shareButton-frame') && 
            !e.target.closest('.articleShare') &&
            !e.target.closest('.shareButton-header')) {
          document.querySelectorAll('.share-buttons').forEach(el => {
            el.classList.remove('active');
          });
        }
      };
      
      document.removeEventListener('click', documentClickHandler);
      document.addEventListener('click', documentClickHandler);
      eventListeners.push({ element: document, event: 'click', handler: documentClickHandler });
      
      const updateShareLinks = () => {
        const shareLinks = document.querySelectorAll('.share-button[href*="encodeURIComponent"]');
        shareLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.includes('window.location.href')) {
            const updatedHref = href.replace(/encodeURIComponent\(typeof window !== 'undefined' \? window\.location\.href : ''\)/g, 
              `encodeURIComponent('${window.location.href}')`);
            link.setAttribute('href', updatedHref);
          }
        });
      };
      
      updateShareLinks();
      
      isInitialized = true;
    };

    const initializeProgressBar = () => {
      const progressBar = document.querySelector('.progressBar');
      
      if (progressBar) {
        const scrollHandler = () => {
          if (!isMounted) return;
          
          const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = (winScroll / height) * 100;
          
          progressBar.style.width = scrolled + '%';

          const articleHeader = document.querySelector('.articleDetails-nav');
          if (articleHeader) {
            if (winScroll > 200) {
              articleHeader.classList.add('scrolled');
            } else {
              articleHeader.classList.remove('scrolled');
            }
          }
        };
        
        window.removeEventListener('scroll', scrollHandler);
        window.addEventListener('scroll', scrollHandler);
        eventListeners.push({ element: window, event: 'scroll', handler: scrollHandler });
        
        scrollHandler();
      }
    };

    const initialize = () => {
      if (!isMounted) return;
      
      try {
        initializeShareButtons();
        initializeProgressBar();
      } catch (err) {
        console.error('Error during initialization:', err);
      }
    };

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        initialize();
      } else {
        const domReadyHandler = () => {
          initialize();
        };
        
        window.addEventListener('load', domReadyHandler);
        eventListeners.push({ element: window, event: 'load', handler: domReadyHandler });
        
        const timeoutId = setTimeout(initialize, 1000);
        timeouts.push(timeoutId);
      }
    }

    return () => {
      isMounted = false;
      
      timeouts.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      
      eventListeners.forEach(({ element, event, handler }) => {
        if (element) {
          element.removeEventListener(event, handler);
        }
      });
    };
  }, []);

  return null;
}