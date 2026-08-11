import { useState } from "react";
import "./ConvertReferralLead.css";
import "./responsive.css";

export default function ConvertReferralLead() {
  const [businessValue, setBusinessValue] = useState(0);
  const [netRevenue, setNetRevenue] = useState(0);
  const [commRate] = useState(5);
  const [tierBonus] = useState(0);

  const baseRevenue = Number(businessValue) || 0;
  const commAmount = (baseRevenue * commRate) / 100;
  const total = commAmount + tierBonus;

  return (
    <div className="rl">
      <div className="rl__breadcrumb">Referral Management &nbsp;›&nbsp; Lead Conversion</div>

      <div className="rl__topbar">
        <div>
          <h1>Convert Referral Lead</h1>
          <p>Finalize the conversion process and calculate partner commissions.</p>
        </div>
        <button type="button" className="rl__btn rl__btn--ghost">Save Draft</button>
      </div>

      <div className="rl__grid">
        <div className="rl__main">
          <div className="rl-card">
            <h3>📄 Conversion Details</h3>

            <div className="rl__field-row">
              <div className="rl__field">
                <label>REFERRAL ID</label>
                <input type="text" defaultValue="REF-2023-9981" disabled />
              </div>
              <div className="rl__field">
                <label>CLIENT NAME</label>
                <input type="text" placeholder="Enter client's legal name" />
              </div>
            </div>

            <div className="rl__field-row">
              <div className="rl__field">
                <label>SERVICE SOLD</label>
                <select defaultValue="Corporate Tax Filing (5% Commission)">
                  <option>Corporate Tax Filing (5% Commission)</option>
                  <option>Audit Services (7% Commission)</option>
                  <option>Advisory (6% Commission)</option>
                </select>
              </div>
              <div className="rl__field">
                <label>CONVERSION DATE</label>
                <input type="date" />
              </div>
            </div>

            <div className="rl__field-row">
              <div className="rl__field">
                <label>BUSINESS VALUE (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={businessValue}
                  onChange={(e) => setBusinessValue(e.target.value)}
                />
                <p className="rl__field-note">Total contract value of the deal.</p>
              </div>
              <div className="rl__field">
                <label>NET REVENUE (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={netRevenue}
                  onChange={(e) => setNetRevenue(e.target.value)}
                />
                <p className="rl__field-note">Revenue after internal operational costs.</p>
              </div>
            </div>
          </div>

          <div className="rl__notice-row">
            <div className="rl-card rl__notice">
              <span className="rl__notice-icon">ℹ</span>
              <div>
                <p className="rl__notice-title">Compliance Check</p>
                <p className="rl__notice-detail">
                  All converted leads must undergo a mandatory 24-hour audit review before commission payout.
                </p>
              </div>
            </div>
            <div className="rl-card rl__notice rl__notice--positive">
              <span className="rl__notice-icon">✓</span>
              <div>
                <p className="rl__notice-title">Tier Eligibility</p>
                <p className="rl__notice-detail">
                  Converting this lead may qualify the partner for the &lsquo;Platinum Tier&rsquo; referral status.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rl__side">
          <div className="rl-card">
            <h3>🧮 Commission Logic</h3>
            <div className="rl__logic-row">
              <span>Base Revenue</span>
              <strong>${baseRevenue.toFixed(2)}</strong>
            </div>
            <div className="rl__logic-row">
              <span>Comm. Rate (%)</span>
              <strong>{commRate}%</strong>
            </div>
            <div className="rl__logic-row">
              <span>Tier Bonus</span>
              <strong>+${tierBonus.toFixed(2)}</strong>
            </div>

            <div className="rl__total">
              <p>TOTAL COMMISSION</p>
              <p className="rl__total-value">${total.toFixed(2)}</p>
            </div>

            <button type="button" className="rl__calc-btn">↻ Calculate Commission</button>
            <button type="button" className="rl__mark-btn">✓ Mark as Converted</button>
          </div>

          <div className="rl-card rl__partner">
            <div className="rl__partner-header">
              <span className="rl__partner-icon">⬇</span>
              <div>
                <p className="rl__partner-name">Elite Tax Group</p>
                <p className="rl__partner-tier">GOLD PARTNER</p>
              </div>
            </div>
            <div className="rl__partner-stats">
              <div>
                <p className="rl__partner-stat-label">YTD CONV.</p>
                <p className="rl__partner-stat-value">24</p>
              </div>
              <div>
                <p className="rl__partner-stat-label">YTD PAID</p>
                <p className="rl__partner-stat-value">$12.4k</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
