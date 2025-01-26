// services/newsletterService.js
const Newsletter = require('../models/Newsletter');
const User = require('../models/User');
const EmailService = require('./emailService'); // Import EmailService

class NewsletterService {
  constructor() {
    this.emailService = EmailService; // Assign EmailService to instance property
  }

  async createNewsletter(newsletterData) {
    return await Newsletter.create(newsletterData);
  }

  async getNewsletterRecipients(language) {
    return await User.find({
      newsletterSubscription: true,
      language: language
    }).select('email firstName');
  }

  async sendNewsletter(newsletter) {
    const recipients = await this.getNewsletterRecipients(newsletter.language);
    const results = {
      total: recipients.length,
      successful: 0,
      failed: 0
    };

    for (const recipient of recipients) {
      try {
        await this.sendNewsletterEmail(recipient, newsletter);
        results.successful++;
      } catch (error) {
        results.failed++;
        console.error(`Failed to send newsletter to ${recipient.email}`, error);
      }
    }

    // Aggiorna lo stato e i risultati della newsletter
    newsletter.status = 'sent';
    newsletter.recipients = results;
    await newsletter.save();

    return results;
  }

  async sendNewsletterEmail(recipient, newsletter) {
    const subject = newsletter.subject;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">${newsletter.title}</h2>
        
        <p>Ciao ${recipient.firstName},</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${newsletter.content}
        </div>
        
        <p style="color: #666; font-size: 12px;">
          Per annullare l'iscrizione alla newsletter, 
          <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${recipient.email}">clicca qui</a>.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            Cordiali saluti,<br>
            Il team FastAffiliation
          </p>
        </div>
      </div>
    `;

    return this.emailService.sendEmail(recipient.email, subject, html);
  }
}

module.exports = new NewsletterService();