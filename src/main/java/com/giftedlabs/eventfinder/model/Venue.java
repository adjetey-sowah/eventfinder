package com.giftedlabs.eventfinder.model;

import com.giftedlabs.eventfinder.model.embeddables.Address;
import com.giftedlabs.eventfinder.model.embeddables.Geolocation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The {@code Venue} entity represents a physical location where events are held.
 *
 * <p>This class is designed as an entity (as opposed to an embeddable) because venues can be shared
 * across multiple events and event organizers. Making Venue an entity allows for:
 * <ul>
 *   <li><b>Reusability:</b> Popular venues can be centrally maintained and referenced by many events,
 *       reducing data duplication.</li>
 *   <li><b>Consistency:</b> Updating a venue's information (e.g., address or geolocation) is easier
 *       because the change propagates to all associated events.</li>
 *   <li><b>User Convenience:</b> Event organizers can select a popular venue from a searchable list.
 *       Once selected, the venue’s details (address, geolocation, and name) are auto-populated, streamlining
 *       the event creation process.</li>
 *   <li><b>Extensibility:</b> The entity can later be expanded with additional attributes like reviews,
 *       capacity, or pricing without changing the Event entity. This keeps the model flexible for future
 *       enhancements.</li>
 * </ul>
 * </p>
 *
 * <p>The {@code Venue} entity uses embedded objects for address and geolocation details. This design
 * encapsulates related data in a clean, maintainable way while avoiding unnecessary table joins for these
 * value objects. In our relational schema, Venue is stored in its own table and is related to Event via
 * a foreign key. This approach strikes a balance between performance and data integrity.</p>
 *
 * <p>The recommended use-case is as follows:
 * <ul>
 *   <li>If an event organizer selects a popular, pre-existing venue from the list, the system references
 *       the existing record and auto-fills the venue details on the Event form.</li>
 *   <li>If a venue is not in the popular list, the organizer can create a custom venue entry by providing
 *       all necessary details.</li>
 * </ul>
 * </p>
 *
 * <p><b>Example Usage:</b>
 * <pre>{@code
 * Venue venue = Venue.builder()
 *     .name("Downtown Convention Center")
 *     .address(new Address("123 Main St", "Metropolis", "StateName", "CountryName", "12345"))
 *     .geolocation(new Geolocation(12.345678, 98.765432))
 *     .build();
 * }</pre>
 * </p>
 *
 * @author
 *   Julius Adjetey Sowah
 * @version 1.0
 */


@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "venues")
public class Venue {

    /**
     * The unique identifier for the venue.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The address of the venue encapsulated as an embeddable {@code Address} object.
     * Embedding the address ensures that venue location details are stored as part of the
     * venue record for better performance and easier maintenance.
     */
    @Embedded
    private Address address;

    /**
     * The geolocation (latitude and longitude) of the venue encapsulated as an embeddable
     * {@code Geolocation} object. This field can be used for mapping or location-based searches.
     */
    @Embedded
    private Geolocation geolocation;

    /**
     * The name of the venue. This field helps the event organizer identify the location easily.
     */
    private String name;

    /**
     * Optional field for tracking the popularity or usage metrics of the venue. This field
     * can assist in auto-fill features by ranking venues based on how frequently they are used.
     */
    private Integer popularity;
}