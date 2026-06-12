const router = require('express').Router();
const SystemSettings = require('../models/SystemSettings');
const { protect, adminOnly } = require('../middleware/auth');
const { sendRawTelegram } = require('../utils/telegram');

// GET /api/settings/telegram — Admin: get current Telegram config
router.get('/telegram', protect, adminOnly, async (req, res) => {
  try {
    const settings = await SystemSettings.getSingleton();
    // Mask token for security — only expose last 6 chars
    const token = settings.telegram.botToken;
    const maskedToken = token
      ? `${'*'.repeat(Math.max(0, token.length - 6))}${token.slice(-6)}`
      : '';
    res.json({
      botToken: maskedToken,
      chatId:   settings.telegram.chatId,
      enabled:  settings.telegram.enabled,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/settings/telegram — Admin: update Telegram config
router.post('/telegram', protect, adminOnly, async (req, res) => {
  try {
    const { botToken, chatId, enabled } = req.body;
    const settings = await SystemSettings.getSingleton();

    // Only update token if a real value (not masked) is provided
    if (botToken && !botToken.startsWith('***')) {
      settings.telegram.botToken = botToken.trim();
    }
    if (chatId !== undefined)  settings.telegram.chatId   = chatId.trim();
    if (enabled !== undefined) settings.telegram.enabled  = Boolean(enabled);

    await settings.save();
    res.json({ message: 'Settings saved', enabled: settings.telegram.enabled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/settings/telegram/test — Admin: send a test message
router.post('/telegram/test', protect, adminOnly, async (req, res) => {
  try {
    const settings = await SystemSettings.getSingleton();
    const { botToken, chatId } = settings.telegram;

    if (!botToken || !chatId) {
      return res.status(400).json({ message: 'Bot Token and Chat ID are required before testing.' });
    }

    await sendRawTelegram(botToken, chatId, '👋 <b>Hello Admin!</b>\n\n✅ Bot is working correctly!\n🛍 Your E-commerce notifications are active.');
    res.json({ message: 'Test message sent successfully!' });
  } catch (err) {
    res.status(500).json({ message: `Failed to send: ${err.message}` });
  }
});

module.exports = router;
