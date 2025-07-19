// ===== EMERGENCY NAVIGATION FALLBACK =====
// This script ensures navigation works even if main app fails

(function() {
    'use strict';
    
    console.log('🚨 Emergency navigation script loading...');
    
    // Simple navigation function
    function navigateToSection(sectionId) {
        console.log(`🚨 Emergency navigation to: ${sectionId}`);
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        // Remove active from nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            console.log(`✅ Emergency: Activated section ${sectionId}`);
        } else {
            console.error(`❌ Emergency: Section not found: ${sectionId}`);
        }
        
        // Activate nav link
        const targetNavLink = document.querySelector(`[href="#${sectionId}"]`);
        if (targetNavLink) {
            targetNavLink.classList.add('active');
            console.log(`✅ Emergency: Activated nav link for ${sectionId}`);
        }
        
        // Update page title
        document.title = `${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} - Email Guardian`;
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    // Setup emergency navigation after DOM loads
    function setupEmergencyNavigation() {
        console.log('🚨 Setting up emergency navigation...');
        
        // Wait a bit to see if main app works
        setTimeout(() => {
            // Check if main app navigation is working
            const navLinks = document.querySelectorAll('.nav-link');
            
            if (navLinks.length === 0) {
                console.error('🚨 No nav links found!');
                return;
            }
            
            // Test if main app is working
            if (!window.app || typeof window.app.navigateToSection !== 'function') {
                console.warn('🚨 Main app not working, using emergency navigation');
                
                // Remove existing listeners and add emergency ones
                navLinks.forEach(link => {
                    // Clone to remove existing listeners
                    const newLink = link.cloneNode(true);
                    link.parentNode.replaceChild(newLink, link);
                    
                    newLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        const sectionId = newLink.getAttribute('href').substring(1);
                        navigateToSection(sectionId);
                    });
                    
                    console.log(`🚨 Emergency listener added for: ${newLink.getAttribute('href')}`);
                });
                
                // Add global emergency function
                window.emergencyNavigate = navigateToSection;
                
                console.log('✅ Emergency navigation activated');
            } else {
                console.log('✅ Main app navigation working fine');
            }
        }, 2000);
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupEmergencyNavigation);
    } else {
        setupEmergencyNavigation();
    }
    
    // Add to global scope for manual testing
    window.forceEmergencyNavigation = () => {
        console.log('🚨 Forcing emergency navigation setup...');
        setupEmergencyNavigation();
    };
    
})();

console.log('🚨 Emergency navigation script loaded'); 