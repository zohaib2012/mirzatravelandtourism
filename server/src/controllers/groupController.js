const prisma = require("../config/db");

// Get all active flight groups with filters
exports.getGroups = async (req, res) => {
  try {
    const { category, airline, sector, search, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const where = { status: "ACTIVE" };
    if (category) where.category = category;
    if (airline) where.airlineId = parseInt(airline);
    if (sector) where.sectorId = parseInt(sector);
    if (search) {
      where.OR = [
        { groupName: { contains: search, mode: "insensitive" } },
        { airline: { name: { contains: search, mode: "insensitive" } } },
        { sector: { routeDisplay: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [groups, total] = await Promise.all([
      prisma.flightGroup.findMany({
        where,
        include: {
          airline: true,
          sector: true,
          flightLegs: { orderBy: { legNumber: "asc" } },
        },
        orderBy: { departureDate: "asc" },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.flightGroup.count({ where }),
    ]);

    res.json({ groups, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single group with all details
exports.getGroupById = async (req, res) => {
  try {
    const group = await prisma.flightGroup.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        airline: true,
        sector: true,
        flightLegs: { orderBy: { legNumber: "asc" } },
      },
    });

    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get filter options (airlines and sectors with active groups)
exports.getFilterOptions = async (req, res) => {
  try {
    const { category } = req.query;
    const where = { status: "ACTIVE" };
    if (category) where.category = category;

    const groups = await prisma.flightGroup.findMany({
      where,
      select: { airlineId: true, sectorId: true },
    });

    const airlineIds = [...new Set(groups.map((g) => g.airlineId))];
    const sectorIds = [...new Set(groups.map((g) => g.sectorId))];

    const [airlines, sectors] = await Promise.all([
      prisma.airline.findMany({ where: { id: { in: airlineIds } }, orderBy: { name: "asc" } }),
      prisma.sector.findMany({ where: { id: { in: sectorIds } } }),
    ]);

    res.json({ airlines, sectors });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Create group
exports.createGroup = async (req, res) => {
  try {
    const { groupName, category, airlineId, sectorId, totalSeats, departureDate,
      returnDate, numDays, adultPrice, childPrice, infantPrice, currency, pnr1, pnr2, flightLegs } = req.body;

    const group = await prisma.flightGroup.create({
      data: {
        groupName, category,
        airlineId: parseInt(airlineId),
        sectorId: parseInt(sectorId),
        totalSeats: parseInt(totalSeats),
        availableSeats: parseInt(totalSeats),
        departureDate: new Date(departureDate),
        returnDate: returnDate ? new Date(returnDate) : null,
        numDays: numDays ? parseInt(numDays) : null,
        adultPrice: parseFloat(adultPrice),
        childPrice: childPrice ? parseFloat(childPrice) : null,
        infantPrice: infantPrice ? parseFloat(infantPrice) : null,
        currency: currency || "PKR",
        pnr1, pnr2,
        flightLegs: flightLegs ? {
          create: flightLegs.map((leg, i) => ({
            legNumber: i + 1,
            flightNumber: leg.flightNumber,
            departureDate: new Date(leg.departureDate),
            origin: leg.origin,
            destination: leg.destination,
            departureTime: leg.departureTime,
            arrivalTime: leg.arrivalTime,
            baggage: leg.baggage,
          })),
        } : undefined,
      },
      include: { airline: true, sector: true, flightLegs: true },
    });

    res.status(201).json({ message: "Group created", group });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update group
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Parse numeric fields
    if (data.airlineId) data.airlineId = parseInt(data.airlineId);
    if (data.sectorId) data.sectorId = parseInt(data.sectorId);
    if (data.totalSeats) data.totalSeats = parseInt(data.totalSeats);
    if (data.availableSeats) data.availableSeats = parseInt(data.availableSeats);
    if (data.numDays) data.numDays = parseInt(data.numDays);
    if (data.adultPrice) data.adultPrice = parseFloat(data.adultPrice);
    if (data.childPrice) data.childPrice = parseFloat(data.childPrice);
    if (data.infantPrice) data.infantPrice = parseFloat(data.infantPrice);
    if (data.departureDate) data.departureDate = new Date(data.departureDate);
    if (data.returnDate) data.returnDate = new Date(data.returnDate);

    // Handle flight legs update separately
    const flightLegs = data.flightLegs;
    delete data.flightLegs;

    const group = await prisma.flightGroup.update({
      where: { id: parseInt(id) },
      data,
      include: { airline: true, sector: true, flightLegs: true },
    });

    if (flightLegs) {
      await prisma.flightLeg.deleteMany({ where: { groupId: parseInt(id) } });
      await prisma.flightLeg.createMany({
        data: flightLegs.map((leg, i) => ({
          groupId: parseInt(id),
          legNumber: i + 1,
          flightNumber: leg.flightNumber,
          departureDate: new Date(leg.departureDate),
          origin: leg.origin,
          destination: leg.destination,
          departureTime: leg.departureTime,
          arrivalTime: leg.arrivalTime,
          baggage: leg.baggage,
        })),
      });
    }

    res.json({ message: "Group updated", group });
  } catch (error) {
    console.error("Update group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Delete group
exports.deleteGroup = async (req, res) => {
  try {
    await prisma.flightGroup.update({
      where: { id: parseInt(req.params.id) },
      data: { status: "INACTIVE" },
    });
    res.json({ message: "Group deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
