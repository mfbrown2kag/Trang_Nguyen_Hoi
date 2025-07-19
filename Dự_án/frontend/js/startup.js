// ===== STARTUP SCRIPT =====
// Ensures navigation works regardless of load order

console.log('🚀 Startup script initializing...');

// Navigation state
let navigationReady = false;

// Simple immediate navigation setup
function setupImmediateNavigation() {
    console.log('⚡ Setting up immediate navigation...');
    
    // Get nav links
    const navLinks = document.querySelectorAll('.nav-link');
    console.log(`Found ${navLinks.length} nav links to setup`);
    
    if (navLinks.length === 0) {
        console.warn('⚠️ No nav links found yet');
        return false;
    }
    
    // Setup click handlers immediately
    navLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        console.log(`Setting up immediate handler for link ${index}: ${href}`);
        
        // Remove any existing listeners
        link.onclick = null;
        
        // Add new listener
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionId = href.substring(1);
            console.log(`🎯 Immediate navigation triggered: ${sectionId}`);
            
            // Use the most reliable navigation method available
            if (window.app && typeof window.app.navigateToSection === 'function') {
                console.log('Using main app navigation');
                window.app.navigateToSection(sectionId);
            } else if (window.manualNavigate) {
                console.log('Using manual navigation');
                window.manualNavigate(sectionId);
            } else if (window.emergencyNavigate) {
                console.log('Using emergency navigation');
                window.emergencyNavigate(sectionId);
            } else {
                console.log('Using fallback navigation');
                immediateNavigate(sectionId);
            }
        });
    });
    
    navigationReady = true;
    console.log('✅ Immediate navigation setup complete');
    return true;
}

// Fallback navigation function
function immediateNavigate(sectionId) {
    console.log(`🔧 Fallback navigation to: ${sectionId}`);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Remove active from nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }
    
    // Activate nav link
    const targetNav = document.querySelector(`[href="#${sectionId}"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }
    
    window.scrollTo(0, 0);
}

// Try setup immediately if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM loaded, setting up navigation...');
        
        // Try multiple times to ensure it works
        let attempts = 0;
        const maxAttempts = 5;
        
        function trySetup() {
            attempts++;
            console.log(`🔄 Navigation setup attempt ${attempts}/${maxAttempts}`);
            
            if (setupImmediateNavigation()) {
                console.log('✅ Navigation setup successful');
                
                // Show test buttons after a delay
                setTimeout(() => {
                    if (window.showNavTest) {
                        console.log('💡 Type showNavTest() in console to show test buttons');
                    }
                }, 2000);
                
            } else if (attempts < maxAttempts) {
                console.log('⏳ Retrying navigation setup in 500ms...');
                setTimeout(trySetup, 500);
            } else {
                console.error('❌ Failed to setup navigation after all attempts');
            }
        }
        
        trySetup();
    });
} else {
    // DOM already ready
    console.log('📄 DOM already ready, setting up navigation immediately...');
    setupImmediateNavigation();
}

// Add global functions
window.forceNavigationSetup = setupImmediateNavigation;
window.immediateNavigate = immediateNavigate;

// Status check function
window.checkNavigationStatus = function() {
    console.log('📊 Navigation Status:');
    console.log('- Navigation ready:', navigationReady);
    console.log('- Main app:', !!window.app);
    console.log('- Manual navigate:', !!window.manualNavigate);
    console.log('- Emergency navigate:', !!window.emergencyNavigate);
    console.log('- Nav links found:', document.querySelectorAll('.nav-link').length);
    console.log('- Sections found:', document.querySelectorAll('.section').length);
};

console.log('🚀 Startup script loaded');
console.log('💡 Available functions: forceNavigationSetup(), immediateNavigate(id), checkNavigationStatus()'); 