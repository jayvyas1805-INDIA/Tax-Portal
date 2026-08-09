import "./ProfileTabs.css";

const TABS = [
  { id: "personal", label: "Personal Info" },
  { id: "professional", label: "Professional Info" },
  { id: "address", label: "Address Info" },
];

const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="profile-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`profile-tabs__tab${
            tab.id === activeTab ? " profile-tabs__tab--active" : ""
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
