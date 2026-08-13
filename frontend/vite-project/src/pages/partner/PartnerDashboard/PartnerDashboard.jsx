import { useState, useEffect } from "react";
import SidebarNav from "../../../component/SidebarNav/SidebarNav";
import StatCard from "../../../component/StatCard/StatCard";
// import DashboardTopbar from "./sections/DashboardTopbar";
import PageTopbar from "../../../component/PageTopbar/PageTopbar";
import QuickActionsCard from "./sections/QuickActionsCard";
import ProfileCompletionChecklist from "./sections/ProfileCompletionChecklist";
// import ProfileCompletionChecklist from "../../../component/ProfileCompletionChecklist/ProfileCompletionChecklist";
import ReferralTrendsChart from "./sections/ReferralTrendsChart";
import CommissionEarningsChart from "./sections/CommissionEarningsChart";
import ConversionFunnelChart from "./sections/ConversionFunnelChart";
import RecentActivityFeed from "./sections/RecentActivityFeed";
import TierUpsellBanner from "./sections/TierUpsellBanner";
import CreateReferralModal from "../MyReferrals/sections/CreateReferralModal";
import { useLogout } from "../../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import {
  getDashboardStats,
  getReferralTrends,
  getAvailableYears,
  getCommissionChart,
  getCurrentPartnerSettings,
} from "../../../api/dashboardApi";
import { getProfile, getProfileCompletion } from "../../../api/profileApi"
import { createReferral, getReferrals, exportReferrals } from "../../../api/referralApi";
import { getNotifications } from "../../../api/notificationApi";
import { formatTimeAgo } from "../../../utils/formatTimeAgo";
import "./PartnerDashboard.css";
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

// const STATS = [
//   { label: "Total Referrals", value: "128", meta: "+12%", metaTone: "positive" },
//   { label: "Converted", value: "42", meta: "Direct businesses", metaTone: "neutral" },
//   { label: "Pending", value: "18", meta: "In verification", metaTone: "warning" },
//   { label: "Total Earned", value: "$12,450", meta: "YTD Earnings", metaTone: "neutral" },
//   { label: "Pending Comm.", value: "$3,200", meta: "Payable next cycle", metaTone: "warning" },
//   { label: "Conv. Rate", value: "32.8%", meta: "Lead to conversion", metaTone: "positive" },
// ];


