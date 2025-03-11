package com.giftedlabs.eventfinder.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Event name is required")
    private String name;

    @Column(length = 2000)
    private String description;

    @NotNull(message = "Event start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "Event end time is required")
    private LocalDateTime endTime;

    @NotBlank(message = "Event location is required")
    private String location;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    private String imageUrl;

    private String organizerName;

    private String organizerContact;

    @NotNull(message = "Event capacity is required")
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    private EventCategory category;

    private Double latitude;

    private Double longitude;

    private Boolean isActive;
}