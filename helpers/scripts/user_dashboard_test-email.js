const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'magneventsdotin@gmail.com',
    pass: 'ooio cdhg oxml bumq',
  },
});

const mailOptions = {
  from: 'magneventsdotin@gmail.com',
  to: 'magneventsdotin@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log("Error sending email:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
