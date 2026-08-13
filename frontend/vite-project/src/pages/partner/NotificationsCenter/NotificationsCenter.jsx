import { useState, useEffect, useCallback } from "react";
import SidebarNav from "../../../component/SidebarNav/SidebarNav";
import PageTopbar from "../../../component/PageTopbar/PageTopbar";
import NotificationTabs from "./sections/NotificationTabs";
import NotificationsList from "./sections/NotificationsList";
import UnreadBanner from "./sections/UnreadBanner";
import { useLogout } from "../../../hooks/useLogout";
import { getProfile, getProfileCompletion } from "../../../api/profileApi"
import NotificationDetailModal from "./sections/NotificationDetailModal";
import {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
} from "../../../api/notificationApi";
import "./NotificationsCenter.css";

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
const PAGE_SIZE = 5;

const NotificationsCenter = () => {
  const [activeNavId, setActiveNavId] = useState("notifications");
  const [activeTab, setActiveTab] = useState("all");
  const [completionPercentage, setCompletionPercentage] = useState({
    percentage: 0,
    items: [],
  });
  const [photo, setPhoto] = useState("")

  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const handleLogout = useLogout();


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

  const loadNotifications = useCallback(
    async (pageToLoad, append) => {
      setIsLoading(true);
      try {
        const response = await getNotifications(activeTab, pageToLoad, PAGE_SIZE);
        setNotifications((previous) =>
          append ? [...previous, ...response.notifications] : response.notifications
        );
        setHasMore(response.hasMore);
        setTotalUnreadCount(response.totalUnreadCount);
        setPage(pageToLoad);
      } catch (error) {
        console.error("Failed to load notifications ->", error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    loadNotifications(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleLoadOlder = () => {
    loadNotifications(page + 1, true);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((previous) => previous.map((n) => ({ ...n, isRead: true })));
      setTotalUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read ->", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);

    if (notification.isRead) return;

    setNotifications((previous) =>
      previous.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
    );
    setTotalUnreadCount((previous) => Math.max(0, previous - 1));
    try {
      await markOneAsRead(notification._id);
    } catch (error) {
      console.error("Failed to mark notification as read ->", error);
    }
  };

  return (
    <div className="notifications-center">
      <SidebarNav
        brandTitle="Udyog Mantra"
        brandSubtitle="Partner Portal"
        items={NAV_ITEMS}
        footerItems={FOOTER_ITEMS}
        activeId={activeNavId}
        onItemSelect={handleNavSelect}
      />

      <div className="notifications-center__content">
        <PageTopbar
          title="Notifications"
          completionPercentage={completionPercentage.percentage}
          photoUrl={photo}
        />

        <main className="notifications-center__main">
          <NotificationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onMarkAllRead={handleMarkAllRead}
          />

          {isLoading && notifications.length === 0 ? (
            <p className="notifications-center__status">Loading notifications...</p>
          ) : (
            <NotificationsList
              notifications={notifications}
              hasMore={hasMore}
              onLoadOlder={handleLoadOlder}
              onNotificationClick={handleNotificationClick}
            />
          )}

          <UnreadBanner unreadCount={totalUnreadCount} onManagePreferences={() => { }} />

          <NotificationDetailModal
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
          />
        </main>
      </div>
    </div>
  );
};

export default NotificationsCenter;