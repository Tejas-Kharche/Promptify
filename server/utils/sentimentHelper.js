// sentimentHelper.js
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const moodKeywords = {
  happy: ['joy', 'excited', 'cheerful', 'yay', 'glad', 'delight'],
  sad: ['alone', 'heartbroken', 'crying', 'empty', 'depressed'],
  calm: ['peaceful', 'relaxed', 'serene', 'chill', 'soothing'],
  angry: ['mad', 'angry', 'furious', 'rage'],
  anxious: ['nervous', 'worried', 'panic'],
  romantic: ['love', 'romantic', 'crush', 'heart'],
  confident: ['strong', 'fearless', 'confident', 'bold'],
  nostalgic: ['remember', 'old days', 'past', 'nostalgic'],
  energetic: ['hype', 'party', 'dancing', 'workout', 'energetic'],
};

const analyzePrompt = (prompt) => {
  const result = sentiment.analyze(prompt);
  const lowerPrompt = prompt.toLowerCase();

  // Mood detection via keyword match
  let detectedMood = null;
  for (const mood in moodKeywords) {
    if (moodKeywords[mood].some(keyword => lowerPrompt.includes(keyword))) {
      detectedMood = mood;
      break;
    }
  }

  // Fallback mood based on sentiment score
  if (!detectedMood) {
    detectedMood = result.score > 2 ? 'happy' : result.score < -2 ? 'sad' : 'calm';
  }

  return {
    mood: detectedMood,
    sentimentScore: result.score,
  };
};

module.exports = analyzePrompt;
