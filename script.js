/**
 * Professional Portfolio Interactivity Script
 * Using ES6+, DOM API, and Events
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // --- 1. API Integrations & Form Submission ---
    const signupForm = document.querySelector('form');
    
    // Function to handle fetching and displaying data
    const initAPIs = async () => {
        // No longer overwriting principles images to ensure they display correctly from HTML
    };

    initAPIs();

    // --- Exercise Search (API-Ninjas) ---
    const exerciseBtn = document.getElementById('search-exercise-btn');
    const muscleSelect = document.getElementById('muscle-select');
    const exerciseResults = document.getElementById('exercise-results');
    const NINJA_API_KEY = '3WIbUGGs3LDDu6Ctfgx2w5ytyf2mMLCXObUScC55';

    const fetchExercises = async () => {
        const muscle = muscleSelect.value;
        if (!muscle) {
            alert('Please select a muscle group.');
            return;
        }

        exerciseResults.innerHTML = '<div class="spinner" style="grid-column: 1/-1;"></div>';
        exerciseBtn.disabled = true;
        exerciseBtn.textContent = 'Searching...';

        try {
            const response = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`, {
                headers: { 'X-Api-Key': NINJA_API_KEY }
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Error (${response.status}): ${errorBody || response.statusText}`);
            }
            
            const exercises = await response.json();
            renderExercises(exercises);
        } catch (error) {
            console.error('Error:', error);
            exerciseResults.innerHTML = `<p style="color:var(--accent-red); grid-column:1/-1; text-align:center;">
                Error loading exercises.<br>
                <small style="opacity:0.8;">${error.message}</small>
            </p>`;
        } finally {
            exerciseBtn.disabled = false;
            exerciseBtn.textContent = 'Find Exercises';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner': return '#10b981'; // Green
            case 'intermediate': return '#f59e0b'; // Yellow/Amber
            case 'expert': return '#ef4444'; // Red
            default: return 'var(--text-dim)';
        }
    };

    const renderExercises = (exercises) => {
        if (exercises.length === 0) {
            exerciseResults.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No exercises found for this muscle group.</p>';
            return;
        }

        exerciseResults.innerHTML = exercises.map(ex => `
            <div class="card" style="margin:0; display:flex; flex-direction:column; gap:0.5rem;">
                <h3 style="color:var(--accent-white); border:none; padding:0; font-size:1.1rem;">${ex.name}</h3>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <span style="font-size:0.7rem; padding:0.2rem 0.5rem; background:#333; border-radius:4px;">${ex.type}</span>
                    <span style="font-size:0.7rem; padding:0.2rem 0.5rem; background:#333; border-radius:4px; color:${getDifficultyColor(ex.difficulty)}; font-weight:bold;">${ex.difficulty}</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-dim); line-height:1.4; margin-top:0.5rem;">
                    ${ex.instructions.length > 200 ? ex.instructions.substring(0, 200) + '...' : ex.instructions}
                </p>
            </div>
        `).join('');
    };

    if (exerciseBtn) {
        exerciseBtn.addEventListener('click', fetchExercises);
    }

    if (signupForm) {
        // Selecting all relevant input elements
        const inputs = signupForm.querySelectorAll('input, textarea');

        /**
         * Validates an individual input field and applies visual feedback
         * @param {HTMLElement} input 
         * @param {boolean} force - If true, show error even if empty
         */
        const validateField = (input, force = false) => {
            const isRequired = input.hasAttribute('required');
            const isEmpty = input.value.trim() === '';
            const isValid = input.checkValidity();

            if (!isEmpty && isValid) {
                // Input has valid data
                input.classList.add('valid');
                input.classList.remove('invalid');
            } else if (!isEmpty && !isValid) {
                // Input has data, but it's formatted incorrectly
                input.classList.add('invalid');
                input.classList.remove('valid');
            } else if (isEmpty && isRequired && force) {
                // Input is empty, mandatory, and user moved away or submitted
                input.classList.add('invalid');
                input.classList.remove('valid');
            } else {
                // Input is empty and either optional or not interacted with yet
                input.classList.remove('valid', 'invalid');
            }
        };

        // Add event listeners for real-time feedback
        inputs.forEach(input => {
            // Event: 'input' triggers whenever the value changes
            input.addEventListener('input', () => validateField(input));
            
            // Event: 'blur' triggers when user leaves the field
            input.addEventListener('blur', () => validateField(input, true));
        });

        // Event: 'submit' handle form submission
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Stop page reload
            
            let allValid = true;
            inputs.forEach(input => {
                validateField(input, true);
                if (!input.checkValidity()) allValid = false;
            });

            if (allValid) {
                // Prepare form data
                const formData = {
                    name: signupForm.name.value,
                    email: signupForm.email.value,
                    age: signupForm.age.value,
                    level: signupForm.level.value,
                    days: Array.from(signupForm.querySelectorAll('input[name="days"]:checked')).map(el => el.value)
                };

                // 👤 Customer details (POST /users)
                try {
                    const response = await fetch('https://jsonplaceholder.typicode.com/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData),
                    });
                    const result = await response.json();
                    console.log('Success:', result);

                    // DOM Manipulation: Replace form with success message
                    const container = signupForm.parentElement;
                    container.innerHTML = `
                        <div class="success-message" style="text-align: center; padding: 2rem; animation: fadeIn 0.5s ease-in;">
                            <h3 style="color: #10b981; margin-bottom: 1rem;">✓ Lead Captured Successfully! (ID: ${result.id})</h3>
                            <p>Thank you for your interest, ${result.name}. We've received your request for the <strong>${result.level}</strong> training guide.</p>
                            <p style="font-size:0.8rem; color:var(--text-dim); margin-top:1rem;">API Response: Simulated success with JSONPlaceholder.</p>
                            <button onclick="location.reload()" class="btn-secondary" style="margin-top: 1rem;">Back to form</button>
                        </div>
                    `;
                } catch (error) {
                    console.error('Error submitting form:', error);
                    alert('An error occurred. Please try again later.');
                }
            } else {
                // Simple alert if validation fails on submit
                alert('Please fill in the form correctly.');
            }
        });
    }

    // --- 2. Smooth Scrolling for Navigation ---
    // Using ES6 Spread operator to convert NodeList to Array
    const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Smooth scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for sticky nav
                    behavior: 'smooth'
                });

                // If mobile menu is open, close it (for mobile view)
                const navToggle = document.getElementById('nav-toggle');
                if (navToggle) navToggle.checked = false;
            }
        });
    });

    // --- 3. Dynamic Skill Card Hover Effects ---
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        // Event: mouseenter
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 10px 30px rgba(225, 29, 72, 0.15)';
        });

        // Event: mouseleave
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = 'none';
        });
    });

    // --- 4. Scroll Reveal (Optional but cool) ---
    const revealOnScroll = () => {
        const sections = document.querySelectorAll('section');
        const triggerBottom = window.innerHeight * 0.8;

        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < triggerBottom) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    };

    // Initial styling for scroll reveal
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0.9'; // Subtle start
        section.style.transition = 'all 0.6s ease-out';
    });

    window.addEventListener('scroll', revealOnScroll);

    // --- 5. Programming Quotes API Integration ---
    const quoteText = document.querySelector('.quote-text');
    const quoteAuthor = document.querySelector('.quote-author');
    const newQuoteBtn = document.getElementById('new-quote-btn');

    /**
     * Fetches a random programming quote from an API
     */
    const fetchQuote = async () => {
        if (!quoteText) return;

        try {
            quoteText.textContent = 'Updating inspiration...';
            quoteAuthor.textContent = '';
            
            // Note: Using a reliable public API for programming/tech quotes
            const response = await fetch('https://api.quotable.io/random?tags=technology|famous-quotes');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            // Update UI with quote
            quoteText.textContent = `"${data.content}"`;
            quoteAuthor.textContent = data.author;
            
            // Add a small animation effect
            quoteText.style.animation = 'none';
            void quoteText.offsetWidth; // trigger reflow
            quoteText.style.animation = 'fadeIn 0.8s ease-in-out';
            
        } catch (error) {
            console.error('Error fetching quote:', error);
            quoteText.textContent = '"Code is like humor. When you have to explain it, it’s bad."';
            quoteAuthor.textContent = 'Cory House';
        }
    };

    // Initial fetch on load
    if (quoteText) {
        fetchQuote();
    }

    // Event listener for button click
    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', fetchQuote);
    }
});
