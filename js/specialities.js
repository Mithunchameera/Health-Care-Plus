// Specialities Page JavaScript

class SpecialitiesManager {
    constructor() {
        this.specialities = [];
        this.filteredSpecialities = [];
        this.initializeSpecialities();
    }

    initializeSpecialities() {
        this.loadSpecialitiesData();
        this.setupSearch();
        this.setupAnimations();
    }

    loadSpecialitiesData() {
        // Get all speciality cards
        this.specialities = Array.from(document.querySelectorAll('.speciality-card'));
        this.filteredSpecialities = [...this.specialities];
    }

    setupSearch() {
        const searchInput = document.getElementById('speciality-search');
        const searchBtn = document.querySelector('.btn-search');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch(searchInput.value);
            });
        }
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            // Show all specialities
            this.specialities.forEach(card => {
                card.classList.remove('hidden', 'filtered');
                card.classList.add('animate-in');
            });
            return;
        }

        this.specialities.forEach(card => {
            const specialityName = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const conditions = Array.from(card.querySelectorAll('.common-conditions li'))
                .map(li => li.textContent.toLowerCase())
                .join(' ');

            const isMatch = specialityName.includes(searchTerm) || 
                          description.includes(searchTerm) || 
                          conditions.includes(searchTerm);

            if (isMatch) {
                card.classList.remove('hidden', 'filtered');
                card.classList.add('animate-in');
            } else {
                card.classList.add('filtered');
                card.classList.remove('animate-in');
            }
        });

        // Show search results count
        const visibleCards = this.specialities.filter(card => 
            !card.classList.contains('hidden') && !card.classList.contains('filtered')
        );

        this.showSearchResults(visibleCards.length, searchTerm);
    }

    showSearchResults(count, searchTerm) {
        // Remove existing search result message
        const existingMessage = document.querySelector('.search-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new search result message
        const message = document.createElement('div');
        message.className = 'search-results-message';
        message.innerHTML = `
            <p>Found ${count} specialit${count === 1 ? 'y' : 'ies'} matching "${searchTerm}"</p>
            ${count === 0 ? '<p class="no-results-text">Try searching for different terms or browse all specialities.</p>' : ''}
            <button class="btn-clear-search" onclick="specialitiesManager.clearSearch()">Clear Search</button>
        `;

        // Insert message before the grid
        const grid = document.querySelector('.specialities-grid');
        grid.parentNode.insertBefore(message, grid);

        // Auto-hide message after 5 seconds if there are results
        if (count > 0) {
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 5000);
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('speciality-search');
        if (searchInput) {
            searchInput.value = '';
        }

        // Remove search results message
        const message = document.querySelector('.search-results-message');
        if (message) {
            message.remove();
        }

        // Show all specialities
        this.handleSearch('');
    }

    setupAnimations() {
        // Animate cards on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add a small delay for staggered animation
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                }
            });
        }, observerOptions);

        // Observe all speciality cards
        this.specialities.forEach(card => {
            observer.observe(card);
        });
    }

    // Navigate to doctors page with speciality filter
    findDoctors(speciality) {
        window.location.href = `find-doctors.html?speciality=${encodeURIComponent(speciality)}`;
    }
}

// Initialize specialities manager
let specialitiesManager;

document.addEventListener('DOMContentLoaded', () => {
    specialitiesManager = new SpecialitiesManager();
});

// Add CSS for search results and animations
const specialitiesStyles = `
.search-results-message {
    background: var(--white);
    padding: var(--spacing-lg);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    text-align: center;
    margin-bottom: var(--spacing-xl);
    border-left: 4px solid var(--primary-blue);
}

.search-results-message p {
    margin-bottom: var(--spacing-sm);
    color: var(--primary-blue-dark);
    font-weight: 500;
}

.no-results-text {
    color: var(--text-gray);
    font-size: var(--font-size-sm);
}

.btn-clear-search {
    background: none;
    border: 1px solid var(--primary-blue);
    color: var(--primary-blue);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: var(--spacing-sm);
}

.btn-clear-search:hover {
    background-color: var(--primary-blue);
    color: var(--white);
}

.speciality-card {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.3s ease;
}

.speciality-card.animate-in {
    opacity: 1;
    transform: translateY(0);
}

.speciality-card.filtered {
    opacity: 0.3;
    transform: scale(0.95);
    pointer-events: none;
}

.speciality-card.hidden {
    display: none;
}

/* Hover effects for better interactivity */
.speciality-card:hover .speciality-icon {
    transform: scale(1.1);
    transition: transform 0.3s ease;
}

.speciality-card:hover h3 {
    color: var(--primary-blue);
    transition: color 0.3s ease;
}
`;

// Inject specialities-specific styles
const specialitiesStyleSheet = document.createElement('style');
specialitiesStyleSheet.textContent = specialitiesStyles;
document.head.appendChild(specialitiesStyleSheet);