package com.giftedlabs.eventfinder.controller;


import com.giftedlabs.eventfinder.dto.EventDTO;
import com.giftedlabs.eventfinder.dto.LocationSearchDTO;
import com.giftedlabs.eventfinder.model.EventCategory;
import com.giftedlabs.eventfinder.service.EventService;
import com.giftedlabs.eventfinder.service.S3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;
    private final S3Service s3Service;

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

    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EventDTO> createEventWithImage(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("startTime") String startTime,
            @RequestParam("endTime") String endTime,
            @RequestParam("location") String location,
            @RequestParam("city") String city,
            @RequestParam("state") String state,
            @RequestParam("country") String country,
            @RequestParam("category") EventCategory category,
            @RequestParam("capacity") Integer capacity,
            @RequestParam(value = "organizerName", required = false) String organizerName,
            @RequestParam(value = "organizerContact", required = false) String organizerContact,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        EventDTO eventDTO = new EventDTO();
        eventDTO.setName(name);
        eventDTO.setDescription(description);
        eventDTO.setStartTime(Instant.parse(startTime).atZone(ZoneId.systemDefault()).toLocalDateTime());
        eventDTO.setEndTime(Instant.parse(endTime).atZone(ZoneId.systemDefault()).toLocalDateTime());
        eventDTO.setLocation(location);
        eventDTO.setCity(city);
        eventDTO.setState(state);
        eventDTO.setCountry(country);
        eventDTO.setCategory(category);
        eventDTO.setCapacity(capacity);
        eventDTO.setOrganizerName(organizerName);
        eventDTO.setOrganizerContact(organizerContact);
        eventDTO.setLatitude(latitude);
        eventDTO.setLongitude(longitude);
        eventDTO.setIsActive(true);

        // Upload image to S3 if provided
        if (image != null && !image.isEmpty()) {
            String imageUrl = s3Service.uploadFile(image);
            eventDTO.setImageUrl(imageUrl);
        }

        return new ResponseEntity<>(eventService.createEvent(eventDTO), HttpStatus.CREATED);
    }



    @PutMapping("/{id}")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDTO eventDTO) {
        return ResponseEntity.ok(eventService.updateEvent(id, eventDTO));
    }


    @PutMapping(value = "/{id}/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EventDTO> updateEventWithImage(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("startTime") String startTime,
            @RequestParam("endTime") String endTime,
            @RequestParam("location") String location,
            @RequestParam("city") String city,
            @RequestParam("state") String state,
            @RequestParam("country") String country,
            @RequestParam("category") EventCategory category,
            @RequestParam("capacity") Integer capacity,
            @RequestParam(value = "organizerName", required = false) String organizerName,
            @RequestParam(value = "organizerContact", required = false) String organizerContact,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        EventDTO eventDTO = new EventDTO();
        eventDTO.setName(name);
        eventDTO.setDescription(description);
        eventDTO.setStartTime(LocalDateTime.parse(startTime));
        eventDTO.setEndTime(LocalDateTime.parse(endTime));
        eventDTO.setLocation(location);
        eventDTO.setCity(city);
        eventDTO.setState(state);
        eventDTO.setCountry(country);
        eventDTO.setCategory(category);
        eventDTO.setCapacity(capacity);
        eventDTO.setOrganizerName(organizerName);
        eventDTO.setOrganizerContact(organizerContact);
        eventDTO.setLatitude(latitude);
        eventDTO.setLongitude(longitude);
        eventDTO.setIsActive(true);

        // Upload image to S3 if provided
        if (image != null && !image.isEmpty()) {
            String imageUrl = s3Service.uploadFile(image);
            eventDTO.setImageUrl(imageUrl);
        }

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