// Function to open links in external browser
function openExternal(url) {
    // Method 1: Direct window.open with specific parameters
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    // Fallback for popup blockers
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Create a temporary link and click it
        const tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.target = '_blank';
        tempLink.rel = 'noopener noreferrer';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
    }
    
    return false;
}

// Detect if user is in Instagram/Facebook in-app browser
function isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for Instagram and Facebook user agents
    const isInstagram = /Instagram/i.test(ua);
    const isFacebook = /FBAN/i.test(ua) || /FBAV/i.test(ua) || /FBIOS/i.test(ua);
    const isMessenger = /Messenger/i.test(ua);
    
    // Also check for webview
    const isWebView = /; wv\)/i.test(ua) || /Version\/[\d.]+ Mobile\/\w+ Safari\/\w+.* wv\)/i.test(ua);
    
    return isInstagram || isFacebook || isMessenger || isWebView;
}

// Show warning if in in-app browser
function showBrowserWarning() {
    if (isInAppBrowser()) {
        const warningDiv = document.getElementById('browserWarning');
        if (warningDiv) {
            warningDiv.style.display = 'block';
            
            // Auto-hide after 8 seconds
            setTimeout(() => {
                warningDiv.style.opacity = '0';
                setTimeout(() => {
                    warningDiv.style.display = 'none';
                    warningDiv.style.opacity = '1';
                }, 500);
            }, 8000);
        }
    }
}

// Add click handlers to all buttons
function setupButtons() {
    const buttons = document.querySelectorAll('.btn[data-url]');
    
    buttons.forEach(button => {
        // Remove any existing listeners to avoid duplicates
        button.removeEventListener('click', handleButtonClick);
        button.addEventListener('click', handleButtonClick);
        
        // Add loading state
        button.addEventListener('click', function(e) {
            const originalText = this.innerHTML;
            this.innerHTML = '🔄 Opening...';
            this.style.opacity = '0.7';
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.opacity = '1';
            }, 1000);
        });
    });
}

// Handle button click
function handleButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const url = button.getAttribute('data-url');
    
    if (url) {
        // Log for debugging
        console.log('Opening external URL:', url);
        
        // Attempt to open in external browser
        openExternal(url);
        
        // Additional fallback for iOS
        setTimeout(() => {
            if (isInAppBrowser()) {
                // Try alternative method for iOS
                window.location.href = url;
            }
        }, 500);
    } else {
        console.error('No URL found for button');
    }
    
    return false;
}

// Intercept all link clicks (for any dynamically added links)
function interceptAllLinks() {
    document.addEventListener('click', function(e) {
        // Find if clicked element is a link or inside a link
        let link = e.target.closest('a');
        if (link && link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript:')) {
            // Don't intercept buttons that have data-url
            if (!link.closest('.btn[data-url]')) {
                e.preventDefault();
                openExternal(link.href);
                return false;
            }
        }
    });
}

// Add animation effects
function addAnimations() {
    const cards = document.querySelectorAll('.card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Track clicks for analytics (optional)
function trackClick(url, source) {
    // You can add analytics tracking here if needed
    console.log(`Click tracked: ${url} from ${source}`);
    
    // Example: Send to Google Analytics or your own analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'external_link_click', {
            'event_category': 'external_link',
            'event_label': url,
            'value': source
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Landing page initialized - All links will open in external browser');
    
    showBrowserWarning();
    setupButtons();
    interceptAllLinks();
    addAnimations();
    
    // Add touch feedback for mobile
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        btn.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
});

// For iOS: Ensure links open correctly even after navigation
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Page was loaded from cache, re-setup buttons
        setupButtons();
    }
});

// Export for debugging (optional)
window.openExternal = openExternal;
window.isInAppBrowser = isInAppBrowser;
