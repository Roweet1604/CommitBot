const Knowledge = require('../models/knowledge');
const Chatbot = require('../models/chatbot');
const { splitIntoChunks } = require('../utils/textProcessor');

// POST /api/chatbots/:id/knowledge — add a knowledge entry
const addKnowledge = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const chatbot = await Chatbot.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot not found' });
    }

    // Split content into searchable chunks automatically
    const chunks = splitIntoChunks(content);

    const knowledge = await Knowledge.create({
      chatbot: chatbot._id,
      title,
      rawContent: content,
      chunks
    });

    res.status(201).json({
      ...knowledge.toObject(),
      chunkCount: chunks.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/chatbots/:id/knowledge — get all entries
const getKnowledge = async (req, res) => {
  try {
    const chatbot = await Chatbot.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chatbot) {
      return res.status(404).json({ message: 'Chatbot not found' });
    }

    const knowledge = await Knowledge.find({ chatbot: chatbot._id })
      .select('title rawContent chunks createdAt');

    res.json(knowledge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/knowledge/:knowledgeId — update entry
const updateKnowledge = async (req, res) => {
  try {
    const { title, content } = req.body;
    const knowledge = await Knowledge.findById(req.params.knowledgeId);

    if (!knowledge) {
      return res.status(404).json({ message: 'Knowledge entry not found' });
    }

    const chatbot = await Chatbot.findOne({
      _id: knowledge.chatbot,
      user: req.user._id
    });

    if (!chatbot) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (title) knowledge.title = title;
    if (content) {
      knowledge.rawContent = content;
      knowledge.chunks = splitIntoChunks(content);
    }

    await knowledge.save();
    res.json(knowledge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/knowledge/:knowledgeId — delete entry
const deleteKnowledge = async (req, res) => {
  try {
    const knowledge = await Knowledge.findById(req.params.knowledgeId);

    if (!knowledge) {
      return res.status(404).json({ message: 'Knowledge entry not found' });
    }

    const chatbot = await Chatbot.findOne({
      _id: knowledge.chatbot,
      user: req.user._id
    });

    if (!chatbot) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await knowledge.deleteOne();
    res.json({ message: 'Knowledge entry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addKnowledge, getKnowledge, updateKnowledge, deleteKnowledge };