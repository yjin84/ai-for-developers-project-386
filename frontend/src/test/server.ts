import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Node-сервер MSW для Vitest (проект `unit`). */
export const mockServer = setupServer(...handlers)

/**
 * Включает перехват с жёстким `onUnhandledRequest: 'error'` — незамоканный
 * запрос валит тест, а не уходит в реальную сеть.
 */
export function startMockServer(): void {
  mockServer.listen({ onUnhandledRequest: 'error' })
}

export function stopMockServer(): void {
  mockServer.close()
}
