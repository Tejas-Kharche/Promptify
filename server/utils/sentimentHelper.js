const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Keywords associated with moods
const moodKeywords = {
  happy: [
    'joy', 'excited', 'cheerful', 'optimistic', 'yay', 'delighted', 'smiling',
    'sunny', 'grateful', 'blessed', 'good vibes', 'feeling great', 'fun',
    'radiant', 'jubilant', 'giggly', 'ecstatic', 'on cloud nine', 'lively', 'bright',
    'vibrant', 'elated', 'glowing', 'euphoric', 'laughing', 'bubbly', 'sparkling'
  ],
  sad: [
    'alone', 'heartbroken', 'depressed', 'crying', 'empty', 'unhappy', 'tears',
    'down', 'blue', 'miserable', 'sorrow', 'lost', 'lonely', 'pain',
    'melancholy', 'broken', 'grieving', 'heavy heart', 'devastated', 'wounded',
    'mournful', 'drained', 'hopeless', 'weeping', 'numb', 'regretful'
  ],
  angry: [
    'mad', 'angry', 'furious', 'rage', 'annoyed', 'frustrated', 'hate', 'pissed',
    'irritated', 'infuriated', 'disgusted', 'exploding', 'snapped',
    'outraged', 'burning', 'storming', 'heated', 'boiling', 'grumpy',
    'temper', 'enraged', 'fuming', 'hostile', 'seething', 'bitter'
  ],
  anxious: [
    'nervous', 'worried', 'anxious', 'panic', 'scared', 'fearful', 'tense', 'stressed',
    'uneasy', 'shaky', 'butterflies', 'overthinking', 'dread', 'concerned',
    'paranoid', 'jittery', 'sweaty palms', 'apprehensive', 'twitchy',
    'on edge', 'restless', 'insecure', 'uneasy', 'pressure', 'nervous wreck'
  ],
  romantic: [
    'love', 'romantic', 'crush', 'heart', 'valentine', 'date', 'candlelight',
    'together', 'relationship', 'falling for', 'sweetheart', 'affection',
    'soulmate', 'holding hands', 'intimacy', 'kiss', 'flirting', 'roses',
    'serenade', 'cuddles', 'infatuated', 'lover', 'bonded', 'moonlight'
  ],
  confident: [
    'strong', 'fearless', 'confident', 'bold', 'ready', 'determined', 'winning',
    'ambitious', 'focused', 'empowered', 'motivated', 'capable', 'unstoppable',
    'resilient', 'assertive', 'dominant', 'thriving', 'limitless', 'go-getter',
    'sure', 'self-assured', 'taking charge', 'on fire', 'rise up', 'victory'
  ],
  nostalgic: [
    'remember', 'old', 'past', 'nostalgic', 'school days', 'miss those days',
    'reminisce', 'flashback', 'childhood', 'memories', 'good old times', 'back then',
    'used to', 'high school', 'college days', 'bittersweet', 'vintage',
    'throwback', 'recollection', 'retro', 'long ago', 'golden days', 'photo album',
    'before', 'times gone by', 'yesteryear'
  ],
  energetic: [
    'hype', 'party', 'dancing', 'workout', 'energetic', 'pumped', 'charged up',
    'alive', 'turn up', 'excited', 'vibing', 'groove', 'jumping', 'beat',
    'lit', 'on fire', 'adrenaline', 'bursting', 'raving', 'fast-paced',
    'jumping jacks', 'buzzing', 'wild', 'amped', 'roaring', 'banger'
  ],
  calm: [
    'peaceful', 'calm', 'relaxed', 'soothing', 'quiet', 'still', 'zen',
    'serene', 'chill', 'slow down', 'breathe', 'unwind', 'tranquil',
    'meditative', 'harmony', 'mindful', 'cozy', 'easygoing', 'mellow',
    'gentle', 'comforting', 'dreamy', 'soft', 'nature sounds', 'lowkey'
  ]
};



const analyzePrompt = (prompt) => {
  const result = sentiment.analyze(prompt);
  const lowerPrompt = prompt.toLowerCase();

  //Keyword match
  for (const mood in moodKeywords) {
    if (moodKeywords[mood].some(keyword => lowerPrompt.includes(keyword))) {
      return {
        score: result.score,
        mood,
        comparative: result.comparative,
      };
    }
  }

  // Fallback using sentiment score
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

