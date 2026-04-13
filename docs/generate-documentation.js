const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType,
  PageBreak, VerticalAlign, convertInchesToTwip, Header, Footer,
  PageNumber, NumberFormat
} = require("docx");
const fs = require("fs");

// ── Color Palette ──
const PRIMARY = "0C446F";     // Dark navy (matching reference site)
const ACCENT = "FAAF43";      // Golden orange (matching reference site)
const ACCENT2 = "034264";     // Deep blue
const LIGHT_BG = "F8F9FA";    // Light gray
const WHITE = "FFFFFF";
const DARK = "1A1A2E";
const GRAY = "6B7280";
const LIGHT_GRAY = "E5E7EB";
const SUCCESS = "28A745";
const WARNING = "F06723";
const TABLE_HEADER = "0C446F";
const TABLE_ALT = "F0F4F8";

// ── Helper Functions ──
function spacer(size = 200) {
  return new Paragraph({ spacing: { before: size, after: size } });
}

function dividerLine() {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: ACCENT } },
    children: [],
  });
}

function sectionHeader(number, title) {
  return [
    new Paragraph({
      spacing: { before: 500, after: 80 },
      children: [
        new TextRun({ text: `${number}. `, font: "Calibri", size: 28, color: ACCENT, bold: true }),
        new TextRun({ text: title.toUpperCase(), font: "Calibri", size: 28, color: PRIMARY, bold: true }),
      ],
    }),
    new Paragraph({
      spacing: { after: 250 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT } },
      children: [],
    }),
  ];
}

function subHeader(text) {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    children: [
      new TextRun({ text, font: "Calibri", size: 24, color: ACCENT2, bold: true }),
    ],
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: 21,
        color: opts.color || DARK,
        bold: opts.bold || false,
        italics: opts.italic || false,
      }),
    ],
  });
}

function bulletPoint(text, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix, font: "Calibri", size: 21, color: PRIMARY, bold: true }));
  }
  children.push(new TextRun({ text, font: "Calibri", size: 21, color: DARK }));
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: convertInchesToTwip(0.3) },
    children: [
      new TextRun({ text: "  \u2022  ", font: "Calibri", size: 21, color: ACCENT }),
      ...children,
    ],
  });
}

function numberedPoint(num, text, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix, font: "Calibri", size: 21, color: PRIMARY, bold: true }));
  }
  children.push(new TextRun({ text, font: "Calibri", size: 21, color: DARK }));
  return new Paragraph({
    spacing: { before: 50, after: 50 },
    indent: { left: convertInchesToTwip(0.3) },
    children: [
      new TextRun({ text: `${num}.  `, font: "Calibri", size: 21, color: ACCENT, bold: true }),
      ...children,
    ],
  });
}

function createCell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shading ? { type: ShadingType.SOLID, color: opts.shading } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: text || "",
            font: "Calibri",
            size: opts.size || 20,
            color: opts.color || DARK,
            bold: opts.bold || false,
          }),
        ],
      }),
    ],
  });
}

function tableHeaderRow(headers, widths = []) {
  return new TableRow({
    tableHeader: true,
    children: headers.map((h, i) =>
      createCell(h, {
        shading: TABLE_HEADER,
        color: WHITE,
        bold: true,
        center: true,
        size: 20,
        width: widths[i] || undefined,
      })
    ),
  });
}

function tableDataRow(cells, alt = false) {
  return new TableRow({
    children: cells.map((c, i) =>
      createCell(typeof c === "string" ? c : c.text, {
        shading: alt ? TABLE_ALT : WHITE,
        bold: typeof c === "object" ? c.bold : false,
        size: 19,
      })
    ),
  });
}

function createTable(headers, rows, widths = []) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableHeaderRow(headers, widths),
      ...rows.map((row, i) => tableDataRow(row, i % 2 === 1)),
    ],
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ══════════════════════════════════════════════════════════════
// ── DOCUMENT SECTIONS ──
// ══════════════════════════════════════════════════════════════

function coverPage() {
  return [
    spacer(600),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "MIRZA TRAVEL & TOURISM", font: "Calibri", size: 48, color: PRIMARY, bold: true }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT } },
      children: [],
    }),
    spacer(100),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "Online Travel Booking Platform", font: "Calibri", size: 32, color: ACCENT2, bold: true }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "Software Requirements Specification (SRS)", font: "Calibri", size: 26, color: GRAY }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "& Project Documentation", font: "Calibri", size: 26, color: GRAY }),
      ],
    }),
    spacer(400),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "Prepared By:", font: "Calibri", size: 22, color: GRAY }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "[Your Company Name]", font: "Calibri", size: 26, color: PRIMARY, bold: true }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "[Contact Email] | [Phone Number]", font: "Calibri", size: 20, color: GRAY }),
      ],
    }),
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Prepared For:", font: "Calibri", size: 22, color: GRAY }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Mirza Travel & Tourism", font: "Calibri", size: 26, color: PRIMARY, bold: true }),
      ],
    }),
    spacer(300),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Document Version: 1.0  |  Date: April 2026", font: "Calibri", size: 20, color: GRAY }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "Status: Draft - Editable", font: "Calibri", size: 20, color: WARNING, bold: true }),
      ],
    }),
    pageBreak(),
  ];
}

function tableOfContents() {
  const items = [
    ["1", "Executive Summary"],
    ["2", "Project Overview"],
    ["3", "System Architecture"],
    ["4", "Technology Stack"],
    ["5", "User Roles & Permissions"],
    ["6", "Module Breakdown"],
    ["  6.1", "Public Landing Website"],
    ["  6.2", "Agent Registration & Authentication"],
    ["  6.3", "Agent Dashboard"],
    ["  6.4", "Flight Groups Management"],
    ["  6.5", "Booking System"],
    ["  6.6", "Umrah Packages"],
    ["  6.7", "Umrah Calculator"],
    ["  6.8", "Hotel Rates Management"],
    ["  6.9", "Payment & Accounts"],
    ["  6.10", "Admin Panel"],
    ["7", "Database Schema"],
    ["8", "API Endpoints"],
    ["9", "UI/UX Design Specifications"],
    ["10", "Security Requirements"],
    ["11", "Development Phases & Timeline"],
    ["12", "Testing Strategy"],
    ["13", "Deployment Plan"],
    ["14", "Terms & Conditions"],
  ];

  return [
    new Paragraph({
      spacing: { before: 200, after: 200 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "TABLE OF CONTENTS", font: "Calibri", size: 32, color: PRIMARY, bold: true }),
      ],
    }),
    dividerLine(),
    spacer(100),
    ...items.map(([num, title]) => {
      const isSubItem = num.trim().includes(".");
      return new Paragraph({
        spacing: { before: isSubItem ? 30 : 80, after: isSubItem ? 30 : 80 },
        indent: { left: isSubItem ? convertInchesToTwip(0.5) : 0 },
        children: [
          new TextRun({
            text: `${num}  `,
            font: "Calibri",
            size: isSubItem ? 20 : 22,
            color: ACCENT,
            bold: !isSubItem,
          }),
          new TextRun({
            text: title,
            font: "Calibri",
            size: isSubItem ? 20 : 22,
            color: isSubItem ? GRAY : PRIMARY,
            bold: !isSubItem,
          }),
        ],
      });
    }),
    pageBreak(),
  ];
}

function executiveSummary() {
  return [
    ...sectionHeader("1", "Executive Summary"),
    bodyText(
      "Mirza Travel & Tourism aims to establish a comprehensive online travel booking platform that enables travel agents to search, book, and manage airline group tickets, Umrah packages, and hotel accommodations through a centralized digital portal."
    ),
    spacer(100),
    bodyText(
      "The platform will consist of three main panels: a public-facing landing website for brand visibility and agent registration, an agent dashboard for managing bookings, payments, and accounts, and an admin panel for complete system management including agent approval, inventory control, and financial oversight."
    ),
    spacer(100),
    subHeader("Key Objectives"),
    bulletPoint("Provide a user-friendly online platform for travel agents to browse and book group airline tickets"),
    bulletPoint("Enable complete Umrah package management including flights, hotels, visa, and transport"),
    bulletPoint("Implement a secure agent registration and approval system with admin oversight"),
    bulletPoint("Provide real-time seat availability and pricing for airline groups"),
    bulletPoint("Enable online payment submission with receipt upload and ledger tracking"),
    bulletPoint("Generate printable e-tickets, vouchers, and financial reports"),
    bulletPoint("Build a scalable, modern architecture using MERN stack with PostgreSQL"),
    spacer(100),
    subHeader("Target Users"),
    bulletPoint("Travel Agents: ", "Primary Users - "),
    bodyText("  Registered travel agencies who will search, book, and manage group tickets for their customers.", { color: GRAY }),
    bulletPoint("Admin Staff: ", "Platform Managers - "),
    bodyText("  Mirza Travel & Tourism internal team who manage agents, inventory, pricing, and operations.", { color: GRAY }),
    bulletPoint("End Customers: ", "Indirect Users - "),
    bodyText("  Travelers who benefit from agent bookings (no direct platform access).", { color: GRAY }),
    pageBreak(),
  ];
}

