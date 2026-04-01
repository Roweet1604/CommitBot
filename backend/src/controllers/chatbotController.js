const Chatbot = require('../models/chatbot');
const Knowledge = require('../models/Knowledge');

const createChatbot = async (req, res) => {
  try {
    const { name, greetingMessage, responseMode, appearance } = req.body;

    const chatbot = await Chatbot.create({
      user: req.user._id,
      name,
      greetingMessage,
      responseMode: responseMode || 'keyword',
      appearance: {
        ...appearance,
        botDisplayName: appearance?.botDisplayName || name
      }
    });

    res.status(201).json(chatbot);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getChatbots = async (req, res) => {
  try {
    const chatbots = await Chatbot.find({ user: req.user._id });
    res.json(chatbots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot not found' });
    }

    res.json(chatbot);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateChatbot = async (req, res) => {
  try {
    const { name, greetingMessage, responseMode, appearance } = req.body;

    const updateFields = {};

    if (name) updateFields.name = name;
    if (greetingMessage) updateFields.greetingMessage = greetingMessage;
    if (responseMode) updateFields.responseMode = responseMode;
    if (appearance) {
      if (appearance.backgroundColor !== undefined) updateFields['appearance.backgroundColor'] = appearance.backgroundColor;
      if (appearance.bubbleColor !== undefined) updateFields['appearance.bubbleColor'] = appearance.bubbleColor;
      if (appearance.fontColor !== undefined) updateFields['appearance.fontColor'] = appearance.fontColor;
      if (appearance.logoUrl !== undefined) updateFields['appearance.logoUrl'] = appearance.logoUrl;
      if (appearance.avatarUrl !== undefined) updateFields['appearance.avatarUrl'] = appearance.avatarUrl;
      if (appearance.botDisplayName !== undefined) updateFields['appearance.botDisplayName'] = appearance.botDisplayName;
    }

    const chatbot = await Chatbot.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot not found' });
    }

    res.json(chatbot);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteChatbot = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot not found' });
    }

    await Knowledge.deleteMany({ chatbot: chatbot._id });
    await chatbot.deleteOne();

    res.json({ message: 'Chatbot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const saveApiKey = async (req, res) => {
  try {
    const { apiKey, provider, model } = req.body;

    if (!apiKey || !provider) {
      return res.status(400).json({ message: 'API key and provider are required' });
    }

    const chatbot = await Chatbot.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot not found' });
    }

    chatbot.setApiKey(apiKey, provider);
    if (model) chatbot.apiModel = model;
    await chatbot.save();

    res.json({
      message: 'API key saved securely',
      preview: chatbot.apiKeyPreview,
      provider: chatbot.apiKeyProvider,
      model: chatbot.apiModel
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteApiKey = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot not found' });
    }

    chatbot.removeApiKey();
    await chatbot.save();

    res.json({ message: 'API key removed permanently' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createChatbot,
  getChatbots,
  getChatbot,
  updateChatbot,
  deleteChatbot,
  saveApiKey,
  deleteApiKey
};