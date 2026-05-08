const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const { sendDatabaseAwareError } = require("../utils/db-error-response");
const { demoAccounts, getRoleAccess } = require("../config/rbac.config");

const crypto = require("crypto");

async function ensureDemoAccount(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  const matchedDemo = demoAccounts.find(
    (account) =>
      account.email.toLowerCase() === normalizedEmail &&
      account.password === password,
  );

  if (!matchedDemo) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: matchedDemo.email,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  const hashedPassword = await bcrypt.hash(matchedDemo.password, 10);
  return prisma.user.create({
    data: {
      name: matchedDemo.name,
      email: matchedDemo.email,
      password: hashedPassword,
      role: matchedDemo.role,
    },
  });
}

/*
 Register User
*/
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Existing user check
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully 🚀",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log(error);

    sendDatabaseAwareError(res, error, "Server Error");
  }
};

/*
 Login User
*/
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    await ensureDemoAccount(normalizedEmail, password);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    const access = getRoleAccess(user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleName: access.roleName,
        description: access.description,
        permissions: access.permissions,
        routes: access.routes,
        dashboardWidgets: access.dashboardWidgets,
        analyticsVisibility: access.analyticsVisibility,
      },
    });
  } catch (error) {
    console.log(error);

    sendDatabaseAwareError(res, error, "Server Error");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Expiry: 15 mins
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry: expiry,
      },
    });

    res.status(200).json({
      success: true,
      message: "Reset token generated",
      resetToken, // later email ku anupuvom
    });
  } catch (error) {
    console.log(error);

    sendDatabaseAwareError(res, error, "Server Error");
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful 🔥",
    });
  } catch (error) {
    console.log(error);

    sendDatabaseAwareError(res, error, "Server Error");
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Current user loaded",
      user: {
        ...user,
        ...getRoleAccess(user.role),
      },
    });
  } catch (error) {
    console.log(error);

    return sendDatabaseAwareError(res, error, "Server Error");
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
