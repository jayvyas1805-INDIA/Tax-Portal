import { useState, useEffect, useCallback  } from "react";
import SidebarNav from "../../../component/SidebarNav/SidebarNav";
import PageTopbar from "../../../component/PageTopbar/PageTopbar";
import StatusBadge from "../../../component/StatusBadge/StatusBadge";
import AccountInformationCard from "./sections/AccountInformationCard";
import RecentPaymentCard from "./sections/RecentPaymentCard";
import SecuredSettlementsCard from "./sections/SecuredSettlementsCard";
import HelpAndScheduleRow from "./sections/HelpAndScheduleRow";
import { useLogout } from "../../../hooks/useLogout";
import {getProfile,getProfileCompletion} from "../../../api/profileApi"
import {getBankDetails,updateBankDetails} from "../../../api/bankDetailsApi"
import "./BankAccountDetails.css";

const NAV_ITEMS = [
  {
    id: "dashboard",
    icon: "🏠",
    label: "Dashboard",
    path: "/partner-dashboard",
  },
  {
    id: "referrals",
    icon: "👥",
    label: "My Referrals",
    path: "/my-referrals",
  },
  {
    id: "commission",
    icon: "💰",
    label: "Commission Management",
    path: "/commission-management",
  },
  {
    id: "notifications",
    icon: "🔔",
    label: "Notifications",
    path: "/notifications",
  },
  {
    id: "profile",
    icon: "👤",
    label: "Profile Management",
    path: "/profile-management",
  },
  {
    id: "kyc",
    icon: "📄",
    label: "KYC Documents",
    path: "/kyc-documents",
  },
  {
    id: "banking",
    icon: "🏦",
    label: "Bank Details",
    path: "/bank-details",
  },
  {
    id: "settings",
    icon: "⚙️",
    label: "Settings",
    path: "/account-settings",
  },
];

const FOOTER_ITEMS = [{ id: "logout", icon: "🚪", label: "Logout" }];

const STATUS_LABELS = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
};

const STATUS_TONE = {
  verified: "positive",
  pending: "warning",
  rejected: "negative",
};

const toFormData = (bankDetails) => ({
  accountHolderName: bankDetails.accountHolderName,
  bankName: bankDetails.bankName,
  branch: bankDetails.branch,
  ifscCode: bankDetails.ifscCode,
  accountNumber: bankDetails.accountNumber,
  accountType: bankDetails.accountType,
});

const BankAccountDetails = () => {
  const [activeNavId, setActiveNavId] = useState("banking");
  const handleLogout = useLogout();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [bankDetails, setBankDetails] = useState(null);
  const [formData, setFormData] = useState(null);
  const [cancelledChequeFile, setCancelledChequeFile] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState({
    percentage: 0,
    items: []
  })
  const [photo,setPhoto] = useState("")

  const loadBankDetails = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getBankDetails();
      setBankDetails(response.bankDetails);
      setFormData(toFormData(response.bankDetails));
    } catch (error) {
      setLoadError(error.response?.data?.message || "Failed to load your bank details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBankDetails();
  }, [loadBankDetails]);

  const handleNavSelect = (id) => {
    if (id === "logout") {
      handleLogout();
    } else {
      setActiveNavId(id);
    }
  };

  const handleFieldChange = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    setSaveSuccess("");
  };

  const handleFileSelect = (file) => {
    setCancelledChequeFile(file);
    setSaveSuccess("");
  };

  const handleCancel = () => {
    setFormData(toFormData(bankDetails));
    setCancelledChequeFile(null);
    setSaveError("");
    setSaveSuccess("");
  };

  const handleSaveChanges = async () => {
    setSaveError("");
    setSaveSuccess("");
    setIsSaving(true);

    try {
      const response = await updateBankDetails(formData, cancelledChequeFile);
      setBankDetails(response.bankDetails);
      setFormData(toFormData(response.bankDetails));
      setCancelledChequeFile(null);
      setSaveSuccess(response.message);
    } catch (error) {
      setSaveError(
        error.response?.data?.message || "Something went wrong while saving your bank details."
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
    <div className="bank-account-details">
      <SidebarNav
        brandTitle="Udyog Mantra"
        brandSubtitle="Partner Portal"
        items={NAV_ITEMS}
        footerItems={FOOTER_ITEMS}
        activeId={activeNavId}
        onItemSelect={handleNavSelect}
      />

      <div className="bank-account-details__content">
        <PageTopbar 
          title="Bank Account Details" 
          completionPercentage={completionPercentage.percentage}
          photoUrl={photo}
          />

        <main className="bank-account-details__main">
          <div className="bank-account-details__page-header">
            <div>
              <p className="bank-account-details__breadcrumb">
                Portal &gt; Settings &gt; Bank Details
              </p>
              <h2 className="bank-account-details__title">
                Manage Payout Accounts
              </h2>
            </div>
            {bankDetails && (
              <StatusBadge
                label={`Verification Status: ${STATUS_LABELS[bankDetails.verificationStatus]}`}
                tone={STATUS_TONE[bankDetails.verificationStatus]}
              />
            )}
          </div>

          {isLoading && <p className="bank-account-details__status">Loading your bank details...</p>}
          {loadError && !isLoading && (
            <p className="bank-account-details__status bank-account-details__status--error">
              {loadError}
            </p>
          )}

          {!isLoading && !loadError && bankDetails && formData && (
            <>
              {saveError && (
                <p className="bank-account-details__status bank-account-details__status--error">
                  {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="bank-account-details__status bank-account-details__status--success">
                  {saveSuccess}
                </p>
              )}

              {bankDetails.adminRemarks && (
                <p className="bank-account-details__status bank-account-details__status--warning">
                  Admin note: {bankDetails.adminRemarks}
                </p>
              )}

              <div className="bank-account-details__row">
                <AccountInformationCard
                  formData={formData}
                  onFieldChange={handleFieldChange}
                  onFileSelect={handleFileSelect}
                  cancelledChequeFileUrl={bankDetails.cancelledChequeFileUrl}
                  onSaveChanges={handleSaveChanges}
                  onCancel={handleCancel}
                  isSaving={isSaving}
                />

                <div className="bank-account-details__sidebar-column">
                  <RecentPaymentCard
                    recentPayment={bankDetails.recentPayment}
                    onViewHistory={() => {}}
                  />
                  <SecuredSettlementsCard />
                </div>
              </div>

              <HelpAndScheduleRow
                nextPayoutDate={new Date(bankDetails.nextPayoutDate).toLocaleDateString(undefined, {
                  dateStyle: "long",
                })}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BankAccountDetails;
