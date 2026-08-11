import { Routes, Route } from "react-router-dom";
import PartnerRegistration from "../pages/partner/PartnerRegistration/PartnerRegistration";
import RegistrationSuccess from "../pages/partner/PartnerRegistration/RegistrationSuccess";
import PartnerLogin from "../pages/partner/PartnerLogin/PartnerLogin";
import PartnerDashboard from "../pages/partner/PartnerDashboard/PartnerDashboard";
import CommissionManagement from "../pages/partner/CommissionManagement/CommissionManagement";
import MyReferrals from "../pages/partner/MyReferrals/MyReferrals";
import NotificationsCenter from "../pages/partner/NotificationsCenter/NotificationsCenter";
import ProfileManagement from "../pages/partner/ProfileManagement/ProfileManagement";
import KycDocuments from "../pages/partner/KycDocuments/KycDocuments";
import BankAccountDetails from "../pages/partner/BankAccountDetails/BankAccountDetails";
import AccountSettings from "../pages/partner/AccountSettings/AccountSettings";
import ForgotPassword from "../pages/partner/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/partner/ResetPassword/ResetPassword";
import VerifyEmail from "../pages/partner/VerifyEmail/VerifyEmail";
import PrivateRoute from "./PrivateRoute";
import NotFound from "../pages/Not Found/NotFound";
// Admin routes starts
import AdminLayout from "../component/Admin/Adminbar/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import PartnerManagement from "../pages/Admin/PartnerManagement";
import ReferralManagement from "../pages/Admin/ReferralManagement";
import CommissionManagementA from "../pages/Admin/CommissionManagement";
import BusinessManagement from "../pages/Admin/BusinessManagement";
import ReportsAnalytics from "../pages/Admin/ReportsAnalytics";
import NotificationCenter from "../pages/Admin/NotificationCenter";
import Settings from "../pages/Admin/Settings";
import ConvertReferralLead from "../pages/Admin/ConvertReferralLead";
import ReviewFeedback from "../pages/Admin/ReviewFeedback";

import { Navigate } from "react-router-dom";
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/partner-registration" element={<PartnerRegistration />} />
      <Route path="/partner-registration/success" element={<RegistrationSuccess />} />
      <Route path="/partner-login" element={<PartnerLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Protected — partner-only routes */}
      <Route
        path="/"
        element={<Navigate to="/partner-registration" replace />}
      />
      <Route
        path="/partner-dashboard"
        element={
          <PrivateRoute allowedRoles={["partner"]}>
            <PartnerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/commission-management"
        element={
          <PrivateRoute allowedRoles={["partner"]}>
            <CommissionManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-referrals"
        element={
          <PrivateRoute allowedRoles={["partner"]}>
            <MyReferrals />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute allowedRoles={["partner"]}>
            <NotificationsCenter />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile-management"
        element={
          <PrivateRoute allowedRoles={["partner"]}>
            <ProfileManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/kyc-documents"
        element={
          <PrivateRoute allowedRoles={["partner"]}>
            <KycDocuments />
          </PrivateRoute>
        }
      />
      <Route
        path="/bank-details"
        element={
          <PrivateRoute allowedRoles={["partner"]}>
            <BankAccountDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/account-settings"
        element={
          <PrivateRoute allowedRoles={["partner"]}>
            <AccountSettings />
          </PrivateRoute>
        }
      />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="partner-management" element={<PartnerManagement />} />
        <Route path="referral-management" element={<ReferralManagement />} />
        <Route path="commission-management" element={<CommissionManagementA />} />
        <Route path="business-management" element={<BusinessManagement />} />
        <Route path="reports-analytics" element={<ReportsAnalytics />} />
        <Route path="notification-center" element={<NotificationCenter />} />
        <Route path="settings" element={<Settings />} />
        <Route path="referral-management/convert/:referralId" element={<ConvertReferralLead />} />
        <Route path="review-feedback" element={<ReviewFeedback />} />
        <Route path="*" element={<NotFound />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;
