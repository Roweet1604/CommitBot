const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addKnowledge,
  getKnowledge,
  updateKnowledge,
  deleteKnowledge
} = require('../controllers/knowledgeController');
const { validateId } = require('../middleware/validateId');

router.param('id', validateId);
router.param('knowledgeId', validateId);

router.post('/chatbots/:id/knowledge', protect, addKnowledge);
router.get('/chatbots/:id/knowledge', protect, getKnowledge);
router.put('/knowledge/:knowledgeId', protect, updateKnowledge);
router.delete('/knowledge/:knowledgeId', protect, deleteKnowledge);

module.exports = router;