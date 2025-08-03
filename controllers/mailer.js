
const nodemailer = require('nodemailer');

// Configure your email service credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: "nkululekosekwanele7@gmail.com",
    pass: "wckq xltp fxas idiq"
  }
});

const sendMail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: '"TMS Portal" <nkululekosekwanele7@gmail.com>',
    to,
    subject,
    text,
    html
  });
  return info;
};

module.exports = { sendMail };