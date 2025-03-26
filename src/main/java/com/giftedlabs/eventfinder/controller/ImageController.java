package com.giftedlabs.eventfinder.controller;




import com.giftedlabs.eventfinder.dto.EventImageDTO;
import com.giftedlabs.eventfinder.service.EventService;
import com.giftedlabs.eventfinder.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping(value = "/api/images", headers = "API-VERSION=1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ImageController {

    private final S3Service s3Service;
    private final EventService eventService;

    @PostMapping("/upload")
    public ResponseEntity<EventImageDTO> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = s3Service.uploadFile(file);
        return ResponseEntity.ok(new EventImageDTO(imageUrl));
    }

    @PostMapping("/events/{eventId}")
    public ResponseEntity<EventImageDTO> uploadEventImage(
            @PathVariable Long eventId,
            @RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = eventService.uploadEventImage(eventId, file);
        return ResponseEntity.ok(new EventImageDTO(imageUrl));
    }
}