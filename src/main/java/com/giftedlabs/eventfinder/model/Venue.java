package com.giftedlabs.eventfinder.model;

import com.giftedlabs.eventfinder.model.embeddables.Address;
import com.giftedlabs.eventfinder.model.embeddables.Geolocation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "venues")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Embedded
    private Address address;

    @Embedded
    private Geolocation geolocation;

    private String name;

    private Integer popularity;
}