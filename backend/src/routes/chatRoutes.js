module.exports = (app, limiter) => {
  const { chat, getBotConfig } = require('../controllers/chatController');
  app.post('/api/chat/:botId', limiter, chat);
  app.get('/api/chat/:botId/config', getBotConfig);
};