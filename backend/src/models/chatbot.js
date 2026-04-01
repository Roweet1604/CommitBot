const mongoose = require('mongoose');
const crypto = require('crypto');

const IV_LENGTH = 16;

const encrypt = (text) => {
  const key = process.env.ENCRYPTION_KEY;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
  const key = process.env.ENCRYPTION_KEY;
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    iv
  );
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
};

const chatbotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  greetingMessage: {
    type: String,
    default: 'Hi! How can I help you today?'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  responseMode: {
    type: String,
    enum: ['keyword', 'ai'],
    default: 'keyword'
  },
  encryptedApiKey: {
    type: String,
    default: null
  },
  apiKeyProvider: {
  type: String,
  enum: ['anthropic', 'openai', 'google', 'groq', 'mistral', 'other', null],
  default: null
  },
  apiModel: {
    type: String,
    default: null
  },
  apiKeyPreview: {
    type: String,
    default: null
  },
  appearance: {
    backgroundColor: { type: String, default: '#ffffff' },
    bubbleColor:     { type: String, default: '#6C63FF' },
    fontColor:       { type: String, default: '#111111' },
    logoUrl:         { type: String, default: null },
    avatarUrl:       { type: String, default: null },
    botDisplayName:  { type: String, default: 'Assistant' }
  },
  totalConversations: { type: Number, default: 0 },
  totalMessages:      { type: Number, default: 0 }

}, { timestamps: true });

chatbotSchema.methods.setApiKey = function(plainKey, provider) {
  this.encryptedApiKey = encrypt(plainKey);
  this.apiKeyProvider = provider;
  this.apiKeyPreview = '...' + plainKey.slice(-4);
};

chatbotSchema.methods.getApiKey = function() {
  if (!this.encryptedApiKey) return null;
  return decrypt(this.encryptedApiKey);
};

chatbotSchema.methods.removeApiKey = function() {
  this.encryptedApiKey = null;
  this.apiKeyProvider = null;
  this.apiKeyPreview = null;
};

chatbotSchema.statics.updateDisplayName = async function(botId, displayName) {
  return await this.findByIdAndUpdate(
    botId,
    { $set: { 'appearance.botDisplayName': displayName } },
    { new: true }
  );
};

module.exports = mongoose.models.Chatbot || mongoose.model('Chatbot', chatbotSchema);