function projectOverview() {
  return [
    ...sectionHeader("2", "Project Overview"),
    bodyText(
      "The Mirza Travel & Tourism Online Booking Platform is a B2B (Business-to-Business) web application designed specifically for travel agents. The platform will replicate and enhance the functionality of established travel agency portals with a modern, responsive, and scalable architecture."
    ),
    spacer(100),
    subHeader("Business Model"),
    bodyText("The platform operates on a B2B model where:"),
    bulletPoint("Mirza Travel & Tourism acts as the aggregator/supplier of group airline tickets and Umrah packages"),
    bulletPoint("Registered travel agents browse available inventory and make bookings on behalf of their customers"),
    bulletPoint("Pricing includes buying rates (cost to Mirza) and selling rates (price to agents) with built-in margins"),
    bulletPoint("Agents submit payments via bank transfer and upload receipts for verification"),
    bulletPoint("A complete accounting system tracks agent balances, debits, credits, and closing balances"),
    spacer(100),
    subHeader("Core Business Flows"),
    spacer(50),
    bodyText("Flow 1: Agent Registration & Approval", { bold: true }),
    numberedPoint(1, "Agent visits the landing page and fills out the registration form"),
    numberedPoint(2, "Admin receives the registration request and reviews the agent's details"),
    numberedPoint(3, "Admin approves/rejects the agent registration"),
    numberedPoint(4, "Approved agents receive their Agent Code and login credentials"),
    numberedPoint(5, "Agent logs in with Agent Code + Email + Password"),
    spacer(50),
    bodyText("Flow 2: Ticket Booking", { bold: true }),
    numberedPoint(1, "Agent searches for available flight groups (filtered by airline, sector, category)"),
    numberedPoint(2, "Agent selects a group and clicks 'Book Now'"),
    numberedPoint(3, "Agent enters passenger count (adults, children, infants) and passenger details"),
    numberedPoint(4, "System calculates total price based on per-seat pricing"),
    numberedPoint(5, "Booking is created with a countdown timer for payment deadline"),
    numberedPoint(6, "Agent submits payment via bank transfer and uploads receipt"),
    numberedPoint(7, "Admin verifies payment and confirms the booking"),
    numberedPoint(8, "Agent can print e-tickets and vouchers"),
    spacer(50),
    bodyText("Flow 3: Umrah Package Booking", { bold: true }),
    numberedPoint(1, "Agent uses Umrah Calculator to build a custom package (visa + hotels + transport)"),
    numberedPoint(2, "Or agent browses pre-built Umrah packages with pricing by room type"),
    numberedPoint(3, "Agent selects package and room type (Shared/Double/Triple/Quad)"),
    numberedPoint(4, "System processes the booking with same payment and confirmation flow"),
    pageBreak(),
  ];
}

function systemArchitecture() {
  return [
    ...sectionHeader("3", "System Architecture"),
    bodyText(
      "The platform follows a modern three-tier architecture with clear separation of concerns between the client-side application, server-side API, and database layer."
    ),
    spacer(100),
    subHeader("Architecture Overview"),
    spacer(50),
    createTable(
      ["Layer", "Technology", "Purpose"],
      [
        ["Frontend (Client)", "React.js + Vite + Tailwind CSS", "User interface, routing, state management"],
        ["Backend (API Server)", "Node.js + Express.js", "REST API, business logic, authentication"],
        ["Database", "PostgreSQL + Prisma ORM", "Data storage, relations, migrations"],
        ["Authentication", "JWT (Access + Refresh Tokens)", "Secure user sessions"],
        ["File Storage", "Multer + Cloudinary", "Logo uploads, payment receipts, documents"],
        ["PDF Generation", "jsPDF / React-PDF", "E-tickets, vouchers, ledger reports"],
        ["Real-time", "Socket.io (optional)", "Live seat updates, booking notifications"],
      ]
    ),
    spacer(200),
    subHeader("Application Structure"),
    spacer(50),
    bodyText("The application is organized as a monorepo with two main packages:", { bold: true }),
    spacer(50),
    bodyText("Frontend (client/):", { bold: true, color: PRIMARY }),
    bulletPoint("React.js with Vite for fast development and optimized builds"),
    bulletPoint("React Router v6 for client-side routing with protected routes"),
    bulletPoint("Tailwind CSS for utility-first responsive styling"),
    bulletPoint("Axios for HTTP requests to the backend API"),
    bulletPoint("React Context/Zustand for global state management"),
    bulletPoint("React Hook Form for form handling and validation"),
    spacer(50),
    bodyText("Backend (server/):", { bold: true, color: PRIMARY }),
    bulletPoint("Express.js REST API with structured route handlers"),
    bulletPoint("Prisma ORM for type-safe database queries and migrations"),
    bulletPoint("JWT middleware for route protection and role-based access"),
    bulletPoint("Multer for file upload handling"),
    bulletPoint("Express Validator for input validation and sanitization"),
    bulletPoint("Helmet & CORS for security headers"),
    spacer(50),
    bodyText("Database:", { bold: true, color: PRIMARY }),
    bulletPoint("PostgreSQL for relational data (users, bookings, flights, payments)"),
    bulletPoint("Prisma migrations for version-controlled schema changes"),
    bulletPoint("Proper indexing on frequently queried columns (agent_id, status, dates)"),
    pageBreak(),
  ];
}

function technologyStack() {
  return [
    ...sectionHeader("4", "Technology Stack"),
    bodyText("The following technologies have been selected for optimal performance, developer productivity, and long-term maintainability."),
    spacer(100),
    subHeader("Frontend Technologies"),
    createTable(
      ["Technology", "Version", "Purpose"],
      [
        ["React.js", "18.x", "Component-based UI library"],
        ["Vite", "5.x", "Build tool and dev server"],
        ["Tailwind CSS", "3.x", "Utility-first CSS framework"],
        ["React Router", "6.x", "Client-side routing"],
        ["Axios", "1.x", "HTTP client for API calls"],
        ["React Hook Form", "7.x", "Form handling and validation"],
        ["Zustand", "4.x", "Lightweight state management"],
        ["React Icons", "5.x", "Icon library"],
        ["React Toastify", "10.x", "Toast notifications"],
        ["jsPDF", "2.x", "Client-side PDF generation"],
        ["date-fns", "3.x", "Date formatting and calculations"],
      ]
    ),
    spacer(200),
    subHeader("Backend Technologies"),
    createTable(
      ["Technology", "Version", "Purpose"],
      [
        ["Node.js", "20.x LTS", "Server runtime environment"],
        ["Express.js", "4.x", "Web framework for REST API"],
        ["Prisma", "5.x", "ORM for PostgreSQL"],
        ["PostgreSQL", "16.x", "Relational database"],
        ["JSON Web Token", "9.x", "Authentication tokens"],
        ["bcryptjs", "2.x", "Password hashing"],
        ["Multer", "1.x", "File upload middleware"],
        ["Cloudinary", "2.x", "Cloud file storage"],
        ["Express Validator", "7.x", "Input validation"],
        ["Helmet", "7.x", "Security headers"],
        ["CORS", "2.x", "Cross-origin resource sharing"],
        ["Nodemailer", "6.x", "Email notifications"],
        ["dotenv", "16.x", "Environment variable management"],
      ]
    ),
    spacer(200),
    subHeader("Development & Deployment Tools"),
    createTable(
      ["Tool", "Purpose"],
      [
        ["Git + GitHub", "Version control and code repository"],
        ["VS Code", "Code editor"],
        ["Postman", "API testing"],
        ["pgAdmin", "Database management GUI"],
        ["Vercel / Railway", "Frontend / Backend hosting"],
        ["Neon / Supabase", "Managed PostgreSQL hosting"],
        ["ESLint + Prettier", "Code linting and formatting"],
      ]
    ),
    pageBreak(),
  ];
}

