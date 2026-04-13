import { useEffect } from "react";
import { format } from "date-fns";

/**
 * Airline Ticket Print Layout
 * Usage: <TicketPrint booking={booking} onClose={fn} />
 * Opens a new window with print-ready ticket
 */
const TicketPrint = ({ booking, onClose }) => {
  useEffect(() => {
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;

    const group = booking.group;
    const legs = group?.flightLegs || [];
    const passengers = booking.passengers || [];
    const airline = group?.airline;

    const legsHtml = legs.map((leg, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${leg.flightNumber || "-"}</strong></td>
        <td>${leg.origin || "-"}</td>
        <td>${leg.destination || "-"}</td>
        <td>${leg.departureDate ? format(new Date(leg.departureDate), "dd MMM yyyy") : "-"}</td>
        <td>${leg.departureTime || "-"}</td>
        <td>${leg.arrivalTime || "-"}</td>
        <td>Economy</td>
        <td>${leg.baggage || "25 KG"}</td>
        <td>Included</td>
      </tr>
    `).join("");

    const paxHtml = passengers.map((p, i) => {
      const parts = p.name.split(" ");
      const surname = parts[parts.length - 1];
      const given = parts.slice(0, -1).join(" ") || parts[0];
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${p.type === "ADULT" ? "MR" : p.type === "INFANT" ? "INF" : "MSTR"}</td>
          <td><strong>${surname}</strong></td>
          <td>${given}</td>
          <td>${p.type}</td>
          <td>${p.passportNo || "-"}</td>
        </tr>
      `;
    }).join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Airline Ticket - ${booking.bookingNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; background: #fff; padding: 20px; }
        .ticket-header { background: linear-gradient(135deg, #0C446F, #034264); color: white; padding: 20px 25px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
        .ticket-header h1 { font-size: 22px; font-weight: 900; letter-spacing: 1px; }
        .ticket-header h2 { font-size: 13px; margin-top: 4px; opacity: 0.85; }
        .bk-num { background: #FAAF43; color: #0C446F; padding: 8px 18px; border-radius: 5px; font-size: 15px; font-weight: 900; }
        .section { background: #fff; border: 1px solid #ddd; border-top: none; padding: 15px 25px; }
        .section-title { font-size: 13px; font-weight: bold; color: #0C446F; border-bottom: 2px solid #FAAF43; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #1e2d3d; color: white; padding: 7px 10px; text-align: left; font-size: 11px; }
        td { padding: 6px 10px; border-bottom: 1px solid #f0f0f0; font-size: 11px; }
        tr:nth-child(even) td { background: #f8f9fa; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-weight: bold; font-size: 11px; }
        .status-confirmed { background: #d4edda; color: #155724; }
        .status-on-request { background: #fff3cd; color: #856404; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 10px; }
        .info-item { background: #f8f9fa; padding: 10px 14px; border-radius: 5px; border-left: 3px solid #FAAF43; }
        .info-label { font-size: 10px; color: #888; text-transform: uppercase; }
        .info-value { font-size: 13px; font-weight: bold; color: #0C446F; margin-top: 2px; }
        .footer { background: #f8f9fa; border: 1px solid #ddd; border-top: none; padding: 12px 25px; border-radius: 0 0 8px 8px; text-align: center; color: #888; font-size: 10px; }
        .price-box { background: linear-gradient(135deg, #0C446F, #1d6eed); color: white; padding: 12px 20px; border-radius: 6px; text-align: center; margin-top: 10px; }
        .price-box .amount { font-size: 24px; font-weight: 900; }
        @media print {
          body { padding: 0; }
          button { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div style="max-width: 860px; margin: 0 auto;">
        <!-- Header -->
        <div class="ticket-header">
          <div>
            <h1>MIRZA TRAVEL & TOURISM</h1>
            <h2>AIRLINE BOOKING TICKET</h2>
          </div>
          <div class="bk-num">BK# ${booking.bookingNo}</div>
        </div>

        <!-- Booking Info -->
        <div class="section">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Booked By</div>
              <div class="info-value">${booking.agent?.contactPerson || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Agent Code</div>
              <div class="info-value">${booking.agent?.agentCode || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Booking Date</div>
              <div class="info-value">${format(new Date(booking.createdAt), "dd MMM yyyy HH:mm")}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Airline</div>
              <div class="info-value">${airline?.name || "-"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Group ID</div>
              <div class="info-value">AG-${booking.groupId}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="status-badge ${booking.status === "CONFIRMED" ? "status-confirmed" : "status-on-request"}">
                  ${booking.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Flight Details -->
        <div class="section">
          <div class="section-title">Flight Details</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Flight #</th>
                <th>From</th>
                <th>To</th>
                <th>Dep Date</th>
                <th>Dep Time</th>
                <th>Arr Time</th>
                <th>Class</th>
                <th>Baggage</th>
                <th>Meal</th>
              </tr>
            </thead>
            <tbody>
              ${legsHtml || '<tr><td colspan="10" style="text-align:center;color:#999">No flight legs</td></tr>'}
            </tbody>
          </table>
        </div>

        <!-- Passenger Details -->
        <div class="section">
          <div class="section-title">Passenger Details</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Surname</th>
                <th>Given Name</th>
                <th>Type</th>
                <th>Passport #</th>
              </tr>
            </thead>
            <tbody>
              ${paxHtml || '<tr><td colspan="6" style="text-align:center;color:#999">No passengers</td></tr>'}
            </tbody>
          </table>
        </div>

        <!-- Price Summary -->
        <div class="section" style="display: flex; justify-content: flex-end; gap: 20px; align-items: center;">
          <div style="flex:1">
            <div class="section-title">Price Breakdown</div>
            <table style="width: 50%;">
              <tr><td>Adults (${booking.adultsCount})</td><td style="text-align:right;font-weight:bold">PKR ${Number(booking.adultPrice || 0).toLocaleString()} × ${booking.adultsCount}</td></tr>
              ${booking.childrenCount > 0 ? `<tr><td>Children (${booking.childrenCount})</td><td style="text-align:right;font-weight:bold">PKR ${Number(booking.childPrice || 0).toLocaleString()} × ${booking.childrenCount}</td></tr>` : ""}
              ${booking.infantsCount > 0 ? `<tr><td>Infants (${booking.infantsCount})</td><td style="text-align:right;font-weight:bold">PKR ${Number(booking.infantPrice || 0).toLocaleString()} × ${booking.infantsCount}</td></tr>` : ""}
            </table>
          </div>
          <div class="price-box">
            <div style="font-size:10px;opacity:0.8;text-transform:uppercase">Total Amount</div>
            <div class="amount">PKR ${Number(booking.totalPrice).toLocaleString()}</div>
            <div style="font-size:10px;opacity:0.7;margin-top:4px">${booking.totalSeats} Seat(s)</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Mirza Travel & Tourism</strong> | Helpline: +92 3000381533</p>
          <p style="margin-top:4px">This is a computer generated ticket. Valid only with authorized stamp.</p>
          <p style="margin-top:4px">Printed on: ${format(new Date(), "dd MMM yyyy HH:mm")}</p>
          <button onclick="window.print()" style="margin-top:8px; padding:8px 24px; background:#0C446F; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">
            🖨️ Print Ticket
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

export default TicketPrint;
