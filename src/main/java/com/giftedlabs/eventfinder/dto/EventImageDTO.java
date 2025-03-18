package com.giftedlabs.eventfinder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventImageDTO {
    private String imageUrl;    // Store the S3 OBJECT key, not the URL

}
