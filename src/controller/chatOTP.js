import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import brevo from "../config/brevo.js";

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOTP();

        // OTP 5 minutes valid
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Existing unverified user ko update karo
        if (existingUser) {
            existingUser.name = name;
            existingUser.password = hashedPassword;

            await existingUser.save();
        } else {
            await User.create({
                name,
                email,
                password: hashedPassword,
                isVerified: false,
            });
        }

        // Purana OTP delete
        await OTP.deleteOne({ email });

        // New OTP save
        await OTP.create({
            email,
            otp,
            expiresAt,
        });

        // Brevo email
        await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                email: process.env.BREVO_EMAIL,
                name: process.env.BREVO_NAME,
            },

            to: [
                {
                    email,
                    name,
                },
            ],

            subject: "Your WhatsApp Verification OTP",

            htmlContent: `
        <div style="
          font-family: Arial;
          max-width: 500px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 15px;
        ">

          <h2>WhatsApp Clone</h2>

          <p>Hello ${name},</p>

          <p>
            Your verification OTP is:
          </p>

          <h1 style="
            letter-spacing: 8px;
            text-align: center;
          ">
            ${otp}
          </h1>

          <p>
            This OTP will expire in 5 minutes.
          </p>

          <p>
            If you did not create this account,
            please ignore this email.
          </p>

        </div>
      `,
        });

        return res.status(201).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.log("REGISTER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};