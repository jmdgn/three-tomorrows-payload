// blog-scripts.js - Place this in your public/scripts/blog directory

document.addEventListener('DOMContentLoaded', function() {
  // Toggle share buttons when clicking the share button
  const shareButtons = document.querySelectorAll('.articleShare');
  
  if (shareButtons && shareButtons.length > 0) {
    shareButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const menuId = this.getAttribute('data-menu');
        const menu = document.getElementById(menuId);
        
        // Toggle the active class
        if (menu) {
          menu.classList.toggle('active');
        }
        
        // Close other menus
        document.querySelectorAll('.share-buttons').forEach(el => {
          if (el.id !== menuId) {
            el.classList.remove('active');
          }
        });
      });
    });
  }
  
  // Close share menus when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.shareButton-frame') && 
        !e.target.closest('.articleShare')) {
      document.querySelectorAll('.share-buttons').forEach(el => {
        el.classList.remove('active');
      });
    }
  });
  
  // Copy link functionality
  const copyButtons = document.querySelectorAll('.copyLink');
  
  if (copyButtons && copyButtons.length > 0) {
    copyButtons.forEach(button => {
      button.addEventListener('click', function() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
          // Show feedback
          const paragraph = this.querySelector('p');
          if (paragraph) {
            const originalText = paragraph.textContent;
            paragraph.textContent = 'Copied!';
            
            setTimeout(() => {
              paragraph.textContent = originalText;
            }, 2000);
          }
        }).catch(err => {
          console.error('Could not copy text: ', err);
        });
      });
    });
  }
  
  // Reading progress bar
  const progressBar = document.querySelector('.progressBar');
  
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      progressBar.style.width = scrolled + '%';
    });
  }
  
  // Fix social share URLs that use window.location
  const updateShareLinks = () => {
    const shareLinks = document.querySelectorAll('.share-button[href*="encodeURIComponent"]');
    shareLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href.includes('window.location.href')) {
        const updatedHref = href.replace(/encodeURIComponent\(typeof window !== 'undefined' \? window\.location\.href : ''\)/g, 
          `encodeURIComponent('${window.location.href}')`);
        link.setAttribute('href', updatedHref);
      }
    });
  };
  
  // Run once on page load
  updateShareLinks();
});