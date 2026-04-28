import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { BookingPage } from './pages/BookingPage';
import { PaymentPage } from './pages/PaymentPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { CrewPage } from './pages/admin/CrewPage';
import { ServicesPage } from './pages/admin/ServicesPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/results',
    Component: ResultsPage,
  },
  {
    path: '/booking',
    element: (
      <ProtectedRoute requiredRole="passenger">
        <BookingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment',
    element: (
      <ProtectedRoute requiredRole="passenger">
        <PaymentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: DashboardPage },
      { path: 'crew/:flightId', Component: CrewPage },
      { path: 'services', Component: ServicesPage },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);