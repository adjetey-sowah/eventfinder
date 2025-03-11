package com.giftedlabs.eventfinder.controller;


import com.giftedlabs.eventfinder.dto.EventDTO;
import com.giftedlabs.eventfinder.dto.LocationSearchDTO;
import com.giftedlabs.eventfinder.model.EventCategory;
import com.giftedlabs.eventfinder.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@Valid @RequestBody EventDTO eventDTO) {
        return new ResponseEntity<>(eventService.createEvent(eventDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDTO eventDTO) {
        return ResponseEntity.ok(eventService.updateEvent(id, eventDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDTO>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/location")
    public ResponseEntity<List<EventDTO>> getEventsByLocation(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String country) {
        return ResponseEntity.ok(eventService.getEventsByLocation(city, state, country));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<EventDTO>> getEventsByCategory(@PathVariable EventCategory category) {
        return ResponseEntity.ok(eventService.getEventsByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventDTO>> searchUpcomingEventsByFilter(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) EventCategory category) {
        return ResponseEntity.ok(eventService.searchUpcomingEventsByFilter(city, state, country, category));
    }

    @PostMapping("/search/radius")
    public ResponseEntity<List<EventDTO>> searchEventsByRadius(@RequestBody LocationSearchDTO searchDTO) {
        return ResponseEntity.ok(eventService.searchEventsByRadius(searchDTO));
    }

    @GetMapping("/categories")
    public ResponseEntity<EventCategory[]> getAllCategories() {
        return ResponseEntity.ok(EventCategory.values());
    }
}