function userRoles() {
  return [
    ...sectionHeader("5", "User Roles & Permissions"),
    bodyText("The system implements role-based access control (RBAC) with three distinct user roles:"),
    spacer(100),
    createTable(
      ["Role", "Access Level", "Key Permissions"],
      [
        ["Super Admin", "Full System Access", "Manage everything - agents, flights, bookings, payments, settings, reports"],
        ["Agent", "Agent Panel Access", "Search flights, book tickets, manage own bookings, submit payments, view ledger"],
        ["Public User", "Landing Page Only", "View website, register as agent, contact support"],
      ]
    ),
    spacer(200),
    subHeader("Admin Permissions Detail"),
    createTable(
      ["Module", "Permissions"],
      [
        ["Agent Management", "View, Approve, Reject, Activate, Deactivate, Delete agents"],
        ["Flight Groups", "Create, Edit, Delete, Update pricing, Manage seats"],
        ["Bookings", "View all, Confirm, Cancel, Assign PNR, Extend deadline"],
        ["Packages", "Create, Edit, Delete Umrah packages with flights + hotels + transport"],
        ["Hotels", "Add, Edit, Delete hotels and room rates for Makkah/Madina"],
        ["Visa Types", "Add, Edit visa types with buying/selling rates"],
        ["Transport", "Add, Edit vehicles, routes, and transport pricing"],
        ["Payments", "View submissions, Post/Unpost payments, Add remarks"],
        ["Accounts", "Manage agent ledgers, Add debit/credit entries, Generate reports"],
        ["Bank Details", "Add, Edit bank accounts displayed to agents"],
        ["Settings", "System configuration, Company profile, Email templates"],
      ]
    ),
    spacer(200),
    subHeader("Agent Permissions Detail"),
    createTable(
      ["Module", "Permissions"],
      [
        ["Dashboard", "View booking stats, account balance"],
        ["Flight Search", "Search, filter by airline/sector/category, view details"],
        ["Booking", "Book seats, enter passenger details, view booking status"],
        ["Umrah Packages", "Browse packages, select room type, book"],
        ["Umrah Calculator", "Build custom package (visa + hotels + transport)"],
        ["Hotel Rates", "View Makkah/Madina hotel rates, filter by rating/distance"],
        ["Payments", "Submit payment with receipt upload, view payment history"],
        ["Ledger", "View own account ledger, print ledger PDF"],
        ["Profile", "Update contact info, phone, city, country, upload logo"],
        ["Password", "Change own password"],
        ["Tickets", "Print e-tickets, vouchers for confirmed bookings"],
      ]
    ),
    pageBreak(),
  ];
}

