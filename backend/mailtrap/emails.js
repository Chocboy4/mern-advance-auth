const { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } = require('./emailTemplate');
const { mailtrapClient, sender } = require('./mailtrap.config');


const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject : "Verify Your Email",
            html : VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category : "Email Verification"
        })

        console.log("Email sent successfully", response);
        
    } catch (error) {
        console.error(`error sending verification`, error)
        throw new Error(`Error sending verification email: ${error}`)
    }
}

const sendWelcomeEmail = async (email, name) => {
    const recipient = [{email}]
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "23931128-3d62-4661-8a45-310211d3d302",
            template_variables : {
                "company_info_name": "Francis Tech",
                "name" : name
              }
        })

        console.log("welcome Email sent successfully", response);
    } catch (error) {
        console.error("Error sending welcome email", error)
    }
}

const sendPasswordResetEmail = async (email, resetUrl) => {
    const recipient = [ {email} ]

    try {
        const response = await mailtrapClient.send({
            from : sender,
            to: recipient,
            subject: "Reset your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
            category: "Passwordf Reset"
        })
    } catch (error) {
        console.error("Error sending password reset email", error)

        throw new Error(`Error sending password reset email: ${error}`)
    }
}

const sendResetSuccessEmail = async (email) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        })

        console.log("Passworemail sent successfully", response);
    } catch (error) {
        console.error('Error sending password reset succese email', error)

        throw new Error(`Error sending password reset success email: ${error}`)
    }
}

exports.sendVerificationEmail = sendVerificationEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail
exports.sendResetSuccessEmail = sendResetSuccessEmail