const PartnerDashboard = () => {
  const [activeNavId, setActiveNavId] = useState("dashboard");
  const [expanded, setExpanded] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState({
    percentage: 0,
    items: [],
  });
  const [photo, setPhoto] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [stats, setStats] = useState({
    totalReferrals: 0,
    converted: 0,
    underReview: 0,
    proposalShared: 0,
    rejected: 0,
    tier: "",
    commissionPercent: 0,
  });
  const currentYear = new Date().getFullYear();

  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [referralTrends, setReferralTrends] = useState([]);

  const [commissionYear, setCommissionYear] = useState(
    new Date().getFullYear()
  );

  const [commissionYears, setCommissionYears] = useState([]);

  const [commissionData, setCommissionData] = useState([]);

  const [commissionTotal, setCommissionTotal] = useState(0);
  const [partnerSettings, setPartnerSettings] = useState({
    systemConfig: null,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const RECENT_ACTIVITIES_PAGE_SIZE = 5;

  const STATS = [
    {
      label: "Total Referrals",
      value: stats.totalReferrals,
      meta: `${stats.proposalShared} proposal shared`,
      metaTone: "positive",
    },
    {
      label: "Converted",
      value: stats.converted,
      meta: "Successfully converted",
      metaTone: "positive",
    },
    {
      label: "Under Review",
      value: stats.underReview,
      meta: "Awaiting review",
      metaTone: "warning",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      meta: "Not converted",
      metaTone: "negative",
    },
    {
      label: "Payout Day",
      value: partnerSettings?.systemConfig?.payoutScheduleDay
        ? `${partnerSettings.systemConfig.payoutScheduleDay}th`
        : "—",
      meta: "Monthly payout schedule",
      metaTone: "neutral",
    },
    {
      label: "Partner Tier",
      value: stats.tier,
      meta: `${stats.commissionPercent}% commission`,
      metaTone: "positive",
    },
  ];
  const navigate = useNavigate()


  useEffect(() => {
    fetchProfile();
    fetchData();
    fetchStats();
    fetchYears();
    fetchCurrentPartnerSettings();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getProfileCompletion();
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
  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data.data || data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchReferralTrends = async (year) => {
    try {
      const data = await getReferralTrends(year);
      setReferralTrends(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchYears = async () => {
    try {
      const res = await getAvailableYears();

      setYears(res.years);
      setSelectedYear(res.selectedYear);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchCurrentPartnerSettings = async () => {
    try {
      const data = await getCurrentPartnerSettings();

      setPartnerSettings({
        systemConfig: data.systemConfig || null,
      });
    } catch (err) {
      console.error("Failed to fetch partner settings:", err);
    }
  };

  const fetchCommissionChart = async (year) => {
    try {
      const data = await getCommissionChart(year);

      setCommissionData(data.chartData);
      setCommissionTotal(data.cumulativeTotal);
      setCommissionYears(data.availableYears);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReferralTrends(selectedYear);
  }, [selectedYear]);
  useEffect(() => {
    fetchCommissionChart(commissionYear);
  }, [commissionYear]);

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


  const handleLogout = useLogout();


  const handleNavSelect = (id) => {
    if (id === "logout") {
      handleLogout();
    } else {
      setActiveNavId(id);
    }
  };
  useEffect(() => {
    getNotifications("all", 1, RECENT_ACTIVITIES_PAGE_SIZE)
      .then((response) => {
        setRecentActivities(
          response.notifications.map((notification) => ({
            id: notification._id,
            icon: notification.icon,
            title: notification.title,
            meta: formatTimeAgo(notification.createdAt),
          }))
        );
      })
      .catch((error) => console.error("Failed to load recent activity ->", error));
  }, []);

  return (
    <div className="partner-dashboard">
      <SidebarNav
        brandTitle="TaxPartner Pro"
        brandSubtitle="Verified Consultant"
        items={NAV_ITEMS}
        footerItems={FOOTER_ITEMS}
        activeId={activeNavId}
        onItemSelect={handleNavSelect}
      />

      <div className="partner-dashboard__content">
        {/* <DashboardTopbar partnerName="Jonathan Doe" completionPercentage={85} /> */}
        <PageTopbar
          title="Partner Dashboard"
          // subtitle= {}
          completionPercentage={completionPercentage.percentage}
          // partnerName="Jonathan Doe"
          photoUrl={photo}
        />
        <main className="partner-dashboard__main">
          <div className="partner-dashboard__stats-grid">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="partner-dashboard__row">
            <QuickActionsCard
              onCreateReferral={() => setIsCreateModalOpen(true)}
              onViewReferrals={() => navigate("/my-referrals")}
              onViewCommissionHistory={() => navigate("/commission-management")}
            />
            <ProfileCompletionChecklist
              percentage={completionPercentage.percentage}
              items={completionPercentage.items}
            />
          </div>

          <div className="partner-dashboard__row partner-dashboard__row--charts">
            <ReferralTrendsChart
              data={referralTrends}
              years={years}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
            <CommissionEarningsChart
              data={commissionData}
              cumulativeTotal={commissionTotal}
              years={commissionYears}
              selectedYear={commissionYear}
              setSelectedYear={setCommissionYear}
            />
          </div>

          <div className="partner-dashboard__row partner-dashboard__row--bottom">
            <ConversionFunnelChart
              totalReferrals={stats.totalReferrals}
              proposalShared={stats.status === "Proposal Shared" ? stats.proposalShared : 0}
              converted={stats.converted}
            />
            <div className="partner-dashboard__sidebar-column">
              <RecentActivityFeed
                activities={recentActivities}
                onViewAll={() => navigate("/notifications")}
              />
              <TierUpsellBanner
                tier={stats.tier}
                commissionPercent={stats.commissionPercent}
                onClaimBonus={() => navigate("/commission-management")}
              />
            </div>
            <CreateReferralModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onCreate={handleCreateReferral}
              isSubmitting={isCreating}
              error={createError}
            />
          </div>
        </main>
      </div>
    </div>
  );
};


export default PartnerDashboard;
