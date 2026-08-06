import type { Booking, BookingWithEventType } from '@/api/bookings'
import type { EventType } from '@/api/eventTypes'
import type { AvailableSlot } from '@/api/slots'

/**
 * Фикстуры мок-бэкенда для тестов.
 *
 * Даты генерируются относительно «сегодня» (момента вызова) — тесты и
 * E2E фиксируют время (`vi.setSystemTime`, `page.clock.setFixedTime`),
 * поэтому значения детерминированы, но не протухают с течением дней.
 *
 * Свойства фикстур, на которые опираются тесты:
 * - слоты минимум на три разных дня, из них хотя бы один — в следующем
 *   месяце (иначе навигацию по месяцам в календаре не проверить);
 * - список встреч намеренно **не отсортирован** по `start` — на нём
 *   проверяется клиентская сортировка `UpcomingBookingsTab`.
 */
export const eventTypes: EventType[] = [
  {
    id: 'consultation-30',
    name: 'Консультация',
    description: 'Тридцать минут разговора о проекте.',
    durationMinutes: 30,
  },
  {
    id: 'quick-call-15',
    name: 'Быстрый звонок',
    description: 'Пятнадцатиминутный созвон по любому вопросу.',
    durationMinutes: 15,
  },
]

export const eventTypeIds = eventTypes.map((e) => e.id)

/** Локальная дата «сегодня + offsetDays» в указанный час. */
function atDay(offsetDays: number, hour: number): Date {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  return d
}

/** Слот на день `offsetDays` в час `hour` для типа с длительностью `durationMinutes`. */
function slotAt(offsetDays: number, hour: number, durationMinutes: number): AvailableSlot {
  const start = atDay(offsetDays, hour)
  const end = new Date(start.getTime() + durationMinutes * 60_000)
  return { start: start.toISOString(), end: end.toISOString() }
}

/**
 * Свободные слоты типа события.
 *
 * Времена — 09:00, 10:00, 11:00 сегодня; 09:00, 10:00 завтра; 09:00 послезавтра
 * и 10:00 в следующем месяце. Время суток фиксировано, поэтому бронирования
 * из фикстур (14:00–16:00) не пересекаются со свободными слотами.
 */
export function availableSlotsFor(eventTypeId: string): AvailableSlot[] {
  const eventType = eventTypes.find((e) => e.id === eventTypeId)
  if (!eventType) return []
  const { durationMinutes } = eventType
  const slots: AvailableSlot[] = [
    slotAt(0, 9, durationMinutes),
    slotAt(0, 10, durationMinutes),
    slotAt(0, 11, durationMinutes),
    slotAt(1, 9, durationMinutes),
    slotAt(1, 10, durationMinutes),
    slotAt(2, 9, durationMinutes),
  ]
  // День в следующем месяце (середина месяца) — для проверки навигации календаря.
  const now = new Date()
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 15, 10, 0, 0, 0)
  slots.push({
    start: nextMonthStart.toISOString(),
    end: new Date(nextMonthStart.getTime() + durationMinutes * 60_000).toISOString(),
  })
  return slots
}

/**
 * Бронирования для админской вкладки — намеренно в неотсортированном порядке
 * по `start`. Время (15:00 и далее) не пересекается со свободными слотами.
 */
export function seedBookings(): BookingWithEventType[] {
  const consultation = eventTypes[0] as EventType
  const quickCall = eventTypes[1] as EventType

  const byEventType = (eventType: EventType) => ({
    id: `booking-${eventType.id}`,
    eventType,
    start: slotAt(3, 15, eventType.durationMinutes).start,
    end: slotAt(3, 15, eventType.durationMinutes).end,
    createdAt: slotAt(1, 20, eventType.durationMinutes).start,
  })

  return [
    byEventType(quickCall),
    byEventType(consultation),
    byEventType(consultation),
    byEventType(quickCall),
  ]
}

/** Готовая бронь на «сегодня, 09:00» — используется happy-path тестами. */
export function bookingAtTodayNine(eventTypeId: string): Booking {
  const eventType = eventTypes.find((e) => e.id === eventTypeId) as EventType
  const start = atDay(0, 9)
  return {
    id: 'booking-today-0900',
    eventTypeId,
    start: start.toISOString(),
    end: new Date(start.getTime() + eventType.durationMinutes * 60_000).toISOString(),
    createdAt: new Date().toISOString(),
  }
}
