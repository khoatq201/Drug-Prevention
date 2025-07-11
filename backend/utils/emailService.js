const nodemailer = require("nodemailer");

// Tạo transporter cho Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Tạo mã OTP ngẫu nhiên 6 chữ số
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("🎲 Generated OTP:", otp);
  return otp;
};

// Gửi OTP để xác thực đăng ký
const sendRegistrationOTP = async (email, firstName, otp) => {
  console.log("📧 Sending registration OTP email:", { email, firstName, otp });
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.ORG_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Mã xác thực đăng ký tài khoản",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Xác thực tài khoản</h1>
        </div>
        
        <div style="padding: 40px 30px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Xin chào ${firstName}!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Cảm ơn bạn đã đăng ký tài khoản tại <strong>${process.env.ORG_NAME}</strong>. 
            Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác thực bên dưới:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #10B981; color: white; font-size: 32px; font-weight: bold; 
                        padding: 20px; border-radius: 8px; letter-spacing: 8px; display: inline-block;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Lưu ý:</strong> Mã xác thực này có hiệu lực trong <strong>10 phút</strong>. 
            Vui lòng không chia sẻ mã này với bất kỳ ai.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này.
            </p>
          </div>
        </div>
        
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            © 2025 ${process.env.ORG_NAME}. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Registration OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending registration OTP:", error);
    throw new Error("Không thể gửi mã xác thực");
  }
};

// Gửi OTP để reset password
const sendPasswordResetOTP = async (email, firstName, otp) => {
  console.log("📧 Sending password reset OTP email:", {
    email,
    firstName,
    otp,
  });
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.ORG_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Mã xác thực đặt lại mật khẩu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #DC2626, #B91C1C); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Đặt lại mật khẩu</h1>
        </div>
        
        <div style="padding: 40px 30px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Xin chào ${firstName}!</h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại 
            <strong>${process.env.ORG_NAME}</strong>. Vui lòng nhập mã xác thực bên dưới để tiếp tục:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #DC2626; color: white; font-size: 32px; font-weight: bold; 
                        padding: 20px; border-radius: 8px; letter-spacing: 8px; display: inline-block;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Lưu ý:</strong> Mã xác thực này có hiệu lực trong <strong>10 phút</strong>. 
            Vui lòng không chia sẻ mã này với bất kỳ ai.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và đảm bảo tài khoản của bạn an toàn.
            </p>
          </div>
        </div>
        
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            © 2025 ${process.env.ORG_NAME}. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending password reset OTP:", error);
    throw new Error("Không thể gửi mã xác thực");
  }
};

module.exports = {
  generateOTP,
  sendRegistrationOTP,
  sendPasswordResetOTP,
};
