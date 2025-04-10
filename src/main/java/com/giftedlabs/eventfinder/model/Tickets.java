package com.giftedlabs.eventfinder.model;

import com.giftedlabs.eventfinder.model.enums.TicketStatus;
import com.giftedlabs.eventfinder.model.enums.TicketType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "tickets")
public class Tickets{

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private TicketType ticketType;

    private BigDecimal price;

    private LocalDateTime purchaseTime;

    private TicketStatus status;

    private String uniqueCode;



}
