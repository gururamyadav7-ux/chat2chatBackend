const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,

        to: email,

        subject: "Your Registration OTP",

        html: `
      <div style="
        font-family: Arial;
        max-width: 500px;
        margin: auto;
        padding: 30px;
        border: 1px solid #ddd;
        border-radius: 15px;
      ">

        <h2 style="text-align:center;">
          WhatsApp Clone
        </h2>

        <p>Your registration OTP is:</p>

        <h1 style="
          text-align:center;
          letter-spacing: 8px;
        ">
          ${otp}
        </h1>

        <p>
          This OTP will expire in 5 minutes.
        </p>

        <p>
          If you did not request this OTP, ignore this email.
        </p>

      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;