function moduleBreakdown() {
  return [
    ...sectionHeader("6", "Module Breakdown"),

    // 6.1 Landing Website
    subHeader("6.1 Public Landing Website"),
    bodyText("The public-facing website serves as the primary entry point for brand visibility and agent acquisition."),
    spacer(50),
    bodyText("Pages & Components:", { bold: true }),
    createTable(
      ["Component", "Description", "Key Elements"],
      [
        ["Hero Section", "Full-width banner with video background", "Company tagline, key selling points, CTA button, Agent Login form"],
        ["Navigation Bar", "Fixed top navbar with scroll color change", "Logo, Home, Products dropdown, About, Contact, WhatsApp, Register/Login"],
        ["Services Section", "Feature showcase cards", "Flight Groups, Umrah Groups, Umrah Calculator, Umrah Packages"],
        ["Office Locations", "Branch office display", "City name, address, location image for each branch"],
        ["Authorizations", "Trust badges/certifications", "IATA, SECP, DTS, and other certification logos"],
        ["Footer", "Site-wide footer", "Contact info, product links, social media, copyright"],
        ["Agent Login Form", "Authentication form in hero section", "Agent Code, Email, Password, Login button, Signup link"],
        ["Registration Page", "New agent signup", "City selection, agency details, contact info, documents"],
        ["Password Recovery", "Modal for forgotten password", "Email input, send password reset button"],
      ]
    ),
    spacer(100),

    // 6.2 Authentication
    subHeader("6.2 Agent Registration & Authentication"),
    bodyText("Secure authentication system with multi-field login and admin-controlled registration."),
    spacer(50),
    bodyText("Registration Form Fields:", { bold: true }),
    createTable(
      ["Field", "Type", "Required", "Validation"],
      [
        ["Agency Name", "Text", "Yes", "Min 3 characters"],
        ["Contact Person Name", "Text", "Yes", "Min 2 characters"],
        ["Email", "Email", "Yes", "Valid email format, unique"],
        ["Phone Number", "Text", "Yes", "Valid phone format"],
        ["City", "Dropdown", "Yes", "Select from 100+ cities"],
        ["Country", "Text", "Yes", "Auto-filled based on city"],
        ["Password", "Password", "Yes", "Min 8 chars, 1 uppercase, 1 number, 1 special char"],
        ["Confirm Password", "Password", "Yes", "Must match password"],
        ["Agency Logo", "File Upload", "No", "JPG/PNG, max 2MB"],
      ]
    ),
    spacer(50),
    bodyText("Login Fields:", { bold: true }),
    bulletPoint("Agent Code (unique system-generated code after admin approval)"),
    bulletPoint("Email Address"),
    bulletPoint("Password"),
    spacer(100),

    // 6.3 Agent Dashboard
    subHeader("6.3 Agent Dashboard"),
    bodyText("The main hub for agents after login, showing key metrics and quick navigation."),
    spacer(50),
    bodyText("Dashboard Components:", { bold: true }),
    createTable(
      ["Component", "Description"],
      [
        ["One Way Groups Card", "Total one-way group bookings count with quick link"],
        ["Umrah Groups Card", "Total Umrah group bookings count with quick link"],
        ["Umrah Calculator Card", "Total Umrah calculator bookings count with quick link"],
        ["Account Balance Card", "Closing balance (Debit/Credit) with link to ledger"],
        ["Profile Update Form", "Quick form to update contact person, phone, city, country"],
        ["Sidebar Navigation", "Full navigation menu to all agent panel sections"],
      ]
    ),
    spacer(100),

    // 6.4 Flight Groups
    subHeader("6.4 Flight Groups Management"),
    bodyText("The core module for browsing and searching available airline group tickets."),
    spacer(50),
    bodyText("Flight Card Information:", { bold: true }),
    createTable(
      ["Field", "Description", "Example"],
      [
        ["Group Name", "Airline + Sector identifier", "SAUDI ARABIAN AIRLINES-LHE-JED-LHE"],
        ["Category", "Flight type category", "Umrah Group / UAE One-Way / KSA One-Way"],
        ["Airline", "Operating airline with logo", "PIA, Air Sial, Fly Dubai, Saudi Airlines"],
        ["Sector/Route", "Flight route details", "LHE-JED-LHE (round trip), ISB-DXB (one way)"],
        ["Flight Legs", "Multi-leg flight details", "Flight#, Date, Route, Dep Time, Arr Time, Baggage"],
        ["Total Seats", "Total group allocation", "50 seats"],
        ["Available Seats", "Remaining bookable seats", "23 seats"],
        ["Departure Date", "Formatted departure date", "Wed 16 Sep 2026"],
        ["Number of Days", "Trip duration (Umrah)", "21 days"],
        ["Pricing", "Per-seat price by passenger type", "Adult: PKR 85,000 | Child: PKR 75,000 | Infant: PKR 15,000"],
      ]
    ),
    spacer(50),
    bodyText("Search & Filter Options:", { bold: true }),
    bulletPoint("Category Tabs: All Types, Umrah, UAE One-Way, KSA One-Way"),
    bulletPoint("Filter by Airline: Radio buttons for each airline (PIA, Air Sial, Fly Dubai, etc.)"),
    bulletPoint("Filter by Sector: Route-specific buttons (LHE-JED, ISB-DXB, etc.)"),
    bulletPoint("Text Search: Free-text search across all flight details"),
    bulletPoint("Sector Quick Buttons: Breadcrumb-style route buttons for quick filtering"),
    spacer(100),

    // 6.5 Booking System
    subHeader("6.5 Booking System"),
    bodyText("Complete ticket booking workflow from seat selection to e-ticket generation."),
    spacer(50),
    bodyText("Booking Modal Fields:", { bold: true }),
    createTable(
      ["Field", "Type", "Description"],
      [
        ["Adults Count", "Number (min 1)", "Number of adult passengers"],
        ["Children Count", "Number (min 0)", "Number of child passengers (under 12)"],
        ["Infants Count", "Number (min 0)", "Number of infant passengers (under 2)"],
        ["Adult Price/Seat", "Display (readonly)", "Price per adult seat in PKR"],
        ["Child Price/Seat", "Display (readonly)", "Price per child seat in PKR"],
        ["Infant Price/Seat", "Display (readonly)", "Price per infant seat in PKR"],
        ["Total Price", "Calculated", "Grand total = (adults x price) + (children x price) + (infants x price)"],
        ["Passenger Names", "Dynamic text inputs", "Name fields generated based on passenger count"],
      ]
    ),
    spacer(50),
    bodyText("Booking Statuses:", { bold: true }),
    createTable(
      ["Status", "Color", "Description"],
      [
        ["On Request", "Yellow/Warning", "Booking submitted, awaiting admin confirmation"],
        ["Partial", "Blue/Info", "Partial payment received"],
        ["Confirmed", "Green/Success", "Payment verified, booking confirmed"],
        ["Cancelled", "Red/Danger", "Booking cancelled (manual or auto-expired)"],
      ]
    ),
    spacer(50),
    bodyText("Booking Features:", { bold: true }),
    bulletPoint("Countdown Timer: Each booking has an expiry countdown (FlipClock) for payment deadline"),
    bulletPoint("Auto-Cancellation: Bookings expire automatically if payment not received within deadline"),
    bulletPoint("Booking History: Filterable by date range and status with DataTables pagination"),
    bulletPoint("E-Ticket Print: Generate printable demo/final tickets for confirmed bookings"),
    bulletPoint("Bank Details Display: Show bank accounts for payment after successful booking"),
    spacer(100),

    // 6.6 Umrah Packages
    subHeader("6.6 Umrah Packages"),
    bodyText("Pre-built Umrah packages combining flights, hotels, visa, and transport."),
    spacer(50),
    bodyText("Package Card Information:", { bold: true }),
    createTable(
      ["Element", "Description"],
      [
        ["Package Number", "Sequential package identifier (e.g., UPV # 653)"],
        ["Departure Date", "Outbound flight date"],
        ["Return Date", "Inbound flight date"],
        ["Number of Days", "Total trip duration"],
        ["Available Seats", "Remaining bookable seats"],
        ["Flight Segments", "Flight#, Date, Route, Times, Baggage for each leg"],
        ["Hotels (Makkah)", "Hotel name, nights, distance from Haram"],
        ["Hotels (Madina)", "Hotel name, nights, distance from Masjid Nabawi"],
        ["Transport", "Vehicle type, route, transport cost"],
        ["Pricing", "Rates by room type: Shared, Double, Triple, Quad"],
        ["Airline Logo", "Visual airline brand identifier"],
      ]
    ),
    spacer(100),

    // 6.7 Umrah Calculator
    subHeader("6.7 Umrah Calculator"),
    bodyText("A dynamic package builder tool allowing agents to create custom Umrah packages."),
    spacer(50),
    bodyText("Calculator Sections:", { bold: true }),
    createTable(
      ["Section", "Fields", "Description"],
      [
        ["Visa Information", "Adults count, Infants count, Visa Type dropdown, Adult Rate, Infant Rate, Total Visa Cost", "Select visa type with auto-calculated buying/selling rates"],
        ["Room Type", "Private / Sharing dropdown", "Determines hotel rate calculation method"],
        ["Hotel Selection", "City (Makkah/Madina), Hotel, Rooms, Room Type, Check-in, Nights, Check-out", "Dynamic multi-row hotel selection with auto-populated options"],
        ["Transport", "Vehicle type, Route, Transfer rate", "Select transport with auto-populated route and rate"],
      ]
    ),
    spacer(50),
    bodyText("Dynamic Features:", { bold: true }),
    bulletPoint("Add/Remove city rows dynamically for multi-city hotel stays"),
    bulletPoint("Hotels dropdown auto-populates based on selected city (Makkah vs Madina)"),
    bulletPoint("Room types auto-populate based on selected hotel"),
    bulletPoint("Check-out date auto-calculates based on check-in date + nights"),
    bulletPoint("Transport routes auto-populate based on vehicle type selection"),
    bulletPoint("Total cost calculates automatically: Visa + Hotels + Transport"),
    spacer(100),

    // 6.8 Hotel Rates
    subHeader("6.8 Hotel Rates Management"),
    bodyText("Display and manage hotel rates for Makkah and Madina with filtering capabilities."),
    spacer(50),
    bodyText("Hotel Rate Table Columns:", { bold: true }),
    createTable(
      ["Column", "Description"],
      [
        ["Hotel Name", "Name of the hotel"],
        ["Date", "Rate validity date range"],
        ["Distance", "Distance from Haram (Makkah) or Masjid Nabawi (Madina) in meters"],
        ["Sharing Rate", "Per-person rate for sharing room occupancy"],
        ["Double Rate", "Per-person rate for double room occupancy"],
        ["Triple Rate", "Per-person rate for triple room occupancy"],
        ["Quad Rate", "Per-person rate for quad (4-person) room occupancy"],
        ["Quint Rate", "Per-person rate for quint (5-person) room occupancy"],
      ]
    ),
    spacer(50),
    bodyText("Filter Options:", { bold: true }),
    bulletPoint("Filter by Star Rating: 1 to 5 stars"),
    bulletPoint("Filter by Distance: Distance ranges from Haram/Masjid Nabawi"),
    bulletPoint("Filter by Hotel Name: Specific hotel selection"),
    bulletPoint("Print Rates: Print-friendly view of hotel rates"),
    spacer(100),

    // 6.9 Payment & Accounts
    subHeader("6.9 Payment & Accounts System"),
    bodyText("Complete financial management for agent payments, verification, and accounting."),
    spacer(50),
    bodyText("Payment Submission Form:", { bold: true }),
    createTable(
      ["Field", "Type", "Description"],
      [
        ["Date", "Date picker", "Payment date"],
        ["Description", "Text (uppercase)", "Payment description/reference"],
        ["Bank Account", "Dropdown", "Select receiving bank account"],
        ["Amount", "Number", "Payment amount in PKR"],
        ["Receipt Upload", "File", "Payment receipt screenshot/photo (required)"],
      ]
    ),
    spacer(50),
    bodyText("Payment History Table:", { bold: true }),
    createTable(
      ["Column", "Description"],
      [
        ["Voucher ID", "System-generated payment voucher number"],
        ["Date", "Payment submission date"],
        ["Description", "Payment description"],
        ["Amount", "Payment amount in PKR"],
        ["Status", "Posted (verified) / Un-Posted (pending verification)"],
        ["Remarks", "Admin remarks on the payment"],
        ["Receipt", "Uploaded receipt image/document"],
      ]
    ),
    spacer(50),
    bodyText("Ledger (Account Statement):", { bold: true }),
    createTable(
      ["Column", "Description"],
      [
        ["Voucher #", "Transaction voucher number"],
        ["Date", "Transaction date"],
        ["Description", "Transaction description"],
        ["Debit", "Amount debited (bookings, charges)"],
        ["Credit", "Amount credited (payments received)"],
        ["Balance", "Running balance after each transaction"],
      ]
    ),
    bulletPoint("Opening Balance display"),
    bulletPoint("Closing Balance with total debit and credit summary"),
    bulletPoint("Print Ledger: PDF export of the complete ledger"),
    bulletPoint("Date Range Filter: Filter by from/to dates"),
    spacer(100),

    // 6.10 Admin Panel
    subHeader("6.10 Admin Panel"),
    bodyText("Comprehensive administration dashboard for complete platform management."),
    spacer(50),
    bodyText("Admin Modules:", { bold: true }),
    createTable(
      ["Module", "Features"],
      [
        ["Dashboard", "Total agents, total bookings, revenue summary, recent activity, charts"],
        ["Agent Management", "List all agents, approve/reject registrations, activate/deactivate, view agent details"],
        ["Flight Groups", "Add new groups, edit pricing, update seat counts, manage airlines and sectors"],
        ["Booking Management", "View all bookings, confirm/cancel, assign PNR numbers, extend payment deadlines"],
        ["Umrah Packages", "Create packages (flights + hotels + transport), set pricing by room type, manage availability"],
        ["Hotel Management", "Add/edit hotels, set room rates (sharing/double/triple/quad/quint), manage distances"],
        ["Visa Types", "Create/edit visa types with buying and selling rates for adults and children"],
        ["Transport", "Manage vehicle types, routes, and transport pricing (buying/selling)"],
        ["Payment Verification", "View agent payment submissions, verify receipts, post/unpost payments, add remarks"],
        ["Accounts & Ledger", "Manage agent ledgers, add debit/credit entries, generate financial reports"],
        ["Bank Accounts", "Add/edit bank details displayed to agents for payment"],
        ["Reports", "Revenue reports, booking analytics, agent performance, financial summaries"],
        ["Settings", "Company profile, email templates, system configuration"],
      ]
    ),
    pageBreak(),
  ];
}

