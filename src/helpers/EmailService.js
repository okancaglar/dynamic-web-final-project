const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send a confirmation email for a ticket.
 * @param {string} toEmail
 * @param {Object} ticket
 */
async function sendTicketConfirmation(toEmail, ticket) {
    const { passenger_name, ticket_id, flight_id, seat_number } = ticket;
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: `Your Ticket #${ticket_id} Confirmation`,
        text: `Hello ${passenger_name},

Your ticket (#${ticket_id}) for flight ${flight_id} is confirmed.
Seat: ${seat_number || 'Unassigned'}

Thank you for booking with us.`,
        html: `<p>Hello ${passenger_name},</p>
<ul>
  <li><strong>Ticket ID:</strong> ${ticket_id}</li>
  <li><strong>Flight ID:</strong> ${flight_id}</li>
  <li><strong>Seat:</strong> ${seat_number || 'Unassigned'}</li>
</ul>
<p>Thank you for booking with us.</p>`
    });
}

module.exports = { sendTicketConfirmation };