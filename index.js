const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const functions = require('@google-cloud/functions-framework');
const mg = mailgun.client({ username: 'api', key: "30b334475448b8389ba1f58b6890ea4f-f68a26c9-7c751faa" });

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

connection.connect(function (err) {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

functions.cloudEvent('helloPubSub', async (cloudEvent) => {
  try {
    const base64name = cloudEvent.data.message.data;

    const name = base64name
      ? Buffer.from(base64name, 'base64').toString()
      : 'World';

    console.log(name);

    const { firstName, email, token } = JSON.parse(name);

    const activationLink = `http://adwaitchangan.me:3000/v1/user/verify?token=${token}`;

    const now = new Date();
    const verificationSentAt = now.toISOString();
    const verificationExpiryAt = new Date(now.getTime() + 2 * 60000).toISOString(); // 2 minutes after verificationSentAt

    connection.query('UPDATE Users SET verification_sent_at=?, verification_expiry_at=? WHERE username=?',
      [verificationSentAt, verificationExpiryAt, email],
      function (error, results, fields) {
        if (error) throw error;
        console.log('Verification details updated for email:', email);
      });


    const message = await mg.messages.create('adwaitchangan.me', {
      from: "<support@adwaitchangan.me>",
      to: [email],
      subject: "Account Verification - Webapp",
      text: `Hi ${firstName}, this email was sent to verify your account. Please click the following link to verify your email: ${activationLink}`,
      html: `<p>Hello ${firstName}, this email was sent to verify you account. Please click the following link to verify your email: <a href="${activationLink}">Verify Email</a></p>`
    })
      .then(msg => console.log(msg)) // logs response data
      .catch(err => console.log(err)); // logs any error
  } catch (error) {
    console.error(error);
  }
});
