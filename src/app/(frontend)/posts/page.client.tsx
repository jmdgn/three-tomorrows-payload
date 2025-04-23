'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'

const PageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
    
    const runBlogScripts = () => {
      const shareButtons = document.querySelectorAll('.articleShare');
      if (shareButtons.length > 0) {
        shareButtons.forEach(button => {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const menuId = this.getAttribute('data-menu');
            const menu = document.getElementById(menuId);
            if (menu) {
              menu.classList.toggle('active');
              console.log('Share menu toggled:', menuId, menu.classList.contains('active'));
            }
          });
        });
      }
    };
    
    runBlogScripts();
    setTimeout(runBlogScripts, 500);
  }, [setHeaderTheme]);
  
  return (
    <></>
  )
}

export default PageClient