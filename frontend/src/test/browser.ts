import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW-воркер для Playwright E2E (service worker).
 *
 * Динамически импортируется из `main.tsx` только при
 * `VITE_ENABLE_MSW === 'true'` (сборка `--mode test`). В обычной прод-сборке
 * флаг ложный, чанк не загружается.
 *
 * `mockServiceWorker.js` кладётся в `public/` (`npx msw init public/`) и
 * раздаётся тем же dev/preview-сервером, что и приложение.
 */
export const worker = setupWorker(...handlers)

export async function enableMocking(): Promise<void> {
  await worker.start({
    serviceWorker: { url: '/mockServiceWorker.js' },
    /** Незамоканный запрос валит тест, а не уходит в реальную сеть. */
    onUnhandledRequest: 'error',
  })
}
