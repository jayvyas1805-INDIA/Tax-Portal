// controllers/profileController.js

import Partner from "../models/Partner.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { computeProfileCompletion } from "../utils/profileCompletion.js";

export const getProfile = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id)
      .select(
        "-password -refreshTokenHash -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires"
      );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error("getProfile error ->", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching profile.",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found.",
      });
    }

    const {
      fullName,
      mobileNumber,
      dateOfBirth,
      gender,

      occupation,
      companyName,
      experienceYears,

      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
    } = req.body;

    // --------------------------
    // Personal Information
    // --------------------------

    if (fullName !== undefined)
      partner.personalInfo.fullName = fullName;

    if (mobileNumber !== undefined)
      partner.personalInfo.mobileNumber = mobileNumber;

    if (dateOfBirth !== undefined)
      partner.personalInfo.dateOfBirth = dateOfBirth;

    if (gender !== undefined)
      partner.personalInfo.gender = gender;

    // --------------------------
    // Professional Information
    // --------------------------

    if (occupation !== undefined)
      partner.professionalInfo.occupation = occupation;

    if (companyName !== undefined)
      partner.professionalInfo.companyName = companyName;

    if (experienceYears !== undefined)
      partner.professionalInfo.experienceYears = experienceYears;

    // --------------------------
    // Address Information
    // --------------------------

    if (addressLine1 !== undefined)
      partner.addressInfo.addressLine1 = addressLine1;

    if (addressLine2 !== undefined)
      partner.addressInfo.addressLine2 = addressLine2;

    if (city !== undefined)
      partner.addressInfo.city = city;

    if (state !== undefined)
      partner.addressInfo.state = state;

    if (pincode !== undefined)
      partner.addressInfo.pincode = pincode;

    await partner.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: partner,
    });

  } catch (error) {

    console.error("updateProfile error ->", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating profile.",
    });
  }
};



export const uploadProfilePhoto = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      "partner-profile"
    );

    partner.profileImage = imageUrl;

    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      profileImage: partner.profileImage,
    });
  } catch (error) {
    console.error("uploadProfilePhoto:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload profile photo",
    });
  }
};



export const getProfileCompletion = async (req, res) => {
    try {
        const partner = await Partner.findById(req.user.id);

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Partner not found",
            });
        }
        const completion = computeProfileCompletion(partner);

        return res.status(200).json({
            success: true,
            ...completion,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};