// ========== INSTAGRAM BROWSER DETECTION ==========
function isInstagramBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    // Complete Instagram & Facebook in-app browser detection
    return ua.includes('Instagram') || 
           ua.includes('FBAV') ||    // Facebook Android
           ua.includes('FBAN') ||    // Facebook iOS
           ua.includes('FBIOS') ||   // Facebook iOS
           ua.includes('Messenger') || // Messenger app
           (window.top !== window.self && document.referrer.includes('instagram'));
}

// ========== EXTERNAL BROWSER HANDLER (Exactly like pehle wala system) ==========
function openInExternalBrowser(url) {
    if (isInstagramBrowser()) {
        // Method 1: Create and click hidden link - triggers "Leave Instagram?" popup
        const externalLink = document.createElement('a');
        externalLink.href = url;
        externalLink.target = '_blank';
        externalLink.rel = 'noopener noreferrer';
        externalLink.style.display = 'none';
        document.body.appendChild(externalLink);
        externalLink.click();
        document.body.removeChild(externalLink);
        
        // Method 2: Fallback for iOS - use window.open
        setTimeout(() => {
            window.open(url, '_blank', 'noopener,noreferrer');
        }, 100);
        
        return false;
    }
    // Normal navigation for non-Instagram browsers
    window.location.href = url;
    return true;
}

// ========== HANDLE CARD CLICKS ==========
function setupCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const url = card.getAttribute('data-url');
        const site = card.getAttribute('data-site');
        
        if (url) {
            // Remove any existing listeners
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Visual feedback
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // CRITICAL: Use redirect.html to trigger page navigation
                // This makes Instagram think we're leaving the page
                const redirectUrl = `redirect.html?to=${encodeURIComponent(url)}&site=${site}`;
                openInExternalBrowser(redirectUrl);
                
                return false;
            });
        }
    });
}

// ========== SHOW WARNING IF IN INSTAGRAM BROWSER ==========
function showWarningIfNeeded() {
    if (isInstagramBrowser()) {
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            position: fixed;
            bottom: 70px;
            left: 20px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            color: #ffaa00;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 13px;
            text-align: center;
            z-index: 9999;
            backdrop-filter: blur(10px);
            border: 1px solid #ffaa00;
            animation: slideUp 0.3s ease;
        `;
        warningDiv.innerHTML = `
            🔗 <strong>Tip:</strong> Tap the <strong>⋯</strong> (three dots) 
            and select <strong>"Open in Browser"</strong> for best experience
        `;
        document.body.appendChild(warningDiv);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            warningDiv.style.opacity = '0';
            setTimeout(() => warningDiv.remove(), 500);
        }, 5000);
    }
}

// Add animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    setupCards();
    showWarningIfNeeded();
    
    // Debug log
    if (isInstagramBrowser()) {
        console.log('🔍 Instagram browser detected - Using external redirect system');
    } else {
        console.log('✅ Normal browser - Links work normally');
    }
});

// Export for debugging
window.openInExternalBrowser = openInExternalBrowser;
window.isInstagramBrowser = isInstagramBrowser;
