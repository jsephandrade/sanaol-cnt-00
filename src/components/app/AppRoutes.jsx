import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Lazy load pages for better performance
const Index = lazy(() => import('../../pages/Index'));
const LoginPage = lazy(() => import('../../pages/LoginPage'));
const SignupPage = lazy(() => import('../../pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('../../pages/ForgotPasswordPage'));
const FaceScanPage = lazy(() => import('../../pages/FaceScanPage'));
const FaceRegistrationPage = lazy(() => import('../../pages/FaceRegistrationPage'));
const NotFound = lazy(() => import('../../pages/NotFound'));
const HelpPage = lazy(() => import('../../pages/HelpPage'));
const SettingsPage = lazy(() => import('../../pages/SettingsPage'));

// Lazy load components
const MenuManagement = lazy(() => import('../MenuManagement'));
const SalesAnalytics = lazy(() => import('../SalesAnalytics'));
const EmployeeSchedule = lazy(() => import('../EmployeeSchedule'));
const CustomerFeedback = lazy(() => import('../CustomerFeedback'));
const POS = lazy(() => import('../POS'));
const Catering = lazy(() => import('../Catering'));
const Inventory = lazy(() => import('../Inventory'));
const Payments = lazy(() => import('../Payments'));
const Users = lazy(() => import('../Users'));
const UserLogs = lazy(() => import('../UserLogs'));
const Notifications = lazy(() => import('../Notifications'));
const MainLayout = lazy(() => import('../../layouts/MainLayout'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public route wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// App routes component
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/face-scan"
            element={
              <PublicRoute>
                <FaceScanPage />
              </PublicRoute>
            }
          />
          <Route
            path="/face-registration"
            element={
              <ProtectedRoute>
                <FaceRegistrationPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <MainLayout title="Menu Management">
                  <MenuManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <MainLayout title="Sales Analytics">
                  <SalesAnalytics />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <MainLayout title="Employee Schedule">
                  <EmployeeSchedule />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <MainLayout title="Customer Feedback">
                  <CustomerFeedback />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <MainLayout title="Point of Sale">
                  <POS />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/catering"
            element={
              <ProtectedRoute>
                <MainLayout title="Catering Management">
                  <Catering />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <MainLayout title="Inventory Management">
                  <Inventory />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <MainLayout title="Payment Management">
                  <Payments />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <MainLayout title="User Management">
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <MainLayout title="User Logs">
                  <UserLogs />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout title="Notifications">
                  <Notifications />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout title="Settings">
                  <SettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <MainLayout title="Help Center">
                  <HelpPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;