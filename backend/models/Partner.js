import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const partnerSchema = new mongoose.Schema(
  {
    // ---- Auth (top-level, mirrors personalInfo.emailAddress for fast login lookup) ----
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["partner"],
      default: "partner",
    },

    // Drives which CommissionRule applies when a referral converts. Every
    // partner starts at the base tier and can be promoted by an admin.
    tier: {
      type: String,
      enum: ["Emerging Bronze", "Standard Silver", "Strategic Gold"],
      default: "Emerging Bronze",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    refreshTokenHash: {
      type: String,
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },
    // ---- Account Settings ----
    settings: {
      security: {
        lastPasswordChanged: {
          type: Date,
          default: Date.now,
        },
      },

      communication: {
        emailNotifications: {
          type: Boolean,
          default: true,
        },
        smsNotifications: {
          type: Boolean,
          default: true,
        },
        whatsappNotifications: {
          type: Boolean,
          default: true,
        },
        marketingEmails: {
          type: Boolean,
          default: false,
        },
      },

      accessControl: {
        activeSessions: {
          type: Number,
          default: 1,
        },
        loginHistory: [
          {
            loginAt: Date,
            ipAddress: String,
            device: String,
          },
        ],
      },
    },

    // ---- Step 1: Personal Info ----
    personalInfo: {
      fullName: { type: String, required: true, trim: true },
      mobileNumber: { type: String, required: true, trim: true },
      dateOfBirth: { type: Date, required: true },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
      },
      status: {
        type: String,
        enum: ["complete"],
        default: "complete",
      },
    },

    // ---- Step 2: Professional Info ----
    professionalInfo: {
      occupation: { type: String, required: true },
      companyName: { type: String, trim: true, default: "" },
      experienceYears: { type: Number, required: true },
      status: {
        type: String,
        enum: ["complete"],
        default: "complete",
      },
    },

    // ---- Step 3: Address Info ----
    addressInfo: {
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true, default: "" },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true, trim: true },
      status: {
        type: String,
        enum: ["complete"],
        default: "complete",
      },
    },

    // ---- Step 4: KYC Verification ----
    kycInfo: {
      panNumber: { type: String, required: true, uppercase: true, trim: true },
      aadhaarNumber: { type: String, required: true, trim: true },

      panCard: {
        fileUrl: { type: String, default: "" },
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
        adminRemarks: { type: String, default: "" },
        submittedAt: { type: Date, default: Date.now },
      },

      aadhaarCard: {
        fileUrl: { type: String, default: "" },
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
        adminRemarks: { type: String, default: "" },
        submittedAt: { type: Date, default: Date.now },
      },

      photo: {
        fileUrl: { type: String, default: "" },
        status: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
        adminRemarks: { type: String, default: "" },
        submittedAt: { type: Date, default: Date.now },
      },

      history: [
        {
          documentType: {
            type: String,
            enum: ["PAN Card Copy", "Aadhaar Front & Back", "Live Photograph"],
          },
          fileUrl: String,
          status: {
            type: String,
            enum: ["pending", "verified", "rejected"],
          },
          adminRemarks: String,
          submittedAt: Date,
        },
      ],
      status: {
        type: String,
        enum: ["complete","pending"],
        default: "pending",
      },
    },

    // ---- Step 5: Banking Info ----
    bankingInfo: {
      accountHolderName: { type: String, required: true, trim: true },
      bankName: { type: String, required: true },
      branch: { type: String, trim: true, default: "" },
      accountNumber: { type: String, required: true, select: false },
      ifscCode: { type: String, required: true, uppercase: true, trim: true },
      accountType: {
        type: String,
        enum: ["savings", "current"],
        required: true,
      },
      cancelledChequeFileUrl: { type: String, default: "" },
      adminRemarks: { type: String, default: "" },
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      status: {
        type: String,
        enum: ["complete","pending"],
        default: "pending",
      },
    },

    // ---- Payout history — populated by admin/finance, read-only for partners ----
    payouts: [
      {
        amount: Number,
        paidAt: Date,
        utrNumber: String,
        status: {
          type: String,
          enum: ["paid", "processing", "failed"],
          default: "paid",
        },
      },
    ],

    // ---- Steps 6 & 7: Review + Legal Acceptance ----
    agreement: {
      agreedToTerms: { type: Boolean, required: true, default: false },
      agreedToTermsConditions: { type: Boolean, required: true, default: false },
      agreedToPrivacyPolicy: { type: Boolean, required: true, default: false },
      agreedAt: { type: Date, default: null },
      status: {
        type: String,
        enum: ["complete","pending"],
        default: "complete"
      }
    },

    // ---- Registration + application meta ----
    registration: {
      referenceNumber: { type: String, unique: true, sparse: true },
      currentStep: { type: Number, default: 7 },
      isCompleted: { type: Boolean, default: true },
      submittedAt: { type: Date, default: Date.now },
      applicationStatus: {
        type: String,
        enum: ["pending_review", "approved", "rejected"],
        default: "pending_review",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
partnerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare a plaintext password against the stored hash
partnerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Partner = mongoose.model("Partner", partnerSchema);

export default Partner;
