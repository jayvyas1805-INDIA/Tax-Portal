import { useRef } from "react";
import Button from "../../../../component/Button/Button";
import "./ProfilePhotoCard.css";

const ProfilePhotoCard = ({
  photoUrl,
  name,
  title,
  onUpload,
  isUploading,
}) => {
  const fileInputRef = useRef(null);

  const handleSelect = () => {
    if (isUploading) return;
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onUpload(file);
    e.target.value = ""; // allow re-selecting the same file later
  };

  return (
    <div className="profile-photo-card">
      <div className="profile-photo-card__photo-wrap">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="profile-photo-card__photo"
          />
        ) : (
          <span className="profile-photo-card__placeholder">🧑</span>
        )}
      </div>

      <p className="profile-photo-card__name">{name}</p>
      <p className="profile-photo-card__title">{title}</p>

      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="profile-photo-card__actions">
        <Button variant="primary" onClick={handleSelect} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePhotoCard;