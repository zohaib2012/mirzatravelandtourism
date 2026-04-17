import prisma from "../config/db.js";

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const [totalAgents, pendingAgents, totalBookings, activeGroups,
      confirmedBookings, cancelledBookings, totalRevenue] = await Promise.all([
      prisma.user.count({ where: { role: "AGENT" } }),
      prisma.user.count({ where: { role: "AGENT", status: "PENDING" } }),
      prisma.booking.count(),
      prisma.flightGroup.count({ where: { status: "ACTIVE" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: "CONFIRMED" } }),
    ]);

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        agent: { select: { agencyName: true, agentCode: true } },
        group: { include: { airline: true } },
      },
    });

    res.json({
      totalAgents, pendingAgents, totalBookings, activeGroups,
      confirmedBookings, cancelledBookings,
      totalRevenue: Number(totalRevenue._sum.totalPrice || 0),
      recentBookings,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all agents
export const getAgents = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const where = { role: "AGENT" };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { agencyName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { agentCode: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
      ];
    }

    const [agents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, agentCode: true, agencyName: true, contactPerson: true,
          email: true, phone: true, city: true, country: true, logoUrl: true,
          status: true, createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ agents, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update agent status
export const updateAgentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      select: { id: true, agencyName: true, agentCode: true, email: true, status: true },
    });
    res.json({ message: `Agent ${status.toLowerCase()}`, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Airlines
export const getAirlines = async (req, res) => {
  try {
    const airlines = await prisma.airline.findMany({ orderBy: { name: "asc" } });
    res.json({ airlines });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createAirline = async (req, res) => {
  try {
    const { name, code, logoUrl } = req.body;
    const airline = await prisma.airline.create({ data: { name, code: code || null, logoUrl: logoUrl || null } });
    res.status(201).json({ message: "Airline created", airline });
  } catch (error) {
    console.error("Create airline error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAirline = async (req, res) => {
  try {
    const { name, code, logoUrl } = req.body;
    const airline = await prisma.airline.update({
      where: { id: parseInt(req.params.id) },
      data: { name, code: code || null, logoUrl: logoUrl || null },
    });
    res.json({ message: "Airline updated", airline });
  } catch (error) {
    console.error("Update airline error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Sectors
export const getSectors = async (req, res) => {
  try {
    const sectors = await prisma.sector.findMany({ orderBy: { routeDisplay: "asc" } });
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createSector = async (req, res) => {
  try {
    const sector = await prisma.sector.create({ data: req.body });
    res.status(201).json({ message: "Sector created", sector });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSector = async (req, res) => {
  try {
    const sector = await prisma.sector.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ message: "Sector updated", sector });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Hotels
export const createHotel = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.distance) data.distance = parseFloat(data.distance);
    if (data.starRating) data.starRating = parseInt(data.starRating);
    if (data.sharingRate) data.sharingRate = parseFloat(data.sharingRate);
    if (data.doubleRate) data.doubleRate = parseFloat(data.doubleRate);
    if (data.tripleRate) data.tripleRate = parseFloat(data.tripleRate);
    if (data.quadRate) data.quadRate = parseFloat(data.quadRate);
    if (data.quintRate) data.quintRate = parseFloat(data.quintRate);
    if (data.validFrom) data.validFrom = new Date(data.validFrom);
    if (data.validTo) data.validTo = new Date(data.validTo);

    const hotel = await prisma.hotel.create({ data });
    res.status(201).json({ message: "Hotel created", hotel });
  } catch (error) {
    console.error("Create hotel error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.distance) data.distance = parseFloat(data.distance);
    if (data.starRating) data.starRating = parseInt(data.starRating);
    if (data.sharingRate) data.sharingRate = parseFloat(data.sharingRate);
    if (data.doubleRate) data.doubleRate = parseFloat(data.doubleRate);
    if (data.tripleRate) data.tripleRate = parseFloat(data.tripleRate);
    if (data.quadRate) data.quadRate = parseFloat(data.quadRate);
    if (data.quintRate) data.quintRate = parseFloat(data.quintRate);
    if (data.validFrom) data.validFrom = new Date(data.validFrom);
    if (data.validTo) data.validTo = new Date(data.validTo);

    const hotel = await prisma.hotel.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json({ message: "Hotel updated", hotel });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    await prisma.hotel.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false },
    });
    res.json({ message: "Hotel deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Visa Types
export const createVisaType = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.adultBuyRate) data.adultBuyRate = parseFloat(data.adultBuyRate);
    if (data.adultSellRate) data.adultSellRate = parseFloat(data.adultSellRate);
    if (data.childBuyRate) data.childBuyRate = parseFloat(data.childBuyRate);
    if (data.childSellRate) data.childSellRate = parseFloat(data.childSellRate);

    const visaType = await prisma.visaType.create({ data });
    res.status(201).json({ message: "Visa type created", visaType });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateVisaType = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.adultBuyRate) data.adultBuyRate = parseFloat(data.adultBuyRate);
    if (data.adultSellRate) data.adultSellRate = parseFloat(data.adultSellRate);
    if (data.childBuyRate) data.childBuyRate = parseFloat(data.childBuyRate);
    if (data.childSellRate) data.childSellRate = parseFloat(data.childSellRate);

    const visaType = await prisma.visaType.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json({ message: "Visa type updated", visaType });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Transport
export const createTransport = async (req, res) => {
  try {
    const { vehicleType, name, route, buyRate, sellRate } = req.body;
    const data = {
      vehicleType: vehicleType || name || "",
      route: route || null,
      buyRate: buyRate ? parseFloat(buyRate) : null,
      sellRate: sellRate ? parseFloat(sellRate) : null,
    };
    const transport = await prisma.transport.create({ data });
    res.status(201).json({ message: "Transport created", transport });
  } catch (error) {
    console.error("Create transport error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTransport = async (req, res) => {
  try {
    const { vehicleType, name, route, buyRate, sellRate } = req.body;
    const data = {
      vehicleType: vehicleType || name || "",
      route: route || null,
      buyRate: buyRate ? parseFloat(buyRate) : null,
      sellRate: sellRate ? parseFloat(sellRate) : null,
    };
    const transport = await prisma.transport.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json({ message: "Transport updated", transport });
  } catch (error) {
    console.error("Update transport error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Bank Accounts
export const createBankAccount = async (req, res) => {
  try {
    const { bankName, accountTitle, accountNumber, iban, branchName, branchCode, logoUrl } = req.body;
    const account = await prisma.bankAccount.create({
      data: { bankName, accountTitle, accountNumber, iban: iban || null, branchName: branchName || null, branchCode: branchCode || null, logoUrl: logoUrl || null },
    });
    res.status(201).json({ message: "Bank account created", account });
  } catch (error) {
    console.error("Create bank account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateBankAccount = async (req, res) => {
  try {
    const { bankName, accountTitle, accountNumber, iban, branchName, branchCode, logoUrl } = req.body;
    const account = await prisma.bankAccount.update({
      where: { id: parseInt(req.params.id) },
      data: { bankName, accountTitle, accountNumber, iban: iban || null, branchName: branchName || null, branchCode: branchCode || null, logoUrl: logoUrl || null },
    });
    res.json({ message: "Bank account updated", account });
  } catch (error) {
    console.error("Update bank account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Office Branches
export const getOfficeBranches = async (req, res) => {
  try {
    const branches = await prisma.officeBranch.findMany({
      where: { isActive: true },
      orderBy: { isHead: "desc" },
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createOfficeBranch = async (req, res) => {
  try {
    const { city, address, phone, isHead, imageUrl, name } = req.body;
    const data = {
      name: name || city || "",
      city: city || "",
      address: address || "",
      imageUrl: imageUrl || null,
      isHead: isHead === true || isHead === "true",
    };
    const branch = await prisma.officeBranch.create({ data });
    res.status(201).json({ message: "Branch created", branch });
  } catch (error) {
    console.error("Create branch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOfficeBranch = async (req, res) => {
  try {
    const { city, address, phone, isHead, imageUrl, name } = req.body;
    const data = {
      name: name || city || "",
      city: city || "",
      address: address || "",
      imageUrl: imageUrl || null,
      isHead: isHead === true || isHead === "true",
    };
    const branch = await prisma.officeBranch.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json({ message: "Branch updated", branch });
  } catch (error) {
    console.error("Update branch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Authorizations
export const getAuthorizations = async (req, res) => {
  try {
    const auths = await prisma.authorization.findMany({ where: { isActive: true } });
    res.json(auths);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createAuthorization = async (req, res) => {
  try {
    const auth = await prisma.authorization.create({ data: req.body });
    res.status(201).json({ message: "Authorization created", auth });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Deals
export const getDeals = async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createDeal = async (req, res) => {
  try {
    const deal = await prisma.deal.create({ data: req.body });
    res.status(201).json({ message: "Deal created", deal });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Airline
export const deleteAirline = async (req, res) => {
  try {
    await prisma.airline.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Airline deleted" });
  } catch {
    res.status(400).json({ message: "Cannot delete - airline may have groups" });
  }
};

// Delete Sector
export const deleteSector = async (req, res) => {
  try {
    await prisma.sector.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Sector deleted" });
  } catch {
    res.status(400).json({ message: "Cannot delete - sector may have groups" });
  }
};

// Get Hotels
export const getHotels = async (req, res) => {
  try {
    const { city } = req.query;
    const where = { isActive: true };
    if (city) where.city = city;
    const hotels = await prisma.hotel.findMany({ where, orderBy: { name: "asc" } });
    res.json(hotels);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Visa Types
export const getVisaTypes = async (req, res) => {
  try {
    const visaTypes = await prisma.visaType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
    res.json(visaTypes);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Visa Type
export const deleteVisaType = async (req, res) => {
  try {
    await prisma.visaType.update({ where: { id: parseInt(req.params.id) }, data: { isActive: false } });
    res.json({ message: "Visa type deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Transports
export const getTransports = async (req, res) => {
  try {
    const transports = await prisma.transport.findMany({ where: { isActive: true }, orderBy: { vehicleType: "asc" } });
    res.json(transports);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Transport
export const deleteTransport = async (req, res) => {
  try {
    await prisma.transport.update({ where: { id: parseInt(req.params.id) }, data: { isActive: false } });
    res.json({ message: "Transport deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    const payments = await prisma.payment.findMany({
      where,
      include: {
        agent: { select: { agentCode: true, contactPerson: true, agencyName: true } },
        bankAccount: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });
    res.json({ payments });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const payment = await prisma.payment.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const updated = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: { status, remarks: adminRemarks || null },
    });

    // If posting payment, create ledger credit entry
    if (status === "POSTED" && payment.status !== "POSTED") {
      await prisma.ledgerEntry.create({
        data: {
          agentId: payment.agentId,
          paymentId: payment.id,
          date: payment.date || new Date(),
          description: `Payment Posted: ${payment.description || "Bank Transfer"}`,
          credit: payment.amount,
          debit: 0,
          balance: 0,
        },
      });
    }

    res.json({ message: "Payment status updated", payment: updated });
  } catch (err) {
    console.error("Update payment status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Bank Accounts
export const getBankAccounts = async (req, res) => {
  try {
    const accounts = await prisma.bankAccount.findMany({ where: { isActive: true }, orderBy: { bankName: "asc" } });
    res.json(accounts);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Bank Account
export const deleteBankAccount = async (req, res) => {
  try {
    await prisma.bankAccount.update({ where: { id: parseInt(req.params.id) }, data: { isActive: false } });
    res.json({ message: "Bank account deactivated" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Branch
export const deleteOfficeBranch = async (req, res) => {
  try {
    await prisma.officeBranch.update({ where: { id: parseInt(req.params.id) }, data: { isActive: false } });
    res.json({ message: "Branch deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Authorization
export const updateAuthorization = async (req, res) => {
  try {
    const auth = await prisma.authorization.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ message: "Authorization updated", auth });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Authorization
export const deleteAuthorization = async (req, res) => {
  try {
    await prisma.authorization.update({ where: { id: parseInt(req.params.id) }, data: { isActive: false } });
    res.json({ message: "Authorization deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Deal
export const updateDeal = async (req, res) => {
  try {
    const deal = await prisma.deal.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ message: "Deal updated", deal });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Deal
export const deleteDeal = async (req, res) => {
  try {
    await prisma.deal.update({ where: { id: parseInt(req.params.id) }, data: { isActive: false } });
    res.json({ message: "Deal deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    const { status, bookingType, agentId, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (bookingType) where.bookingType = bookingType;
    if (agentId) where.agentId = parseInt(agentId);

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        agent: { select: { agentCode: true, contactPerson: true, agencyName: true } },
        group: { include: { airline: true, sector: true } },
        package: { select: { packageName: true, departureDate: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
    });
    const total = await prisma.booking.count({ where });
    res.json({ bookings, total });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Booking Status (admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json({ message: "Booking status updated", booking });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin get Groups
export const getAdminGroups = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    const groups = await prisma.flightGroup.findMany({
      where,
      include: { airline: true, sector: true, flightLegs: true, _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
    });
    const total = await prisma.flightGroup.count({ where });
    res.json({ groups, total });
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin create Group (full group with flight legs)
export const createGroup = async (req, res) => {
  try {
    const { flightLegs, ...groupData } = req.body;
    if (groupData.departureDate) groupData.departureDate = new Date(groupData.departureDate);
    groupData.returnDate = groupData.returnDate ? new Date(groupData.returnDate) : null;
    if (groupData.airlineId) groupData.airlineId = parseInt(groupData.airlineId);
    if (groupData.sectorId) groupData.sectorId = parseInt(groupData.sectorId);
    if (groupData.totalSeats) groupData.totalSeats = parseInt(groupData.totalSeats);
    if (groupData.availableSeats) groupData.availableSeats = parseInt(groupData.availableSeats);
    if (groupData.adultPrice) groupData.adultPrice = parseFloat(groupData.adultPrice);
    groupData.childPrice = groupData.childPrice ? parseFloat(groupData.childPrice) : null;
    groupData.infantPrice = groupData.infantPrice ? parseFloat(groupData.infantPrice) : null;

    const group = await prisma.flightGroup.create({
      data: {
        ...groupData,
        flightLegs: flightLegs?.length > 0 ? {
          create: flightLegs.map((leg, i) => ({
            legNumber: i + 1,
            flightNumber: leg.flightNumber,
            origin: leg.origin,
            destination: leg.destination,
            departureDate: leg.departureDate ? new Date(leg.departureDate) : new Date(),
            departureTime: leg.departureTime || null,
            arrivalTime: leg.arrivalTime || null,
            baggage: leg.baggage || null,
          })),
        } : undefined,
      },
      include: { airline: true, sector: true, flightLegs: true },
    });
    res.status(201).json({ message: "Group created", group });
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin update Group
export const updateGroup = async (req, res) => {
  try {
    const { flightLegs, ...groupData } = req.body;
    if (groupData.departureDate) groupData.departureDate = new Date(groupData.departureDate);
    groupData.returnDate = groupData.returnDate ? new Date(groupData.returnDate) : null;
    if (groupData.airlineId) groupData.airlineId = parseInt(groupData.airlineId);
    if (groupData.sectorId) groupData.sectorId = parseInt(groupData.sectorId);
    if (groupData.totalSeats) groupData.totalSeats = parseInt(groupData.totalSeats);
    if (groupData.availableSeats) groupData.availableSeats = parseInt(groupData.availableSeats);
    if (groupData.adultPrice) groupData.adultPrice = parseFloat(groupData.adultPrice);
    groupData.childPrice = groupData.childPrice ? parseFloat(groupData.childPrice) : null;
    groupData.infantPrice = groupData.infantPrice ? parseFloat(groupData.infantPrice) : null;

    // Sequential queries (Neon.tech pooler doesn't support long interactive transactions)
    await prisma.flightGroup.update({
      where: { id: parseInt(req.params.id) },
      data: groupData,
    });
    if (flightLegs) {
      await prisma.flightLeg.deleteMany({ where: { groupId: parseInt(req.params.id) } });
      if (flightLegs.length > 0) {
        await prisma.flightLeg.createMany({
          data: flightLegs.map((leg, i) => ({
            groupId: parseInt(req.params.id),
            legNumber: i + 1,
            flightNumber: leg.flightNumber,
            origin: leg.origin,
            destination: leg.destination,
            departureDate: leg.departureDate ? new Date(leg.departureDate) : new Date(),
            departureTime: leg.departureTime || null,
            arrivalTime: leg.arrivalTime || null,
            baggage: leg.baggage || null,
          })),
        });
      }
    }
    const group = await prisma.flightGroup.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { airline: true, sector: true, flightLegs: true },
    });
    res.json({ message: "Group updated", group });
  } catch (err) {
    console.error("Update group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin delete Group
export const deleteGroup = async (req, res) => {
  try {
    await prisma.flightGroup.update({
      where: { id: parseInt(req.params.id) },
      data: { status: "INACTIVE" },
    });
    res.json({ message: "Group deactivated" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin get Packages
export const getAdminPackages = async (req, res) => {
  try {
    const packages = await prisma.umrahPackage.findMany({
      where: { status: { not: "INACTIVE" } },
      include: {
        group: { include: { airline: true, sector: true } },
        packageHotels: { include: { hotel: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ packages });
  } catch (err) {
    console.error("Get packages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin create Package
export const createPackage = async (req, res) => {
  try {
    const { packageHotels, ...data } = req.body;
    data.departureDate = data.departureDate ? new Date(data.departureDate) : null;
    data.returnDate = data.returnDate ? new Date(data.returnDate) : null;
    data.groupId = data.groupId ? parseInt(data.groupId) : null;
    data.numDays = data.numDays ? parseInt(data.numDays) : null;
    data.availableSeats = data.availableSeats ? parseInt(data.availableSeats) : null;
    data.sharedPrice = data.sharedPrice ? parseFloat(data.sharedPrice) : null;
    data.doublePrice = data.doublePrice ? parseFloat(data.doublePrice) : null;
    data.triplePrice = data.triplePrice ? parseFloat(data.triplePrice) : null;
    data.quadPrice = data.quadPrice ? parseFloat(data.quadPrice) : null;

    // Remove unknown fields
    delete data.visaTypeId; delete data.transportId;

    const pkg = await prisma.umrahPackage.create({ data });

    // Add hotel associations separately
    if (packageHotels?.length > 0) {
      for (const ph of packageHotels) {
        await prisma.packageHotel.create({
          data: {
            packageId: pkg.id,
            hotelId: parseInt(ph.hotelId),
            city: ph.city,
            nights: parseInt(ph.nights || 0),
            checkinDate: ph.checkinDate ? new Date(ph.checkinDate) : null,
            checkoutDate: ph.checkoutDate ? new Date(ph.checkoutDate) : null,
          },
        });
      }
    }

    res.status(201).json({ message: "Package created", package: pkg });
  } catch (err) {
    console.error("Create package error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin update Package
export const updatePackage = async (req, res) => {
  try {
    const { packageHotels, ...data } = req.body;
    data.departureDate = data.departureDate ? new Date(data.departureDate) : null;
    data.returnDate = data.returnDate ? new Date(data.returnDate) : null;
    data.groupId = data.groupId ? parseInt(data.groupId) : null;
    data.numDays = data.numDays ? parseInt(data.numDays) : null;
    data.availableSeats = data.availableSeats ? parseInt(data.availableSeats) : null;
    data.sharedPrice = data.sharedPrice ? parseFloat(data.sharedPrice) : null;
    data.doublePrice = data.doublePrice ? parseFloat(data.doublePrice) : null;
    data.triplePrice = data.triplePrice ? parseFloat(data.triplePrice) : null;
    data.quadPrice = data.quadPrice ? parseFloat(data.quadPrice) : null;
    delete data.visaTypeId; delete data.transportId;

    await prisma.umrahPackage.update({ where: { id: parseInt(req.params.id) }, data });

    // Re-sync hotel associations
    if (packageHotels !== undefined) {
      await prisma.packageHotel.deleteMany({ where: { packageId: parseInt(req.params.id) } });
      for (const ph of (packageHotels || [])) {
        await prisma.packageHotel.create({
          data: {
            packageId: parseInt(req.params.id),
            hotelId: parseInt(ph.hotelId),
            city: ph.city,
            nights: parseInt(ph.nights || 0),
            checkinDate: ph.checkinDate ? new Date(ph.checkinDate) : null,
            checkoutDate: ph.checkoutDate ? new Date(ph.checkoutDate) : null,
          },
        });
      }
    }

    res.json({ message: "Package updated" });
  } catch (err) {
    console.error("Update package error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin delete Package
export const deletePackage = async (req, res) => {
  try {
    await prisma.umrahPackage.update({
      where: { id: parseInt(req.params.id) },
      data: { status: "INACTIVE" },
    });
    res.json({ message: "Package deactivated" });
  } catch (err) {
    console.error("Delete package error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Agent Ledger (admin view)
export const getAgentLedger = async (req, res) => {
  try {
    const { agentId } = req.params;
    const ledger = await prisma.ledgerEntry.findMany({
      where: { agentId: parseInt(agentId) },
      orderBy: { createdAt: "asc" },
    });
    let balance = 0;
    const entries = ledger.map((e) => {
      balance += Number(e.debit) - Number(e.credit);
      return { ...e, balance };
    });
    const agent = await prisma.user.findUnique({
      where: { id: parseInt(agentId) },
      select: { agentCode: true, agencyName: true, contactPerson: true },
    });
    res.json({ entries, agent, currentBalance: balance });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Company Settings
export const getCompanySettings = async (req, res) => {
  try {
    const settings = await prisma.companySetting.findFirst();
    if (!settings) return res.json(null);
    // Normalize to match frontend form field names
    res.json({
      ...settings,
      facebook: settings.facebookUrl || "",
      instagram: settings.instagramUrl || "",
      twitter: settings.twitterUrl || "",
      youtube: settings.youtubeUrl || "",
      linkedin: settings.linkedinUrl || "",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCompanySettings = async (req, res) => {
  try {
    const {
      companyName, tagline, logoUrl, email, phone, whatsapp, address,
      facebook, instagram, twitter, youtube, linkedin,
      facebookUrl, instagramUrl, twitterUrl, youtubeUrl, linkedinUrl,
      heroVideoUrl, heroImageUrl,
    } = req.body;

    const data = {
      companyName: companyName || "Mirza Travel & Tourism",
      tagline: tagline || null,
      logoUrl: logoUrl || null,
      email: email || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      address: address || null,
      facebookUrl: facebookUrl || facebook || null,
      instagramUrl: instagramUrl || instagram || null,
      twitterUrl: twitterUrl || twitter || null,
      youtubeUrl: youtubeUrl || youtube || null,
      linkedinUrl: linkedinUrl || linkedin || null,
      heroVideoUrl: heroVideoUrl || null,
      heroImageUrl: heroImageUrl || null,
    };

    let settings = await prisma.companySetting.findFirst();
    if (settings) {
      settings = await prisma.companySetting.update({ where: { id: settings.id }, data });
    } else {
      settings = await prisma.companySetting.create({ data });
    }
    res.json({ message: "Settings updated", settings });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reports / Analytics
export const getReports = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalBookings, confirmedBookings, cancelledBookings, pendingBookings,
      totalAgents, activeAgents, totalRevenue, totalPayments,
      bookingsByType, recentBookings, topAgents,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.booking.count({ where: { status: "ON_REQUEST" } }),
      prisma.user.count({ where: { role: "AGENT" } }),
      prisma.user.count({ where: { role: "AGENT", status: "ACTIVE" } }),
      prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: "CONFIRMED" } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "POSTED" } }),
      prisma.booking.groupBy({ by: ["bookingType"], _count: true }),
      prisma.booking.findMany({
        take: 10, orderBy: { createdAt: "desc" },
        include: { agent: { select: { agentCode: true, agencyName: true } }, group: { include: { airline: true } } },
      }),
      prisma.booking.groupBy({
        by: ["agentId"], _count: { id: true }, _sum: { totalPrice: true },
        orderBy: { _count: { id: "desc" } }, take: 5,
      }),
    ]);

    // Monthly bookings for current year
    const monthlyBookings = await prisma.$queryRaw`
      SELECT EXTRACT(MONTH FROM created_at)::int AS month, COUNT(*)::int AS count,
             SUM(total_price)::float AS revenue
      FROM bookings WHERE created_at >= ${startOfYear} GROUP BY month ORDER BY month
    `;

    res.json({
      totals: {
        bookings: totalBookings, confirmed: confirmedBookings,
        cancelled: cancelledBookings, pending: pendingBookings,
        agents: totalAgents, activeAgents,
        revenue: Number(totalRevenue._sum.totalPrice || 0),
        payments: Number(totalPayments._sum.amount || 0),
      },
      bookingsByType,
      recentBookings,
      topAgents,
      monthlyBookings,
    });
  } catch (err) {
    console.error("Reports error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
