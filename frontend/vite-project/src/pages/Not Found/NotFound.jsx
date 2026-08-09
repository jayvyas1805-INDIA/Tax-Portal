import { Link } from "react-router-dom";
import {useNavigate} from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1 className="not-found-heading">404</h1>
        <p className="not-found-subtitle">Page Not Found</p>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button className="not-found-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
        
      </div>
    </div>
  );
}
