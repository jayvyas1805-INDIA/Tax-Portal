import { useState, useEffect, useCallback } from "react";
import SidebarNav from "../../../component/SidebarNav/SidebarNav";
import PageTopbar from "../../../component/PageTopbar/PageTopbar";
import SecurityPasswordCard from "./sections/SecurityPasswordCard";
import AccessControlCard from "./sections/AccessControlCard";
import CommunicationChannelsCard from "./sections/CommunicationChannelsCard";
import PrivacyTermsCard from "./sections/PrivacyTermsCard";
import SettingsActionBar from "./sections/SettingsActionBar";
import { useLogout } from "../../../hooks/useLogout";
import {getProfile,getProfileCompletion} from "../../../api/profileApi"
import {
  getSettings,
  changePassword,
  updateCommunicationPreferences,
} from "../../../api/settingsApi";
import "./AccountSettings.css";

import {
  LayoutDashboard,
  Users,
  WalletCards,
  Bell,
  UserCircle,
  FileCheck2,
  Landmark,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/partner-dashboard",
  },
  {
    id: "referrals",
    icon: Users,
    label: "My Referrals",
    path: "/my-referrals",
  },
  {
    id: "commission",
    icon: WalletCards,
    label: "Commission Management",
    path: "/commission-management",
  },
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
    path: "/notifications",
  },
  {
    id: "profile",
    icon: UserCircle,
    label: "Profile Management",
    path: "/profile-management",
  },
  {
    id: "kyc",
    icon: FileCheck2,
    label: "KYC Documents",
    path: "/kyc-documents",
  },
  {
    id: "banking",
    icon: Landmark,
    label: "Bank Details",
    path: "/bank-details",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    path: "/account-settings",
  },
];

const FOOTER_ITEMS = [
  {
    id: "logout",
    icon: LogOut,
    label: "Logout",
  },
];

const EMPTY_PASSWORDS = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  smsNotifications: true,
  whatsappNotifications: true,
  marketingEmails: false,
};

const AccountSettings = () => {
  const [activeNavId, setActiveNavId] = useState("settings");
  const handleLogout = useLogout();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [settingsData, setSettingsData] = useState(null);

  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState({
    percentage: 0,
    items: []
  })
  const [photo,setPhoto] = useState("")

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getSettings();
      setSettingsData(response.settings);
      setPreferences(response.settings.communication);
    } catch (error) {
      setLoadError(
        error.response?.data?.message || "Failed to load your settings."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleNavSelect = (id) => {
    if (id === "logout") {
      handleLogout();
    } else {
      setActiveNavId(id);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((previous) => ({ ...previous, [name]: value }));
    setSaveError("");
    setSaveSuccess("");
  };

  const handlePreferenceToggle = (id) => {
    setPreferences((previous) => ({ ...previous, [id]: !previous[id] }));
    setSaveSuccess("");
  };

  const handleReset = () => {
    setPasswords(EMPTY_PASSWORDS);
    setPreferences(settingsData?.communication || DEFAULT_PREFERENCES);
    setSaveError("");
    setSaveSuccess("");
  };

  const handleSaveSettings = async () => {
    setSaveError("");
    setSaveSuccess("");

    const isChangingPassword =
      passwords.currentPassword || passwords.newPassword || passwords.confirmPassword;

    if (isChangingPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        setSaveError("New password and confirmation do not match.");
        return;
      }
      if (passwords.newPassword.length < 8) {
        setSaveError("New password must be at least 8 characters.");
        return;
      }
    }

    setIsSaving(true);

    try {
      if (isChangingPassword) {
        await changePassword(
          passwords.currentPassword,
          passwords.newPassword,
          passwords.confirmPassword
        );
        setPasswords(EMPTY_PASSWORDS);
      }

      const response = await updateCommunicationPreferences(preferences);

      setSettingsData((previous) => ({
        ...previous,
        communication: response.communication,
        lastPasswordChanged: isChangingPassword
          ? new Date().toISOString()
          : previous.lastPasswordChanged,
      }));
      setSaveSuccess("Settings saved successfully.");
    } catch (error) {
      setSaveError(
        error.response?.data?.message || "Something went wrong while saving your settings."
      );
    } finally {
      setIsSaving(false);
    }
  };
  useEffect(() => {
    fetchProfile();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getProfileCompletion();

      console.log("API Response:", data);

      setCompletionPercentage(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await getProfile();

      const partner = response.data;

      setPhoto(partner.profileImage || "");
      // setPartnerName(partner.personalInfo.fullName || "");

      setPhoto(profile)
    } catch (error) {

    }
  }
  return (
    <div className="account-settings">
      <SidebarNav
        brandTitle="Udyog Mantra"
        brandSubtitle="Partner Portal"
        items={NAV_ITEMS}
        footerItems={FOOTER_ITEMS}
        activeId={activeNavId}
        onItemSelect={handleNavSelect}
      />

      <div className="account-settings__content">
        <PageTopbar
          title="Account Settings"
          completionPercentage={completionPercentage.percentage}
          // partnerName={settingsData ? `Partner ID: ${settingsData.partnerId}` : ""}
          photoUrl={photo}
        />

        <main className="account-settings__main">
          {isLoading && <p className="account-settings__status">Loading your settings...</p>}

          {loadError && !isLoading && (
            <p className="account-settings__status account-settings__status--error">
              {loadError}
            </p>
          )}

          {!isLoading && !loadError && settingsData && (
            <>
              {saveError && (
                <p className="account-settings__status account-settings__status--error">
                  {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="account-settings__status account-settings__status--success">
                  {saveSuccess}
                </p>
              )}

              <div className="account-settings__row">
                <SecurityPasswordCard
                  passwords={passwords}
                  onChange={handlePasswordChange}
                  lastPasswordChanged={settingsData.lastPasswordChanged}
                />
                <AccessControlCard
                  loginHistory={settingsData.accessControl.loginHistory}
                  activeSessions={settingsData.accessControl.activeSessions}
                  onViewAllActivity={() => {}}
                />
              </div>

              <div className="account-settings__row">
                <CommunicationChannelsCard
                  preferences={preferences}
                  onToggle={handlePreferenceToggle}
                />
                <PrivacyTermsCard memberSince={settingsData.createdAt.slice(0,10)} />
              </div>

              <SettingsActionBar
                onReset={handleReset}
                onSaveSettings={handleSaveSettings}
                isSaving={isSaving}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AccountSettings;
