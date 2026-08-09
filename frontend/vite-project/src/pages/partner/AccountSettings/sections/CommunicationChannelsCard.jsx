import "./CommunicationChannelsCard.css";

const CHANNELS = [
  { id: "emailNotifications", label: "Email Notifications", note: "Important account and update alerts" },
  { id: "smsNotifications", label: "SMS Notifications", note: "Security codes and critical payout info" },
  { id: "whatsappNotifications", label: "WhatsApp Notifications", note: "Instant chat-based referral alerts" },
  { id: "marketingEmails", label: "Marketing Emails", note: "Tips, offers, and news about the partner program" },
];

const CommunicationChannelsCard = ({ preferences, onToggle }) => {
  return (
    <div className="communication-channels-card">
      <p className="communication-channels-card__title">
        🔔 Communication Channels
      </p>

      <ul className="communication-channels-card__list">
        {CHANNELS.map((channel) => (
          <li key={channel.id} className="communication-channels-card__item">
            <input
              type="checkbox"
              id={channel.id}
              checked={preferences[channel.id]}
              onChange={() => onToggle(channel.id)}
            />
            <label htmlFor={channel.id}>
              <span className="communication-channels-card__item-label">
                {channel.label}
              </span>
              <span className="communication-channels-card__item-note">
                {channel.note}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunicationChannelsCard;
