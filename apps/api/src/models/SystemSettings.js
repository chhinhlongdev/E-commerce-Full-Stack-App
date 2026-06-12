const { Schema, model } = require('mongoose');

// Singleton document — always _id: 'system'
const systemSettingsSchema = new Schema({
  _id: { type: String, default: 'system' },
  telegram: {
    botToken:    { type: String, default: '' },
    chatId:      { type: String, default: '' },
    enabled:     { type: Boolean, default: true },
  },
}, { timestamps: true });

// Static helper: get (or auto-create) the singleton
systemSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findById('system');
  if (!doc) {
    doc = await this.create({
      _id: 'system',
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        chatId:   process.env.TELEGRAM_CHAT_ID   || '',
        enabled:  true,
      },
    });
  }
  return doc;
};

module.exports = model('SystemSettings', systemSettingsSchema);
