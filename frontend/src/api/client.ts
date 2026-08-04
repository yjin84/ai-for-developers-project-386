import createClient from 'openapi-fetch'
import type { paths } from './schema'

/**
 * Типобезопасный HTTP-клиент, сгенерированный из контракта OpenAPI
 * (`typespec/tsp-output/schema/openapi.yaml` → `src/api/schema.d.ts`).
 *
 * Базовый URL берётся из переменной окружения `VITE_API_BASE_URL` —
 * переключение между Prism-моком и реальным бэкендом происходит только
 * через `.env`, без изменения кода.
 */
export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
})
