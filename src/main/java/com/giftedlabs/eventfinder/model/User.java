package com.giftedlabs.eventfinder.model;

import com.giftedlabs.eventfinder.model.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.NaturalId;


@Data
@Inheritance(strategy = InheritanceType.JOINED)
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
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

    private String password;
}
