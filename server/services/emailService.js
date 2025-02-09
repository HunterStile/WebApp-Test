// services/emailService.js
const sgMail = require('@sendgrid/mail');
const path = require('path');
require('dotenv').config();

const DOMAIN_URL = process.env.DOMAIN_URL || 'https://www.talkchain.xyz/api'; // Personalizza con il tuo dominio

// Configura SendGrid con la tua API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendEmail(to, subject, html) {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'FastAffilation Team'  // Personalizza con il nome del tuo team/azienda
      },
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

  async sendRequestStatusEmail(user, request) {
    const subject = `Aggiornamento stato richiesta campagna: ${request.campaign}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Aggiornamento Stato Richiesta</h2>
      
      <p>Ciao ${user.firstName},</p>
      
      <p>Lo stato della tua richiesta per la campagna <strong>${request.campaign}</strong> è stato aggiornato.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #666;">Dettagli Aggiornamento:</h3>
        <p><strong>Stato:</strong> ${this.getStatusLabel(request.status)}</p>
        ${request.status === 'APPROVED' ? `
          <p><strong>Link Univoco:</strong> <a href="${DOMAIN_URL}${request.uniqueLink}" style="color: #007bff; text-decoration: underline;">${DOMAIN_URL}${request.uniqueLink}</a></p>
        ` : ''}
      </div>
      
      <p>Per ulteriori informazioni, accedi al tuo account sulla nostra piattaforma.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #888; font-size: 12px;">
          Cordiali saluti,<br>
          Il team FastAffiliation
        </p>
      </div>
    </div>
  `;

    return this.sendEmail(user.email, subject, html);
  }

  // Metodo helper per tradurre lo stato
  getStatusLabel(status) {
    const statusLabels = {
      'APPROVED': 'Approvata',
      'REJECTED': 'Rifiutata',
      'DEACTIVATED': 'Disattivata',
      'PENDING': 'In Attesa'
    };
    return statusLabels[status] || status;
  }

  async sendAdminThreadCreationEmail(user, thread) {
    const subject = `Nuovo messaggio dall'assistenza: ${thread.subject}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Nuovo Messaggio dell'Assistenza</h2>
        
        <p>Ciao ${user.firstName},</p>
        
        <p>Hai ricevuto un nuovo messaggio dall'assistenza di FastAffiliation.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #666;">Dettagli Messaggio:</h3>
          <p><strong>Oggetto:</strong> ${thread.subject}</p>
          <p>Accedi al tuo account per leggere il messaggio completo.</p>
        </div>
        
        <p>Se hai domande, non esitare a rispondere tramite la piattaforma.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            Cordiali saluti,<br>
            Il team FastAffiliation
          </p>
        </div>
      </div>
    `;
  
    return this.sendEmail(user.email, subject, html);
  }

  async sendContactConfirmation(email, name) {
    const subject = 'Abbiamo ricevuto il tuo messaggio';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Grazie per averci contattato, ${name}!</h2>
        
        <p>Abbiamo ricevuto il tuo messaggio e ti risponderemo il prima possibile.</p>
        
        <p>Nel frattempo, se hai altre domande, non esitare a contattarci nuovamente.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            Cordiali saluti,<br>
            Il team FastAffiliation
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendAdminNotification(contact) {
    const subject = 'Nuovo messaggio di contatto ricevuto';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Nuovo messaggio di contatto</h2>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Nome:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Messaggio:</strong><br>${contact.message}</p>
        </div>
        
        <p>Accedi al pannello admin per rispondere.</p>
      </div>
    `;

    // Invia a tutti gli admin (puoi configurare gli indirizzi in .env)
    //const adminEmails = process.env.ADMIN_EMAILS.split(',');
    //return Promise.all(adminEmails.map(email => this.sendEmail(email, subject, html)));

    // Email dell'admin impostata manualmente
    const adminEmails = ['talkchainsrl@gmail.com'];
    return Promise.all(adminEmails.map(email => this.sendEmail(email, subject, html)));
  }

  async sendResponseEmail(email, name, response) {
    const subject = 'Risposta al tuo messaggio';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Ciao ${name},</h2>
        
        <p>Abbiamo risposto al tuo messaggio:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${response}
        </div>
        
        <p>Se hai altre domande, non esitare a risponderci.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            Cordiali saluti,<br>
            Il team FastAffiliation
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();