function databaseSchema() {
  return [
    ...sectionHeader("7", "Database Schema"),
    bodyText("The database uses PostgreSQL with Prisma ORM. Below are the core tables and their fields."),
    spacer(100),

    // Users Table
    subHeader("7.1 Users / Agents Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["agent_code", "VARCHAR(10)", "UNIQUE", "System-generated agent code"],
        ["agency_name", "VARCHAR(255)", "NOT NULL", "Travel agency name"],
        ["contact_person", "VARCHAR(255)", "NOT NULL", "Contact person full name"],
        ["email", "VARCHAR(255)", "UNIQUE, NOT NULL", "Login email address"],
        ["password", "VARCHAR(255)", "NOT NULL", "Bcrypt hashed password"],
        ["phone", "VARCHAR(20)", "", "Phone number"],
        ["city", "VARCHAR(100)", "", "City"],
        ["country", "VARCHAR(100)", "DEFAULT 'Pakistan'", "Country"],
        ["logo_url", "TEXT", "", "Agency logo image URL"],
        ["role", "ENUM", "DEFAULT 'agent'", "user role (admin/agent)"],
        ["status", "ENUM", "DEFAULT 'pending'", "Account status (pending/active/inactive)"],
        ["created_at", "TIMESTAMP", "DEFAULT NOW()", "Registration timestamp"],
        ["updated_at", "TIMESTAMP", "", "Last update timestamp"],
      ]
    ),
    spacer(150),

    // Airlines Table
    subHeader("7.2 Airlines Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["name", "VARCHAR(255)", "NOT NULL", "Airline name (e.g., PIA, Air Sial)"],
        ["logo_url", "TEXT", "", "Airline logo image URL"],
        ["status", "BOOLEAN", "DEFAULT true", "Active/inactive status"],
      ]
    ),
    spacer(150),

    // Sectors Table
    subHeader("7.3 Sectors / Routes Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["origin", "VARCHAR(10)", "NOT NULL", "Origin airport code (LHE, ISB, KHI)"],
        ["destination", "VARCHAR(10)", "NOT NULL", "Destination airport code (JED, DXB, RUH)"],
        ["route_display", "VARCHAR(50)", "", "Display format (LHE-JED-LHE)"],
        ["is_round_trip", "BOOLEAN", "DEFAULT false", "One-way or round-trip"],
      ]
    ),
    spacer(150),

    // Flight Groups Table
    subHeader("7.4 Flight Groups Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["group_name", "VARCHAR(255)", "NOT NULL", "Group identifier name"],
        ["category", "ENUM", "NOT NULL", "UMRAH / UAE_ONE_WAY / KSA_ONE_WAY"],
        ["airline_id", "INTEGER", "FK -> airlines.id", "Operating airline"],
        ["sector_id", "INTEGER", "FK -> sectors.id", "Flight route"],
        ["total_seats", "INTEGER", "NOT NULL", "Total seats allocated"],
        ["available_seats", "INTEGER", "NOT NULL", "Currently available seats"],
        ["departure_date", "DATE", "NOT NULL", "Departure date"],
        ["return_date", "DATE", "", "Return date (Umrah only)"],
        ["num_days", "INTEGER", "", "Trip duration in days"],
        ["adult_price", "DECIMAL(12,2)", "NOT NULL", "Price per adult seat"],
        ["child_price", "DECIMAL(12,2)", "", "Price per child seat"],
        ["infant_price", "DECIMAL(12,2)", "", "Price per infant seat"],
        ["currency", "VARCHAR(5)", "DEFAULT 'PKR'", "Price currency"],
        ["pnr_1", "VARCHAR(20)", "", "PNR code 1"],
        ["pnr_2", "VARCHAR(20)", "", "PNR code 2"],
        ["status", "ENUM", "DEFAULT 'active'", "active / inactive / sold_out"],
        ["created_at", "TIMESTAMP", "DEFAULT NOW()", "Created timestamp"],
      ]
    ),
    spacer(150),

    // Flight Legs Table
    subHeader("7.5 Flight Legs / Segments Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["group_id", "INTEGER", "FK -> flight_groups.id", "Parent flight group"],
        ["leg_number", "INTEGER", "NOT NULL", "Sequence number (1, 2, 3...)"],
        ["flight_number", "VARCHAR(20)", "NOT NULL", "Flight number (SV 735)"],
        ["departure_date", "DATE", "NOT NULL", "Leg departure date"],
        ["origin", "VARCHAR(10)", "NOT NULL", "Departure airport code"],
        ["destination", "VARCHAR(10)", "NOT NULL", "Arrival airport code"],
        ["departure_time", "TIME", "", "Departure time"],
        ["arrival_time", "TIME", "", "Arrival time"],
        ["baggage", "VARCHAR(20)", "", "Baggage allowance (23-KG)"],
      ]
    ),
    spacer(150),

    // Bookings Table
    subHeader("7.6 Bookings Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["booking_no", "VARCHAR(20)", "UNIQUE", "Booking reference (BK-28154)"],
        ["agent_id", "INTEGER", "FK -> users.id", "Booking agent"],
        ["group_id", "INTEGER", "FK -> flight_groups.id", "Booked flight group"],
        ["adults_count", "INTEGER", "NOT NULL", "Number of adult passengers"],
        ["children_count", "INTEGER", "DEFAULT 0", "Number of child passengers"],
        ["infants_count", "INTEGER", "DEFAULT 0", "Number of infant passengers"],
        ["total_seats", "INTEGER", "NOT NULL", "Total seats booked"],
        ["total_price", "DECIMAL(12,2)", "NOT NULL", "Grand total price"],
        ["status", "ENUM", "DEFAULT 'on_request'", "on_request / partial / confirmed / cancelled"],
        ["expiry_time", "TIMESTAMP", "", "Payment deadline timestamp"],
        ["auto_cancelled_at", "TIMESTAMP", "", "Auto-cancellation timestamp"],
        ["created_at", "TIMESTAMP", "DEFAULT NOW()", "Booking timestamp"],
      ]
    ),
    spacer(150),

    // Passengers Table
    subHeader("7.7 Passengers Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["booking_id", "INTEGER", "FK -> bookings.id", "Parent booking"],
        ["name", "VARCHAR(255)", "NOT NULL", "Passenger full name"],
        ["type", "ENUM", "NOT NULL", "adult / child / infant"],
        ["dob", "DATE", "", "Date of birth (required for child/infant)"],
        ["passport_no", "VARCHAR(50)", "", "Passport number"],
      ]
    ),
    spacer(150),

    // Hotels Table
    subHeader("7.8 Hotels Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["name", "VARCHAR(255)", "NOT NULL", "Hotel name"],
        ["city", "ENUM", "NOT NULL", "MAKKAH / MADINA"],
        ["distance", "DECIMAL(8,2)", "", "Distance from Haram/Masjid in meters"],
        ["star_rating", "INTEGER", "", "Star rating (1-5)"],
        ["sharing_rate", "DECIMAL(10,2)", "", "Per-person sharing room rate"],
        ["double_rate", "DECIMAL(10,2)", "", "Per-person double room rate"],
        ["triple_rate", "DECIMAL(10,2)", "", "Per-person triple room rate"],
        ["quad_rate", "DECIMAL(10,2)", "", "Per-person quad room rate"],
        ["quint_rate", "DECIMAL(10,2)", "", "Per-person quint room rate"],
        ["valid_from", "DATE", "", "Rate validity start date"],
        ["valid_to", "DATE", "", "Rate validity end date"],
        ["status", "BOOLEAN", "DEFAULT true", "Active status"],
      ]
    ),
    spacer(150),

    // Packages Table
    subHeader("7.9 Umrah Packages Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["package_name", "VARCHAR(255)", "NOT NULL", "Package display name"],
        ["group_id", "INTEGER", "FK -> flight_groups.id", "Associated flight group"],
        ["num_days", "INTEGER", "", "Total package days"],
        ["available_seats", "INTEGER", "", "Available seats"],
        ["shared_price", "DECIMAL(12,2)", "", "Total price per person (shared room)"],
        ["double_price", "DECIMAL(12,2)", "", "Total price per person (double room)"],
        ["triple_price", "DECIMAL(12,2)", "", "Total price per person (triple room)"],
        ["quad_price", "DECIMAL(12,2)", "", "Total price per person (quad room)"],
        ["status", "ENUM", "DEFAULT 'active'", "active / inactive"],
        ["created_at", "TIMESTAMP", "DEFAULT NOW()", "Created timestamp"],
      ]
    ),
    spacer(150),

    // Package Hotels Junction
    subHeader("7.10 Package Hotels (Junction) Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["package_id", "INTEGER", "FK -> umrah_packages.id", "Parent package"],
        ["hotel_id", "INTEGER", "FK -> hotels.id", "Hotel"],
        ["city", "ENUM", "NOT NULL", "MAKKAH / MADINA"],
        ["nights", "INTEGER", "NOT NULL", "Number of nights"],
        ["checkin_date", "DATE", "", "Check-in date"],
        ["checkout_date", "DATE", "", "Check-out date"],
        ["sequence", "INTEGER", "", "Order in itinerary"],
      ]
    ),
    spacer(150),

    // Visa Types Table
    subHeader("7.11 Visa Types Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["name", "VARCHAR(255)", "NOT NULL", "Visa type name"],
        ["adult_buy_rate", "DECIMAL(10,2)", "", "Buying rate per adult"],
        ["adult_sell_rate", "DECIMAL(10,2)", "", "Selling rate per adult"],
        ["child_buy_rate", "DECIMAL(10,2)", "", "Buying rate per child"],
        ["child_sell_rate", "DECIMAL(10,2)", "", "Selling rate per child"],
        ["currency", "VARCHAR(5)", "DEFAULT 'SAR'", "Rate currency"],
        ["status", "BOOLEAN", "DEFAULT true", "Active status"],
      ]
    ),
    spacer(150),

    // Transport Table
    subHeader("7.12 Transport Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["vehicle_type", "VARCHAR(100)", "NOT NULL", "Vehicle type (7 Seater, SUV, Bus)"],
        ["route", "VARCHAR(255)", "", "Route description (JED-MAK-MAD-MAK-JED)"],
        ["buy_rate", "DECIMAL(10,2)", "", "Buying rate"],
        ["sell_rate", "DECIMAL(10,2)", "", "Selling rate"],
        ["status", "BOOLEAN", "DEFAULT true", "Active status"],
      ]
    ),
    spacer(150),

    // Payments Table
    subHeader("7.13 Payments Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["voucher_id", "VARCHAR(20)", "UNIQUE", "System-generated voucher number"],
        ["agent_id", "INTEGER", "FK -> users.id", "Paying agent"],
        ["date", "DATE", "NOT NULL", "Payment date"],
        ["description", "TEXT", "", "Payment description"],
        ["bank_account_id", "INTEGER", "FK -> bank_accounts.id", "Receiving bank account"],
        ["amount", "DECIMAL(12,2)", "NOT NULL", "Payment amount"],
        ["receipt_url", "TEXT", "", "Uploaded receipt file URL"],
        ["status", "ENUM", "DEFAULT 'unposted'", "posted / unposted"],
        ["remarks", "TEXT", "", "Admin remarks"],
        ["created_at", "TIMESTAMP", "DEFAULT NOW()", "Submission timestamp"],
      ]
    ),
    spacer(150),

    // Ledger Table
    subHeader("7.14 Ledger Entries Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["voucher_no", "VARCHAR(20)", "", "Voucher reference number"],
        ["agent_id", "INTEGER", "FK -> users.id", "Agent account"],
        ["date", "DATE", "NOT NULL", "Transaction date"],
        ["description", "TEXT", "", "Transaction description"],
        ["debit", "DECIMAL(12,2)", "DEFAULT 0", "Debit amount"],
        ["credit", "DECIMAL(12,2)", "DEFAULT 0", "Credit amount"],
        ["balance", "DECIMAL(12,2)", "", "Running balance"],
        ["booking_id", "INTEGER", "FK -> bookings.id", "Related booking (if applicable)"],
        ["payment_id", "INTEGER", "FK -> payments.id", "Related payment (if applicable)"],
        ["created_at", "TIMESTAMP", "DEFAULT NOW()", "Entry timestamp"],
      ]
    ),
    spacer(150),

    // Bank Accounts Table
    subHeader("7.15 Bank Accounts Table"),
    createTable(
      ["Column", "Type", "Constraints", "Description"],
      [
        ["id", "SERIAL", "PRIMARY KEY", "Auto-increment ID"],
        ["bank_name", "VARCHAR(255)", "NOT NULL", "Bank name"],
        ["account_title", "VARCHAR(255)", "NOT NULL", "Account holder name"],
        ["account_number", "VARCHAR(50)", "NOT NULL", "Bank account number"],
        ["iban", "VARCHAR(50)", "", "IBAN number"],
        ["branch_address", "TEXT", "", "Branch address"],
        ["logo_url", "TEXT", "", "Bank logo image URL"],
        ["status", "BOOLEAN", "DEFAULT true", "Active status"],
      ]
    ),
    pageBreak(),
  ];
}

