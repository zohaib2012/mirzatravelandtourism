import { useEffect } from "react";
import { format } from "date-fns";

/**
 * Umrah Package Voucher (Voucher 1)
 * Opens a new window with print-ready voucher
 */
const VoucherPrint = ({ booking, onClose }) => {
  useEffect(() => {
    const win = window.open("", "_blank", "width=900,height=750");
    if (!win) return;

    const pkg = booking.package;
    const passengers = booking.passengers || [];
    const hotels = pkg?.packageHotels || [];
    const legs = pkg?.flightLegs || booking.group?.flightLegs || [];

    const hotelsHtml = hotels.map((ph, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${ph.city}</strong></td>
        <td>${ph.hotel?.name || "-"}</td>
        <td>${ph.hotel?.starRating ? "★".repeat(ph.hotel.starRating) : "-"}</td>
        <td>${ph.nights || "-"} Nights</td>
        <td>${ph.checkinDate ? format(new Date(ph.checkinDate), "dd MMM yyyy") : "-"}</td>
        <td>${ph.checkoutDate ? format(new Date(ph.checkoutDate), "dd MMM yyyy") : "-"}</td>
      </tr>
    `).join("");

    const legsHtml = legs.map((leg, i) => `
      <tr>
        <td>${leg.flightNumber || "-"}</td>
        <td>${leg.origin || "-"} → ${leg.destination || "-"}</td>
        <td>${leg.departureDate ? format(new Date(leg.departureDate), "dd MMM yyyy") : "-"}</td>
        <td>${leg.departureTime || "-"}</td>
        <td>${leg.baggage || "25 KG"}</td>
      </tr>
    `).join("");

    const paxHtml = passengers.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.type === "ADULT" ? "MR/MRS" : p.type === "INFANT" ? "INF" : "MSTR"}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.type}</td>
        <td>${p.passportNo || "-"}</td>
      </tr>
    `).join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Umrah Voucher - ${booking.bookingNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; background: #fff; padding: 20px; }
        .voucher-header { background: linear-gradient(135deg, #0C446F 0%, #034264 100%); color: white; padding: 20px 25px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
        .voucher-title { font-size: 20px; font-weight: 900; letter-spacing: 1px; }
        .voucher-sub { font-size: 12px; opacity: 0.8; margin-top: 4px; }
        .bk-num { background: #FAAF43; color: #0C446F; padding: 10px 20px; border-radius: 6px; font-weight: 900; font-size: 16px; }
        .green-bar { background: #28a745; color: white; padding: 10px 25px; font-weight: bold; font-size: 13px; letter-spacing: 1px; }
        .section { border: 1px solid #ddd; border-top: none; padding: 15px 25px; background: white; }
        .section-title { font-size: 12px; font-weight: bold; color: white; background: #1e3c72; padding: 8px 12px; margin: 0 -25px 12px -25px; text-transform: uppercase; letter-spacing: 0.5px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #2c3e50; color: white; padding: 7px 10px; text-align: left; font-size: 11px; }
        td { padding: 6px 10px; border-bottom: 1px solid #f0f0f0; font-size: 11px; }
        tr:nth-child(even) td { background: #f8f9fa; }
        .info-row { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px; }
        .info-box { flex: 1; min-width: 150px; background: #f0f4f8; padding: 10px 14px; border-radius: 5px; border-left: 3px solid #FAAF43; }
        .info-label { font-size: 10px; color: #888; text-transform: uppercase; }
        .info-value { font-size: 13px; font-weight: bold; color: #0C446F; margin-top: 3px; }
        .price-total { background: linear-gradient(135deg, #0C446F, #1d6eed); color: white; padding: 15px 25px; text-align: right; }
        .price-total .amount { font-size: 26px; font-weight: 900; }
        .footer { background: #f8f9fa; border: 1px solid #ddd; border-top: 2px solid #FAAF43; padding: 15px 25px; border-radius: 0 0 8px 8px; text-align: center; }
        .stamp-area { border: 2px dashed #ccc; width: 150px; height: 60px; display: inline-flex; align-items: center; justify-content: center; color: #ccc; font-size: 11px; border-radius: 5px; margin-top: 10px; }
        @media print { button { display: none !important; } }
      </style>
    </head>
    <body>
    <div style="max-width: 860px; margin: 0 auto;">

      <!-- Header -->
      <div class="voucher-header">
        <div>
          <div class="voucher-title">MIRZA TRAVEL & TOURISM</div>
          <div class="voucher-sub">UMRAH PACKAGE VOUCHER</div>
        </div>
        <div class="bk-num">BK# ${booking.bookingNo}</div>
      </div>

      <div class="green-bar">✓ UMRAH PACKAGE BOOKING CONFIRMED VOUCHER</div>

      <!-- Basic Info -->
      <div class="section">
        <div class="info-row">
          <div class="info-box">
            <div class="info-label">Package Name</div>
            <div class="info-value">${pkg?.packageName || "-"}</div>
          </div>
          <div class="info-box">
            <div class="info-label">UPV #</div>
            <div class="info-value">UPV-${booking.packageId}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Departure Date</div>
            <div class="info-value">${pkg?.departureDate ? format(new Date(pkg.departureDate), "dd MMM yyyy") : "-"}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Return Date</div>
            <div class="info-value">${pkg?.returnDate ? format(new Date(pkg.returnDate), "dd MMM yyyy") : "-"}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Room Type</div>
            <div class="info-value">${booking.roomType || "-"}</div>
          </div>
          <div class="info-box">
            <div class="info-label">Agent</div>
            <div class="info-value">${booking.agent?.contactPerson || "-"} (${booking.agent?.agentCode || "-"})</div>
          </div>
        </div>
      </div>

      <!-- Flight Details -->
      ${legsHtml ? `
      <div class="section">
        <div class="section-title">✈ Flight Details</div>
        <table>
          <thead><tr><th>Flight #</th><th>Route</th><th>Date</th><th>Time</th><th>Baggage</th></tr></thead>
          <tbody>${legsHtml}</tbody>
        </table>
      </div>` : ""}

      <!-- Hotel Details -->
      ${hotelsHtml ? `
      <div class="section">
        <div class="section-title">🏨 Hotel Accommodation</div>
        <table>
          <thead><tr><th>#</th><th>City</th><th>Hotel</th><th>Stars</th><th>Duration</th><th>Check-in</th><th>Check-out</th></tr></thead>
          <tbody>${hotelsHtml}</tbody>
        </table>
      </div>` : ""}

      <!-- Passenger Details -->
      <div class="section">
        <div class="section-title">👥 Passenger Details</div>
        <table>
          <thead><tr><th>#</th><th>Title</th><th>Full Name</th><th>Type</th><th>Passport #</th></tr></thead>
          <tbody>
            ${paxHtml || '<tr><td colspan="5" style="text-align:center;color:#999">No passengers listed</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Price -->
      <div class="price-total">
        <div style="font-size:11px;opacity:0.8;text-transform:uppercase;margin-bottom:4px">Total Package Amount</div>
        <div class="amount">PKR ${Number(booking.totalPrice).toLocaleString()}</div>
        <div style="font-size:11px;opacity:0.7;margin-top:4px">${booking.totalSeats} Pax | ${booking.adultsCount} Adults ${booking.childrenCount > 0 ? `· ${booking.childrenCount} Child` : ""} ${booking.infantsCount > 0 ? `· ${booking.infantsCount} Infant` : ""}</div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="text-align:left">
            <p><strong>Mirza Travel & Tourism</strong></p>
            <p>Helpline: +92 3000381533</p>
            <p style="font-size:10px;color:#888;margin-top:4px">Printed: ${format(new Date(), "dd MMM yyyy HH:mm")}</p>
          </div>
          <div style="text-align:center">
            <div class="stamp-area">Authorized Stamp</div>
          </div>
        </div>
        <p style="font-size:10px;color:#999;margin-top:10px">This is a computer generated voucher. Services are subject to hotel and airline availability.</p>
        <button onclick="window.print()" style="margin-top:10px;padding:8px 24px;background:#0C446F;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
          🖨️ Print Voucher
        </button>
      </div>
    </div>
    </body>
    </html>
    `;

    win.document.write(html);
    win.document.close();
    win.focus();

    if (onClose) onClose();
  }, []);

  return null;
};

export default VoucherPrint;
