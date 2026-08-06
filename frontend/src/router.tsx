import { createBrowserRouter, useParams } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { AdminPage } from '@/pages/AdminPage'
import { BookEventTypesPage } from '@/pages/BookEventTypesPage'
import { BookSlotPage } from '@/pages/BookSlotPage'
import { ErrorPage } from '@/pages/ErrorPage'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

/**
 * `key={eventTypeId}` пересоздаёт `BookSlotPage` при переходе между разными
 * типами событий — иначе локальное состояние выбора дня/времени и мутация
 * бронирования оставались бы от предыдущего типа события.
 */
function BookSlotRoute() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  return <BookSlotPage key={eventTypeId} />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'book', element: <BookEventTypesPage /> },
      { path: 'book/:eventTypeId', element: <BookSlotRoute /> },
      { path: 'admin', element: <AdminPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
