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
import ApplicantList from '../features/applicant-management/pages/ApplicantList.jsx';
import ApplicantDetails from '../features/applicant-management/pages/ApplicantDetails.jsx';
import ApplicantCvView from '../features/applicant-management/pages/ApplicantCvView.jsx';
import AboutPage from '../features/help-support/pages/AboutPage.jsx';
import ContactPage from '../features/help-support/pages/ContactPage.jsx';
import FAQPage from '../features/help-support/pages/FAQPage.jsx';
import HelpPage from '../features/help-support/pages/HelpPage.jsx';
import SupportFormPage from '../features/help-support/pages/SupportFormPage.jsx';
import JobsPage from '../features/public-jobs/pages/JobsPage.jsx';
import JobDetailPage from '../features/public-jobs/pages/JobDetailPage.jsx';
import AuthenticatedLayout from '../layouts/authenticated/AuthenticatedLayout.jsx';
import ViewCompanyProfile from '../features/employer-profile/pages/ViewCompanyProfile.jsx';
import CreateCompanyProfile from '../features/employer-profile/pages/CreateCompanyProfile.jsx';
import NotificationCenterPage from '../features/notifications/pages/NotificationCenterPage.jsx';
import EditCompanyProfile from '../features/employer-profile/pages/EditCompanyProfile.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import CreateJobPage from '../features/job-management/pages/CreateJobPage.jsx';
import ManageJobsPage from '../features/job-management/pages/ManageJobsPage.jsx';
import SavedJobsPage from '../features/saved-jobs/pages/SavedJobsPage.jsx';
import EmployerDashboard from '../features/employer-profile/pages/EmployerDashboard.jsx';
import MyProfilePage from '../features/job-seeker-profile/pages/MyProfilePage.jsx';
import EditProfilePage from '../features/job-seeker-profile/pages/EditProfilePage.jsx';
import ProfileCompletionPage from '../features/job-seeker-profile/pages/ProfileCompletionPage.jsx';
import SkillsPage from '../features/job-seeker-profile/pages/SkillsPage.jsx';
import EditJobPage from '../features/job-management/pages/EditJobPage.jsx';
import EducationPage from '../features/job-seeker-profile/pages/EducationPage.jsx';
import ExperiencePage from '../features/job-seeker-profile/pages/ExperiencePage.jsx';
import PortfolioLinksPage from '../features/job-seeker-profile/pages/PortfolioLinksPage.jsx';
import CVPage from '../features/job-seeker-profile/pages/CVPage.jsx';
import ApplicationHistoryPage from '../features/applications/pages/ApplicationHistoryPage.jsx';
import ApplicationDetailsPage from '../features/applications/pages/ApplicationDetailsPage.jsx';
import AdminLayout from '../layouts/admin/AdminLayout.jsx';
import AdminDashboard from '../features/admin/dashboard/AdminDashboard.jsx';
import AdminReportList from '../features/admin/reports/pages/AdminReportList.jsx';
import AdminReportDetails from '../features/admin/reports/pages/AdminReportDetails.jsx';
import AdminUserList from '../features/admin/users/pages/AdminUserList.jsx';
import AdminUserDetails from '../features/admin/users/pages/AdminUserDetails.jsx';
import AdminEmployerList from '../features/admin/employers/pages/AdminEmployerList.jsx';
import AdminEmployerDetails from '../features/admin/employers/pages/AdminEmployerDetails.jsx';
import AdminPlaceholderPage from '../pages/AdminPlaceholderPage.jsx';

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

      <Route
        path="/my-applications"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <ApplicationHistoryPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-applications/:id"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <ApplicationDetailsPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Applicant Management - Employer ONLY (Admin removed) */}
      <Route
        path="/applicants"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <ApplicantList />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/applicants/:id"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <ApplicantDetails />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/applicants/:id/cv"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <ApplicantCvView />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Create Job - Employer only */}
      <Route
        path="/jobs/create"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <CreateJobPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/:jobId/edit"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <EditJobPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/manage"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <ManageJobsPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Dashboard Statistics - Employer */}
      {/* Saved Jobs - Job Seeker only */}
      <Route
        path="/saved-jobs"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <SavedJobsPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Dashboard - Employer */}
      <Route
        path="/employer/dashboard"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <EmployerDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Employer & Company Profile */}
      <Route
        path="/employer/company"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <ViewCompanyProfile />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/profile"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <ViewCompanyProfile />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/company/create"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <CreateCompanyProfile />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/company/edit"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.EMPLOYER]}>
            <AuthenticatedLayout>
              <EditCompanyProfile />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Job Seeker Profile - Job Seeker only */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <MyProfilePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <EditProfilePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/completion"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <ProfileCompletionPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/skills"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <SkillsPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/education"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <EducationPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/experience"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <ExperiencePage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/cv"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <CVPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Notification Center - Shared across all authenticated roles */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute
            allowedRoles={[USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER, USER_ROLES.ADMIN]}
          >
            <AuthenticatedLayout>
              <NotificationCenterPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/portfolio"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.JOB_SEEKER]}>
            <AuthenticatedLayout>
              <PortfolioLinksPage />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Console - Admin only. Routing owned by Bimsara.
           Based on the current accepted develop's AppRoutes. Merged admin
           modules are wired directly (Dashboard, Reported Jobs, User
           Management, Employer Management); the remaining AdminSidebar modules
           fall back to the placeholder until their pages are merged. */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUserList />} />
        <Route path="users/:userId" element={<AdminUserDetails />} />
        <Route path="employers" element={<AdminEmployerList />} />
        <Route path="employers/:companyId" element={<AdminEmployerDetails />} />
        <Route path="reported-jobs" element={<AdminReportList />} />
        <Route path="reported-jobs/:id" element={<AdminReportDetails />} />
        <Route path="*" element={<AdminPlaceholderPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
