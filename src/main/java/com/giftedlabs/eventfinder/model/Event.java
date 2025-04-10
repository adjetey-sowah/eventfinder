package com.giftedlabs.eventfinder.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.giftedlabs.eventfinder.model.enums.EventCategory;
import com.giftedlabs.eventfinder.model.enums.EventState;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Column(length = 512)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    @JsonBackReference
    private Organizer organizer;

    @NotNull(message = "Event capacity is required")
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    private EventCategory category;

    @Enumerated(EnumType.ORDINAL)
    private EventState eventState;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Registration> participants = new ArrayList<>();

    private Boolean isTicketRequired;

}