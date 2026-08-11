import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import kycRoutes from "./routes/kycRoutes.js"
import bankDetailsRoutes from './routes/bankDetailsRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js'
import commissionRoutes from './routes/commissionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import adminPartnerRoutes from './routes/adminPartnerRoutes.js';
import adminReferralRoutes from './routes/adminReferralRoutes.js';
import adminCommissionRoutes from './routes/adminCommissionRoutes.js';
import adminBusinessRoutes from './routes/adminBusinessRoutes.js';
import adminReviewRoutes from './routes/adminReviewRoutes.js';
import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes.js';
import adminNotificationRoutes from './routes/adminNotificationRoutes.js';
import adminSettingsRoutes from './routes/adminSettingsRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : [];

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json()); // ✅ REQUIRED
app.use(express.urlencoded({ extended: true })); // optional but good

app.use('/api/auth', authRoutes);
app.use("/api/partner/profile", profileRoutes);
app.use("/api/partner/settings", settingRoutes);  
app.use("/api/partner/kyc",kycRoutes)
app.use('/api/partner/bank-details', bankDetailsRoutes)
app.use("/api/partner/referrals",referralRoutes)
app.use("/api/partner/dashboard",dashboardRoutes)
app.use("/api/partner/commission", commissionRoutes)
app.use("/api/partner/notifications", notificationRoutes)
app.use("/api/admin/dashboard", adminDashboardRoutes)
app.use("/api/admin/partners", adminPartnerRoutes)
app.use("/api/admin/referrals", adminReferralRoutes)
app.use("/api/admin/commissions", adminCommissionRoutes)
app.use("/api/admin/business", adminBusinessRoutes)
app.use("/api/admin/analytics", adminAnalyticsRoutes)
app.use("/api/admin/reviews", adminReviewRoutes)
app.use("/api/admin/notifications", adminNotificationRoutes)
app.use("/api/admin/settings", adminSettingsRoutes);

const server = async () => {
  try {
    await connectDB();

    app.listen(process.env.PORT || 3000, () => {
      console.log("server started on", process.env.PORT);
    });
  } catch (error) {
    console.log("ERROR->", error);
  }
};

server();
