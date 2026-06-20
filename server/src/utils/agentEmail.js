import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendAgentApprovalEmail = async (agentEmail, agentCode, agencyName) => {
  if (!resend) {
    console.error("[AgentEmail] Resend API key not configured");
    return { success: false, error: "Resend not configured" };
  }

  if (!agentEmail) {
    console.error("[AgentEmail] Agent email not provided");
    return { success: false, error: "Agent email not provided" };
  }

  try {
    const fromEmail = process.env.OTP_SENDER_EMAIL || "onboarding@resend.dev";
    const data = await resend.emails.send({
      from: `Mirza Travel & Tourism <${fromEmail}>`,
      to: agentEmail,
      subject: "Account Approved – Your Agent Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 520px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #1e40af; text-align: center;">Mirza Travel & Tourism</h2>
            <p style="color: #333; font-size: 16px;">Dear <strong>${agencyName}</strong>,</p>
            <p style="color: #333; font-size: 16px;">Your agent account has been <strong style="color: #16a34a;">approved</strong>. You can now login and start booking.</p>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px; color: #0369a1; font-size: 14px;">Your Agent Code:</p>
              <div style="background: #1e40af; color: white; font-size: 28px; font-weight: bold; text-align: center; padding: 12px; border-radius: 6px; letter-spacing: 3px;">
                ${agentCode}
              </div>
            </div>

            <p style="color: #333; font-size: 14px; margin: 16px 0 8px;"><strong>Login Steps:</strong></p>
            <ol style="color: #555; font-size: 14px; padding-left: 20px;">
              <li>Visit <a href="https://smirzatravel.com/login" style="color: #1e40af;">smirzatravel.com/login</a></li>
              <li>Enter your <strong>Agent Code</strong> and registered <strong>Email</strong></li>
              <li>Enter your password to login</li>
            </ol>

            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              If you did not register for this account, please ignore this email.<br>
              &copy; ${new Date().getFullYear()} Mirza Travel & Tourism. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
    console.log(`[AgentEmail] Approval email sent to ${agentEmail} (Code: ${agentCode})`);
    return { success: true, data };
  } catch (error) {
    console.error("[AgentEmail] Resend email error:", error);
    return { success: false, error };
  }
};
