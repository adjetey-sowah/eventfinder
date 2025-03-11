package com.giftedlabs.eventfinder.service;


import com.giftedlabs.eventfinder.dto.EventDTO;
import com.giftedlabs.eventfinder.dto.LocationSearchDTO;
import com.giftedlabs.eventfinder.model.Event;
import com.giftedlabs.eventfinder.model.EventCategory;
import com.giftedlabs.eventfinder.repository.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
        return convertToDTO(event);
    }

    public EventDTO createEvent(EventDTO eventDTO) {
        Event event = convertToEntity(eventDTO);
        event.setIsActive(true);
        Event savedEvent = eventRepository.save(event);
        return convertToDTO(savedEvent);
    }

    public EventDTO updateEvent(Long id, EventDTO eventDTO) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Event not found with id: " + id);
        }

        Event event = convertToEntity(eventDTO);
        event.setId(id);
        Event updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    public List<EventDTO> getUpcomingEvents() {
        return eventRepository.findByStartTimeAfter(LocalDateTime.now())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByLocation(String city, String state, String country) {
        List<Event> events;

        if (city != null && state != null && country != null) {
            events = eventRepository.findByCityAndStateAndCountry(city, state, country);
        } else if (state != null && country != null) {
            events = eventRepository.findByStateAndCountry(state, country);
        } else if (city != null) {
            events = eventRepository.findByCity(city);
        } else {
            events = eventRepository.findAll();
        }

        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByCategory(EventCategory category) {
        return eventRepository.findByCategory(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> searchUpcomingEventsByFilter(String city, String state,
                                                       String country, EventCategory category) {
        LocalDateTime now = LocalDateTime.now();

        return eventRepository.findUpcomingEventsByLocationAndCategory(now, city, state, country, category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> searchEventsByRadius(LocationSearchDTO searchDTO) {
        LocalDateTime now = LocalDateTime.now();

        return eventRepository.findEventsWithinRadius(
                        searchDTO.getLatitude(),
                        searchDTO.getLongitude(),
                        searchDTO.getRadiusInKm(),
                        now)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Helper methods to convert between Entity and DTO
    private EventDTO convertToDTO(Event event) {
        EventDTO eventDTO = new EventDTO();
        BeanUtils.copyProperties(event, eventDTO);
        return eventDTO;
    }

    private Event convertToEntity(EventDTO eventDTO) {
        Event event = new Event();
        BeanUtils.copyProperties(eventDTO, event);
        return event;
    }
}