import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'dummy@ethereal.email',
        pass: 'dummy-password',
      },
    });
  }

  async sendOrderStatusEmail(to: string, orderId: string, status: string) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Eyewear Store" <adityafieansyah@gmail.com>',
        to,
        subject: `Order Status Update: ${status}`,
        text: `Your order ${orderId} status has been updated to ${status}.`,
        html: `<b>Your order ${orderId} status has been updated to ${status}.</b>`,
      });
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // We don't throw the error so that the main process (like order status update) can continue
    }
  }
}
