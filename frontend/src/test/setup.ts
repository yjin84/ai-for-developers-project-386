import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// `globals: false` — `cleanup` сам по матчерам не очищается, вызываем явно.
afterEach(() => {
  cleanup()
})
