package com.giftedlabs.eventfinder.repository;


import com.giftedlabs.eventfinder.model.Event;
import com.giftedlabs.eventfinder.model.EventCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCity(String city);

    List<Event> findByStateAndCountry(String state, String country);

    List<Event> findByCityAndStateAndCountry(String city, String state, String country);

    List<Event> findByStartTimeAfter(LocalDateTime dateTime);

    List<Event> findByCategory(EventCategory category);

    @Query("SELECT e FROM Event e WHERE " +
            "e.startTime >= :startDate AND " +
            "(:city IS NULL OR e.city = :city) AND " +
            "(:state IS NULL OR e.state = :state) AND " +
            "(:country IS NULL OR e.country = :country) AND " +
            "(:category IS NULL OR e.category = :category) AND " +
            "e.isActive = true " +
            "ORDER BY e.startTime ASC")
    List<Event> findUpcomingEventsByLocationAndCategory(
            @Param("startDate") LocalDateTime startDate,
            @Param("city") String city,
            @Param("state") String state,
            @Param("country") String country,
            @Param("category") EventCategory category);

    @Query(value = "SELECT * FROM events e " +
            "WHERE e.is_active = true " +
            "AND e.start_time >= :startDate " +
            "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(e.latitude)) * " +
            "cos(radians(e.longitude) - radians(:longitude)) + " +
            "sin(radians(:latitude)) * sin(radians(e.latitude)))) <= :radiusInKm " +
            "ORDER BY e.start_time ASC", nativeQuery = true)
    List<Event> findEventsWithinRadius(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusInKm") Double radiusInKm,
            @Param("startDate") LocalDateTime startDate);
}