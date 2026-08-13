import { useState, useEffect, useCallback } from "react";
import SidebarNav from "../../../component/SidebarNav/SidebarNav";
import PageTopbar from "../../../component/PageTopbar/PageTopbar";
import DocumentStatusCard from "./sections/DocumentStatusCard";
import SubmitDocumentsCard from "./sections/SubmitDocumentsCard";
import KycGuidelinesCard from "./sections/KycGuidelinesCard";
import ComplianceLevelCard from "./sections/ComplianceLevelCard";
import VerificationHistoryTable from "./sections/VerificationHistoryTable";
import { useLogout } from "../../../hooks/useLogout";
import { getProfile, getProfileCompletion } from "../../../api/profileApi"
import { getKycStatus, resubmitKycDocuments } from "../../../api/kycApi";
import "./KycDocuments.css";

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

const STATUS_META = {
  verified: { status: "Verified", tone: "positive", accentColor: "#1c9a53" },
  pending: { status: "Pending", tone: "warning", accentColor: "#b8792a" },
  rejected: { status: "Rejected", tone: "negative", accentColor: "#c53939" },
};

const EMPTY_FILES = {
  panCardFile: null,
  aadhaarCardFile: null,
  passportPhotoFile: null,
};

const buildStatusCards = (kyc) => [
  {
    label: "PAN Card",
    value: kyc.panNumber,
    ...STATUS_META[kyc.panCard.status],
    meta: kyc.panCard.adminRemarks || `Submitted ${new Date(kyc.panCard.submittedAt).toLocaleDateString()}`,
  },
  {
    label: "Aadhaar Card",
    value: kyc.aadhaarNumber,
    ...STATUS_META[kyc.aadhaarCard.status],
    meta: kyc.aadhaarCard.adminRemarks || `Submitted ${new Date(kyc.aadhaarCard.submittedAt).toLocaleDateString()}`,
  },
  {
    label: "Live Photograph",
    value: "Photo",
    ...STATUS_META[kyc.photo.status],
    meta: kyc.photo.adminRemarks || `Submitted ${new Date(kyc.photo.submittedAt).toLocaleDateString()}`,
  },
];

const KycDocuments = () => {
  const [activeNavId, setActiveNavId] = useState("kyc");
  const handleLogout = useLogout();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [kyc, setKyc] = useState(null);

  const [panNumber, setPanNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [files, setFiles] = useState(EMPTY_FILES);
  const [fileNames, setFileNames] = useState(EMPTY_FILES);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState({
    percentage: 0,
    items: [],
  })
  const [photo, setPhoto] = useState("")

  const loadKycStatus = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getKycStatus();
      setKyc(response.kyc);
      setPanNumber(response.kyc.panNumber);
      setAadhaarNumber(response.kyc.aadhaarNumber);
    } catch (error) {
      setLoadError(error.response?.data?.message || "Failed to load your KYC status.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKycStatus();
  }, [loadKycStatus]);

  const handleNavSelect = (id) => {
    if (id === "logout") {
      handleLogout();
    } else {
      setActiveNavId(id);
    }
  };

  const handleFileChange = (fieldName, file) => {
    setFiles((previous) => ({ ...previous, [fieldName]: file }));
    setFileNames((previous) => ({ ...previous, [fieldName]: file.name }));
    setSubmitSuccess("");
  };

  const handleDiscard = () => {
    setPanNumber(kyc.panNumber);
    setAadhaarNumber(kyc.aadhaarNumber);
    setFiles(EMPTY_FILES);
    setFileNames(EMPTY_FILES);
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleUploadDocuments = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    const panNumberChanged = panNumber !== kyc.panNumber;
    const aadhaarNumberChanged = aadhaarNumber !== kyc.aadhaarNumber;
    const hasFiles = Object.values(files).some(Boolean);

    if (!panNumberChanged && !aadhaarNumberChanged && !hasFiles) {
      setSubmitError("Make a change or select a document before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resubmitKycDocuments({
        panNumber: panNumberChanged ? panNumber : undefined,
        aadhaarNumber: aadhaarNumberChanged ? aadhaarNumber : undefined,
        files,
      });

      setKyc(response.kyc);
      setFiles(EMPTY_FILES);
      setFileNames(EMPTY_FILES);
      setSubmitSuccess("Documents submitted for verification.");
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Something went wrong while submitting your documents."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDocument = (fileUrl) => {
    if (fileUrl) window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleReupload = () => {
    document.getElementById("submit-documents-section")?.scrollIntoView({ behavior: "smooth" });
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
    <div className="kyc-documents">
      <SidebarNav
        brandTitle="Udyog Mantra"
        brandSubtitle="Partner Portal"
        items={NAV_ITEMS}
        footerItems={FOOTER_ITEMS}
        activeId={activeNavId}
        onItemSelect={handleNavSelect}
      />

      <div className="kyc-documents__content">
        <PageTopbar 
          title="KYC Documents" 
          completionPercentage={completionPercentage.percentage} 
          photoUrl = {photo}
          
          />

        <main className="kyc-documents__main">
          {isLoading && <p className="kyc-documents__status">Loading your KYC status...</p>}
          {loadError && !isLoading && (
            <p className="kyc-documents__status kyc-documents__status--error">{loadError}</p>
          )}

          {!isLoading && !loadError && kyc && (
            <>
              <div className="kyc-documents__status-grid">
                {buildStatusCards(kyc).map((card) => (
                  <DocumentStatusCard key={card.label} {...card} />
                ))}
              </div>

              <div className="kyc-documents__row">
                <div id="submit-documents-section">
                  {submitError && (
                    <p className="kyc-documents__status kyc-documents__status--error">{submitError}</p>
                  )}
                  {submitSuccess && (
                    <p className="kyc-documents__status kyc-documents__status--success">{submitSuccess}</p>
                  )}
                  <SubmitDocumentsCard
                    panNumber={panNumber}
                    aadhaarNumber={aadhaarNumber}
                    onPanNumberChange={setPanNumber}
                    onAadhaarNumberChange={setAadhaarNumber}
                    fileNames={fileNames}
                    onFileChange={handleFileChange}
                    onDiscard={handleDiscard}
                    onUploadDocuments={handleUploadDocuments}
                    isSubmitting={isSubmitting}
                    photoUrl={photo}
                  />
                </div>

                <div className="kyc-documents__sidebar-column">
                  <KycGuidelinesCard />
                  <ComplianceLevelCard level={kyc.complianceLevel} />
                </div>
              </div>

              <VerificationHistoryTable
                history={kyc.history}
                onViewDocument={handleViewDocument}
                onReupload={handleReupload}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default KycDocuments;
