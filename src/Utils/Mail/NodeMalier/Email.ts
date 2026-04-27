// // service/EmailService.ts
// import nodemailer, { Transporter } from "nodemailer";
// import { Config } from "../Config";

// export interface EmailData {
//   to: string | string[];
//   subject: string;
//   text?: string;
//   html?: string;
//   from?: string;
// }

// export class EmailService {
//   private transporter: Transporter;

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       host: Config.SMTP_HOST,
//       port: Config.SMTP_PORT,
//       secure: Config.SMTP_SECURE,
//       auth: {
//         user: Config.SMTP_USER,
//         pass: Config.SMTP_PASS,
//       },
//     });
//   }

//   async sendEmail(data: EmailData): Promise<void> {
//     try {
//       const info = await this.transporter.sendMail({
//         from: data.from || Config.SMTP_FROM,
//         to: data.to,
//         subject: data.subject,
//         text: data.text,
//         html: data.html,
//       });

//       console.log(`✅ Email sent: ${info.messageId}`);
//     } catch (error) {
//       console.error("Email sending failed:", error);
//       throw new Error("Failed to send email");
//     }
//   }

//   async sendWelcomeEmail(email: string, name: string): Promise<void> {
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px;">
//         <h2>Welcome ${name}!</h2>
//         <p>Thank you for joining our platform.</p>
//         <p>We're excited to have you on board!</p>
//         <br />
//         <p>Best regards,<br />The Team</p>
//       </div>
//     `;

//     await this.sendEmail({
//       to: email,
//       subject: "Welcome to Our Platform!",
//       html,
//     });
//   }

//   async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
//     const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

//     const html = `
//       <div style="font-family: Arial, sans-serif;">
//         <h2>Password Reset Request</h2>
//         <p>Click the link below to reset your password:</p>
//         <a href="${resetLink}">Reset Password</a>
//         <p>This link expires in 1 hour.</p>
//         <p>If you didn't request this, please ignore this email.</p>
//       </div>
//     `;

//     await this.sendEmail({
//       to: email,
//       subject: "Password Reset Request",
//       html,
//     });
//   }

//   async verifyConnection(): Promise<boolean> {
//     try {
//       await this.transporter.verify();
//       console.log("✅ Email transporter ready");
//       return true;
//     } catch (error) {
//       console.error("❌ Email transporter not ready:", error);
//       return false;
//     }
//   }
// }


import nodemailer, { Transporter } from "nodemailer";
const Config = require("../../../Config/Config");

export interface EmailData {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}



let transporter: Transporter;

transporter = nodemailer.createTransport({
    host: Config.SMTP_HOST,
    port: Config.SMTP_PORT,
    secure: Config.SMTP_SECURE,
    auth: {
        user: Config.SMTP_USER,
        pass: Config.SMTP_PASS,
    },

})


const sendEmail = async (data: EmailData): Promise<void> => {
    try {
        const info = await transporter.sendMail({
            from: data.from || Config.SMTP_FROM,
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,
        });
        console.log(`✅ Email sent: ${info.messageId}`);
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Failed to send email");
    }
}

export const SendWelcomeEmail = async (
    email: string, name: string
): Promise<object> => {
    try {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f4f4f4;
        }
        .container {
            max-width: 500px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: #22c55e;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .greeting {
            font-size: 22px;
            color: #333;
            margin-bottom: 15px;
        }
        .message {
            color: #666;
            line-height: 1.6;
            margin-bottom: 25px;
        }
        .footer {
            background: #f9fafb;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome! </h1>
        </div>
        <div class="content">
            <div class="greeting">
                Hello ${name}!
            </div>
            <div class="message">
                Thanks for joining! We're excited to have you on board.
            </div>
        </div>
        <div class="footer">
            © 2024 Your Company
        </div>
    </div>
</body>
</html>
    `;
        await sendEmail({
            to: email,
            subject: "Welcome to Our Platform!",
            html,
        })

        return { message: "welcome email sent successfully" }

    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Failed to send welcome email");
    }
};

export const sendOtp = async (email: string, name: string, otp: string): Promise<object> => {
    try {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f4f4f4;
        }
        .container {
            max-width: 500px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: #3b82f6;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
            text-align: center;
        }
        .greeting {
            font-size: 22px;
            color: #333;
            margin-bottom: 15px;
        }
        .message {
            color: #666;
            line-height: 1.6;
            margin-bottom: 25px;
        }
        .otp-box {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            border: 2px dashed #3b82f6;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #3b82f6;
            letter-spacing: 8px;
            font-family: monospace;
        }
        .expiry {
            color: #ef4444;
            font-size: 14px;
            font-weight: bold;
            margin-top: 15px;
        }
        .footer {
            background: #f9fafb;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
        .note {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1> Email Verification</h1>
        </div>
        <div class="content">
            <div class="greeting">
                Hello ${name}!
            </div>
            <div class="message">
                Thank you for signing up! Please use the following OTP to verify your email address.
            </div>
            <div class="otp-box">
                <div class="otp-code">
                    ${otp}
                </div>
            </div>
            <div class="expiry">
                 This OTP is valid for 10 minutes
            </div>
            <div class="note">
                If you didn't request this, please ignore this email.
            </div>
        </div>
        <div class="footer">
            © 2024 Your Company | Secure Verification
        </div>
    </div>
</body>
</html>
`;

        await sendEmail({
            to: email,
            subject: " OTP VERIFICATION ",
            html,
        })

        return { Message: "Otp verification sent" }

    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Failed to send otp email");
    }

}