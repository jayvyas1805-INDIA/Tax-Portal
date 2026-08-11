import { useEffect, useState } from "react";
import "./Settings.css";
import {
  getCommissionRules,
  createCommissionRule,
  updateCommissionRule,
  getQuarterlyForecast,
  getSystemConfig,
  updateSystemConfig,
} from "../../api/adminSettingsApi";
import { getTemplates, updateTemplate } from "../../api/adminSettingsApi";
import "./responsive.css";

const TABS = [
  { key: "commission-rules", label: "Commission Rules", icon: "📊" },
  { key: "roles-permissions", label: "Roles & Permissions", icon: "🔑" },
  { key: "email-templates", label: "Email/SMS Templates", icon: "✉" },
  { key: "system-config", label: "System Config", icon: "⚙" },
];

const TIERS = ["Emerging Bronze", "Standard Silver", "Strategic Gold"];

const TEMPLATE_LABELS = {
  kyc_approved: "KYC Approved",
  bank_details_approved: "Bank Details Approved",
  settings_changed: "Commission Rule / System Config Changed",
  referral_converted: "Referral Converted",
  partner_invite: "Invite Partner",
};

const formatCompactCurrency = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000) return ` ₹${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return ` ₹${(amount / 1_000).toFixed(0)}K`;
  return ` ₹${amount.toFixed(0)}`;
};


function CommissionRulesTab() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [newRule, setNewRule] = useState({
    tier: "",
    basePercent: "",
    thresholdAmount: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const rulesData = await getCommissionRules();

      setRules(rulesData);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load commission rules."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (rule) => {
    setEditingId(rule._id);

    setEditValues({
      basePercent: rule.basePercent,
      thresholdAmount: rule.thresholdAmount || "",
      status: rule.status,
    });
  };

  const saveEdit = async (id) => {
    try {
      setSaving(true);
      setError("");

      const updated = await updateCommissionRule(id, {
        basePercent: Number(editValues.basePercent),
        thresholdAmount: editValues.thresholdAmount,
        status: editValues.status,
      });

      setRules((prev) =>
        prev.map((r) =>
          r._id === id ? updated : r
        )
      );

      setEditingId(null);
      setEditValues({});
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update commission rule."
      );
    } finally {
      setSaving(false);
    }
  };

  const availableTiers = TIERS.filter(
    (tier) => !rules.some((rule) => rule.tier === tier)
  );

  const submitNewRule = async () => {
    if (!newRule.tier || !newRule.basePercent) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const created = await createCommissionRule({
        tier: newRule.tier,
        basePercent: Number(newRule.basePercent),
        thresholdAmount: newRule.thresholdAmount,
      });

      setRules((prev) =>
        [...prev, created].sort(
          (a, b) => b.basePercent - a.basePercent
        )
      );

      setAddingNew(false);

      setNewRule({
        tier: "",
        basePercent: "",
        thresholdAmount: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create commission rule."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="st__content">
      <div className="st__main">
        <div className="st__section-header">
          <h3>Active Commission Structures</h3>

          <button
            type="button"
            className="st__new-rule-btn"
            disabled={availableTiers.length === 0}
            onClick={() => setAddingNew((v) => !v)}
          >
            + New Rule
          </button>
        </div>

        {loading ? (
          <div className="st__state">
            Loading rules...
          </div>
        ) : error ? (
          <div className="st__state st__state--error">
            {error}
          </div>
        ) : (
          <table className="st__table">
            <thead>
              <tr>
                <th>PARTNER TIER</th>
                <th>BASE %</th>
                <th>THRESHOLD</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {/* CREATE NEW RULE */}
              {addingNew && (
                <tr>
                  <td className="st__edit-row">
                    <select
                      value={newRule.tier}
                      onChange={(e) =>
                        setNewRule((v) => ({
                          ...v,
                          tier: e.target.value,
                        }))
                      }
                    >
                      <option value="">
                        Select tier...
                      </option>

                      {availableTiers.map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="st__edit-row">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newRule.basePercent}
                      onChange={(e) =>
                        setNewRule((v) => ({
                          ...v,
                          basePercent: e.target.value,
                        }))
                      }
                    />
                  </td>

                  <td className="st__edit-row">
                    <input
                      type="text"
                      placeholder="e.g. ₹500k ARR or None"
                      value={newRule.thresholdAmount}
                      onChange={(e) =>
                        setNewRule((v) => ({
                          ...v,
                          thresholdAmount: e.target.value,
                        }))
                      }
                    />
                  </td>

                  <td>
                    <span className="st-pill">
                      Active
                    </span>
                  </td>

                  <td>
                    <div className="st__edit-actions">
                      <button
                        type="button"
                        className="st__save-btn"
                        disabled={saving}
                        onClick={submitNewRule}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        className="st__cancel-btn"
                        onClick={() => setAddingNew(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* EXISTING RULES */}
              {rules.map((rule) => (
                <tr key={rule._id}>
                  <td className="st__tier">
                    {rule.tier}
                  </td>

                  {editingId === rule._id ? (
                    <>
                      {/* BASE % */}
                      <td className="st__edit-row">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={editValues.basePercent}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              basePercent: e.target.value,
                            }))
                          }
                        />
                      </td>

                      {/* THRESHOLD */}
                      <td className="st__edit-row">
                        <input
                          type="text"
                          value={
                            editValues.thresholdAmount
                          }
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              thresholdAmount:
                                e.target.value,
                            }))
                          }
                        />
                      </td>

                      {/* STATUS */}
                      <td className="st__edit-row">
                        <select
                          value={editValues.status}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              status: e.target.value,
                            }))
                          }
                        >
                          <option value="Active">
                            Active
                          </option>

                          <option value="Inactive">
                            Inactive
                          </option>
                        </select>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="st__edit-actions">
                          <button
                            type="button"
                            className="st__save-btn"
                            disabled={saving}
                            onClick={() =>
                              saveEdit(rule._id)
                            }
                          >
                            {saving
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            className="st__cancel-btn"
                            onClick={() => {
                              setEditingId(null);
                              setEditValues({});
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* BASE % */}
                      <td className="st__base">
                        {rule.basePercent}%
                      </td>

                      {/* THRESHOLD */}
                      <td>
                        {rule.thresholdAmount || "None"}
                      </td>

                      {/* STATUS */}
                      <td>
                        <span className="st-pill">
                          {rule.status}
                        </span>
                      </td>

                      {/* EDIT */}
                      <td>
                        <button
                          type="button"
                          className="st__edit-btn"
                          onClick={() =>
                            startEdit(rule)
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}



function SystemConfigTab() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getSystemConfig();
        if (!isMounted) return;
        setConfig(data);
        setGoalInput(data.quarterlyRevenueGoal);
      } catch (err) {
        if (isMounted) setError(err?.response?.data?.message || "Failed to load system configuration.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const patch = async (payload) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated = await updateSystemConfig(payload);

      setConfig(updated);

      if (payload.quarterlyRevenueGoal !== undefined) {
        setGoalInput(updated.quarterlyRevenueGoal);
      }

      setSuccess("Settings saved successfully.");

      return true;
    } catch (err) {
      console.error("Failed to update system configuration:", err);

      setError(
        err?.response?.data?.message ||
        "Failed to save system configuration."
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="st__state">Loading system configuration...</div>;
  if (error) return <div className="st__state st__state--error">{error}</div>;

  return (
    <div className="st__grid">
      <div className="st-card">
        <h3>Revenue Goals</h3>
        <div className="st__field-row">
          <span>Quarterly Revenue Goal (used on the Dashboard)</span>
          <div className="st__edit-actions">
            <input
              type="number"
              className="st__number-input"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
            />
            <button
              type="button"
              className="st__save-btn"
              disabled={savingGoal || goalInput === ""}
              onClick={async () => {
                try {
                  setSavingGoal(true);
                  setError("");
                  setSuccess("");

                  const updated = await updateSystemConfig({
                    quarterlyRevenueGoal: Number(goalInput),
                  });

                  setConfig(updated);
                  setGoalInput(updated.quarterlyRevenueGoal);
                  setSuccess("Quarterly revenue goal saved successfully.");
                } catch (err) {
                  console.error(err);

                  setError(
                    err?.response?.data?.message ||
                    "Failed to save quarterly revenue goal."
                  );
                } finally {
                  setSavingGoal(false);
                }
              }}
            >
              {savingGoal ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <div className="st__field-row">
          <span>Payout Schedule Day of Month</span>
          <div className="st__edit-actions">
            <input
              type="number" min="1" max="28"
              className="st__number-input"
              value={config.payoutScheduleDay}
              onChange={(e) => setConfig((c) => ({ ...c, payoutScheduleDay: e.target.value }))}
            />
            <button
              type="button"
              className="st__save-btn"
              disabled={
                savingPayout ||
                Number(config?.payoutScheduleDay) < 1 ||
                Number(config?.payoutScheduleDay) > 28
              }
              onClick={async () => {
                try {
                  setSavingPayout(true);
                  setError("");
                  setSuccess("");

                  const updated = await updateSystemConfig({
                    payoutScheduleDay: Number(config.payoutScheduleDay),
                  });

                  setConfig(updated);
                  setSuccess("Payout schedule saved successfully.");
                } catch (err) {
                  console.error(err);

                  setError(
                    err?.response?.data?.message ||
                    "Failed to save payout schedule."
                  );
                } finally {
                  setSavingPayout(false);
                }
              }}
            >
              {savingPayout ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="st-card">
        <h3>Tax Compliance</h3>
        <div className="st__toggle-row">
          <span>W-9 Auto-verification</span>
          <button
            type="button"
            className={"st__switch" + (config.w9AutoVerify ? " is-on" : "")}
            disabled={saving}
            onClick={() => patch({ w9AutoVerify: !config.w9AutoVerify })}
            aria-label="Toggle W-9 Auto-verification"
          >
            <span />
          </button>
        </div>
        <div className="st__toggle-row">
          <span>1099-NEC Generation</span>
          <button
            type="button"
            className={"st__switch" + (config.nec1099Generation ? " is-on" : "")}
            disabled={saving}
            onClick={() => patch({ nec1099Generation: !config.nec1099Generation })}
            aria-label="Toggle 1099-NEC Generation"
          >
            <span />
          </button>
        </div>
      </div>
    </div>
  );
}



function EmailSmsTemplatesTab() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedKey, setSelectedKey] = useState("kyc_approved");
  const [channel, setChannel] = useState("email");
  const [draft, setDraft] = useState({ subject: "", body: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const current = templates.find((t) => t.key === selectedKey && t.channel === channel);
    if (current) {
      setDraft({
        subject: current.subject || "",
        body: current.body || "",
        isActive: current.isActive,
      });
    }
  }, [templates, selectedKey, channel]);

  const currentTemplate = templates.find((t) => t.key === selectedKey && t.channel === channel);

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated = await updateTemplate(selectedKey, channel, draft);

      setTemplates((prev) =>
        prev.map((t) => (t.key === selectedKey && t.channel === channel ? updated : t))
      );
      setSuccess("Template saved successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="st__state">Loading templates...</div>;

  return (
    <div className="st__content">
      <div className="st__main">
        <div className="st__section-header">
          <h3>Email &amp; SMS Templates</h3>
        </div>

        <div className="st__field-row">
          <span>Template</span>
          <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)}>
            {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="st__tabs" style={{ margin: "12px 0" }}>
          <button
            type="button"
            className={"st__tab" + (channel === "email" ? " st__tab--active" : "")}
            onClick={() => setChannel("email")}
          >
            ✉ Email
          </button>
          <button
            type="button"
            className={"st__tab" + (channel === "sms" ? " st__tab--active" : "")}
            onClick={() => setChannel("sms")}
          >
            💬 SMS
          </button>
        </div>

        {error && <div className="st__state st__state--error">{error}</div>}
        {success && <div className="st__state">{success}</div>}

        {channel === "email" && (
          <div className="st__field-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <span>Subject</span>
            <input
              type="text"
              value={draft.subject}
              onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
            />
          </div>
        )}

        <div className="st__field-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <span>Body {channel === "email" ? "(HTML supported)" : ""}</span>
          <textarea
            rows={channel === "email" ? 10 : 4}
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            style={{ fontFamily: "monospace", padding: 8 }}
          />
        </div>

        <p className="st__placeholder">
          Available variables for this template:{" "}
          <code>{"{{" + getVarsForKey(selectedKey).join("}}, {{") + "}}"}</code>
        </p>

        <div className="st__toggle-row">
          <span>Active</span>
          <button
            type="button"
            className={"st__switch" + (draft.isActive ? " is-on" : "")}
            onClick={() => setDraft((d) => ({ ...d, isActive: !d.isActive }))}
            aria-label="Toggle template active"
          >
            <span />
          </button>
        </div>

        <div className="st__edit-actions" style={{ marginTop: 16 }}>
          <button type="button" className="st__save-btn" disabled={saving} onClick={save}>
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Just for the variable hint under the textarea — keep in sync with defaultTemplates.js
function getVarsForKey(key) {
  switch (key) {
    case "kyc_approved":
    case "bank_details_approved":
      return ["partnerName"];
    case "settings_changed":
      return ["partnerName", "changeSummary"];
    case "referral_converted":
      return ["partnerName", "clientName", "commissionAmount", "commissionRate"];
    case "partner_invite":
      return ["inviteeName", "inviteLink"];
    default:
      return [];
  }
}

export default function Settings() {
  const [tab, setTab] = useState("commission-rules");

  return (
    <div className="st">
      <div className="st__topbar">
        <h1>System Settings</h1>
        <p>Configure enterprise-level parameters, manage permissions, and audit system activities.</p>
      </div>

      <div className="st__tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={"st__tab" + (tab === t.key ? " st__tab--active" : "")}
            onClick={() => setTab(t.key)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === "commission-rules" && <CommissionRulesTab />}
      {tab === "system-config" && <SystemConfigTab />}

      {tab === "roles-permissions" && (
        <div className="st-card">
          <h3>Roles &amp; Permissions</h3>
          <p className="st__placeholder">
            Not wired yet — your Admin model currently only supports a single "admin"
            role (no manager/analyst/viewer distinctions, no permission scopes). Building
            this needs a proper roles &amp; permissions schema first. Let me know if you
            want that designed and built.
          </p>
        </div>
      )}

      {tab === "email-templates" && (
        <div className="st-card">
          <h3>Email/SMS Templates</h3>
          <p className="st__placeholder">
            Not wired yet — emails are currently sent with hardcoded HTML inline in the
            code (see the verification email in authController.js), and there's no
            template storage or SMS integration anywhere in the backend. Building this
            needs a new EmailTemplate model plus an SMS provider integration.
          </p>
        </div>
      )}
    </div>
  );
}
