package com.giftedlabs.eventfinder.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.giftedlabs.eventfinder.model.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "organiser")
public class Organizer extends User{

    private String organizationName;
    private String logoUrl;
    private VerificationStatus verificationStatus;

    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "organizer_id")
    @JsonManagedReference
    private List<Event> events;
}
