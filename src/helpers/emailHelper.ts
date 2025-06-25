import nodemailer from 'nodemailer';
import { ISendEmail } from '../types/email';

const EMAIL_HEADER_NAME = "Example Email";
const EMAIL_FROM = "allendodul6@gmail.com";
const EMAIL_USER = "allendodul6@gmail.com";
const EMAIL_PASS = "gkbq saom tmxp loll";
const EMAIL_HOST = "smtp.gmail.com";
const EMAIL_PORT = 587;

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    }
})

const sendEmail = async (values: ISendEmail) => {
    try{
         const info = await transporter.sendMail({
            from: `${EMAIL_HEADER_NAME} ${EMAIL_FROM}`,
            to: values.to,
            subject: values.subject,
            html: values.html,
        })

        console.log("Mail send succesfully.");
    }catch(error){
        console.log("Email Error: ", error);
    }
}

export const emailHelper = {
    sendEmail
}