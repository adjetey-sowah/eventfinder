package com.giftedlabs.eventfinder.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.NaturalId;


@Data
@Inheritance(strategy = InheritanceType.JOINED)
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @Email
    @NaturalId(mutable = false)
    private String email;

    @NaturalId(mutable = false)
    private String phoneNumber;

    @Enumerated(EnumType.ORDINAL)
    private Role role;

    private String profilePicture;
}
