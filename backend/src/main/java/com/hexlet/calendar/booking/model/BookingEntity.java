package com.hexlet.calendar.booking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "bookings")
public class BookingEntity {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_type_id", nullable = false)
    private EventTypeEntity eventType;

    @Column(nullable = false, unique = true)
    private Instant start;

    @Column(name = "\"end\"", nullable = false)
    private Instant end;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected BookingEntity() {
    }

    public BookingEntity(String id, EventTypeEntity eventType, Instant start, Instant end,
            Instant createdAt) {
        this.id = id;
        this.eventType = eventType;
        this.start = start;
        this.end = end;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public EventTypeEntity getEventType() {
        return eventType;
    }

    public Instant getStart() {
        return start;
    }

    public Instant getEnd() {
        return end;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}