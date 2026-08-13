import { useState, useEffect } from "react";
import SidebarNav from "../../../component/SidebarNav/SidebarNav";
import PageTopbar from "../../../component/PageTopbar/PageTopbar";
import ProfileCompletionChecklist from "../../../component/ProfileCompletionChecklist/ProfileCompletionChecklist";
import Button from "../../../component/Button/Button";
import ProfilePhotoCard from "./sections/ProfilePhotoCard";
import ProfileTabs from "./sections/ProfileTabs";
import PersonalInfoTab from "./sections/PersonalInfoTab";
import ProfessionalInfoTab from "./sections/ProfessionalInfoTab";
import AddressInfoTab from "./sections/AddressInfoTab";
import VerifyDocumentsBanner from "./sections/VerifyDocumentsBanner";
import { useLogout } from "../../../hooks/useLogout";
import { getProfile, updateProfile, uploadProfilePhoto, getProfileCompletion } from "../../../api/profileApi";
import "./ProfileManagement.css";

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

const INITIAL_FORM_DATA = {
  fullName: "",
  mobileNumber: "",
  emailAddress: "",
  dateOfBirth: "",
  gender: "",

  occupation: "",
  companyName: "",
  experienceYears: "",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  profileImage: "",
};

const ProfileManagement = () => {
  const [activeNavId, setActiveNavId] = useState("profile");
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [originalData, setOriginalData] = useState(INITIAL_FORM_DATA);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState({
    percentage: 0,
    items: [],
  });

  const handleLogout = useLogout();

  const handleNavSelect = (id) => {
    if (id === "logout") {
      handleLogout();
    } else {
      setActiveNavId(id);
    }
  };

  const handleFieldChange = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const renderTab = () => {
    switch (activeTab) {
      case "personal":
        return (
          <PersonalInfoTab
            formData={formData}
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        );
      case "professional":
        return (
          <ProfessionalInfoTab
            formData={formData}
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        );
      case "address":
        return (
          <AddressInfoTab
            formData={formData}
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchData();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await getProfile();
      const partner = response.data;

      const profile = {
        fullName: partner.personalInfo.fullName || "",
        mobileNumber: partner.personalInfo.mobileNumber || "",
        emailAddress: partner.email || "",
        dateOfBirth: partner.personalInfo.dateOfBirth
          ? partner.personalInfo.dateOfBirth.substring(0, 10)
          : "",
        gender: partner.personalInfo.gender || "",

        occupation: partner.professionalInfo.occupation || "",
        companyName: partner.professionalInfo.companyName || "",
        experienceYears: partner.professionalInfo.experienceYears || "",

        addressLine1: partner.addressInfo.addressLine1 || "",
        addressLine2: partner.addressInfo.addressLine2 || "",
        city: partner.addressInfo.city || "",
        state: partner.addressInfo.state || "",
        pincode: partner.addressInfo.pincode || "",
        profileImage: partner.profileImage || "",
      };

      setFormData(profile);
      setOriginalData(profile);
    } catch (error) {
      console.error(error);
      alert("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const data = await getProfileCompletion();
      setCompletionPercentage(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateProfile(formData);

      setOriginalData(formData);
      setIsEditing(false);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleProfilePhotoUpload = async (file) => {
    try {
      setUploadingPhoto(true);

      const response = await uploadProfilePhoto(file);

      setFormData((prev) => ({
        ...prev,
        profileImage: response.profileImage,
      }));
      setOriginalData((prev) => ({
        ...prev,
        profileImage: response.profileImage,
      }));

      alert("Profile photo updated.");
    } catch (err) {
      console.error(err);
      alert("Unable to upload image");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-management">
        <SidebarNav
          brandTitle="Udyog Mantra"
          brandSubtitle="Partner Portal"
          items={NAV_ITEMS}
          footerItems={FOOTER_ITEMS}
          activeId={activeNavId}
          onItemSelect={handleNavSelect}
        />
        <div className="profile-management__content">
          <PageTopbar title="Profile Management" />
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-management">
      <SidebarNav
        brandTitle="Udyog Mantra"
        brandSubtitle="Partner Portal"
        items={NAV_ITEMS}
        footerItems={FOOTER_ITEMS}
        activeId={activeNavId}
        onItemSelect={handleNavSelect}
      />

      <div className="profile-management__content">
        <PageTopbar
          title="Profile Management"
          completionPercentage={completionPercentage.percentage}
          photoUrl={formData.profileImage}
        />

        <main className="profile-management__main">
          <div className="profile-management__top-row">
            <div className="profile-management__sidebar-column">
              <ProfilePhotoCard
                photoUrl={formData.profileImage}
                name={formData.fullName}
                title="Senior Tax Consultant"
                onUpload={handleProfilePhotoUpload}
                isUploading={uploadingPhoto}
              />
              <ProfileCompletionChecklist
                percentage={completionPercentage.percentage}
                items={completionPercentage.items}
              />
            </div>

            <div className="profile-management__form-card">
              <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {renderTab()}

              <div className="profile-management__actions">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  Edit
                </Button>

                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={!isEditing || saving}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </div>

          <VerifyDocumentsBanner onCompleteKyc={() => { }} />
        </main>
      </div>
    </div>
  );
};

export default ProfileManagement;