function apiEndpoints() {
  return [
    ...sectionHeader("8", "API Endpoints"),
    bodyText("RESTful API design with versioned endpoints and consistent response format."),
    spacer(50),
    bodyText("Base URL: /api/v1", { bold: true, color: PRIMARY }),
    spacer(100),

    subHeader("8.1 Authentication Endpoints"),
    createTable(
      ["Method", "Endpoint", "Description", "Auth"],
      [
        ["POST", "/auth/register", "Agent registration", "Public"],
        ["POST", "/auth/login", "Agent/Admin login", "Public"],
        ["POST", "/auth/refresh-token", "Refresh access token", "Token"],
        ["POST", "/auth/forgot-password", "Request password reset", "Public"],
        ["POST", "/auth/reset-password", "Reset password with token", "Public"],
        ["PUT", "/auth/change-password", "Change current password", "Agent/Admin"],
        ["POST", "/auth/logout", "Logout and invalidate token", "Agent/Admin"],
      ]
    ),
    spacer(100),

    subHeader("8.2 Agent Profile Endpoints"),
    createTable(
      ["Method", "Endpoint", "Description", "Auth"],
      [
        ["GET", "/profile", "Get own profile details", "Agent"],
        ["PUT", "/profile", "Update profile (contact, phone, city)", "Agent"],
        ["PUT", "/profile/logo", "Upload/update agency logo", "Agent"],
      ]
    ),
    spacer(100),

    subHeader("8.3 Flight Groups Endpoints"),
    createTable(
      ["Method", "Endpoint", "Description", "Auth"],
      [
        ["GET", "/groups", "List all active flight groups", "Agent"],
        ["GET", "/groups/:id", "Get group details with flight legs", "Agent"],
        ["GET", "/groups/filter", "Filter by airline, sector, category", "Agent"],
        ["POST", "/groups", "Create new flight group", "Admin"],
        ["PUT", "/groups/:id", "Update group details/pricing", "Admin"],
        ["DELETE", "/groups/:id", "Delete/deactivate group", "Admin"],
        ["PUT", "/groups/:id/seats", "Update seat availability", "Admin"],
      ]
    ),
    spacer(100),

    subHeader("8.4 Booking Endpoints"),
    createTable(
      ["Method", "Endpoint", "Description", "Auth"],
      [
        ["POST", "/bookings", "Create new booking", "Agent"],
        ["GET", "/bookings", "List agent's own bookings", "Agent"],
        ["GET", "/bookings/:id", "Get booking details with passengers", "Agent"],
        ["GET", "/bookings/all", "List all bookings (all agents)", "Admin"],
        ["PUT", "/bookings/:id/status", "Update booking status", "Admin"],
        ["PUT", "/bookings/:id/cancel", "Cancel a booking", "Agent/Admin"],
        ["GET", "/bookings/:id/ticket", "Generate e-ticket PDF", "Agent"],
      ]
    ),
    spacer(100),

    subHeader("8.5 Umrah Packages Endpoints"),
    createTable(
      ["Method", "Endpoint", "Description", "Auth"],
      [
        ["GET", "/packages", "List all available packages", "Agent"],
        ["GET", "/packages/:id", "Get package details", "Agent"],
        ["POST", "/packages", "Create new package", "Admin"],
        ["PUT", "/packages/:id", "Update package", "Admin"],
        ["DELETE", "/packages/:id", "Delete package", "Admin"],
        ["POST", "/packages/:id/book", "Book a package", "Agent"],
      ]
    ),
    spacer(100),

    subHeader("8.6 Umrah Calculator Endpoints"),
    createTable(
      ["Method", "Endpoint", "Description", "Auth"],
      [
        ["GET", "/visa-types", "List all visa types with rates", "Agent"],
        ["GET", "/hotels", "List hotels (filter by city)", "Agent"],
        ["GET", "/hotels/:id/rooms", "Get room types for hotel", "Agent"],
        ["GET", "/transport", "List transport options", "Agent"],
        ["GET", "/transport/:id/routes", "Get routes for vehicle type", "Agent"],
        ["POST", "/calculator/calculate", "Calculate package price", "Agent"],
        ["POST", "/calculator/book", "Book calculated package", "Agent"],
      ]
    ),
    spacer(100),

    subHeader("8.7 Hotel Rates Endpoints"),
    createTable(
      ["Method", "Endpoint", "Description", "Auth"],
      [
        ["GET", "/hotel-rates/makkah", "Get Makkah hotel rates", "Agent"],
        ["GET", "/hotel-rates/madina", "Get Madina hotel rates", "Agent"],
        ["POST", "/hotels", "Add new hotel", "Admin"],
        ["PUT", "/hotels/:id", "Update hotel rates", "Admin"],
        ["DELETE", "/hotels/:id", "Delete hotel", "Admin"],
      ]
    ),
    spacer(100),

    subHeader("8.8 Payments & Accounts Endpoints"),
    createTable(
      ["Method", "Endpoint", "Description", "Auth"],
      [
        ["POST", "/payments", "Submit payment with receipt", "Agent"],
        ["GET", "/payments", "List agent's own payments", "Agent"],
        ["GET", "/payments/all", "List all agent payments", "Admin"],
        ["PUT", "/payments/:id/status", "Post/Unpost payment", "Admin"],
        ["PUT", "/payments/:id/remarks", "Add admin remarks", "Admin"],
        ["GET", "/ledger", "Get agent's ledger entries", "Agent"],
        ["GET", "/ledger/:agent_id", "Get specific agent's ledger", "Admin"],
        ["POST", "/ledger", "Add ledger entry (debit/credit)", "Admin"],
        ["GET", "/ledger/print", "Generate ledger PDF", "Agent"],
        ["GET", "/bank-accounts", "Get bank details for payment", "Agent"],
        ["POST", "/bank-accounts", "Add bank account", "Admin"],
        ["PUT", "/bank-accounts/:id", "Update bank account", "Admin"],
      ]
    ),
    spacer(100),

    subHeader("8.9 Admin Endpoints"),
    createTable(
      ["Method", "Endpoint", "Description", "Auth"],
      [
        ["GET", "/admin/agents", "List all registered agents", "Admin"],
        ["PUT", "/admin/agents/:id/approve", "Approve agent registration", "Admin"],
        ["PUT", "/admin/agents/:id/reject", "Reject agent registration", "Admin"],
        ["PUT", "/admin/agents/:id/status", "Activate/Deactivate agent", "Admin"],
        ["GET", "/admin/dashboard", "Dashboard stats (agents, bookings, revenue)", "Admin"],
        ["GET", "/admin/reports/revenue", "Revenue report with date filters", "Admin"],
        ["GET", "/admin/reports/bookings", "Booking analytics report", "Admin"],
        ["POST", "/admin/visa-types", "Create visa type", "Admin"],
        ["PUT", "/admin/visa-types/:id", "Update visa type", "Admin"],
        ["POST", "/admin/transport", "Create transport option", "Admin"],
        ["PUT", "/admin/transport/:id", "Update transport option", "Admin"],
      ]
    ),
    pageBreak(),
  ];
}

