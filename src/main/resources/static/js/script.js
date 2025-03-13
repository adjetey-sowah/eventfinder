document.addEventListener('DOMContentLoaded', function() {
    // Navigation and section visibility
    const upcomingEventsLink = document.getElementById('upcoming-events-link');
    const addEventLink = document.getElementById('add-event-link');
    const searchEventsLink = document.getElementById('search-events-link');

    const upcomingEventsSection = document.getElementById('upcoming-events-section');
    const addEventSection = document.getElementById('add-event-section');
    const searchEventsSection = document.getElementById('search-events-section');

    // Event listeners for navigation
    upcomingEventsLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(upcomingEventsSection, upcomingEventsLink);
        loadUpcomingEvents();
    });

    addEventLink.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(addEventSection, addEventLink);
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
        addEventSection.classList.add('hidden');
        searchEventsSection.classList.add('hidden');

        // Remove active class from all links
        upcomingEventsLink.classList.remove('active');
        addEventLink.classList.remove('active');
        searchEventsLink.classList.remove('active');

        // Show selected section and mark link as active
        section.classList.remove('hidden');
        link.classList.add('active');
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
                // Populate category dropdown in add event form
                const categorySelect = document.getElementById('category');
                categorySelect.innerHTML = '';

                // Populate search category dropdown
                const searchCategorySelect = document.getElementById('search-category');
                searchCategorySelect.innerHTML = '<option value="">All Categories</option>';

                // Populate filter category dropdown
                const categoryFilter = document.getElementById('category-filter');
                categoryFilter.innerHTML = '<option value="">All Categories</option>';

                categories.forEach(category => {
                    // Add event form dropdown
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = formatCategoryName(category);
                    categorySelect.appendChild(option);

                    // Search form dropdown
                    const searchOption = document.createElement('option');
                    searchOption.value = category;
                    searchOption.textContent = formatCategoryName(category);
                    searchCategorySelect.appendChild(searchOption);

                    // Filter dropdown
                    const filterOption = document.createElement('option');
                    filterOption.value = category;
                    filterOption.textContent = formatCategoryName(category);
                    categoryFilter.appendChild(filterOption);
                });
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                alert('Failed to load event categories. Please try refreshing the page.');
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
                displayEvents(events, eventsContainer);
            })
            .catch(error => {
                console.error('Error loading upcoming events:', error);
                eventsContainer.innerHTML = '<div class="error">Failed to load events. Please try again later.</div>';
            });
    }

    // Display events in a container
    function displayEvents(events, container) {
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<div class="no-events">No events found matching your criteria.</div>';
            return;
        }

        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.dataset.eventId = event.id;

            const eventImage = event.imageUrl ? event.imageUrl : 'https://via.placeholder.com/300x180?text=No+Image';

            const startDate = new Date(event.startTime);
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
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.name}</h3>
                    <div class="event-details">
                        <span>${formattedDate} · ${formattedTime}</span>
                    </div>
                    <div class="event-location">
                        <span>${event.location}, ${event.city}</span>
                    </div>
                    <div>
                        <span class="event-category">${formatCategoryName(event.category)}</span>
                    </div>
                </div>
            `;

            // Add click event to view event details
            eventCard.addEventListener('click', function() {
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

                const startDate = new Date(event.startTime);
                const endDate = new Date(event.endTime);

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

                modal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error loading event details:', error);
                alert('Failed to load event details. Please try again later.');
            });
    }

    // Close modal when clicking the X button
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('event-modal').style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('event-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
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

        fetch('/api/events/with-image', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create event');
                }
                return response.json();
            })
            .then(data => {
                alert('Event created successfully!');
                document.getElementById('event-form').reset();
                imagePreview.innerHTML = '';
                imagePreview.style.display = 'none';
                showSection(upcomingEventsSection, upcomingEventsLink);
                loadUpcomingEvents();
            })
            .catch(error => {
                console.error('Error creating event:', error);
                alert('Failed to create event. Please try again later.');
            });
    });

    // Cancel add event button
    document.getElementById('cancel-add-event').addEventListener('click', function() {
        document.getElementById('event-form').reset();
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
            imagePreview.style.display = 'none';
        }
        showSection(upcomingEventsSection, upcomingEventsLink);
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
                displayEvents(events, eventsContainer);
            })
            .catch(error => {
                console.error('Error filtering events:', error);
                alert('Failed to filter events. Please try again later.');
            });
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
                displayEvents(events, resultsContainer);
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
                displayEvents(events, resultsContainer);
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
    loadUpcomingEvents();
    loadCategories();
});