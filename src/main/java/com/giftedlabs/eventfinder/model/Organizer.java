package com.giftedlabs.eventfinder.model;

import com.giftedlabs.eventfinder.model.enums.VerificationStatus;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;


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
}
