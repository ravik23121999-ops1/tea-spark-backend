const sendEmail = require('./sendEmail');

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Being Prepared',
  ready: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_MESSAGES = {
  pending: 'Your order has been received and is pending confirmation.',
  confirmed: 'Your order is confirmed! We will start preparing it soon.',
  preparing: 'Good news! Our team is now preparing your order.',
  ready: 'Your order is ready! You can pick it up or expect delivery shortly.',
  completed: 'Your order has been completed. Thank you for choosing Tea Spark!',
  cancelled: 'Your order has been cancelled. If you have questions, please contact us.',
};

function buildOrderStatusEmail(order, newStatus) {
  const customerName = order.customer?.name || 'Customer';
  const label = STATUS_LABELS[newStatus] || newStatus;
  const bodyMessage = STATUS_MESSAGES[newStatus] || `Your order status is now: ${label}.`;

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">${item.teaName} × ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">$${item.lineTotal.toFixed(2)}</td></tr>`
    )
    .join('');

  const itemsText = order.items
    .map((item) => `  • ${item.teaName} × ${item.quantity} — $${item.lineTotal.toFixed(2)}`)
    .join('\n');

  const subject = `Tea Spark — Order ${order.orderNumber} is now ${label}`;

  const text = `Hi ${customerName},

${bodyMessage}

Order: ${order.orderNumber}
Status: ${label}
Payment: ${order.paymentStatus}

Items:
${itemsText}

Total: $${order.total.toFixed(2)}

Thank you for ordering with Tea Spark!`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
      <h2 style="color:#7c3aed;">Tea Spark</h2>
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>${bodyMessage}</p>
      <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px;"><strong>Order:</strong> ${order.orderNumber}</p>
        <p style="margin:0 0 8px;"><strong>Status:</strong> ${label}</p>
        <p style="margin:0;"><strong>Payment:</strong> ${order.paymentStatus}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
        <tr>
          <td style="padding:12px 0;font-weight:bold;">Total</td>
          <td style="padding:12px 0;font-weight:bold;text-align:right;color:#7c3aed;">$${order.total.toFixed(2)}</td>
        </tr>
      </table>
      <p style="margin-top:24px;color:#64748b;font-size:14px;">Thank you for choosing Tea Spark!</p>
    </div>
  `;

  return { subject, text, html };
}

async function sendOrderStatusEmail(order, previousStatus, newStatus) {
  const email = order.customer?.email?.trim();
  if (!email) {
    return { sent: false, reason: 'no_customer_email' };
  }
  if (previousStatus === newStatus) {
    return { sent: false, reason: 'status_unchanged' };
  }

  const { subject, text, html } = buildOrderStatusEmail(order, newStatus);
  const result = await sendEmail(email, subject, text, html);

  if (result.success) {
    return { sent: true, to: email };
  }
  return { sent: false, reason: 'send_failed', error: result.error };
}

module.exports = { sendOrderStatusEmail, STATUS_LABELS };
