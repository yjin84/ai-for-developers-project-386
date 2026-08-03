import "@typespec/http";

using Http;

namespace CalendarBooking;

/**
 * Тип события, который создаёт владелец календаря.
 * Гости используют его, чтобы понять, на что они записываются,
 * и чтобы выбрать календарь для бронирования.
 */
model EventType {
  /** Идентификатор задаётся владельцем календаря при создании. */
  id: string;

  /** Название типа события, например "Консультация". */
  name: string;

  /** Описание того, что будет происходить на встрече. */
  description: string;

  /** Длительность встречи в минутах. */
  durationMinutes: int32;
}

/** Тело запроса на создание типа события владельцем календаря. */
model EventTypeCreate {
  /** Идентификатор нового типа события, задаётся владельцем. */
  id: string;

  name: string;
  description: string;
  durationMinutes: int32;
}

/**
 * Свободный слот в календаре выбранного типа события.
 * Слоты рассчитываются на 14 дней вперёд от текущей даты.
 */
model AvailableSlot {
  /** Начало слота. */
  start: utcDateTime;

  /** Конец слота: start + durationMinutes выбранного типа события. */
  end: utcDateTime;
}

/** Бронирование, созданное гостем на свободный слот. */
model Booking {
  id: string;

  /** Тип события, на который сделано бронирование. */
  eventTypeId: string;

  /** Начало забронированного слота. */
  start: utcDateTime;

  /** Конец забронированного слота (вычисляется по длительности типа события). */
  end: utcDateTime;

  /** Момент создания бронирования. */
  createdAt: utcDateTime;
}

/** Тело запроса на создание бронирования гостем. */
model BookingCreate {
  /** Идентификатор выбранного типа события. */
  eventTypeId: string;

  /** Начало выбранного гостем слота. */
  start: utcDateTime;
}

/**
 * Бронирование вместе с данными о типе события — используется на странице
 * владельца календаря со списком всех предстоящих встреч.
 */
model BookingWithEventType {
  id: string;
  eventType: EventType;
  start: utcDateTime;
  end: utcDateTime;
  createdAt: utcDateTime;
}

@error
model Error {
  code: int32;
  message: string;
}
