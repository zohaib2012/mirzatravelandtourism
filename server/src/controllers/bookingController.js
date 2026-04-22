import prisma from "../config/db.js";
import { generateBookingNo } from "../utils/helpers.js";

// Create booking
export const createBooking = async (req, res) => {
  try {
    const { groupId, packageId, bookingType, roomType, adultsCount, childrenCount,
      infantsCount, passengers } = req.body;

    // Validate seats availability
    if (groupId) {
      const group = await prisma.flightGroup.findUnique({ where: { id: parseInt(groupId) } });
      if (!group) return res.status(404).json({ message: "Flight group not found" });

      const totalSeats = adultsCount + childrenCount;
      if (totalSeats > group.availableSeats) {
        return res.status(400).json({ message: `Only ${group.availableSeats} seats available` });
      }

      // Calculate price
      const totalPrice =
        adultsCount * Number(group.adultPrice) +
        childrenCount * Number(group.childPrice || 0) +
        infantsCount * Number(group.infantPrice || 0);

      // Generate unique booking number BEFORE transaction to avoid timeout
      let bookingNo;
      let isUnique = false;
      while (!isUnique) {
        bookingNo = generateBookingNo();
        const existing = await prisma.booking.findUnique({ where: { bookingNo } });
        if (!existing) isUnique = true;
      }

      // Set expiry (2 hours from now)
      const expiryTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

      // Create booking (sequential queries — Neon.tech serverless pooler doesn't support long transactions)
      const newBooking = await prisma.booking.create({
        data: {
          bookingNo,
          agentId: req.user.id,
          groupId: parseInt(groupId),
          packageId: packageId ? parseInt(packageId) : null,
          bookingType: bookingType || "AIRLINE",
          roomType,
          adultsCount: parseInt(adultsCount),
          childrenCount: parseInt(childrenCount || 0),
          infantsCount: parseInt(infantsCount || 0),
          totalSeats,
          totalPrice,
          expiryTime,
          passengers: passengers ? {
            create: passengers.map((p) => ({
              title: p.title || null,
              name: p.name,
              surname: p.surname || null,
              type: p.type,
              dob: p.dob ? new Date(p.dob) : null,
              passportNo: p.passportNo || null,
              passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : null,
              passportFrontUrl: p.passportFrontUrl || null,
              passportBackUrl: p.passportBackUrl || null,
            })),
          } : undefined,
        },
        include: { passengers: true, group: { include: { airline: true, sector: true } } },
      });

      // Decrease available seats
      await prisma.flightGroup.update({
        where: { id: parseInt(groupId) },
        data: { availableSeats: { decrement: totalSeats } },
      });

      // Create ledger entry (debit)
      await prisma.ledgerEntry.create({
        data: {
          agentId: req.user.id,
          date: new Date(),
          description: `Booking ${bookingNo} - ${group.groupName}`,
          debit: totalPrice,
          balance: totalPrice,
          bookingId: newBooking.id,
        },
      });

      const booking = newBooking;

      res.status(201).json({ message: "Booking created successfully", booking });
    } else if (packageId) {
      // Package booking
      const pkg = await prisma.umrahPackage.findUnique({ where: { id: parseInt(packageId) } });
      if (!pkg) return res.status(404).json({ message: "Package not found" });

      const priceMap = { shared: pkg.sharedPrice, double: pkg.doublePrice, triple: pkg.triplePrice, quad: pkg.quadPrice };
      const pricePerPerson = Number(priceMap[roomType] || pkg.doublePrice);
      const totalPrice = pricePerPerson * (adultsCount + childrenCount);

      let bookingNo;
      let isUnique = false;
      while (!isUnique) {
        bookingNo = generateBookingNo();
        const existing = await prisma.booking.findUnique({ where: { bookingNo } });
        if (!existing) isUnique = true;
      }

      const expiryTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

      const booking = await prisma.booking.create({
        data: {
          bookingNo,
          agentId: req.user.id,
          packageId: parseInt(packageId),
          bookingType: "PACKAGE",
          roomType,
          adultsCount: parseInt(adultsCount),
          childrenCount: parseInt(childrenCount || 0),
          infantsCount: parseInt(infantsCount || 0),
          totalSeats: adultsCount + childrenCount,
          totalPrice,
          expiryTime,
        },
        include: { package: true },
      });

      res.status(201).json({ message: "Package booked successfully", booking });
    }
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get agent's bookings
export const getMyBookings = async (req, res) => {
  try {
    const { dateFrom, dateTo, status, bookingType, page = 1, limit = 50 } = req.query;

    const where = { agentId: req.user.id };
    if (status && status !== "all") where.status = status;
    if (bookingType) where.bookingType = bookingType;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          group: { include: { airline: true, sector: true } },
          package: true,
          passengers: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get booking details
export const getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        agent: { select: { id: true, agencyName: true, contactPerson: true, email: true, phone: true } },
        group: { include: { airline: true, sector: true, flightLegs: { orderBy: { legNumber: "asc" } } } },
        package: { include: { packageHotels: { include: { hotel: true } }, packageTransport: { include: { transport: true } } } },
        passengers: true,
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check access
    if (req.user.role === "AGENT" && booking.agentId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const { dateFrom, dateTo, status, bookingType, agentId, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status && status !== "all") where.status = status;
    if (bookingType) where.bookingType = bookingType;
    if (agentId) where.agentId = parseInt(agentId);
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          agent: { select: { id: true, agencyName: true, agentCode: true } },
          group: { include: { airline: true, sector: true } },
          package: true,
          passengers: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get booking detail (with passengers)
export const getBookingDetail = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        agent: { select: { id: true, agencyName: true, contactPerson: true, email: true, phone: true, agentCode: true } },
        group: { include: { airline: true, sector: true, flightLegs: { orderBy: { legNumber: "asc" } } } },
        package: true,
        passengers: true,
      },
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update booking passengers
export const updateBookingPassengers = async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { passengers } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Delete existing passengers and recreate
    await prisma.passenger.deleteMany({ where: { bookingId } });
    const created = await prisma.passenger.createMany({
      data: passengers.map((p) => ({
        bookingId,
        title: p.title || null,
        name: p.name,
        surname: p.surname || null,
        type: p.type,
        dob: p.dob ? new Date(p.dob) : null,
        passportNo: p.passportNo || null,
        passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : null,
        passportFrontUrl: p.passportFrontUrl || null,
        passportBackUrl: p.passportBackUrl || null,
      })),
    });

    const updated = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { passengers: true },
    });

    res.json({ message: "Passengers updated", booking: updated });
  } catch (error) {
    console.error("Update passengers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = parseInt(req.params.id);

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        autoCancelledAt: status === "CANCELLED" ? new Date() : null,
      },
    });

    // If cancelled, release seats back
    if (status === "CANCELLED" && booking.groupId) {
      await prisma.flightGroup.update({
        where: { id: booking.groupId },
        data: { availableSeats: { increment: booking.totalSeats } },
      });
    }

    res.json({ message: `Booking ${status.toLowerCase()}`, booking: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
