import {createTransport} from 'nodemailer'

// Create a transporter using SMTP
const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async({to, subject, body}:{to:string, subject: string, body: string})=>{
     const missingConfig = ["SMTP_USER", "SMTP_PASS", "SENDER_EMAIL"].filter((key) => !process.env[key]?.trim());
     if (missingConfig.length > 0) {
        throw new Error(`Missing SMTP configuration: ${missingConfig.join(", ")}`);
     }

     const respons = await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        html: body,
    })
   return respons;
}

export default sendEmail;