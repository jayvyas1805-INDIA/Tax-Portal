import Button from "../../../../component/Button/Button";
import "./TierUpsellBanner.css";

const TierUpsellBanner = ({ tier, commissionPercent, onClaimBonus }) => {
  return (
    <div className="tier-upsell-banner">
      <p className="tier-upsell-banner__title">New Tier Unlocked!</p>
      <p className="tier-upsell-banner__description">
        You're now a {tier} Partner. Earn {commissionPercent}% commission by
        completing your next tier goals.
      </p>
      <Button variant="primary" onClick={onClaimBonus}>
        Claim Commission
      </Button>
    </div>
  );
};

export default TierUpsellBanner;