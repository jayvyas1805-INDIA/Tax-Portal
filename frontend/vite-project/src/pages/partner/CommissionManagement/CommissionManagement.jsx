import { useState, useEffect, useCallback } from "react";
import SidebarNav from "../../../component/SidebarNav/SidebarNav";
import PageTopbar from "../../../component/PageTopbar/PageTopbar";
import StatCard from "../../../component/StatCard/StatCard";
import AvailableBalanceCard from "./sections/AvailableBalanceCard";
import CommissionTrendChart from "./sections/CommissionTrendChart";
import ReportingToolsCard from "./sections/ReportingToolsCard";
import RecentTransactionsTable from "./sections/RecentTransactionsTable";
import { useLogout } from "../../../hooks/useLogout";
import {getProfile,getProfileCompletion} from "../../../api/profileApi"
import {
  getCommissionSummary,
  getTransactions,
  exportTransactions,
  requestWithdrawal,
} from "../../../api/commissionApi";
import "./CommissionManagement.css";

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

const PAGE_SIZE = 10;

const CommissionManagement = () => {
  const [activeNavId, setActiveNavId] = useState("commission");
  const handleLogout = useLogout();
  const [summary, setSummary] = useState(null);
  const [range, setRange] = useState("6m");
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("success");
  const [completionPercentage, setCompletionPercentage] = useState({
    percentage: 0,
    items: [],
  });
  const [photo, setPhoto] = useState("")




  const handleNavSelect = (id) => {
    if (id === "logout") {
      handleLogout();
    } else {
      setActiveNavId(id);
    }
  };


  useEffect(() => {
    fetchProfile();
    fetchData();
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


  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const response = await getCommissionSummary(range);
      setSummary(response.summary);
    } catch (error) {
      console.error("Failed to load commission summary ->", error);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [range]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const loadTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    try {
      const response = await getTransactions(searchTerm, currentPage, PAGE_SIZE);
      setTransactions(response.transactions);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to load transactions ->", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleWithdraw = async () => {
    setStatusMessage("");
    setIsWithdrawing(true);
    try {
      const response = await requestWithdrawal();
      setStatusMessage(response.message);
      setStatusTone("success");
      loadSummary();
    } catch (error) {
      setStatusMessage(
        error.response?.data?.message || "Something went wrong while requesting your withdrawal."
      );
      setStatusTone("error");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleExport = async (format) => {
    try {
      await exportTransactions(format);
    } catch (error) {
      console.error("Export failed ->", error);
    }
  };

  const stats = summary
    ? [
        { label: "Total Earnings", value: `₹${summary.totalEarnings.toLocaleString()}`, meta: "All-time", metaTone: "neutral" },
        { label: "Paid", value: `₹${summary.paid.toLocaleString()}`, meta: "Credited by company", metaTone: "positive" },
        { label: "Pending", value: `₹${summary.pending.toLocaleString()}`, meta: "Awaiting approval", metaTone: "warning" },
        { label: "Company Fee", value: `₹${summary.companyFee.toLocaleString()}`, meta: "Deducted", metaTone: "neutral" },
      ]
    : [];

  return (
    <div className="commission-management">
      <SidebarNav
        brandTitle="Udyog Mantra"
        brandSubtitle="Partner Portal"
        items={NAV_ITEMS}
        footerItems={FOOTER_ITEMS}
        activeId={activeNavId}
        onItemSelect={handleNavSelect}
      />

      <div className="commission-management__content">
         <PageTopbar 
          title="Commission Management" 
          completionPercentage={completionPercentage.percentage}
          photoUrl={photo}
          />

        <main className="commission-management__main">
          {statusMessage && (
            <p className={`commission-management__status commission-management__status--${statusTone}`}>
              {statusMessage}
            </p>
          )}

          {!isLoadingSummary && summary && (
            <>
              <div className="commission-management__top-row">
                <div className="commission-management__stats-grid">
                  {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                  ))}
                </div>
                <AvailableBalanceCard
                  availableBalance={summary.availableBalance}
                  totalWithdrawn={summary.totalWithdrawn}
                  pendingApproval={summary.pendingApproval}
                  onWithdraw={handleWithdraw}
                  isWithdrawing={isWithdrawing}
                />
              </div>

              <div className="commission-management__row">
                <CommissionTrendChart
                  data={summary.trend}
                  range={range}
                  onRangeChange={setRange}
                />
                <ReportingToolsCard
                  onDownloadStatement={() => handleExport("csv")}
                  onDownloadInvoice={() => handleExport("pdf")}
                />
              </div>
            </>
          )}

          {!isLoadingTransactions && (
            <RecentTransactionsTable
              transactions={transactions}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default CommissionManagement;
