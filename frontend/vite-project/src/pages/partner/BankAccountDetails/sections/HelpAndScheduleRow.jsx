import "./HelpAndScheduleRow.css";

const HelpAndScheduleRow = ({ nextPayoutDate }) => {
  return (
    <div className="help-and-schedule-row">
      <div className="help-and-schedule-row__card">
        <span aria-hidden="true">💬</span>
        <div>
          <p className="help-and-schedule-row__title">Need Help?</p>
          <p className="help-and-schedule-row__text">Contact Billing Support</p>
        </div>
      </div>

      <div className="help-and-schedule-row__card">
        <span aria-hidden="true">📅</span>
        <div>
          <p className="help-and-schedule-row__title">Next Payout</p>
          <p className="help-and-schedule-row__text">
            Scheduled for {nextPayoutDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpAndScheduleRow;
