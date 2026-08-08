package com.hexlet.calendar.booking.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "slot")
public record SlotProperties(
        @DefaultValue("Europe/Moscow") String timezone,
        @DefaultValue("14") int daysAhead,
        @DefaultValue("1,2,3,4,5") List<Integer> daysOfWeek,
        @DefaultValue("9") int startHour,
        @DefaultValue("17") int endHour,
        @DefaultValue("60") int stepMin) {
}
