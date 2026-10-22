module.exports = (app, limiter) => {
  const { chat, getBotConfig } = require('../controllers/chatController');
  const { validateId } = require('../middleware/validateId');
  app.param('botId', validateId);
  app.post('/api/chat/:botId', limiter, chat);
  app.get('/api/chat/:botId/config', getBotConfig);
};