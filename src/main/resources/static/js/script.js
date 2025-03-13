document.addEventListener('DOMContentLoaded', function() {
    // State variables for pagination
    let currentPage = 0;
    let totalPages = 0;
    let pageSize = 9;
    let currentSort = "startTime,desc";
    let currentStatus = "ALL";
    let currentCategory = "";

    // Navigation and section visibility
    const upcomingEventsLink = document.getElementById('upcoming-events-link');
    const allEventsLink = document.getElementById('all-events-link');
    const addEventLink = document.getElementById('add-event-link');
    const searchEventsLink = document.getElementById('search-events-link');

    const upcomingEventsSection = document.getElementById('upcoming-events-section');
    const allEventsSection = document.getElementById('all-events-section');
    const addEventSection = document.getElementById('add-event-section');
    const searchEventsSection = document.getElementById('search-events-section');

    // Event listeners for navigation
    upcomingEventsLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(upcomingEventsSection, upcomingEventsLink);
        loadUpcomingEvents();
    });

    allEventsLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(allEventsSection, allEventsLink);
        loadAllEvents(0);
    });

    addEventLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(addEventSection, addEventLink);
        resetEventForm();
        document.getElementById('event-form-title').textContent = 'Add New Event';
        document.getElementById('save-event-btn').textContent = 'Save Event';
        loadCategories();
    });

    searchEventsLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(searchEventsSection, searchEventsLink);
        loadCategories();
    });

    // Helper function to show active section
    function showSection(section, link) {
        // Hide all sections
        upcomingEventsSection.classList.add('hidden');
        allEventsSection.classList.add('hidden');
        addEventSection.classList.add('hidden');
        searchEventsSection.classList.add('hidden');

        // Remove active class from all links
        upcomingEventsLink.classList.remove('active');
        allEventsLink.classList.remove('active');
        addEventLink.classList.remove('active');
        searchEventsLink.classList.remove('active');

        // Show selected section and mark link as active
        section.classList.remove('hidden');
        link.classList.add('active');
    }

    // Reset event form
    function resetEventForm() {
        document.getElementById('event-form').reset();
        document.getElementById('event-id').value = '';
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('image-preview').style.display = 'none';
    }

    // Load categories for dropdowns
    function loadCategories() {
        fetch('/api/events/categories')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                return response.json();
            })
            .then(categories => {
                populateCategoryDropdowns(categories);
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                alert('Failed to load event categories. Please try refreshing the page.');
            });
    }

    function populateCategoryDropdowns(categories) {
        // Arrays of dropdown elements
        const categorySelects = [
            document.getElementById('category'),
            document.getElementById('search-category'),
            document.getElementById('category-filter'),
            document.getElementById('all-category-filter')
        ];

        // Process each dropdown
        categorySelects.forEach(select => {
            if (!select) return;

            // Clear existing options except for the first one in search/filter dropdowns
            if (select.id === 'category') {
                select.innerHTML = '';
            } else {
                select.innerHTML = '<option value="">All Categories</option>';
            }

            // Add category options
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = formatCategoryName(category);
                select.appendChild(option);
            });
        });
    }

    // Helper function to format category names
    function formatCategoryName(category) {
        return category.toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Load upcoming events
    function loadUpcomingEvents() {
        const eventsContainer = document.getElementById('events-list');
        eventsContainer.innerHTML = '<div class="loading">Loading events...</div>';

        fetch('/api/events/upcoming')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch upcoming events');
                }
                return response.json();
            })
            .then(events => {
                displayEvents(events, eventsContainer, true);
            })
            .catch(error => {
                console.error('Error loading upcoming events:', error);
                eventsContainer.innerHTML = '<div class="error">Failed to load events. Please try again later.</div>';
            });
    }

    // Load all events with pagination
    function loadAllEvents(page) {
        const eventsContainer = document.getElementById('all-events-list');
        eventsContainer.innerHTML = '<div class="loading">Loading events...</div>';

        // Build the URL with pagination and sorting parameters
        let url = `/api/events/page?page=${page}&size=${pageSize}&sort=${currentSort}`;

        // Add status filter if not ALL
        if (currentStatus !== "ALL") {
            url += `&status=${currentStatus}`;
        }

        // Add category filter if selected
        if (currentCategory) {
            url += `&category=${currentCategory}`;
        }

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                return response.json();
            })
            .then(data => {
                // Update pagination state
                currentPage = data.number;
                totalPages = data.totalPages;
                updatePaginationControls();

                // Display events
                displayEvents(data.content, eventsContainer, true);
            })
            .catch(error => {
                console.error('Error loading events:', error);
                eventsContainer.innerHTML = '<div class="error">Failed to load events. Please try again later.</div>';
            });
    }

    // Update pagination controls
    function updatePaginationControls() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageIndicators = document.getElementById('page-indicators');

        // Disable/enable previous and next buttons
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === totalPages - 1;

        // Generate page indicators
        pageIndicators.innerHTML = '';

        // Logic for showing page numbers with ellipsis for large page counts
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        // Adjust startPage if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        // Always show first page
        if (startPage > 0) {
            addPageIndicator(0, "First");
            if (startPage > 1) {
                // Add ellipsis if there's a gap
                const ellipsis = document.createElement('div');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageIndicators.appendChild(ellipsis);
            }
        }

        // Add visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            addPageIndicator(i);
        }

        // Always show last page
        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                // Add ellipsis if there's a gap
                const ellipsis = document.createElement('div');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageIndicators.appendChild(ellipsis);
            }
            addPageIndicator(totalPages - 1, "Last");
        }
    }

    // Add a page indicator button
    function addPageIndicator(pageNum, label) {
        const pageIndicators = document.getElementById('page-indicators');
        const indicator = document.createElement('div');
        indicator.className = 'page-indicator';
        if (pageNum === currentPage) {
            indicator.classList.add('active');
        }

        // Add special classes for first and last pages for responsive design
        if (label === "First") indicator.classList.add('first-page');
        if (label === "Last") indicator.classList.add('last-page');

        indicator.textContent = label || (pageNum + 1);
        indicator.addEventListener('click', () => {
            if (pageNum !== currentPage) {
                loadAllEvents(pageNum);
            }
        });

        pageIndicators.appendChild(indicator);
    }

    // Display events in a container
    function displayEvents(events, container, showActions = false) {
        container.innerHTML = '';

        if (!events || events.length === 0) {
            container.innerHTML = '<div class="no-events">No events found matching your criteria.</div>';
            return;
        }

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.dataset.eventId = event.id;

            const eventImage = event.imageUrl ? event.imageUrl : 'https://via.placeholder.com/300x180?text=No+Image';

            const startDate = new Date(event.startTime);
            const currentDate = new Date();
            const isPast = startDate < currentDate;

            const formattedDate = startDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });

            const formattedTime = startDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${eventImage}" alt="${event.name}">
                    ${isPast ?
                '<span class="event-status-badge status-past">Past</span>' :
                '<span class="event-status-badge status-upcoming">Upcoming</span>'
            }
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.name}</h3>
                    <div class="event-details">
                        <span><i class="far fa-calendar-alt"></i> ${formattedDate} · ${formattedTime}</span>
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}, ${event.city}</span>
                    </div>
                    <div>
                        <span class="event-category">${formatCategoryName(event.category)}</span>
                    </div>
                </div>
            `;

            // Add click event to view event details
            eventCard.addEventListener('click', function(e) {
                // Check if the click was on an action button or its parent
                if (e.target.closest('.event-actions')) {
                    return; // Don't open modal for action button clicks
                }
                showEventDetails(event.id);
            });

            container.appendChild(eventCard);
        });
    }

    // Show event details in modal
    function showEventDetails(eventId) {
        fetch(`/api/events/${eventId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch event details');
                }
                return response.json();
            })
            .then(event => {
                const modal = document.getElementById('event-modal');
                const eventDetails = document.getElementById('event-details');
                const actionButtons = document.getElementById('event-actions');

                const startDate = new Date(event.startTime);
                const endDate = new Date(event.endTime);
                const currentDate = new Date();
                const isPast = startDate < currentDate;

                const formattedStartDate = startDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const formattedStartTime = startDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const formattedEndTime = endDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const eventImage = event.imageUrl ? event.imageUrl : 'https://via.placeholder.com/600x400?text=No+Image';

                eventDetails.innerHTML = `
                    <div class="event-details-content">
                        <div class="event-details-image">
                            <img src="${eventImage}" alt="${event.name}">
                            ${isPast ?
                    '<span class="event-status-badge status-past">Past</span>' :
                    '<span class="event-status-badge status-upcoming">Upcoming</span>'
                }
                        </div>
                        <div class="event-details-info">
                            <h2>${event.name}</h2>
                            
                            <p>
                                <span class="detail-label">Date:</span>
                                <span class="detail-value">${formattedStartDate}</span>
                            </p>
                            
                            <p>
                                <span class="detail-label">Time:</span>
                                <span class="detail-value">${formattedStartTime} - ${formattedEndTime}</span>
                            </p>
                            
                            <p>
                                <span class="detail-label">Location:</span>
                                <span class="detail-value">${event.location}</span>
                            </p>
                            
                            <p>
                                <span class="detail-label">Address:</span>
                                <span class="detail-value">${event.city}, ${event.state}, ${event.country}</span>
                            </p>
                            
                            <p>
                                <span class="detail-label">Category:</span>
                                <span class="detail-value">${formatCategoryName(event.category)}</span>
                            </p>
                            
                            <p>
                                <span class="detail-label">Capacity:</span>
                                <span class="detail-value">${event.capacity} people</span>
                            </p>
                            
                            ${event.organizerName ? `
                            <p>
                                <span class="detail-label">Organizer:</span>
                                <span class="detail-value">${event.organizerName}</span>
                            </p>
                            ` : ''}
                            
                            ${event.organizerContact ? `
                            <p>
                                <span class="detail-label">Contact:</span>
                                <span class="detail-value">${event.organizerContact}</span>
                            </p>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${event.description ? `
                    <div class="event-description">
                        <h3>About this event</h3>
                        <p>${event.description}</p>
                    </div>
                    ` : ''}
                `;

                // Add action buttons
                actionButtons.innerHTML = `
                    <button class="btn-primary" id="edit-event-btn">
                        <i class="fas fa-edit"></i> Edit Event
                    </button>
                    <button class="btn-danger" id="delete-event-btn">
                        <i class="fas fa-trash-alt"></i> Delete Event
                    </button>
                `;

                // Edit event button
                document.getElementById('edit-event-btn').addEventListener('click', function() {
                    modal.style.display = 'none';
                    showEditEventForm(event);
                });

                // Delete event button
                document.getElementById('delete-event-btn').addEventListener('click', function() {
                    showDeleteConfirmation(event.id, event.name);
                });

                modal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error loading event details:', error);
                alert('Failed to load event details. Please try again later.');
            });
    }

    // Show edit event form
    function showEditEventForm(event) {
        // Navigate to the add event section
        showSection(addEventSection, addEventLink);

        // Update form title
        document.getElementById('event-form-title').textContent = 'Edit Event';
        document.getElementById('save-event-btn').textContent = 'Update Event';

        // Load categories
        loadCategories();

        // Fill the form with event data
        document.getElementById('event-id').value = event.id;
        document.getElementById('name').value = event.name;
        document.getElementById('description').value = event.description || '';

        // Format date-time inputs
        const startDateTime = new Date(event.startTime);
        const endDateTime = new Date(event.endTime);

        document.getElementById('startTime').value = formatDateTimeForInput(startDateTime);
        document.getElementById('endTime').value = formatDateTimeForInput(endDateTime);

        document.getElementById('location').value = event.location;
        document.getElementById('city').value = event.city;
        document.getElementById('state').value = event.state;
        document.getElementById('country').value = event.country;

        document.getElementById('latitude').value = event.latitude || '';
        document.getElementById('longitude').value = event.longitude || '';
        document.getElementById('capacity').value = event.capacity;

        // Set the category (will be available after loadCategories completes)
        setTimeout(() => {
            document.getElementById('category').value = event.category;
        }, 300);

        document.getElementById('organizerName').value = event.organizerName || '';
        document.getElementById('organizerContact').value = event.organizerContact || '';

        // Show image preview if available
        const imagePreview = document.getElementById('image-preview');
        if (event.imageUrl) {
            imagePreview.innerHTML = `<img src="${event.imageUrl}" alt="Preview">`;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.innerHTML = '';
            imagePreview.style.display = 'none';
        }
    }

    // Format date for datetime-local input
    function formatDateTimeForInput(date) {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16);
    }

    // Show delete confirmation modal
    function showDeleteConfirmation(eventId, eventName) {
        const confirmModal = document.getElementById('confirm-modal');
        const confirmMessage = document.getElementById('confirm-message');

        confirmMessage.textContent = `Are you sure you want to delete the event "${eventName}"? This action cannot be undone.`;

        confirmModal.style.display = 'block';

        // Set up the confirmation button
        document.getElementById('confirm-yes').onclick = function() {
            deleteEvent(eventId);
            confirmModal.style.display = 'none';
        };

        // Set up the cancel button
        document.getElementById('confirm-no').onclick = function() {
            confirmModal.style.display = 'none';
        };
    }

    // Delete an event
    function deleteEvent(eventId) {
        fetch(`/api/events/${eventId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete event');
                }

                // Close the event modal if open
                document.getElementById('event-modal').style.display = 'none';

                // Reload the current page/section
                alert('Event deleted successfully!');

                // Refresh the current active section
                if (upcomingEventsSection.classList.contains('hidden') === false) {
                    loadUpcomingEvents();
                } else if (allEventsSection.classList.contains('hidden') === false) {
                    loadAllEvents(currentPage);
                } else if (searchEventsSection.classList.contains('hidden') === false) {
                    // If in search section, just display a message instead of clearing results
                    alert('Event deleted. Refresh your search to see updated results.');
                }
            })
            .catch(error => {
                console.error('Error deleting event:', error);
                alert('Failed to delete event. Please try again later.');
            });
    }

    // Close modals when clicking the X button
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modals when clicking outside the modal content
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Image preview for file input
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');

    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '';
                imagePreview.style.display = 'none';
            }
        });
    }

    // Handle event form submission with file upload
    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const eventId = document.getElementById('event-id').value;
        const isUpdate = eventId !== '';

        // Convert datetime to ISO format
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');

        if (startTimeInput.value) {
            const startDate = new Date(startTimeInput.value);
            formData.set('startTime', startDate.toISOString());
        }

        if (endTimeInput.value) {
            const endDate = new Date(endTimeInput.value);
            formData.set('endTime', endDate.toISOString());
        }

        // Different endpoint for create vs update
        const url = isUpdate
            ? `/api/events/${eventId}/with-image`
            : '/api/events/with-image';

        const method = isUpdate ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to ${isUpdate ? 'update' : 'create'} event`);
                }
                return response.json();
            })
            .then(data => {
                alert(`Event ${isUpdate ? 'updated' : 'created'} successfully!`);
                resetEventForm();

                // Return to appropriate list view
                if (isUpdate) {
                    // If we're editing, go back to the same section we were viewing
                    if (allEventsSection.classList.contains('hidden') === false) {
                        showSection(allEventsSection, allEventsLink);
                        loadAllEvents(currentPage);
                    } else {
                        showSection(upcomingEventsSection, upcomingEventsLink);
                        loadUpcomingEvents();
                    }
                } else {
                    // For new events, go to upcoming events
                    showSection(upcomingEventsSection, upcomingEventsLink);
                    loadUpcomingEvents();
                }
            })
            .catch(error => {
                console.error(`Error ${isUpdate ? 'updating' : 'creating'} event:`, error);
                alert(`Failed to ${isUpdate ? 'update' : 'create'} event. Please try again later.`);
            });
    });

    // Cancel button handler (works for both add and edit)
    document.getElementById('cancel-event-btn').addEventListener('click', function() {
        resetEventForm();

        // Return to appropriate list view
        if (allEventsSection.classList.contains('hidden') === false) {
            // If we came from all events, go back there
            showSection(allEventsSection, allEventsLink);
        } else {
            // Default to upcoming events
            showSection(upcomingEventsSection, upcomingEventsLink);
        }
    });

    // Filter events
    document.getElementById('filter-button').addEventListener('click', function() {
        const category = document.getElementById('category-filter').value;
        const location = document.getElementById('location-filter').value;

        let url = '/api/events/search?';

        if (location) {
            // Simple parsing for location input
            const locationParts = location.split(',').map(part => part.trim());

            if (locationParts.length >= 1) url += `city=${encodeURIComponent(locationParts[0])}&`;
            if (locationParts.length >= 2) url += `state=${encodeURIComponent(locationParts[1])}&`;
            if (locationParts.length >= 3) url += `country=${encodeURIComponent(locationParts[2])}&`;
        }

        if (category) {
            url += `category=${encodeURIComponent(category)}`;
        }

        // Remove trailing & or ? if present
        url = url.replace(/[&?]$/, '');

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch filtered events');
                }
                return response.json();
            })
            .then(events => {
                const eventsContainer = document.getElementById('events-list');
                displayEvents(events, eventsContainer, true);
            })
            .catch(error => {
                console.error('Error filtering events:', error);
                alert('Failed to filter events. Please try again later.');
            });
    });

    // All Events section filters and pagination
    document.getElementById('all-category-filter').addEventListener('change', function() {
        currentCategory = this.value;
        currentPage = 0; // Reset to first page
        loadAllEvents(0);
    });

    document.getElementById('event-status-filter').addEventListener('change', function() {
        currentStatus = this.value;
        currentPage = 0; // Reset to first page
        loadAllEvents(0);
    });

    document.getElementById('sort-by').addEventListener('change', function() {
        currentSort = this.value;
        currentPage = 0; // Reset to first page
        loadAllEvents(0);
    });

    // Pagination buttons
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 0) {
            loadAllEvents(currentPage - 1);
        }
    });

    document.getElementById('next-page').addEventListener('click', function() {
        if (currentPage < totalPages - 1) {
            loadAllEvents(currentPage + 1);
        }
    });

    // Handle location search form submission
    document.getElementById('location-search-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const city = document.getElementById('search-city').value;
        const state = document.getElementById('search-state').value;
        const country = document.getElementById('search-country').value;
        const category = document.getElementById('search-category').value;

        let url = '/api/events/search?';

        if (city) url += `city=${encodeURIComponent(city)}&`;
        if (state) url += `state=${encodeURIComponent(state)}&`;
        if (country) url += `country=${encodeURIComponent(country)}&`;
        if (category) url += `category=${encodeURIComponent(category)}`;

        // Remove trailing & or ? if present
        url = url.replace(/[&?]$/, '');

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to search events');
                }
                return response.json();
            })
            .then(events => {
                const resultsContainer = document.getElementById('search-results-list');
                displayEvents(events, resultsContainer, true);
            })
            .catch(error => {
                console.error('Error searching events:', error);
                alert('Failed to search events. Please try again later.');
            });
    });

    // Handle radius search form submission
    document.getElementById('radius-search-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const latitude = parseFloat(document.getElementById('search-latitude').value);
        const longitude = parseFloat(document.getElementById('search-longitude').value);
        const radiusInKm = parseFloat(document.getElementById('search-radius').value);

        const searchData = {
            latitude: latitude,
            longitude: longitude,
            radiusInKm: radiusInKm
        };

        fetch('/api/events/search/radius', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to search events by radius');
                }
                return response.json();
            })
            .then(events => {
                const resultsContainer = document.getElementById('search-results-list');
                displayEvents(events, resultsContainer, true);
            })
            .catch(error => {
                console.error('Error searching events by radius:', error);
                alert('Failed to search events by radius. Please try again later.');
            });
    });

    // Use current location button
    document.getElementById('use-current-location').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    document.getElementById('search-latitude').value = position.coords.latitude;
                    document.getElementById('search-longitude').value = position.coords.longitude;
                },
                function(error) {
                    console.error('Error getting location:', error);
                    alert('Failed to get your current location. Please try again or enter coordinates manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    });

    // Load upcoming events when the page loads
    loadAllEvents();
    loadUpcomingEvents();
    loadCategories();
});