function uiSpecifications() {
  return [
    ...sectionHeader("9", "UI/UX Design Specifications"),
    bodyText("The platform follows a modern, professional design language inspired by the reference site."),
    spacer(100),

    subHeader("9.1 Color Palette"),
    createTable(
      ["Color Name", "Hex Code", "Usage"],
      [
        ["Primary Navy", "#0C446F", "Headers, headings, navigation links, primary text"],
        ["Deep Blue", "#034264", "Footer background, dark sections, sidebar"],
        ["Golden Accent", "#FAAF43", "CTA buttons, highlights, borders, active states"],
        ["Orange", "#F06723", "Warning states, secondary CTA, header scroll state"],
        ["White", "#FFFFFF", "Backgrounds, card surfaces, text on dark"],
        ["Light Gray", "#F8F9FA", "Section backgrounds, alternating table rows"],
        ["Success Green", "#28A745", "Confirmed status, success messages"],
        ["Danger Red", "#DC3545", "Cancelled status, error messages, delete actions"],
        ["Warning Yellow", "#FFC107", "Pending status, filter buttons"],
        ["Info Blue", "#17A2B8", "Info cards, dashboard stat cards"],
        ["WhatsApp Green", "#25D366", "WhatsApp CTA button"],
      ]
    ),
    spacer(100),

    subHeader("9.2 Typography"),
    createTable(
      ["Element", "Font", "Size", "Weight"],
      [
        ["Main Headings", "Poppins / Montserrat", "28-48px", "700 (Bold)"],
        ["Sub Headings", "Poppins", "20-24px", "600 (Semi-Bold)"],
        ["Body Text", "Open Sans", "14-16px", "400 (Regular)"],
        ["Navigation", "Poppins", "15px", "600 (Semi-Bold)"],
        ["Buttons", "Poppins", "14-16px", "600 (Semi-Bold)"],
        ["Table Data", "Open Sans", "13-14px", "400 (Regular)"],
        ["Labels", "Open Sans", "12-13px", "500 (Medium)"],
      ]
    ),
    spacer(100),

    subHeader("9.3 Responsive Breakpoints"),
    createTable(
      ["Breakpoint", "Width", "Target Device"],
      [
        ["Mobile", "\u2264 600px", "Smartphones (portrait)"],
        ["Tablet", "601px - 768px", "Tablets, large phones"],
        ["Desktop", "769px - 1200px", "Laptops, small monitors"],
        ["Large Desktop", "> 1200px", "Full HD monitors"],
      ]
    ),
    spacer(100),

    subHeader("9.4 Key UI Components"),
    bulletPoint("Fixed Top Navbar: White background, changes to golden (#FAAF43) on scroll, with shadow"),
    bulletPoint("Hero Section: Full-width with video background (desktop) / fallback image (mobile), min-height 80vh"),
    bulletPoint("Service Cards: Image + title overlay, hover lift effect with shadow transition"),
    bulletPoint("Flight Cards: Horizontal layout showing airline logo, sector details, seats, price, Book Now CTA"),
    bulletPoint("Package Cards: Dark gradient background, flight details, hotel info, pricing by room type"),
    bulletPoint("Booking Modal: 3-column layout (passengers, price/seat, totals) with dynamic passenger rows"),
    bulletPoint("Dashboard Cards: Colored stat cards (info, success, warning, danger) with icon + count + link"),
    bulletPoint("Data Tables: Dark header, striped rows, search filter, pagination (50 per page)"),
    bulletPoint("Sidebar: AdminLTE dark theme, expandable menu items with sub-items"),
    bulletPoint("Loading Animation: Full-screen overlay with bouncing ball / plane animation"),
    bulletPoint("Countdown Timer: FlipClock.js for booking expiry countdown"),
    bulletPoint("Toast Notifications: Top-right position for success/error/warning messages"),
    pageBreak(),
  ];
}

function securityRequirements() {
  return [
    ...sectionHeader("10", "Security Requirements"),
    bodyText("The platform implements industry-standard security practices to protect agent data and financial transactions."),
    spacer(100),

    createTable(
      ["Security Measure", "Implementation"],
      [
        ["Password Hashing", "bcryptjs with 12 salt rounds - passwords never stored in plain text"],
        ["JWT Authentication", "Access tokens (15min expiry) + Refresh tokens (7-day expiry)"],
        ["Role-Based Access", "Middleware checks user role (admin/agent) before route access"],
        ["Input Validation", "Express Validator on all API endpoints to prevent injection"],
        ["SQL Injection Prevention", "Prisma ORM parameterized queries - no raw SQL"],
        ["XSS Protection", "Helmet.js security headers, input sanitization"],
        ["CSRF Protection", "SameSite cookie policy, CORS origin restriction"],
        ["HTTPS Enforcement", "SSL certificate required, HTTP redirects to HTTPS"],
        ["Rate Limiting", "Express Rate Limit on login/registration endpoints"],
        ["File Upload Validation", "File type whitelist (JPG/PNG/PDF), max size limits"],
        ["Environment Variables", ".env file for secrets, never committed to git"],
        ["Password Requirements", "Min 8 chars, 1 uppercase, 1 number, 1 special character"],
        ["Session Management", "Secure HTTP-only cookies for refresh tokens"],
        ["Data Encryption", "Sensitive data encrypted at rest in database"],
      ]
    ),
    pageBreak(),
  ];
}

function developmentTimeline() {
  return [
    ...sectionHeader("11", "Development Phases & Timeline"),
    bodyText("The project is divided into 4 phases with iterative delivery for continuous feedback."),
    spacer(100),

    subHeader("Phase 1: Foundation & Authentication (Week 1-2)"),
    createTable(
      ["Task", "Duration", "Deliverables"],
      [
        ["Project setup (MERN + PostgreSQL + Prisma)", "2 days", "Working project skeleton with build tools"],
        ["Database schema design & migrations", "2 days", "All tables created with relationships"],
        ["Authentication system (register/login/JWT)", "3 days", "Agent registration, login, password reset"],
        ["Admin panel setup", "2 days", "Admin login, agent approval workflow"],
        ["Landing page (public website)", "3 days", "Hero, services, offices, footer, responsive design"],
      ]
    ),
    spacer(100),

    subHeader("Phase 2: Core Booking System (Week 3-4)"),
    createTable(
      ["Task", "Duration", "Deliverables"],
      [
        ["Flight groups CRUD (admin)", "3 days", "Add/edit/delete flight groups, airlines, sectors"],
        ["Flight search & filter (agent)", "3 days", "Category tabs, airline/sector filters, search"],
        ["Booking system", "4 days", "Book seats modal, passenger details, booking creation"],
        ["Booking management", "2 days", "Booking list, status updates, countdown timer"],
        ["E-ticket generation", "2 days", "PDF ticket generation for confirmed bookings"],
      ]
    ),
    spacer(100),

    subHeader("Phase 3: Umrah & Hotel Modules (Week 5-6)"),
    createTable(
      ["Task", "Duration", "Deliverables"],
      [
        ["Hotel management (admin)", "2 days", "CRUD for hotels, room rates (sharing to quint)"],
        ["Hotel rates display (agent)", "2 days", "Makkah/Madina hotel rates with filters"],
        ["Visa & transport management", "2 days", "CRUD for visa types and transport options"],
        ["Umrah calculator", "3 days", "Dynamic package builder (visa + hotels + transport)"],
        ["Umrah packages", "3 days", "Package listing, room type pricing, booking"],
        ["Package booking management", "2 days", "Package bookings list, vouchers, print"],
      ]
    ),
    spacer(100),

    subHeader("Phase 4: Payments, Reports & Polish (Week 7-8)"),
    createTable(
      ["Task", "Duration", "Deliverables"],
      [
        ["Payment submission & verification", "3 days", "Submit payment, upload receipt, admin verification"],
        ["Ledger & accounting", "3 days", "Agent ledger, debit/credit entries, print PDF"],
        ["Bank details management", "1 day", "Admin CRUD for bank accounts"],
        ["Admin dashboard & reports", "2 days", "Stats, charts, revenue reports, booking analytics"],
        ["Testing & bug fixes", "3 days", "End-to-end testing, performance optimization"],
        ["Deployment", "2 days", "Production deployment, SSL, domain setup"],
      ]
    ),
    spacer(100),
    bodyText("Total Estimated Duration: 8 Weeks", { bold: true, color: PRIMARY }),
    bodyText("Note: Timeline is subject to change based on feedback, additional requirements, and testing results.", { italic: true, color: GRAY }),
    pageBreak(),
  ];
}

