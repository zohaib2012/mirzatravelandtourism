import { useEffect } from "react";
import { format } from "date-fns";

/**
 * Voucher 2 - Simplified agent copy (condensed format)
 */
const Voucher2Print = ({ booking, onClose }) => {
  useEffect(() => {
    const win = window.open("", "_blank", "width=800,height=650");
    if (!win) return;

    const pkg = booking.package;
    const passengers = booking.passengers || [];
    const hotels = pkg?.packageHotels || [];

    const makkahHotel = hotels.find(h => h.city === "MAKKAH");
    const madinaHotel = hotels.find(h => h.city === "MADINA");

    const paxHtml = passengers.map((p, i) => `
      <tr>
        <td style="padding:5px 8px;border:1px solid #ddd;">${i + 1}</td>
        <td style="padding:5px 8px;border:1px solid #ddd;"><strong>${p.name}</strong></td>
        <td style="padding:5px 8px;border:1px solid #ddd;">${p.type}</td>
        <td style="padding:5px 8px;border:1px solid #ddd;">${p.passportNo || "-"}</td>
      </tr>
    `).join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Voucher 2 - ${booking.bookingNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #000; padding: 15px; }
        .header { background: #0C446F; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 6px 6px 0 0; }
        .header h1 { font-size: 18px; font-weight: 900; }
        .header .bk { background: #FAAF43; color: #0C446F; padding: 6px 15px; border-radius: 4px; font-weight: 900; font-size: 14px; }
        .yellow-bar { background: #FAAF43; color: #0C446F; padding: 7px 20px; font-weight: bold; font-size: 13px; border-left: 5px solid #0C446F; }
        .body { border: 1px solid #0C446F; border-top: none; padding: 15px 20px; border-radius: 0 0 6px 6px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .field { margin-bottom: 8px; }
        .field-label { font-size: 10px; color: #666; text-transform: uppercase; font-weight: bold; }
        .field-value { font-size: 13px; font-weight: bold; color: #0C446F; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
        .section-head { background: #034264; color: white; padding: 5px 10px; font-size: 11px; font-weight: bold; margin: 12px 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #1e3c72; color: white; padding: 6px 8px; text-align: left; }
        td { padding: 5px 8px; border: 1px solid #ddd; }
        .total-row { background: #0C446F; color: white; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; border-radius: 5px; margin-top: 15px; }
        .total-label { font-size: 11px; opacity: 0.8; }
        .total-amount { font-size: 22px; font-weight: 900; }
        .notes { margin-top: 12px; font-size: 10px; color: #666; border-top: 1px dashed #ccc; padding-top: 10px; }
        @media print { button { display: none !important; } }
      </style>
    </head>
    <body>
    <div style="max-width:760px;margin:0 auto;">

      <div class="header">
        <div>
          <h1>MIRZA TRAVEL & TOURISM</h1>
          <div style="font-size:11px;opacity:0.8;margin-top:3px">UMRAH PACKAGE — AGENT COPY (VOUCHER 2)</div>
        </div>
        <div class="bk">BK# ${booking.bookingNo}</div>
      </div>

      <div class="yellow-bar">📋 PACKAGE DETAILS — ${pkg?.packageName || "UMRAH PACKAGE"}</div>

      <div class="body">

        <div class="two-col">
          <div>
            <div class="field">
              <div class="field-label">Agent Name</div>
              <div class="field-value">${booking.agent?.contactPerson || "-"}</div>
            </div>
            <div class="field">
              <div class="field-label">Agent Code</div>
              <div class="field-value">${booking.agent?.agentCode || "-"}</div>
            </div>
            <div class="field">
              <div class="field-label">Booking Date</div>
              <div class="field-value">${format(new Date(booking.createdAt), "dd MMM yyyy")}</div>
            </div>
          </div>
          <div>
            <div class="field">
              <div class="field-label">UPV #</div>
              <div class="field-value">UPV-${booking.packageId}</div>
            </div>
            <div class="field">
              <div class="field-label">Departure</div>
              <div class="field-value">${pkg?.departureDate ? format(new Date(pkg.departureDate), "dd MMM yyyy") : "-"}</div>
            </div>
            <div class="field">
              <div class="field-label">Return</div>
              <div class="field-value">${pkg?.returnDate ? format(new Date(pkg.returnDate), "dd MMM yyyy") : "-"}</div>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div>
            <div class="field">
              <div class="field-label">Room Type</div>
              <div class="field-value">${booking.roomType || "-"}</div>
            </div>
          </div>
          <div>
            <div class="field">
              <div class="field-label">Total Passengers</div>
              <div class="field-value">${booking.totalSeats} Pax (${booking.adultsCount}A ${booking.childrenCount > 0 ? `${booking.childrenCount}C` : ""} ${booking.infantsCount > 0 ? `${booking.infantsCount}I` : ""})</div>
            </div>
          </div>
        </div>

        <!-- Hotels -->
        ${(makkahHotel || madinaHotel) ? `
        <div class="section-head">🕌 Hotel Accommodation</div>
        <table>
          <thead><tr><th>City</th><th>Hotel</th><th>Stars</th><th>Nights</th><th>Check-in</th><th>Check-out</th></tr></thead>
          <tbody>
            ${makkahHotel ? `<tr>
              <td><strong>MAKKAH</strong></td>
              <td>${makkahHotel.hotel?.name || "-"}</td>
              <td>${makkahHotel.hotel?.starRating ? "★".repeat(makkahHotel.hotel.starRating) : "-"}</td>
              <td>${makkahHotel.nights} Nights</td>
              <td>${makkahHotel.checkinDate ? format(new Date(makkahHotel.checkinDate), "dd MMM yyyy") : "-"}</td>
              <td>${makkahHotel.checkoutDate ? format(new Date(makkahHotel.checkoutDate), "dd MMM yyyy") : "-"}</td>
            </tr>` : ""}
            ${madinaHotel ? `<tr>
              <td><strong>MADINA</strong></td>
              <td>${madinaHotel.hotel?.name || "-"}</td>
              <td>${madinaHotel.hotel?.starRating ? "★".repeat(madinaHotel.hotel.starRating) : "-"}</td>
              <td>${madinaHotel.nights} Nights</td>
              <td>${madinaHotel.checkinDate ? format(new Date(madinaHotel.checkinDate), "dd MMM yyyy") : "-"}</td>
              <td>${madinaHotel.checkoutDate ? format(new Date(madinaHotel.checkoutDate), "dd MMM yyyy") : "-"}</td>
            </tr>` : ""}
          </tbody>
        </table>` : ""}

        <!-- Passengers -->
        <div class="section-head">👤 Passengers List</div>
        <table>
          <thead><tr><th>#</th><th>Full Name</th><th>Type</th><th>Passport #</th></tr></thead>
          <tbody>
            ${paxHtml || '<tr><td colspan="4" style="text-align:center;color:#999">No passengers</td></tr>'}
          </tbody>
        </table>

        <!-- Total -->
        <div class="total-row">
          <div>
            <div class="total-label">TOTAL PACKAGE COST</div>
          </div>
          <div style="text-align:right">
            <div class="total-amount">PKR ${Number(booking.totalPrice).toLocaleString()}</div>
          </div>
        </div>

        <div class="notes">
          <p>• This is Voucher 2 (Agent Copy) — Please retain for your records.</p>
          <p>• Services are subject to hotel and airline availability.</p>
          <p>• Mirza Travel & Tourism | Tel: +92 3000381533 | Printed: ${format(new Date(), "dd MMM yyyy HH:mm")}</p>
        </div>

        <div style="text-align:center;margin-top:12px;">
          <button onclick="window.print()" style="padding:8px 24px;background:#0C446F;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">
            🖨️ Print Voucher 2
          </button>
        </div>

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

export default Voucher2Print;
