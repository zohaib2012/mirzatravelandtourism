const prisma = require("../config/db");
const { generateVoucherId } = require("../utils/helpers");

// Agent: Submit payment
exports.submitPayment = async (req, res) => {
  try {
    const { date, description, bankAccountId, amount } = req.body;
    const receiptUrl = req.file ? req.file.path || req.file.location : null;

    let voucherId;
    let isUnique = false;
    while (!isUnique) {
      voucherId = generateVoucherId();
      const existing = await prisma.payment.findUnique({ where: { voucherId } });
      if (!existing) isUnique = true;
    }

    const payment = await prisma.payment.create({
      data: {
        voucherId,
        agentId: req.user.id,
        date: new Date(date),
        description: description ? description.toUpperCase() : null,
        bankAccountId: bankAccountId ? parseInt(bankAccountId) : null,
        amount: parseFloat(amount),
        receiptUrl,
      },
      include: { bankAccount: true },
    });

    res.status(201).json({ message: "Payment submitted successfully", payment });
  } catch (error) {
    console.error("Submit payment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Agent: Get my payments
exports.getMyPayments = async (req, res) => {
  try {
    const { dateFrom, dateTo, status, page = 1, limit = 50 } = req.query;

    const where = { agentId: req.user.id };
    if (status && status !== "all") where.status = status;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { bankAccount: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.payment.count({ where }),
    ]);

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    res.json({ payments, total, totalAmount, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const { dateFrom, dateTo, status, agentId, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status && status !== "all") where.status = status;
    if (agentId) where.agentId = parseInt(agentId);
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          agent: { select: { id: true, agencyName: true, agentCode: true } },
          bankAccount: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({ payments, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update payment status (post/unpost)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const paymentId = parseInt(req.params.id);

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const data = { status };
    if (remarks) data.remarks = remarks;

    const updated = await prisma.payment.update({ where: { id: paymentId }, data });

    // If posting, create ledger credit entry
    if (status === "POSTED" && payment.status === "UNPOSTED") {
      await prisma.ledgerEntry.create({
        data: {
          agentId: payment.agentId,
          date: payment.date,
          description: `Payment ${payment.voucherId} - ${payment.description || "Bank Transfer"}`,
          credit: payment.amount,
          paymentId: payment.id,
        },
      });
    }

    res.json({ message: `Payment ${status.toLowerCase()}`, payment: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get ledger entries
exports.getLedger = async (req, res) => {
  try {
    const { dateFrom, dateTo, page = 1, limit = 100 } = req.query;
    const agentId = req.user.role === "ADMIN" && req.query.agentId
      ? parseInt(req.query.agentId)
      : req.user.id;

    const where = { agentId };
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const entries = await prisma.ledgerEntry.findMany({
      where,
      orderBy: { date: "asc" },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    // Calculate running balance and totals
    let totalDebit = 0;
    let totalCredit = 0;
    const ledgerWithBalance = entries.map((entry) => {
      totalDebit += Number(entry.debit);
      totalCredit += Number(entry.credit);
      return { ...entry, runningBalance: totalDebit - totalCredit };
    });

    const closingBalance = totalDebit - totalCredit;

    res.json({
      entries: ledgerWithBalance,
      totalDebit,
      totalCredit,
      closingBalance,
      closingType: closingBalance >= 0 ? "Dr" : "Cr",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get bank accounts
exports.getBankAccounts = async (req, res) => {
  try {
    const accounts = await prisma.bankAccount.findMany({ where: { isActive: true } });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
