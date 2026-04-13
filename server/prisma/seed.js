import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mirzatravel.pk" },
    update: {},
    create: {
      agentCode: "0001",
      agencyName: "Mirza Travel & Tourism",
      contactPerson: "Admin",
      email: "admin@mirzatravel.pk",
      password: adminPassword,
      phone: "+923000000000",
      city: "Faisalabad",
      country: "Pakistan",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("Admin created:", admin.email);

  // 2. Create Demo Agent
  const agentPassword = await bcrypt.hash("Agent@123", 12);
  const agent = await prisma.user.upsert({
    where: { email: "demo@agent.pk" },
    update: {},
    create: {
      agentCode: "5190",
      agencyName: "Demo Travel Agency",
      contactPerson: "Demo Agent",
      email: "demo@agent.pk",
      password: agentPassword,
      phone: "+923001234567",
      city: "Lahore",
      country: "Pakistan",
      role: "AGENT",
      status: "ACTIVE",
    },
  });
  console.log("Demo Agent created:", agent.email);

  // 3. Airlines
  const airlines = await Promise.all([
    prisma.airline.create({ data: { name: "PIA", logoUrl: "/airlines/pia.png" } }),
    prisma.airline.create({ data: { name: "AIR SIAL", logoUrl: "/airlines/airsial.png" } }),
    prisma.airline.create({ data: { name: "SERENE AIR", logoUrl: "/airlines/serene.png" } }),
    prisma.airline.create({ data: { name: "FLY JINNAH", logoUrl: "/airlines/flyjinnah.png" } }),
    prisma.airline.create({ data: { name: "AIRBLUE", logoUrl: "/airlines/airblue.png" } }),
    prisma.airline.create({ data: { name: "SAUDI ARABIAN AIRLINES", logoUrl: "/airlines/saudia.png" } }),
    prisma.airline.create({ data: { name: "FLY DUBAI", logoUrl: "/airlines/flydubai.png" } }),
    prisma.airline.create({ data: { name: "AIR ARABIA", logoUrl: "/airlines/airarabia.png" } }),
    prisma.airline.create({ data: { name: "FLYADEAL", logoUrl: "/airlines/flyadeal.png" } }),
  ]);
  console.log("Airlines created:", airlines.length);

  // 4. Sectors
  const sectors = await Promise.all([
    prisma.sector.create({ data: { origin: "LHE", destination: "JED", routeDisplay: "LHE-JED-LHE", isRoundTrip: true } }),
    prisma.sector.create({ data: { origin: "LHE", destination: "DXB", routeDisplay: "LHE-DXB", isRoundTrip: false } }),
    prisma.sector.create({ data: { origin: "LHE", destination: "RUH", routeDisplay: "LHE-RUH", isRoundTrip: false } }),
    prisma.sector.create({ data: { origin: "LHE", destination: "SHJ", routeDisplay: "LHE-SHJ", isRoundTrip: false } }),
    prisma.sector.create({ data: { origin: "ISB", destination: "DXB", routeDisplay: "ISB-DXB", isRoundTrip: false } }),
    prisma.sector.create({ data: { origin: "ISB", destination: "JED", routeDisplay: "ISB-JED-ISB", isRoundTrip: true } }),
    prisma.sector.create({ data: { origin: "ISB", destination: "RUH", routeDisplay: "ISB-RUH", isRoundTrip: false } }),
    prisma.sector.create({ data: { origin: "ISB", destination: "SHJ", routeDisplay: "ISB-SHJ", isRoundTrip: false } }),
    prisma.sector.create({ data: { origin: "KHI", destination: "RUH", routeDisplay: "KHI-RUH", isRoundTrip: false } }),
    prisma.sector.create({ data: { origin: "LYP", destination: "DXB", routeDisplay: "LYP-DXB", isRoundTrip: false } }),
    prisma.sector.create({ data: { origin: "MUX", destination: "JED", routeDisplay: "MUX-JED-MUX", isRoundTrip: true } }),
    prisma.sector.create({ data: { origin: "LHE", destination: "MED", routeDisplay: "LHE-MED-LHE", isRoundTrip: true } }),
  ]);
  console.log("Sectors created:", sectors.length);

  // 5. Sample Flight Groups
  const group1 = await prisma.flightGroup.create({
    data: {
      groupName: "01. SAUDI ARABIAN AIRLINES LHE-JED-LHE",
      category: "UMRAH",
      airlineId: airlines[5].id, // Saudia
      sectorId: sectors[0].id,   // LHE-JED-LHE
      totalSeats: 50,
      availableSeats: 35,
      departureDate: new Date("2026-09-16"),
      returnDate: new Date("2026-10-07"),
      numDays: 21,
      adultPrice: 185000,
      childPrice: 165000,
      infantPrice: 35000,
      currency: "PKR",
      flightLegs: {
        create: [
          { legNumber: 1, flightNumber: "SV 735", departureDate: new Date("2026-09-16"), origin: "LHE", destination: "JED", departureTime: "11:25", arrivalTime: "15:50", baggage: "23-KG" },
          { legNumber: 2, flightNumber: "SV 736", departureDate: new Date("2026-10-07"), origin: "JED", destination: "LHE", departureTime: "17:30", arrivalTime: "23:45", baggage: "23-KG" },
        ],
      },
    },
  });

  const group2 = await prisma.flightGroup.create({
    data: {
      groupName: "02. FLY JINNAH ISB-SHJ",
      category: "UAE_ONE_WAY",
      airlineId: airlines[3].id, // Fly Jinnah
      sectorId: sectors[7].id,   // ISB-SHJ
      totalSeats: 40,
      availableSeats: 28,
      departureDate: new Date("2026-05-13"),
      adultPrice: 45000,
      childPrice: 38000,
      infantPrice: 8000,
      currency: "PKR",
      flightLegs: {
        create: [
          { legNumber: 1, flightNumber: "9P 512", departureDate: new Date("2026-05-13"), origin: "ISB", destination: "SHJ", departureTime: "08:30", arrivalTime: "11:15", baggage: "30-KG" },
        ],
      },
    },
  });

  const group3 = await prisma.flightGroup.create({
    data: {
      groupName: "03. AIR SIAL LHE-RUH",
      category: "KSA_ONE_WAY",
      airlineId: airlines[1].id, // Air Sial
      sectorId: sectors[2].id,   // LHE-RUH
      totalSeats: 60,
      availableSeats: 42,
      departureDate: new Date("2026-06-20"),
      adultPrice: 55000,
      childPrice: 48000,
      infantPrice: 10000,
      currency: "PKR",
      flightLegs: {
        create: [
          { legNumber: 1, flightNumber: "PF 401", departureDate: new Date("2026-06-20"), origin: "LHE", destination: "RUH", departureTime: "14:00", arrivalTime: "17:30", baggage: "23-KG" },
        ],
      },
    },
  });
  console.log("Flight groups created: 3");

  // 6. Hotels
  const hotels = await Promise.all([
    prisma.hotel.create({ data: { name: "AL KISWAH TOWERS HOTEL", city: "MAKKAH", distance: 200, starRating: 4, sharingRate: 8000, doubleRate: 12000, tripleRate: 10000, quadRate: 9000, quintRate: 8500 } }),
    prisma.hotel.create({ data: { name: "VOCO HOTEL MAKKAH", city: "MAKKAH", distance: 150, starRating: 5, sharingRate: 15000, doubleRate: 22000, tripleRate: 18000, quadRate: 16000, quintRate: 14000 } }),
    prisma.hotel.create({ data: { name: "FUNDAQ HARIS", city: "MAKKAH", distance: 400, starRating: 3, sharingRate: 5000, doubleRate: 8000, tripleRate: 6500, quadRate: 6000, quintRate: 5500 } }),
    prisma.hotel.create({ data: { name: "SWISS INTERNATIONAL MADINA", city: "MADINA", distance: 300, starRating: 4, sharingRate: 7000, doubleRate: 11000, tripleRate: 9000, quadRate: 8000, quintRate: 7500 } }),
    prisma.hotel.create({ data: { name: "SHAZA AL MADINA", city: "MADINA", distance: 200, starRating: 5, sharingRate: 12000, doubleRate: 18000, tripleRate: 15000, quadRate: 13000, quintRate: 11000 } }),
    prisma.hotel.create({ data: { name: "TAJ WARD MADINA", city: "MADINA", distance: 500, starRating: 3, sharingRate: 4500, doubleRate: 7000, tripleRate: 5500, quadRate: 5000, quintRate: 4500 } }),
  ]);
  console.log("Hotels created:", hotels.length);

  // 7. Visa Types
  await Promise.all([
    prisma.visaType.create({ data: { name: "SHIRKAH MAKKAH", adultBuyRate: 550, adultSellRate: 580, childBuyRate: 400, childSellRate: 430, currency: "SAR" } }),
    prisma.visaType.create({ data: { name: "ONLY VISA-1447H", adultBuyRate: 520, adultSellRate: 550, childBuyRate: 380, childSellRate: 400, currency: "SAR" } }),
  ]);
  console.log("Visa types created: 2");

  // 8. Transport
  await Promise.all([
    prisma.transport.create({ data: { vehicleType: "7 Seater", route: "JED-MAK-MAD-MAK-JED", buyRate: 5000, sellRate: 7000 } }),
    prisma.transport.create({ data: { vehicleType: "ROUND TRIP", route: "JED-MAK-MAD-MAK-JED", buyRate: 4000, sellRate: 6000 } }),
    prisma.transport.create({ data: { vehicleType: "SUV & Seater", route: "JED-MAK-MAD-JED", buyRate: 6000, sellRate: 8000 } }),
  ]);
  console.log("Transport options created: 3");

  // 9. Bank Accounts
  await Promise.all([
    prisma.bankAccount.create({ data: { bankName: "HABIB BANK LIMITED", accountTitle: "MIRZA TRAVEL (Private) Limited", accountNumber: "5004 7100 9748 52", iban: "PK36HABB0050047100974852" } }),
    prisma.bankAccount.create({ data: { bankName: "MEEZAN BANK LTD", accountTitle: "MIRZA TRAVEL & TOURISM", accountNumber: "04340106982415", iban: "PK09MEZN0004340106982415" } }),
  ]);
  console.log("Bank accounts created: 2");

  // 10. Office Branches
  await Promise.all([
    prisma.officeBranch.create({ data: { name: "Head Office", city: "Faisalabad", address: "Az Mall, Kohenoor Town, Faisalabad", isHead: true } }),
    prisma.officeBranch.create({ data: { name: "Lahore Office", city: "Lahore", address: "Main Boulevard, Near Siddique Trade Center, Gulberg" } }),
    prisma.officeBranch.create({ data: { name: "Islamabad Office", city: "Islamabad", address: "Gulberg Green, Islamabad" } }),
    prisma.officeBranch.create({ data: { name: "Gujranwala Office", city: "Gujranwala", address: "Jinnah Stadium, Gujranwala" } }),
    prisma.officeBranch.create({ data: { name: "Multan Office", city: "Multan", address: "Katchery Road, Chungi #7, Multan" } }),
  ]);
  console.log("Office branches created: 5");

  // 11. Authorizations
  await Promise.all([
    prisma.authorization.create({ data: { name: "IATA", description: "Officially authorized by IATA for reliable travel services" } }),
    prisma.authorization.create({ data: { name: "SECP", description: "Authorized by Security & Exchange Commission of Pakistan" } }),
    prisma.authorization.create({ data: { name: "DTS", description: "Authorized by Department of Tourist Services" } }),
    prisma.authorization.create({ data: { name: "Serene Air PSA", description: "Authorized by Serene Air PSA for travel services" } }),
    prisma.authorization.create({ data: { name: "PIA PSA", description: "Authorized by PIA PSA Pakistan International Airlines" } }),
  ]);
  console.log("Authorizations created: 5");

  // 12. Company Settings
  await prisma.companySetting.create({
    data: {
      companyName: "Mirza Travel & Tourism",
      tagline: "Your Trusted Travel Partner",
      email: "support@mirzatravel.pk",
      phone: "+92 3000381533",
      whatsapp: "+923000381533",
      address: "Az Mall, Kohenoor Town, Faisalabad, Punjab, Pakistan",
    },
  });
  console.log("Company settings created");

  // 13. Sample Umrah Package
  await prisma.umrahPackage.create({
    data: {
      packageName: "ECONOMY UMRAH PACKAGE - 21 DAYS",
      groupId: group1.id,
      numDays: 21,
      availableSeats: 20,
      sharedPrice: null,
      doublePrice: 254250,
      triplePrice: 240833,
      quadPrice: 234125,
      departureDate: new Date("2026-09-16"),
      returnDate: new Date("2026-10-07"),
      packageHotels: {
        create: [
          { hotelId: hotels[0].id, city: "MAKKAH", nights: 7, checkinDate: new Date("2026-09-16"), checkoutDate: new Date("2026-09-23"), sequence: 1 },
          { hotelId: hotels[3].id, city: "MADINA", nights: 7, checkinDate: new Date("2026-09-23"), checkoutDate: new Date("2026-09-30"), sequence: 2 },
          { hotelId: hotels[2].id, city: "MAKKAH", nights: 7, checkinDate: new Date("2026-09-30"), checkoutDate: new Date("2026-10-07"), sequence: 3 },
        ],
      },
      packageTransport: {
        create: { transportId: 1, cost: 7000 },
      },
    },
  });
  console.log("Sample Umrah package created");

  // 14. Deals
  await Promise.all([
    prisma.deal.create({ data: { title: "Early Bird Umrah Special", description: "Book your Umrah package 3 months in advance and get 10% discount on hotel rates." } }),
    prisma.deal.create({ data: { title: "Group Discount - 10+ Passengers", description: "Groups of 10 or more passengers get special rates on all flight groups." } }),
    prisma.deal.create({ data: { title: "Ramadan Umrah Packages", description: "Special Ramadan Umrah packages with premium hotels near Haram." } }),
  ]);
  console.log("Deals created: 3");

  console.log("\nSeeding complete!");
  console.log("\n--- Login Credentials ---");
  console.log("Admin:  admin@mirzatravel.pk / Admin@123");
  console.log("Agent:  Code: 5190 | demo@agent.pk / Agent@123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
