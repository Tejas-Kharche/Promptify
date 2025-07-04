const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Keywords associated with moods
const moodKeywords = {
  happy: [
    'joy', 'excited', 'cheerful', 'optimistic', 'yay', 'delighted', 'smiling',
    'sunny', 'grateful', 'blessed', 'good vibes', 'feeling great', 'fun'
  ],
  sad: [
    'alone', 'heartbroken', 'depressed', 'crying', 'empty', 'unhappy', 'tears',
    'down', 'blue', 'miserable', 'sorrow', 'lost', 'lonely', 'pain'
  ],
  angry: [
    'mad', 'angry', 'furious', 'rage', 'annoyed', 'frustrated', 'hate', 'pissed',
    'irritated', 'infuriated', 'disgusted', 'exploding', 'snapped'
  ],
  anxious: [
    'nervous', 'worried', 'anxious', 'panic', 'scared', 'fearful', 'tense', 'stressed',
    'uneasy', 'shaky', 'butterflies', 'overthinking', 'dread', 'concerned'
  ],
  romantic: [
    'love', 'romantic', 'crush', 'heart', 'valentine', 'date', 'candlelight',
    'together', 'relationship', 'falling for', 'sweetheart', 'affection'
  ],
  confident: [
    'strong', 'fearless', 'confident', 'bold', 'ready', 'determined', 'winning',
    'ambitious', 'focused', 'empowered', 'motivated', 'capable', 'unstoppable'
  ],
  nostalgic: [
    'remember', 'old', 'past', 'nostalgic', 'school days', 'miss those days',
    'reminisce', 'flashback', 'childhood', 'memories', 'good old times', 'back then',
    'used to', 'high school', 'college days'
  ],
  energetic: [
    'hype', 'party', 'dancing', 'workout', 'energetic', 'pumped', 'charged up',
    'alive', 'turn up', 'excited', 'vibing', 'groove', 'jumping', 'beat'
  ],
  calm: [
    'peaceful', 'calm', 'relaxed', 'soothing', 'quiet', 'still', 'zen',
    'serene', 'chill', 'slow down', 'breathe', 'unwind', 'tranquil'
  ]
};


const analyzePrompt = (prompt) => {
  const result = sentiment.analyze(prompt);
  const lowerPrompt = prompt.toLowerCase();

  // Step 1: Keyword match
  for (const mood in moodKeywords) {
    if (moodKeywords[mood].some(keyword => lowerPrompt.includes(keyword))) {
      return {
        score: result.score,
        mood,
        comparative: result.comparative,
      };
    }
  }

  // Step 2: Fallback using sentiment score
  let fallbackMood = 'calm';
  if (result.score >= 3) fallbackMood = 'happy';
  else if (result.score > 0) fallbackMood = 'confident';
  else if (result.score <= -3) fallbackMood = 'sad';
  else if (result.score < 0) fallbackMood = 'anxious';

  return {
    score: result.score,
    mood: fallbackMood,
    comparative: result.comparative,
  };
};

module.exports = analyzePrompt;

