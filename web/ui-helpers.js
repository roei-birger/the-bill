// UI Helper functions for TheBill application - Enhanced

// Toggle dark mode with animation
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeToggle();
    
    // Add sparkle effect
    createSparkles();
}

// Create sparkles effect
function createSparkles() {
    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${Math.random() * window.innerWidth}px;
            top: ${Math.random() * window.innerHeight}px;
            animation: sparkleFloat ${1 + Math.random()}s ease-out forwards;
        `;
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1500);
    }
}

// Add sparkle animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes sparkleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(0);
        }
    }
`;
document.head.appendChild(styleSheet);

// Update dark mode toggle button appearance
function updateDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.innerHTML = isDarkMode ? 
        '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Apply dark mode from saved preference
function applyDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    updateDarkModeToggle();
}

// Add ripple effect to buttons
function addRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Initialize ripple effects on all buttons
function initRippleEffects() {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', addRippleEffect);
    });
}

// Show a screen and hide others
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.add('active');
    }
}

// Switch between tabs
function switchTab(tabId, containerId) {
    // Deactivate all tabs and content
    const container = document.getElementById(containerId) || document;
    container.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    container.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activate selected tab
    const selectedTab = container.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (selectedTab) selectedTab.classList.add('active');
    
    // Activate associated content
    const selectedContent = container.querySelector(`#${tabId}-tab`);
    if (selectedContent) selectedContent.classList.add('active');
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Add event listener to close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking the X
document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
});

// Format date to localized string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.charAt(0);
}

// Add icons to buttons and improve UI
function enhanceUI() {
    // Add dark mode toggle
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.addEventListener('click', toggleDarkMode);
    document.body.appendChild(darkModeToggle);
    
    // Add icons to buttons
    document.querySelectorAll('.primary-btn, .secondary-btn, .danger-btn').forEach(button => {
        if (button.id === 'create-group-btn' && !button.querySelector('.icon')) {
            button.insertAdjacentHTML('afterbegin', '<span class="icon"><i class="fas fa-plus"></i></span>');
        } else if (button.id === 'add-member-btn' && !button.querySelector('.icon')) {
            button.insertAdjacentHTML('afterbegin', '<span class="icon"><i class="fas fa-user-plus"></i></span>');
        } else if (button.id === 'add-payment-btn' && !button.querySelector('.icon')) {
            button.insertAdjacentHTML('afterbegin', '<span class="icon"><i class="fas fa-dollar-sign"></i></span>');
        } else if (button.id === 'export-data-btn' && !button.querySelector('.icon')) {
            button.insertAdjacentHTML('afterbegin', '<span class="icon"><i class="fas fa-file-export"></i></span>');
        } else if (button.id === 'edit-member-btn' && !button.querySelector('.icon')) {
            button.insertAdjacentHTML('afterbegin', '<span class="icon"><i class="fas fa-user-edit"></i></span>');
        } else if (button.id === 'remove-member-btn' && !button.querySelector('.icon')) {
            button.insertAdjacentHTML('afterbegin', '<span class="icon"><i class="fas fa-user-minus"></i></span>');
        } else if (button.id === 'edit-payment-btn' && !button.querySelector('.icon')) {
            button.insertAdjacentHTML('afterbegin', '<span class="icon"><i class="fas fa-edit"></i></span>');
        } else if (button.id === 'delete-payment-btn' && !button.querySelector('.icon')) {
            button.insertAdjacentHTML('afterbegin', '<span class="icon"><i class="fas fa-trash-alt"></i></span>');
        }
    });
}

// Initialize UI improvements
document.addEventListener('DOMContentLoaded', () => {
    // Apply dark mode preference
    applyDarkModePreference();
    
    // Add UI enhancements
    enhanceUI();
    
    // Initialize ripple effects
    initRippleEffects();
    
    // Setup tab switching
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.getAttribute('data-tab'));
        });
    });
    
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
