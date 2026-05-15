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

function sendDatabaseAwareError(res, error, fallbackMessage, forceStatus = null) {
  const databaseError = getDatabaseErrorDetails(error);

  if (databaseError) {
    const status = forceStatus || databaseError.status;
    return res.status(status).json({
      success: status === 200, // If we force 200, it's a "success" with fallback
      code: databaseError.code,
      message: databaseError.message,
      isFallback: status === 200,
    });
  }

  const status = forceStatus || 500;
  return res.status(status).json({
    success: status === 200,
    message: fallbackMessage,
    isFallback: status === 200,
  });
}


module.exports = {
  sendDatabaseAwareError,
};