function testingStrategy() {
  return [
    ...sectionHeader("12", "Testing Strategy"),
    bodyText("Comprehensive testing approach to ensure platform reliability, security, and performance."),
    spacer(100),

    createTable(
      ["Test Type", "Scope", "Tools"],
      [
        ["Unit Testing", "Individual functions, utilities, calculations (price calc, date logic)", "Jest"],
        ["API Testing", "All REST endpoints - request/response validation, auth checks", "Postman, Supertest"],
        ["Integration Testing", "Complete booking flow, payment flow, registration flow", "Jest + Supertest"],
        ["UI Testing", "Component rendering, form validation, responsive layout", "React Testing Library"],
        ["Security Testing", "SQL injection, XSS, authentication bypass, file upload exploits", "Manual + OWASP tools"],
        ["Performance Testing", "Page load times, API response times, database query optimization", "Lighthouse, Browser DevTools"],
        ["Cross-Browser Testing", "Chrome, Firefox, Safari, Edge compatibility", "Manual testing"],
        ["Mobile Responsiveness", "All pages on mobile/tablet/desktop viewports", "Chrome DevTools, Real devices"],
        ["UAT (User Acceptance)", "Client and sample agents test all flows end-to-end", "Manual testing with feedback"],
      ]
    ),
    spacer(100),

    subHeader("Key Test Scenarios"),
    bulletPoint("Agent registers -> Admin approves -> Agent logs in with agent code"),
    bulletPoint("Agent searches flights -> Filters by airline/sector -> Books seats -> Enters passenger details"),
    bulletPoint("Booking created -> Countdown timer starts -> Payment submitted -> Admin confirms -> Ticket printed"),
    bulletPoint("Booking expires -> Auto-cancelled -> Seats released back to group"),
    bulletPoint("Agent uses Umrah calculator -> Selects visa + hotels + transport -> Price calculated -> Books package"),
    bulletPoint("Agent submits payment -> Uploads receipt -> Admin verifies -> Ledger updated -> Balance reflects"),
    bulletPoint("Concurrent booking: Two agents try to book last available seats simultaneously"),
    pageBreak(),
  ];
}

function deploymentPlan() {
  return [
    ...sectionHeader("13", "Deployment Plan"),
    bodyText("Production deployment strategy for reliable, secure, and scalable hosting."),
    spacer(100),

    subHeader("Hosting Options"),
    createTable(
      ["Component", "Option A (Budget)", "Option B (Premium)"],
      [
        ["Frontend", "Vercel (Free tier)", "AWS S3 + CloudFront"],
        ["Backend API", "Railway / Render", "AWS EC2 / DigitalOcean"],
        ["Database", "Neon / Supabase (Free tier)", "AWS RDS PostgreSQL"],
        ["File Storage", "Cloudinary (Free tier)", "AWS S3"],
        ["Domain", "Custom domain", "Custom domain"],
        ["SSL", "Free (Let's Encrypt)", "AWS Certificate Manager"],
        ["Estimated Monthly Cost", "PKR 0 - 5,000", "PKR 15,000 - 30,000"],
      ]
    ),
    spacer(100),

    subHeader("Deployment Checklist"),
    numberedPoint(1, "Purchase domain name (e.g., mirzatravel.pk)"),
    numberedPoint(2, "Setup PostgreSQL database on chosen hosting platform"),
    numberedPoint(3, "Run Prisma migrations on production database"),
    numberedPoint(4, "Configure environment variables (.env) on server"),
    numberedPoint(5, "Deploy backend API with PM2 process manager"),
    numberedPoint(6, "Build and deploy React frontend to CDN/hosting"),
    numberedPoint(7, "Configure DNS records (A record, CNAME)"),
    numberedPoint(8, "Setup SSL certificate for HTTPS"),
    numberedPoint(9, "Configure CORS, rate limiting, and security headers for production"),
    numberedPoint(10, "Create initial admin account with secure credentials"),
    numberedPoint(11, "Seed initial data (airlines, sectors, bank accounts)"),
    numberedPoint(12, "Run smoke tests on production environment"),
    numberedPoint(13, "Setup database backup schedule (daily)"),
    numberedPoint(14, "Setup monitoring and error logging"),
    pageBreak(),
  ];
}

function termsAndConditions() {
  return [
    ...sectionHeader("14", "Terms & Conditions"),
    bodyText("The following terms govern the development and delivery of this project."),
    spacer(100),

    subHeader("14.1 Project Scope"),
    bulletPoint("This document defines the complete scope of the Mirza Travel & Tourism Online Booking Platform."),
    bulletPoint("Any features or modules not explicitly mentioned in this document are considered out of scope."),
    bulletPoint("Changes to scope after approval will be evaluated for timeline and cost impact."),
    spacer(100),

    subHeader("14.2 Deliverables"),
    bulletPoint("Complete source code with documentation"),
    bulletPoint("Database schema with seed data"),
    bulletPoint("Deployment on chosen hosting platform"),
    bulletPoint("Admin panel with initial configuration"),
    bulletPoint("User guide documentation for admin and agent operations"),
    spacer(100),

    subHeader("14.3 Payment Terms"),
    bodyText("[Payment terms to be discussed and agreed upon between both parties]", { italic: true, color: GRAY }),
    spacer(100),

    subHeader("14.4 Support & Maintenance"),
    bodyText("[Support and maintenance terms to be discussed and agreed upon between both parties]", { italic: true, color: GRAY }),
    spacer(100),

    subHeader("14.5 Intellectual Property"),
    bodyText("[IP ownership terms to be discussed and agreed upon between both parties]", { italic: true, color: GRAY }),
    spacer(300),

    // Signature Section
    dividerLine(),
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "AGREEMENT & APPROVAL", font: "Calibri", size: 28, color: PRIMARY, bold: true }),
      ],
    }),
    spacer(100),

    createTable(
      ["", "Client (Mirza Travel & Tourism)", "Developer ([Your Company])"],
      [
        ["Name", "________________________", "________________________"],
        ["Designation", "________________________", "________________________"],
        ["Signature", "________________________", "________________________"],
        ["Date", "________________________", "________________________"],
      ]
    ),
    spacer(300),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "--- End of Document ---", font: "Calibri", size: 20, color: GRAY, italics: true }),
      ],
    }),
  ];
}

// ══════════════════════════════════════════════════════════════
// ── GENERATE DOCUMENT ──
// ══════════════════════════════════════════════════════════════

async function generateDocument() {
  console.log("Generating Mirza Travel & Tourism - Project Documentation...\n");

  const doc = new Document({
    creator: "Mirza Travel & Tourism",
    title: "Mirza Travel & Tourism - Online Booking Platform Documentation",
    description: "Complete SRS and Project Documentation",
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 21, color: DARK },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.9),
              right: convertInchesToTwip(0.9),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Mirza Travel & Tourism | Project Documentation", font: "Calibri", size: 16, color: GRAY, italics: true }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Confidential | ", font: "Calibri", size: 16, color: GRAY }),
                  new TextRun({ text: "Page ", font: "Calibri", size: 16, color: GRAY }),
                  new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: GRAY }),
                  new TextRun({ text: " of ", font: "Calibri", size: 16, color: GRAY }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Calibri", size: 16, color: GRAY }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...coverPage(),
          ...tableOfContents(),
          ...executiveSummary(),
          ...projectOverview(),
          ...systemArchitecture(),
          ...technologyStack(),
          ...userRoles(),
          ...moduleBreakdown(),
          ...databaseSchema(),
          ...apiEndpoints(),
          ...uiSpecifications(),
          ...securityRequirements(),
          ...developmentTimeline(),
          ...testingStrategy(),
          ...deploymentPlan(),
          ...termsAndConditions(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "mirzatravelandtourism/docs/MirzaTravel_Project_Documentation.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document generated successfully!`);
  console.log(`Output: ${outputPath}`);
  console.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

generateDocument().catch(console.error);
