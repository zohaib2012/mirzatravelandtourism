import prisma from "../config/db.js";

// Get all active packages
export const getPackages = async (req, res) => {
  try {
    const { airline, sector, page = 1, limit = 20 } = req.query;

    const where = { status: "ACTIVE" };

    const packages = await prisma.umrahPackage.findMany({
      where,
      include: {
        group: { include: { airline: true, sector: true, flightLegs: { orderBy: { legNumber: "asc" } } } },
        packageHotels: { include: { hotel: true }, orderBy: { sequence: "asc" } },
        packageTransport: { include: { transport: true } },
      },
      orderBy: { departureDate: "asc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.umrahPackage.count({ where });

    res.json({ packages, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get packages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single package
export const getPackageById = async (req, res) => {
  try {
    const pkg = await prisma.umrahPackage.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        group: { include: { airline: true, sector: true, flightLegs: { orderBy: { legNumber: "asc" } } } },
        packageHotels: { include: { hotel: true }, orderBy: { sequence: "asc" } },
        packageTransport: { include: { transport: true } },
      },
    });
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Create package
export const createPackage = async (req, res) => {
  try {
    const { packageName, groupId, numDays, availableSeats, sharedPrice, doublePrice,
      triplePrice, quadPrice, departureDate, returnDate, hotels, transportId, transportCost } = req.body;

    const pkg = await prisma.umrahPackage.create({
      data: {
        packageName,
        groupId: groupId ? parseInt(groupId) : null,
        numDays: numDays ? parseInt(numDays) : null,
        availableSeats: availableSeats ? parseInt(availableSeats) : null,
        sharedPrice: sharedPrice ? parseFloat(sharedPrice) : null,
        doublePrice: doublePrice ? parseFloat(doublePrice) : null,
        triplePrice: triplePrice ? parseFloat(triplePrice) : null,
        quadPrice: quadPrice ? parseFloat(quadPrice) : null,
        departureDate: departureDate ? new Date(departureDate) : null,
        returnDate: returnDate ? new Date(returnDate) : null,
        packageHotels: hotels ? {
          create: hotels.map((h, i) => ({
            hotelId: parseInt(h.hotelId),
            city: h.city,
            nights: parseInt(h.nights),
            checkinDate: h.checkinDate ? new Date(h.checkinDate) : null,
            checkoutDate: h.checkoutDate ? new Date(h.checkoutDate) : null,
            sequence: i + 1,
          })),
        } : undefined,
        packageTransport: transportId ? {
          create: {
            transportId: parseInt(transportId),
            cost: transportCost ? parseFloat(transportCost) : null,
          },
        } : undefined,
      },
      include: {
        group: { include: { airline: true, sector: true } },
        packageHotels: { include: { hotel: true } },
        packageTransport: { include: { transport: true } },
      },
    });

    res.status(201).json({ message: "Package created", package: pkg });
  } catch (error) {
    console.error("Create package error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update package
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { packageName, groupId, numDays, availableSeats, sharedPrice, doublePrice,
      triplePrice, quadPrice, departureDate, returnDate, status, hotels, transportId, transportCost } = req.body;

    const data = {};
    if (packageName) data.packageName = packageName;
    if (groupId) data.groupId = parseInt(groupId);
    if (numDays) data.numDays = parseInt(numDays);
    if (availableSeats !== undefined) data.availableSeats = parseInt(availableSeats);
    if (sharedPrice !== undefined) data.sharedPrice = sharedPrice ? parseFloat(sharedPrice) : null;
    if (doublePrice !== undefined) data.doublePrice = doublePrice ? parseFloat(doublePrice) : null;
    if (triplePrice !== undefined) data.triplePrice = triplePrice ? parseFloat(triplePrice) : null;
    if (quadPrice !== undefined) data.quadPrice = quadPrice ? parseFloat(quadPrice) : null;
    if (departureDate) data.departureDate = new Date(departureDate);
    if (returnDate) data.returnDate = new Date(returnDate);
    if (status) data.status = status;

    const pkg = await prisma.umrahPackage.update({
      where: { id: parseInt(id) },
      data,
    });

    // Update hotels
    if (hotels) {
      await prisma.packageHotel.deleteMany({ where: { packageId: parseInt(id) } });
      await prisma.packageHotel.createMany({
        data: hotels.map((h, i) => ({
          packageId: parseInt(id),
          hotelId: parseInt(h.hotelId),
          city: h.city,
          nights: parseInt(h.nights),
          checkinDate: h.checkinDate ? new Date(h.checkinDate) : null,
          checkoutDate: h.checkoutDate ? new Date(h.checkoutDate) : null,
          sequence: i + 1,
        })),
      });
    }

    // Update transport
    if (transportId) {
      await prisma.packageTransport.upsert({
        where: { packageId: parseInt(id) },
        create: { packageId: parseInt(id), transportId: parseInt(transportId), cost: transportCost ? parseFloat(transportCost) : null },
        update: { transportId: parseInt(transportId), cost: transportCost ? parseFloat(transportCost) : null },
      });
    }

    res.json({ message: "Package updated" });
  } catch (error) {
    console.error("Update package error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Delete package
export const deletePackage = async (req, res) => {
  try {
    await prisma.umrahPackage.update({
      where: { id: parseInt(req.params.id) },
      data: { status: "INACTIVE" },
    });
    res.json({ message: "Package deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get visa types
export const getVisaTypes = async (req, res) => {
  try {
    const visaTypes = await prisma.visaType.findMany({ where: { isActive: true } });
    res.json(visaTypes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get transport options
export const getTransports = async (req, res) => {
  try {
    const transports = await prisma.transport.findMany({ where: { isActive: true } });
    res.json(transports);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get hotels by city
export const getHotels = async (req, res) => {
  try {
    const { city, rating, distance, hotel } = req.query;
    const where = { isActive: true };
    if (city) where.city = city;
    if (rating) where.starRating = parseInt(rating);
    if (hotel) where.id = parseInt(hotel);

    const hotels = await prisma.hotel.findMany({
      where,
      orderBy: { name: "asc" },
    });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
