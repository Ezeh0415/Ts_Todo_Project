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


