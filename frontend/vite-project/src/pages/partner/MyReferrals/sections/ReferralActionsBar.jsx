import Button from "../../../../component/Button/Button";
import "./ReferralActionsBar.css";

const ReferralActionsBar = ({ onCreateReferral, onExportExcel, onExportPdf }) => {
  return (
    <div className="referral-actions-bar">
      <Button variant="primary" onClick={onCreateReferral}>
        + Create New Referral
      </Button>
      <Button variant="secondary" onClick={onExportExcel}>
        ⬇ Export Excel
      </Button>
      <Button variant="secondary" onClick={onExportPdf}>
        ⬇ Export PDF
      </Button>
    </div>
  );
};

export default ReferralActionsBar;
