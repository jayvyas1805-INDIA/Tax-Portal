import EmailSmsTemplate from "../models/EmailSmsTemplate.js";
import { renderTemplate } from "./renderTemplate.js";
import { sendMail } from "./mailer.js";

export const sendEmailFromTemplate = async (key, to, vars = {}) => {
  try {
    const tpl = await EmailSmsTemplate.findOne({ key, channel: "email", isActive: true });
    if (!tpl) return;

    await sendMail({
      to,
      subject: renderTemplate(tpl.subject, vars),
      html: renderTemplate(tpl.body, vars),
    });
  } catch (error) {
    console.error(`sendEmailFromTemplate (${key}) error ->`, error);
  }
};

export const sendSmsFromTemplate = async (key, to, vars = {}) => {
  try {
    const tpl = await EmailSmsTemplate.findOne({ key, channel: "sms", isActive: true });
    if (!tpl || !to) return;

    const message = renderTemplate(tpl.body, vars);

    // TODO: plug in your SMS provider here (Twilio / MSG91 / etc.)
    // await smsProvider.send({ to, message });
    console.log(`[SMS stub] to=${to} message="${message}"`);
  } catch (error) {
    console.error(`sendSmsFromTemplate (${key}) error ->`, error);
  }
};