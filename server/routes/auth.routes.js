import express from "express";
import jwt from "jsonwebtoken";
import { User, Company, OTP } from "../models/index.js";
import { protect } from "../middleware/auth.js";
import { sendEmail } from "../services/email.services.js";
import { createOTP, verifyOTP } from "../services/otp.services.js";
import { loadTemplate } from "../utils/template.js";
//import { sendEmail } from '../services/email.services.js'

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: "employee",
      isVerified: false,
    });

    // Generate OTP
    const otp = await createOTP(email);

    // Load Email Template
    const html = loadTemplate("otp.html", {
      OTP: otp,
    });

    // Send Verification Email
    await sendEmail({
      to: email,
      subject: "OS Group CRM - Verify Your Email",
      html,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    // Mongoose: User.findOne({ email }).populate('companies')
    const user = await User.findOne({
      where: { email },
      include: [{ model: Company, as: "companies" }],
    });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(401).json({ message: "Account has been deactivated" });

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in.",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      companies: user.companies,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Company, as: "companies" }],
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", protect, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = await createOTP(email);

    // Load email template
    const html = loadTemplate("otp.html", {
      OTP: otp,
    });

    // Send email
    await sendEmail({
      to: email,
      subject: "OS Group CRM - Password Reset OTP",
      html,
    });

    res.json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
//chnges part

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: process.env.MAIL_USER,
      subject: "CRM Email Test",
      html: `
        <h1>Email Working 🎉</h1>
        <p>Your CRM email system is configured successfully.</p>
      `,
    });

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Generate OTP
    const otp = await createOTP(email);

    // Load email template
    const html = loadTemplate("otp.html", {
      OTP: otp,
    });

    // Send email
    await sendEmail({
      to: email,
      subject: "OS Group CRM - Email Verification",
      html,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    console.log("VERIFY OTP ROUTE HIT");
    console.log(req.body);

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
    await verifyOTP(email, otp);

    // Mark user as verified
    await User.update(
      {
        isVerified: true,
      },
      {
        where: {
          email,
        },
      },
    );

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    console.log("========== RESET PASSWORD ==========");
    console.log("BODY:", req.body);
    console.log("HEADERS:", req.headers["content-type"]);

    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    // Check OTP verification
    const otpRecord = await OTP.findOne({
      where: {
        email,
        verified: true,
      },
    });

    console.log("Verified OTP Record:", otpRecord);

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP verification required",
      });
    }

    // Find user
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete OTP
    await otpRecord.destroy();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
