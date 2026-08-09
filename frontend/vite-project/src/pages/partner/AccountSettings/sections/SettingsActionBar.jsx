import Button from "../../../../component/Button/Button";
import "./SettingsActionBar.css";

const SettingsActionBar = ({ onReset, onSaveSettings, isSaving }) => {
  return (
    <div className="settings-action-bar">
      <p className="settings-action-bar__warning">
        ⚠ Changes here affect your global partner profile and payout
        notifications.
      </p>
      <div className="settings-action-bar__buttons">
        <Button variant="secondary" onClick={onReset} disabled={isSaving}>
          Reset
        </Button>
        <Button variant="primary" onClick={onSaveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsActionBar;
