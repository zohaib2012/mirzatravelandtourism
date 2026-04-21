import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendOTPEmail = async (otp) => {
  if (!resend) {
    console.error("Resend API key not configured");
    return { success: false, error: "Resend not configured" };
  }

  if (!process.env.OTP_RECEIVER_EMAIL) {
    console.error("OTP receiver email not configured");
    return { success: false, error: "OTP receiver not configured" };
  }

  try {
    const fromEmail = process.env.OTP_SENDER_EMAIL || "onboarding@resend.dev";
    const data = await resend.emails.send({
      from: `Mirza Travel <${fromEmail}>`,
      to: process.env.OTP_RECEIVER_EMAIL,
      subject: "Your Admin Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #1e40af; text-align: center;">Mirza Travel Admin</h2>
            <p style="color: #333; font-size: 16px;">Your One-Time Password (OTP) for admin login is:</p>
            <div style="background: #1e40af; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 14px;">This OTP will expire in 5 minutes.</p>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              If you did not request this OTP, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend email error:", error);
    return { success: false, error };
  }
};
