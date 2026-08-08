package com.hexlet.calendar.booking.web;

public record ErrorBody(int code, String message) {

    public static ErrorBody of(int code, String message) {
        return new ErrorBody(code, message);
    }
}