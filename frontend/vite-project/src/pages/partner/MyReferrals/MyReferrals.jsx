import { useState, useEffect, useCallback } from "react";
import SidebarNav from "../../../component/SidebarNav/SidebarNav";
import PageTopbar from "../../../component/PageTopbar/PageTopbar";
import ReferralActionsBar from "./sections/ReferralActionsBar";
import ReferralFilterBar from "./sections/ReferralFilterBar";
import ReferralsTable from "./sections/ReferralsTable";
import CreateReferralModal from "./sections/CreateReferralModal";
import ViewReferralModal from "./sections/ViewReferralModal";
import { useLogout } from "../../../hooks/useLogout";
import {getProfile,getProfileCompletion} from "../../../api/profileApi"
import { createReferral, getReferrals, exportReferrals } from "../../../api/referralApi";
import "./MyReferrals.css";

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

const INITIAL_FILTERS = {
  searchTerm: "",
  status: "All Statuses",
  dateFrom: "",
  dateTo: "",
};

const PAGE_SIZE = 10;

const MyReferrals = () => {
  const [activeNavId, setActiveNavId] = useState("referrals");
  const handleLogout = useLogout();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const [referrals, setReferrals] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [viewingReferral, setViewingReferral] = useState(null);
    const [completionPercentage, setCompletionPercentage] = useState({
    percentage: 0,
    items: [],
  });
  const [photo, setPhoto] = useState("")

  const loadReferrals = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getReferrals(filters, currentPage, PAGE_SIZE);
      setReferrals(response.referrals);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
    } catch (error) {
      setLoadError(error.response?.data?.message || "Failed to load your referrals.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const handleNavSelect = (id) => {
    if (id === "logout") {
      handleLogout();
    } else {
      setActiveNavId(id);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((previous) => ({ ...previous, [name]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  const handleCreateReferral = async (formData) => {
    setCreateError("");
    setIsCreating(true);
    try {
      await createReferral({
        ...formData,
        estimatedValue: Number(formData.estimatedValue),
      });
      setIsCreateModalOpen(false);
      setCurrentPage(1);
      loadReferrals();
      return true;
    } catch (error) {
      setCreateError(error.response?.data?.message || "Failed to create referral.");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleExport = async (format) => {
    try {
      await exportReferrals(filters, format);
    } catch (error) {
      console.error("Export failed ->", error);
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
    <div className="my-referrals">
      <SidebarNav
        brandTitle="Udyog Mantra"
        brandSubtitle="Partner Portal"
        items={NAV_ITEMS}
        footerItems={FOOTER_ITEMS}
        activeId={activeNavId}
        onItemSelect={handleNavSelect}
      />

      <div className="my-referrals__content">
        <PageTopbar
          title="My Referrals"
          subtitle="Track and manage your tax professional service referrals here."
          completionPercentage={completionPercentage.percentage}
          photoUrl={photo}
        />

        <main className="my-referrals__main">
          <ReferralActionsBar
            onCreateReferral={() => setIsCreateModalOpen(true)}
            onExportExcel={() => handleExport("csv")}
            onExportPdf={() => handleExport("pdf")}
          />

          <ReferralFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {isLoading && <p className="my-referrals__status">Loading your referrals...</p>}
          {loadError && !isLoading && (
            <p className="my-referrals__status my-referrals__status--error">{loadError}</p>
          )}

          {!isLoading && !loadError && (
            <ReferralsTable
              referrals={referrals}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              onViewReferral={setViewingReferral}
            />
          )}
        </main>
      </div>

      <CreateReferralModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateReferral}
        isSubmitting={isCreating}
        error={createError}
      />

      <ViewReferralModal referral={viewingReferral} onClose={() => setViewingReferral(null)} />
    </div>
  );
};

export default MyReferrals;
