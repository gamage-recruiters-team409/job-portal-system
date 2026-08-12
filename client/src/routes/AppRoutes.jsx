import { Route, Routes } from 'react-router-dom';
import { USER_ROLES } from '../constants/statuses.js';
import PublicLayout from '../layouts/public/PublicLayout.jsx';
import FoundationPage from '../pages/FoundationPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';
import LoginPage from '../features/authentication/LoginPage.jsx';
import RegisterPage from '../features/authentication/RegisterPage.jsx';
import VerifyEmailPage from '../features/authentication/VerifyEmailPage.jsx';
import ForgotPasswordPage from '../features/authentication/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../features/authentication/ResetPasswordPage.jsx';
import MyReportedJobs from '../features/reported-jobs/job-seeker/pages/MyReportedJobs.jsx';
import ReportDetails from '../features/reported-jobs/job-seeker/pages/ReportDetails.jsx';
import AboutPage from '../features/help-support/pages/AboutPage.jsx';
import ContactPage from '../features/help-support/pages/ContactPage.jsx';
import FAQPage from '../features/help-support/pages/FAQPage.jsx';
import HelpPage from '../features/help-support/pages/HelpPage.jsx';
import SupportFormPage from '../features/help-support/pages/SupportFormPage.jsx';
import JobsPage from '../features/public-jobs/pages/JobsPage.jsx';
import JobDetailPage from '../features/public-jobs/pages/JobDetailPage.jsx';
import AuthenticatedLayout from '../layouts/authenticated/AuthenticatedLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages — use their own AuthLayout, intentionally excluded from PublicLayout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Public pages — wrapped in PublicLayout so PublicFooter appears on all of them */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<FoundationPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/support" element={<SupportFormPage />} />
      </Route>

      {/* Reported Jobs - Job Seeker only */}
      <Route
        path="/my-reported-jobs"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <MyReportedJobs />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/report-details/:id"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <ReportDetails />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
