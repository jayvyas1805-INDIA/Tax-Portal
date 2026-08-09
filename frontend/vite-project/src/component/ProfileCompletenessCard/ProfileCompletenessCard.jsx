import "./ProfileCompletenessCard.css";

const ProfileCompletenessCard = ({ percentage }) => {
  return (
    <div className="profile-completeness">
      <span className="profile-completeness__icon" aria-hidden="true">
        🏆
      </span>
      <div className="profile-completeness__text">
        <p className="profile-completeness__title">Profile Completeness</p>
        <p className="profile-completeness__description">
          Complete 100% to activate your referral link immediately.
        </p>
      </div>
      <span className="profile-completeness__percentage">{percentage}%</span>
    </div>
  );
};

export default ProfileCompletenessCard;
