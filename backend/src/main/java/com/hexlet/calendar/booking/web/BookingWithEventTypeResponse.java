package com.hexlet.calendar.booking.web;

import com.hexlet.calendar.booking.model.EventTypeEntity;
import java.time.Instant;

/** Бронирование для страницы владельца: вместе с типом события. */
public record BookingWithEventTypeResponse(String id, EventTypeEntity eventType, Instant start,
        Instant end, Instant createdAt) {
}