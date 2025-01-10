// services/emailService.js
const sgMail = require('@sendgrid/mail');
const path = require('path');
require('dotenv').config();

// Configura SendGrid con la tua API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendEmail(to, subject, html) {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL, // email verificato in SendGrid
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email inviata con successo a ${to}`);
      return true;
    } catch (error) {
      console.error('Errore nell\'invio dell\'email:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Benvenuto nella nostra piattaforma!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Benvenuto ${user.firstName}! 👋</h2>
        
        <p>Siamo felici di averti con noi! Il tuo account è stato creato con successo.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #666;">I tuoi dati di accesso:</h3>
          <p><strong>Username:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
        </div>
        
        <p>Puoi accedere alla piattaforma utilizzando il tuo username e la password che hai scelto durante la registrazione.</p>
        
        <p style="color: #666; font-size: 14px;">Se hai domande o bisogno di assistenza, non esitare a contattarci.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            Cordiali saluti,<br>
            Il team
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();