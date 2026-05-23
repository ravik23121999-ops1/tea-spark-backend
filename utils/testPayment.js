/**
 * Simulated payment gateway for development/testing.
 * - Any card number except those ending in 0000 succeeds.
 * - Card ending in 0000 simulates a declined payment.
 */
function processTestPayment({ cardNumber, amount }) {
  const cleaned = String(cardNumber || '').replace(/\s/g, '');

  if (!cleaned || cleaned.length < 13) {
    return { success: false, error: 'Invalid card number (use at least 13 digits)' };
  }

  if (cleaned.endsWith('0000')) {
    return { success: false, error: 'Card declined (test gateway)' };
  }

  return {
    success: true,
    transactionId: `test_txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    message: `Test payment of $${Number(amount).toFixed(2)} approved`,
    gateway: 'tea-spark-test',
  };
}

module.exports = { processTestPayment };
