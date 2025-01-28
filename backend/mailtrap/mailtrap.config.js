const { MailtrapClient } = require("mailtrap");
require("dotenv").config()


const mailtrapClient = new MailtrapClient({
    endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "hello@demomailtrap.com",
  name: "Hello Francis",
};
// const recipients = [
//   {
//     email: "francisegbuleze@gmail.com",
//   }
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);


module.exports = {mailtrapClient, sender}