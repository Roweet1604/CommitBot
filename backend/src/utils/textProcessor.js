const STOP_WORDS = new Set([
  'what', 'when', 'how', 'why', 'where', 'is', 'are', 'the', 'a', 'an',
  'do', 'you', 'i', 'your', 'my', 'we', 'our', 'us', 'it', 'its',
  'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'this', 'that', 'these', 'those', 'can', 'will', 'would', 'could',
  'should', 'have', 'has', 'had', 'been', 'be', 'was', 'were', 'did',
  'does', 'not', 'no', 'yes', 'from', 'by', 'about', 'which', 'who',
  'tell', 'me', 'please', 'need', 'want', 'get', 'give', 'know', 'any',
  'also', 'just', 'like', 'up', 'so', 'then', 'than', 'too', 'very',
  'hey', 'hi', 'hello', 'thanks', 'thank', 'okay', 'ok', 'sure', 'yes'
]);

// Synonym map — common words that mean the same thing
const SYNONYMS = {
  // Time / hours
  'hours':    ['time', 'open', 'close', 'schedule', 'timing', 'available', 'availability', 'when'],
  'time':     ['hours', 'open', 'close', 'schedule', 'timing', 'when'],
  'open':     ['hours', 'time', 'available', 'timing', 'schedule', 'opening', 'operational'],
  'close':    ['hours', 'time', 'closing', 'shut', 'end'],
  'schedule': ['hours', 'time', 'timing', 'open', 'available'],
  'timing':   ['hours', 'time', 'schedule', 'open'],
  'weekend':  ['saturday', 'sunday', 'sundays', 'saturdays'],
  'saturday': ['weekend', 'weekends'],
  'sunday':   ['weekend', 'weekends'],

  // Shipping / delivery
  'shipping': ['delivery', 'deliver', 'ship', 'courier', 'dispatch', 'send', 'postage', 'freight'],
  'delivery': ['shipping', 'deliver', 'ship', 'courier', 'dispatch', 'send'],
  'deliver':  ['shipping', 'delivery', 'ship', 'send', 'dispatch'],
  'ship':     ['shipping', 'delivery', 'deliver', 'send', 'dispatch'],
  'free':     ['no cost', 'complimentary', 'waived', 'zero'],
  'cost':     ['price', 'fee', 'charge', 'rate', 'amount', 'pay', 'much'],
  'price':    ['cost', 'fee', 'charge', 'rate', 'amount', 'pay', 'much', 'expensive'],

  // Returns / refunds
  'return':   ['refund', 'exchange', 'send back', 'bring back', 'replace', 'money back'],
  'refund':   ['return', 'money back', 'reimburse', 'exchange', 'cancel'],
  'exchange': ['return', 'replace', 'swap', 'refund'],

  // Support / contact
  'contact':  ['support', 'help', 'reach', 'email', 'call', 'phone', 'talk', 'connect'],
  'support':  ['contact', 'help', 'reach', 'email', 'call', 'phone', 'talk', 'assist'],
  'help':     ['support', 'contact', 'assist', 'service'],
  'email':    ['contact', 'support', 'reach', 'mail', 'message'],

  // Location
  'location': ['address', 'place', 'where', 'find', 'located', 'situated', 'store', 'shop'],
  'address':  ['location', 'place', 'where', 'find', 'located'],
  'where':    ['location', 'address', 'place', 'find', 'located'],

  // Payment
  'pay':      ['payment', 'paying', 'paid', 'purchase', 'buy', 'checkout'],
  'payment':  ['pay', 'paying', 'purchase', 'buy', 'checkout', 'transaction'],
  'buy':      ['purchase', 'order', 'pay', 'shop', 'get'],
  'purchase': ['buy', 'order', 'pay', 'shop', 'get'],

  // General
  'much':     ['cost', 'price', 'fee', 'charge', 'rate'],
  'fast':     ['quick', 'speed', 'express', 'rapid', 'soon', 'long'],
  'long':     ['time', 'duration', 'fast', 'quick', 'soon', 'days', 'weeks'],
};

// Stem a word to its root
const stem = (word) => {
  if (word.length <= 4) return word;
  return word
    .replace(/ing$/, '')
    .replace(/tion$/, '')
    .replace(/tions$/, '')
    .replace(/tion$/, '')
    .replace(/sion$/, '')
    .replace(/ness$/, '')
    .replace(/ment$/, '')
    .replace(/able$/, '')
    .replace(/ible$/, '')
    .replace(/ful$/, '')
    .replace(/less$/, '')
    .replace(/ous$/, '')
    .replace(/ive$/, '')
    .replace(/ies$/, 'y')
    .replace(/ied$/, 'y')
    .replace(/ed$/, '')
    .replace(/ly$/, '')
    .replace(/er$/, '')
    .replace(/est$/, '')
    .replace(/s$/, '');
};

// Expand a word with its synonyms
const expandWithSynonyms = (word) => {
  const stemmed = stem(word);
  const synonyms = SYNONYMS[word] || SYNONYMS[stemmed] || [];
  return [word, stemmed, ...synonyms.map(s => stem(s))];
};

// Extract keywords from text
const extractKeywords = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
};

// Split text into sentence chunks
const splitIntoChunks = (text) => {
  return text
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .map(sentence => ({
      text: sentence,
      keywords: extractKeywords(sentence)
    }));
};

// Score how well a chunk matches the query
const scoreChunk = (chunk, queryWords) => {
  let score = 0;
  const chunkKeywords = chunk.keywords;

  for (const qWord of queryWords) {
    const qExpanded = expandWithSynonyms(qWord);

    for (const cWord of chunkKeywords) {
      const cExpanded = expandWithSynonyms(cWord);

      // Check all combinations of expanded words
      for (const qVariant of qExpanded) {
        for (const cVariant of cExpanded) {
          if (qVariant === cVariant && qVariant.length > 2) {
            score += 3; // exact match after stemming/synonyms
            break;
          }
        }

        // Prefix match — first 4 chars same
        if (
          qVariant.length >= 4 &&
          cWord.length >= 4 &&
          qVariant.slice(0, 4) === cWord.slice(0, 4)
        ) {
          score += 2;
        }
      }
    }
  }

  return score;
};

// Find best matching chunk across all knowledge entries
const findBestMatch = (userMessage, knowledgeEntries) => {
  const queryWords = extractKeywords(userMessage);

  if (queryWords.length === 0) return null;

  let bestChunk = null;
  let bestScore = 0;
  let allScores = [];

  for (const entry of knowledgeEntries) {
    for (const chunk of entry.chunks) {
      const score = scoreChunk(chunk, queryWords);
      allScores.push({ chunk, score });
      if (score > bestScore) {
        bestScore = score;
        bestChunk = chunk;
      }
    }
  }

  // Return best match if score is good enough
  return bestScore >= 2 ? bestChunk : null;
};

module.exports = { extractKeywords, splitIntoChunks, findBestMatch };