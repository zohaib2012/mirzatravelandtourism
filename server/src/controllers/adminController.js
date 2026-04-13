const prisma = require("../config/db");

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
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
exports.getAgents = async (req, res) => {
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
exports.updateAgentStatus = async (req, res) => {
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
exports.getAirlines = async (req, res) => {
  try {
    const airlines = await prisma.airline.findMany({ orderBy: { name: "asc" } });
    res.json(airlines);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createAirline = async (req, res) => {
  try {
    const airline = await prisma.airline.create({ data: req.body });
    res.status(201).json({ message: "Airline created", airline });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAirline = async (req, res) => {
  try {
    const airline = await prisma.airline.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ message: "Airline updated", airline });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Sectors
exports.getSectors = async (req, res) => {
  try {
    const sectors = await prisma.sector.findMany({ orderBy: { routeDisplay: "asc" } });
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createSector = async (req, res) => {
  try {
    const sector = await prisma.sector.create({ data: req.body });
    res.status(201).json({ message: "Sector created", sector });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateSector = async (req, res) => {
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
exports.createHotel = async (req, res) => {
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

exports.updateHotel = async (req, res) => {
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

exports.deleteHotel = async (req, res) => {
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
exports.createVisaType = async (req, res) => {
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

exports.updateVisaType = async (req, res) => {
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
exports.createTransport = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.buyRate) data.buyRate = parseFloat(data.buyRate);
    if (data.sellRate) data.sellRate = parseFloat(data.sellRate);

    const transport = await prisma.transport.create({ data });
    res.status(201).json({ message: "Transport created", transport });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTransport = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.buyRate) data.buyRate = parseFloat(data.buyRate);
    if (data.sellRate) data.sellRate = parseFloat(data.sellRate);

    const transport = await prisma.transport.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json({ message: "Transport updated", transport });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Bank Accounts
exports.createBankAccount = async (req, res) => {
  try {
    const account = await prisma.bankAccount.create({ data: req.body });
    res.status(201).json({ message: "Bank account created", account });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBankAccount = async (req, res) => {
  try {
    const account = await prisma.bankAccount.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ message: "Bank account updated", account });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Office Branches
exports.getOfficeBranches = async (req, res) => {
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

exports.createOfficeBranch = async (req, res) => {
  try {
    const branch = await prisma.officeBranch.create({ data: req.body });
    res.status(201).json({ message: "Branch created", branch });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOfficeBranch = async (req, res) => {
  try {
    const branch = await prisma.officeBranch.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json({ message: "Branch updated", branch });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Authorizations
exports.getAuthorizations = async (req, res) => {
  try {
    const auths = await prisma.authorization.findMany({ where: { isActive: true } });
    res.json(auths);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createAuthorization = async (req, res) => {
  try {
    const auth = await prisma.authorization.create({ data: req.body });
    res.status(201).json({ message: "Authorization created", auth });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CRUD Deals
exports.getDeals = async (req, res) => {
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

exports.createDeal = async (req, res) => {
  try {
    const deal = await prisma.deal.create({ data: req.body });
    res.status(201).json({ message: "Deal created", deal });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Company Settings
exports.getCompanySettings = async (req, res) => {
  try {
    const settings = await prisma.companySetting.findFirst();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCompanySettings = async (req, res) => {
  try {
    let settings = await prisma.companySetting.findFirst();
    if (settings) {
      settings = await prisma.companySetting.update({
        where: { id: settings.id },
        data: req.body,
      });
    } else {
      settings = await prisma.companySetting.create({ data: req.body });
    }
    res.json({ message: "Settings updated", settings });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
