import { useEffect, useState } from "react";
import { getCdos, createCdo, updateCdoStatus } from "../../api/adminCdoApi";
import "./CdoManagement.css";

const EMPTY_FORM = { name: "", email: "", password: "", confirmPassword: "" };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

// Mirrors the backend rules so people get instant feedback.
const validate = (form) => {
  if (!form.name.trim()) return "Please enter the full name.";
  if (!EMAIL_REGEX.test(form.email.trim())) return "Enter a valid email address.";
  if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    return "Password must be at least 8 characters and include a letter and a number.";
  }
  if (form.password !== form.confirmPassword) return "Password and Confirm Password must match.";
  return "";
};

export default function CdoManagement() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [cdos, setCdos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setListError("");
        const data = await getCdos();
        if (isMounted) setCdos(data);
      } catch (err) {
        if (isMounted) {
          setListError(err?.response?.data?.message || "Failed to load Admin CDO accounts.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    const problem = validate(form);
    if (problem) {
      setFormError(problem);
      return;
    }

    try {
      setSubmitting(true);
      const res = await createCdo({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setCdos((prev) => [res.data, ...prev]);
      setFormSuccess(
        `${res.data.name} can now sign in from the normal login page with ${res.data.email}.`
      );
      setForm(EMPTY_FORM);
      setShowPassword(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create Admin CDO. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (cdo) => {
    const next = !cdo.isActive;

    if (
      !next &&
      !window.confirm(`Deactivate ${cdo.name}? They will be signed out and unable to log in.`)
    ) {
      return;
    }

    try {
      setUpdatingId(cdo.id);
      setListError("");
      const updated = await updateCdoStatus(cdo.id, next);
      setCdos((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setListError(err?.response?.data?.message || "Failed to update status. Try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="cdo">
      <div className="cdo__topbar">
        <h1>Admin CDO Management</h1>
        <p>
          Register managers who can sign in from the regular login page. An Admin CDO only sees
          the Dashboard, Partner Management and Referral Management.
        </p>
      </div>

      <div className="cdo-card">
        <h3 className="cdo-card__title">Register Admin CDO</h3>

        <form className="cdo__form" onSubmit={handleSubmit} noValidate>
          <label className="cdo__field">
            <span>Full Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              disabled={submitting}
              autoComplete="off"
            />
          </label>

          <label className="cdo__field">
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@company.com"
              disabled={submitting}
              autoComplete="off"
            />
          </label>

          <label className="cdo__field">
            <span>Password</span>
            <div className="cdo__password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters, letter + number"
                disabled={submitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="cdo__toggle"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="cdo__field">
            <span>Confirm Password</span>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              disabled={submitting}
              autoComplete="new-password"
            />
          </label>

          <div className="cdo__form-footer">
            <div className="cdo__messages">
              {formError && <p className="cdo__msg cdo__msg--error">{formError}</p>}
              {formSuccess && <p className="cdo__msg cdo__msg--success">{formSuccess}</p>}
            </div>
            <button type="submit" className="cdo__btn cdo__btn--primary" disabled={submitting}>
              {submitting ? "Creating..." : "Register Admin CDO"}
            </button>
          </div>
        </form>
      </div>

      <div className="cdo-card cdo__list">
        <div className="cdo__list-header">
          <h3 className="cdo-card__title">Admin CDO Accounts</h3>
          <span className="cdo__count">{cdos.length} total</span>
        </div>

        {listError && <p className="cdo__msg cdo__msg--error cdo__msg--pad">{listError}</p>}

        {loading ? (
          <div className="cdo__state">Loading Admin CDO accounts...</div>
        ) : cdos.length === 0 ? (
          <div className="cdo__state">No Admin CDO accounts yet. Register one above.</div>
        ) : (
          <div className="cdo__table-wrap">
            <table className="cdo__table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>STATUS</th>
                  <th>LAST LOGIN</th>
                  <th>CREATED</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cdos.map((cdo) => (
                  <tr key={cdo.id}>
                    <td className="cdo__name">{cdo.name}</td>
                    <td>{cdo.email}</td>
                    <td>
                      <span className={"cdo-pill " + (cdo.isActive ? "cdo-pill--active" : "cdo-pill--inactive")}>
                        ● {cdo.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td>{cdo.lastLogin ? formatDate(cdo.lastLogin, true) : "Never"}</td>
                    <td>{formatDate(cdo.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="cdo__btn"
                        disabled={updatingId === cdo.id}
                        onClick={() => toggleStatus(cdo)}
                      >
                        {updatingId === cdo.id ? "..." : cdo.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
