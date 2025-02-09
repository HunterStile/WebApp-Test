// controllers/contactController.js
const Contact = require('../models/Contact');
const emailService = require('../services/emailService');

class ContactController {
  async submitContact(req, res) {
    try {
      const { name, email, message } = req.body;
      
      // Salva il messaggio nel database
      const contact = await Contact.create({
        name,
        email,
        message
      });

      // Invia email di conferma al cliente
      await emailService.sendContactConfirmation(email, name);
      
      // Invia notifica agli admin
      await emailService.sendAdminNotification(contact);

      res.status(200).json({ success: true, contactId: contact._id });
    } catch (error) {
      console.error('Error in contact submission:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async respondToContact(req, res) {
    try {
      const { contactId, response } = req.body;
      
      const contact = await Contact.findById(contactId);
      if (!contact) {
        return res.status(404).json({ success: false, error: 'Contact not found' });
      }

      // Aggiungi la risposta
      contact.responses.push({ message: response });
      contact.status = 'inProgress';
      await contact.save();

      // Invia la risposta via email
      await emailService.sendResponseEmail(contact.email, contact.name, response);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error in contact response:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

module.exports = new ContactController();