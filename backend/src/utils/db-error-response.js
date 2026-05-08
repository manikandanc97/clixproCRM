const { Prisma } = require("../generated/prisma");

function getDatabaseErrorDetails(error) {
  if (!error || typeof error !== "object") {
    return null;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      code: "DATABASE_UNAVAILABLE",
      message:
        "Unable to reach the database. Check DATABASE_URL, Supabase availability, and network access.",
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P1001") {
      return {
        status: 503,
        code: "DATABASE_UNAVAILABLE",
        message:
          "Unable to reach the database. Check DATABASE_URL, Supabase availability, and network access.",
      };
    }

    if (error.code === "P2021") {
      return {
        status: 503,
        code: "DATABASE_SCHEMA_MISSING",
        message:
          "Database schema is missing CRM tables. Run the Prisma migrations before loading CRM data.",
      };
    }
  }

  return null;
}

function sendDatabaseAwareError(res, error, fallbackMessage) {
  const databaseError = getDatabaseErrorDetails(error);

  if (databaseError) {
    return res.status(databaseError.status).json({
      success: false,
      code: databaseError.code,
      message: databaseError.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
}

module.exports = {
  sendDatabaseAwareError,
};
