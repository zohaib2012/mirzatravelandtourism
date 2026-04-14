import prisma from "../config/db.js";

/**
 * Auto-cancel bookings whose expiryTime has passed and are still ON_REQUEST
 * Returns the number of bookings cancelled
 */
export const runAutoCancel = async () => {
  try {
    const now = new Date();

    // Find all expired ON_REQUEST bookings
    const expired = await prisma.booking.findMany({
      where: {
        status: "ON_REQUEST",
        expiryTime: { lt: now },
      },
      select: { id: true, groupId: true, totalSeats: true },
    });

    if (expired.length === 0) return 0;

    const bookingIds = expired.map((b) => b.id);

    // Mark as CANCELLED with autoCancelledAt timestamp
    await prisma.booking.updateMany({
      where: { id: { in: bookingIds } },
      data: {
        status: "CANCELLED",
        autoCancelledAt: now,
      },
    });

    // Restore seats for airline group bookings
    for (const b of expired) {
      if (b.groupId) {
        await prisma.flightGroup.update({
          where: { id: b.groupId },
          data: { availableSeats: { increment: b.totalSeats } },
        });
      }
    }

    console.log(`[AutoCancel] Cancelled ${expired.length} expired booking(s)`);
    return expired.length;
  } catch (err) {
    console.error("[AutoCancel] Error:", err.message);
    return 0;
  }
};

/**
 * Start auto-cancel interval (for local dev / persistent servers)
 * Runs every 5 minutes
 */
export const startAutoCancelScheduler = () => {
  // Run immediately on startup
  runAutoCancel();

  // Then every 5 minutes
  const interval = setInterval(runAutoCancel, 5 * 60 * 1000);
  console.log("[AutoCancel] Scheduler started (runs every 5 minutes)");
  return interval;
};
