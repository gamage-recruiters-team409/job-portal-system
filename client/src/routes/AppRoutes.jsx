import { Route, Routes } from 'react-router-dom';
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


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FoundationPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Reported Jobs - Job Seeker */}
      <Route path="/my-reported-jobs" element={<MyReportedJobs />} />
      <Route path="/report-details/:id" element={<ReportDetails />} />
      

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
