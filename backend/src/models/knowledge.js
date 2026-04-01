const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  keywords: [{ type: String }]
}, { _id: false });

const knowledgeSchema = new mongoose.Schema({
  chatbot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatbot',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  rawContent: {
    type: String,
    required: true
  },
  chunks: [chunkSchema]
}, { timestamps: true });

module.exports = mongoose.models.Knowledge || mongoose.model('Knowledge', knowledgeSchema);