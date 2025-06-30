const Sentiment = require('sentiment');
const sentiment = new Sentiment();

// Extended mood keywords with weights
const moodKeywords = {
  happy: { 
    keywords: ['joy', 'happy', 'excited', 'awesome', 'great', 'yay', 'cheerful'],
    weight: 1.5 
  },
  sad: { 
    keywords: ['sad', 'depressed', 'cry', 'lonely', 'heartbroken', 'tears', 'miss'],
    weight: -1.5 
  },
  angry: { 
    keywords: ['angry', 'mad', 'furious', 'annoyed', 'rage', 'hate', 'pissed'],
    weight: -1.2 
  },
  anxious: { 
    keywords: ['anxious', 'nervous', 'stress', 'worried', 'panic', 'fear', 'scared'],
    weight: -1.0 
  },
  romantic: { 
    keywords: ['love', 'romantic', 'crush', 'heart', 'kiss', 'adore', 'lover'],
    weight: 1.3 
  },
  confident: { 
    keywords: ['confident', 'strong', 'proud', 'winner', 'boss', 'champion', 'power'],
    weight: 1.4 
  },
  nostalgic: { 
    keywords: ['remember', 'nostalgic', 'memory', 'childhood', 'past', 'old', 'miss'],
    weight: 0.8 
  },
  energetic: { 
    keywords: ['energy', 'party', 'dance', 'pump', 'hype', 'workout', 'active'],
    weight: 1.3 
  },
  calm: { 
    keywords: ['calm', 'peace', 'relax', 'chill', 'serene', 'quiet', 'zen'],
    weight: 0.7 
  }
};

// Enhanced sentiment analysis with keyword boosting
function analyzePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    console.warn('⚠️ Invalid prompt received');
    return { mood: 'calm', score: 0, source: 'fallback' };
  }

  const lowerPrompt = prompt.toLowerCase();
  let detectedMood = null;
  let maxScore = 0;

  // Step 1: Check for mood keywords with weighted scoring
  for (const mood in moodKeywords) {
    const { keywords, weight } = moodKeywords[mood];
    const matches = keywords.filter(word => lowerPrompt.includes(word));
    
    if (matches.length > 0) {
      const moodScore = matches.length * weight;
      if (moodScore > maxScore) {
        maxScore = moodScore;
        detectedMood = mood;
      }
    }
  }

  // Step 2: Fallback to sentiment analysis if no strong keyword match
  if (!detectedMood || maxScore < 1.5) {
    const result = sentiment.analyze(prompt);
    const score = result.score;
    
    if (score > 3) detectedMood = 'happy';
    else if (score > 1) detectedMood = 'confident';
    else if (score < -3) detectedMood = 'angry';
    else if (score < -1) detectedMood = 'sad';
    else detectedMood = 'calm';

    console.log(`📊 Sentiment fallback: Score ${score} → ${detectedMood}`);
    return { 
      mood: detectedMood, 
      score,
      comparative: result.comparative,
      source: 'sentiment' 
    };
  }

  console.log(`🔍 Keyword detection: ${detectedMood} (score: ${maxScore})`);
  return { 
    mood: detectedMood, 
    score: maxScore,
    source: 'keywords' 
  };
}

module.exports = analyzePrompt;