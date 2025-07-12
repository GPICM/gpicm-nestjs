import {Injectable} from '@nestjs/common';
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
    private transport = nodemailer.createTransport({
        service: "gmail",
        auth: { 
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
    });

    async sendEmail({
        to, 
        subject,
        text, 
        html

    }: {
        to: string;
        subject:string;
        text?: string;
        html?: string;
    }) {

        await this.transport.sendMail({
            from: `"No-Reply" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,

        });
    }
}