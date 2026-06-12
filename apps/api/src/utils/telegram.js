const https = require('https');

/**
 * Low-level: send any HTML text to Telegram using provided credentials
 */
function sendRawTelegram(token, chatId, text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' });
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path:     `/bot${token}/sendMessage`,
        method:   'POST',
        headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          const parsed = JSON.parse(data);
          if (!parsed.ok) return reject(new Error(parsed.description));
          resolve(parsed);
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Format order into a clean Telegram HTML message
 */
function formatOrderMessage(order) {
  const date = new Date(order.createdAt).toLocaleString('km-KH', {
    timeZone: 'Asia/Phnom_Penh',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const shortId      = order._id.toString().slice(-8).toUpperCase();
  const itemLines    = order.items.map(i =>
    `  • ${i.name} x${i.quantity} = <b>$${(i.price * i.quantity).toFixed(2)}</b>`
  ).join('\n');
  const paymentLabel = { cod: '💵 Cash on Delivery', card: '💳 Credit Card' }[order.paymentMethod] || order.paymentMethod;
  const { street, city, country, zip } = order.address;

  return `
🔔 <b>[ORDER ថ្មី]</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> #${shortId}
📅 <b>កាលបរិច្ឆេទ:</b> ${date}

👤 <b>អតិថិជន</b>
  ឈ្មោះ: ${order.user?.name || 'Unknown'}
  អ៊ីមែល: ${order.user?.email || 'N/A'}

📦 <b>អាសយដ្ឋានដឹកជញ្ជូន</b>
  ${street}, ${city}
  ${country} ${zip}

🛒 <b>បញ្ជីទំនិញ</b>
${itemLines}

━━━━━━━━━━━━━━━━━━━━
💰 <b>សរុប: $${order.total.toFixed(2)}</b>
${paymentLabel}
`.trim();
}

/**
 * Send new order notification — reads credentials from DB, falls back to .env
 * Never throws — order flow must not be affected
 */
async function sendTelegramNotification(order) {
  try {
    // Lazy-require to avoid circular deps at startup
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.getSingleton();

    const token  = settings.telegram.botToken  || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settings.telegram.chatId    || process.env.TELEGRAM_CHAT_ID;
    const enabled = settings.telegram.enabled;

    if (!enabled) {
      console.info('[Telegram] Notifications disabled via settings.');
      return;
    }
    if (!token || !chatId) {
      console.warn('[Telegram] Missing token or chatId. Skipping notification.');
      return;
    }

    await sendRawTelegram(token, chatId, formatOrderMessage(order));
  } catch (err) {
    // Log but never propagate — order must always succeed
    console.error('[Telegram] Notification failed:', err.message);
  }
}

module.exports = { sendTelegramNotification, sendRawTelegram };
