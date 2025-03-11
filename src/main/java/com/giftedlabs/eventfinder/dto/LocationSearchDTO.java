package com.giftedlabs.eventfinder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationSearchDTO {
    private String city;
    private String state;
    private String country;
    private Double latitude;
    private Double longitude;
    private Double radiusInKm;
}