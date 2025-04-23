const SimpleSceneRefresh = {
  init() {
    if (typeof window === 'undefined') return;

    const homePath = '/'; 

    if (this._initialized) return;
    this._initialized = true;
    
    console.log('Initializing homepage refresh logic...');

    // --- Event Listener for Browser Back/Forward ---
    window.addEventListener('popstate', () => {
      // Check if the current path is the homepage path
      if (window.location.pathname === homePath) {
        console.log('Popstate event detected on homepage. Checking for refresh.'); // Debug log
        this._triggerRefreshCheck();
      }
    });
    
    // --- Event Listener for Link Clicks ---
    document.addEventListener('click', (e) => {
      // Check if the clicked element is an anchor tag (link)
      const anchor = e.target.closest('a'); // Check target and its parents
      if (anchor) {
        const href = anchor.getAttribute('href');
        // Check if the link points to the homepage path
        if (href === homePath || href === '') { // Also handle links with empty href if they lead home
            console.log('Homepage link clicked. Clearing refresh flag.'); // Debug log
            // Clear the session flag so a refresh *can* happen on the next load
            sessionStorage.removeItem('homepage_refreshed_this_session');
        }
      }
    }, true); // Use capture phase to catch clicks early
    
    // --- Initial Check on Page Load ---
    // Check if the current path is the homepage when the script loads
    if (window.location.pathname === homePath) {
        console.log('Initial load on homepage. Checking for refresh.'); // Debug log
        this._triggerRefreshCheck();
    }
  },
  
  _triggerRefreshCheck() {
    // Check if we have *already* refreshed during this browser session
    if (sessionStorage.getItem('homepage_refreshed_this_session') === 'true') {
        console.log('Refresh skipped: Already refreshed this session.'); // Debug log
        return; // Don't refresh again in the same session
    }
    
    // --- Force Refresh Logic ---
    // Set the flag *before* reloading to prevent potential loops if reload is immediate
    sessionStorage.setItem('homepage_refreshed_this_session', 'true');
    console.log('Refreshing homepage now...'); // Debug log
    
    // Use a small delay to ensure the session storage is set before reload begins
    setTimeout(() => {
        window.location.reload();
    }, 50); // 50ms delay, adjust if needed
  }
};

export default SimpleSceneRefresh;