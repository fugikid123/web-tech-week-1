/**
 * JS Tasks Logic: Task Manager & Dynamic Form
 * Implementing ES6+, DOM APIs, and Events
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // TASK 1: MINI TASK MANAGER
    // ==========================================
    const taskInput = document.querySelector('#task-input');
    const addTaskBtn = document.querySelector('#add-task-btn');
    const taskList = document.querySelector('#task-list');

    const addTask = () => {
        const text = taskInput.value.trim();
        
        // Prevent empty tasks
        if (text === "") {
            alert("Please enter a task!");
            return;
        }

        // Create Task Item (li)
        const li = document.createElement('li');
        li.className = 'task-item';
        
        // Create inner structure with Template Literals
        li.innerHTML = `
            <span class="task-text">${text}</span>
            <button class="delete-btn">Delete</button>
        `;

        // Toggle Completed Status
        const taskSpan = li.querySelector('.task-text');
        taskSpan.addEventListener('click', () => {
            li.classList.toggle('completed');
        });

        // Delete Task functionality
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            li.remove();
        });

        // Append to List
        taskList.appendChild(li);

        // Clear input
        taskInput.value = "";
        taskInput.focus();
    };

    // Event Listeners for Task Manager
    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });


    // ==========================================
    // TASK 2: DYNAMIC UI
    // ==========================================
    
    // Part 1: Background Color Switcher
    const bgBox = document.querySelector('#dynamic-bg-box');
    const bgBtn = document.querySelector('#bg-change-btn');
    const colors = ['#1a1a1a', '#2d0a0a', '#0a2d0a', '#0a0a2d', '#2d2d0a'];
    let colorIndex = 0;

    bgBtn.addEventListener('click', () => {
        colorIndex = (colorIndex + 1) % colors.length;
        bgBox.style.backgroundColor = colors[colorIndex];
    });

    // Part 2: Live Character Counter
    const charInput = document.querySelector('#char-input');
    const charCountDisplay = document.querySelector('#char-count');

    charInput.addEventListener('input', () => {
        const length = charInput.value.length;
        charCountDisplay.textContent = length;
        
        // Visual feedback if length gets high
        charCountDisplay.style.color = length > 50 ? '#e11d48' : '#10b981';
    });


    // ==========================================
    // TASK 2: FORM VALIDATION
    // ==========================================
    const form = document.querySelector('#registration-form');

    if (form) {
        const inputs = [...form.querySelectorAll('input')];
        let isSubmitted = false;

        const validators = {
            firstName: value => value.length > 0,
            lastName: value => value.length > 0,
            username: value => value.length >= 8,
            email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            // Min 8 chars, at least 1 number and 1 special character
            password: value => /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value)
        };

        const validateInput = (input, forceShow = false) => {
            const value = input.value.trim();
            const validator = validators[input.id];
            const isValid = validator ? validator(value) : value.length > 0;

            if (isValid) {
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else if (forceShow) {
                input.classList.remove('valid');
                input.classList.add('invalid');
            } else {
                // Keep field neutral until first blur/submit
                input.classList.remove('valid', 'invalid');
            }

            return isValid;
        };

        // Live validation: if a field was invalid, typing fixes it immediately
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const shouldShow = isSubmitted || input.classList.contains('invalid');
                validateInput(input, shouldShow);
            });

            input.addEventListener('blur', () => {
                validateInput(input, true);
            });
        });

        // Form submit handling
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            isSubmitted = true;

            const isFormValid = inputs.every(input => validateInput(input, true));

            if (isFormValid) {
                alert('Registration Successful!');
                form.reset();
                isSubmitted = false;
                inputs.forEach(input => input.classList.remove('valid', 'invalid'));
            } else {
                alert('Please fix the errors in the form.');
            }
        });
    }

    // ==========================================
    // TASK 3: API INTEGRATION (Async/Await)
    // ==========================================
    const API_URL = 'https://jsonplaceholder.typicode.com/posts';
    let allPosts = [];
    let filteredPosts = [];
    let currentPage = 1;
    const postsPerPage = 6;

    // DOM Elements
    const fetchPostsBtn = document.querySelector('#fetch-posts-btn');
    const postsContainer = document.querySelector('#posts-container');
    const loadingSpinner = document.querySelector('#loading-spinner');
    const errorContainer = document.querySelector('#error-container');
    const errorMessage = document.querySelector('#error-message');
    const postSearch = document.querySelector('#post-search');
    const paginationContainer = document.querySelector('#pagination-container');
    
    // Form Elements
    const postFormContainer = document.querySelector('#post-form-container');
    const postForm = document.querySelector('#post-form');
    const showPostFormBtn = document.querySelector('#show-post-form-btn');
    const cancelPostBtn = document.querySelector('#cancel-post-btn');
    const formTitle = document.querySelector('#form-title');
    const postTitleInput = document.querySelector('#post-title');
    const postBodyInput = document.querySelector('#post-body');
    const postIdInput = document.querySelector('#post-id');

    /**
     * Shows/Hides loading state
     * @param {boolean} isLoading 
     */
    const toggleLoading = (isLoading) => {
        loadingSpinner.classList.toggle('hidden', !isLoading);
        if (isLoading) {
            postsContainer.innerHTML = '';
            errorContainer.classList.add('hidden');
        }
    };

    /**
     * Handles API errors
     * @param {string} message 
     */
    const handleError = (message) => {
        errorMessage.textContent = `Error: ${message}`;
        errorContainer.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
    };

    /**
     * Fetches all posts from the API
     */
    const fetchPosts = async () => {
        toggleLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            allPosts = await response.json();
            filteredPosts = [...allPosts];
            currentPage = 1;
            renderPosts();
            renderPagination();
        } catch (error) {
            handleError(error.message);
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    };

    /**
     * Creates or updates a post
     * @param {Event} e 
     */
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        const id = postIdInput.value;
        const postData = {
            title: postTitleInput.value,
            body: postBodyInput.value,
            userId: 1
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                body: JSON.stringify(postData),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            if (!response.ok) throw new Error(`Failed to ${method} post`);

            const result = await response.json();
            
            if (id) {
                // Update local state
                const index = allPosts.findIndex(p => p.id == id);
                if (index !== -1) allPosts[index] = { ...allPosts[index], ...result };
                alert('Post updated successfully (Mock API)');
            } else {
                // Add to local state (JSONPlaceholder doesn't actually save)
                // We'll give it a real-looking ID for our local UI
                const newPost = { ...result, id: allPosts.length + 1 };
                allPosts.unshift(newPost);
                alert('Post created successfully (Mock API)');
            }

            postForm.reset();
            postFormContainer.classList.add('hidden');
            applyFilters();
        } catch (error) {
            alert(`Error saving post: ${error.message}`);
        }
    };

    /**
     * Deletes a post
     * @param {number} id 
     */
    const deletePost = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete post');

            // Remove from local state
            allPosts = allPosts.filter(p => p.id != id);
            alert('Post deleted successfully (Mock API)');
            applyFilters();
        } catch (error) {
            alert(`Error deleting post: ${error.message}`);
        }
    };

    /**
     * Sets up the form for editing
     * @param {Object} post 
     */
    const editPost = (post) => {
        formTitle.textContent = 'Edit Post';
        postIdInput.value = post.id;
        postTitleInput.value = post.title;
        postBodyInput.value = post.body;
        postFormContainer.classList.remove('hidden');
        postFormContainer.scrollIntoView({ behavior: 'smooth' });
    };

    /**
     * Filters posts based on search input
     */
    const applyFilters = () => {
        const query = postSearch.value.toLowerCase();
        filteredPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(query)
        );
        currentPage = 1;
        renderPosts();
        renderPagination();
    };

    /**
     * Renders posts for the current page
     */
    const renderPosts = () => {
        postsContainer.innerHTML = '';
        
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        if (paginatedPosts.length === 0) {
            postsContainer.innerHTML = '<p style="text-align: center; color: var(--text-dim); grid-column: 1 / -1;">No posts found.</p>';
            paginationContainer.classList.add('hidden');
            return;
        }

        paginatedPosts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'post-card';
            card.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.body}</p>
                <div class="post-actions">
                    <button class="btn-secondary btn-small edit-btn">Edit</button>
                    <button class="btn-danger btn-small delete-btn">Delete</button>
                </div>
            `;

            card.querySelector('.edit-btn').addEventListener('click', () => editPost(post));
            card.querySelector('.delete-btn').addEventListener('click', () => deletePost(post.id));

            postsContainer.appendChild(card);
        });

        paginationContainer.classList.remove('hidden');
    };

    /**
     * Renders pagination controls
     */
    const renderPagination = () => {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

        if (totalPages <= 1) {
            paginationContainer.classList.add('hidden');
            return;
        }

        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.textContent = 'Prev';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            currentPage--;
            renderPosts();
            renderPagination();
        };
        paginationContainer.appendChild(prevBtn);

        // Page Numbers (limited to a few)
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.onclick = () => {
                    currentPage = i;
                    renderPosts();
                    renderPagination();
                };
                paginationContainer.appendChild(pageBtn);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.padding = '0.5rem';
                paginationContainer.appendChild(dots);
            }
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            currentPage++;
            renderPosts();
            renderPagination();
        };
        paginationContainer.appendChild(nextBtn);
    };

    // Event Listeners for API section
    fetchPostsBtn.addEventListener('click', fetchPosts);
    
    postSearch.addEventListener('input', applyFilters);

    showPostFormBtn.addEventListener('click', () => {
        formTitle.textContent = 'Create New Post';
        postForm.reset();
        postIdInput.value = '';
        postFormContainer.classList.toggle('hidden');
    });

    cancelPostBtn.addEventListener('click', () => {
        postFormContainer.classList.add('hidden');
    });

    postForm.addEventListener('submit', handlePostSubmit);

    // ==========================================
    // PART 2: DUMMYJSON API (Random Quote)
    // ==========================================
    const fetchQuoteBtn = document.querySelector('#fetch-quote-btn');
    const quoteText = document.querySelector('#quote-text');
    const quoteAuthor = document.querySelector('#quote-author');

    const fetchQuote = async () => {
        fetchQuoteBtn.disabled = true;
        fetchQuoteBtn.textContent = 'Loading...';
        
        try {
            const response = await fetch('https://dummyjson.com/quotes/random');
            if (!response.ok) throw new Error('Failed to fetch quote');
            
            const data = await response.json();
            quoteText.textContent = `"${data.quote}"`;
            quoteAuthor.textContent = `- ${data.author}`;
        } catch (error) {
            quoteText.textContent = 'Error loading quote. Please try again.';
            quoteAuthor.textContent = '';
        } finally {
            fetchQuoteBtn.disabled = false;
            fetchQuoteBtn.textContent = 'Get Random Quote';
        }
    };

    fetchQuoteBtn.addEventListener('click', fetchQuote);

});
