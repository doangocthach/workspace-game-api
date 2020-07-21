const nodemailer = require("nodemailer");

module.exports = sendMail = (receiver, token, protocol, host) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "thachdn.nde18048@vtc.edu.vn", // generated ethereal user
      pass: "01213309289A", // generated ethereal password
    },
  });
  // send mail with defined transport object
  transporter.sendMail({
    from: "Workspace game", // sender address
    to: receiver, // list of receivers
    subject: "Workspace game active your account", // Subject line
    text: "Active your account", // plain text body
    html: `Click here to active your account <a href="${protocol}://${host}/verify/${token}">Active</a>`, // html body
  });
};
