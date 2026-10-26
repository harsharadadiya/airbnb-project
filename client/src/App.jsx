// All pages (routes) of the app.
// Pages are "lazy loaded" so the browser only downloads the code for the page you open.
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import PageLoader from '@/components/common/PageLoader';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ListingDetailPage = lazy(() => import('@/pages/ListingDetailPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const TripsPage = lazy(() => import('@/pages/TripsPage'));
const HostDashboardPage = lazy(() => import('@/pages/host/HostDashboardPage'));
const ListingEditorPage = lazy(() => import('@/pages/host/ListingEditorPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            {/* Public pages */}
            <Route index element={<HomePage />} />
            <Route path="listings/:id" element={<ListingDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Any logged-in user */}
            <Route element={<ProtectedRoute />}>
              <Route path="trips" element={<TripsPage />} />
            </Route>

            {/* Hosts only */}
            <Route element={<ProtectedRoute role="host" />}>
              <Route path="host" element={<HostDashboardPage />} />
              <Route path="host/listings/new" element={<ListingEditorPage />} />
              <Route path="host/listings/:id/edit" element={<ListingEditorPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
