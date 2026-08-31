/**
 * HumSaathi AI - Speech Synthesis & Voice Selection Utility
 * 
 * Provides robust, asynchronous voice selection, female voice prioritization,
 * language-specific voice routing, and internal Roman Urdu pronunciation normalization for TTS.
 * 
 * NOTE: Internal speech text transformations are strictly for SpeechSynthesisUtterance
 * and NEVER alter visible chat bubbles or saved conversation records.
 */

// Female voice name identifiers across Windows, macOS, iOS, Android, and Chromium
const FEMALE_KEYWORDS = [
  'female', 'woman', 'girl', 'zira', 'samantha', 'karen', 'victoria',
  'moira', 'fiona', 'veena', 'uzma', 'asma', 'gul', 'amira', 'fatima',
  'hira', 'heera', 'ayesha', 'saba', 'mary', 'jenny', 'aria', 'sonia',
  'natural', 'eva', 'stephanie', 'sarah', 'salli', 'joanna', 'kendra',
  'kimberly', 'ivy', 'hazel', 'susan', 'catherine', 'neerja', 'swara'
];

/**
 * Check if a voice is female based on name or metadata
 */
export const isFemaleVoice = (voice) => {
  if (!voice) return false;
  const name = (voice.name || '').toLowerCase();
  return FEMALE_KEYWORDS.some((kw) => name.includes(kw));
};

/**
 * Asynchronously retrieve available SpeechSynthesis voices with timeout safety
 */
export const getAvailableVoicesAsync = (timeoutMs = 1500) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices && currentVoices.length > 0) {
      resolve(currentVoices);
      return;
    }

    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(window.speechSynthesis.getVoices() || []);
      }
    }, timeoutMs);

    const onVoicesChanged = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        window.speechSynthesis.onvoiceschanged = null;
        resolve(window.speechSynthesis.getVoices() || []);
      }
    };

    window.speechSynthesis.onvoiceschanged = onVoicesChanged;
  });
};

/**
 * Select the best matching voice for a given language, prioritizing female natural voices.
 */
export const selectBestVoice = (voices, language = 'en') => {
  if (!voices || voices.length === 0) return null;

  const lang = (language || 'en').toLowerCase();

  // Normalize voice language tag for comparison
  const getLangCode = (v) => (v.lang || '').toLowerCase().replace('_', '-');

  // ==========================================
  // 1. URDU SCRIPT (ur)
  // ==========================================
  if (lang === 'ur') {
    // 1a. Female Urdu voice (ur-PK, ur-IN, ur)
    const femaleUrdu = voices.find((v) => {
      const c = getLangCode(v);
      return (c.startsWith('ur-pk') || c.startsWith('ur-in') || c.startsWith('ur')) && isFemaleVoice(v);
    });
    if (femaleUrdu) return femaleUrdu;

    // 1b. Any Urdu voice
    const anyUrdu = voices.find((v) => {
      const c = getLangCode(v);
      return c.startsWith('ur-pk') || c.startsWith('ur-in') || c.startsWith('ur');
    });
    if (anyUrdu) return anyUrdu;

    // 1c. Female South Asian regional voice (pa-PK, pa-IN, hi-IN, en-PK, en-IN)
    const femaleSouthAsian = voices.find((v) => {
      const c = getLangCode(v);
      return (c.startsWith('pa-') || c.startsWith('hi-') || c.startsWith('en-pk') || c.startsWith('en-in')) && isFemaleVoice(v);
    });
    if (femaleSouthAsian) return femaleSouthAsian;

    // 1d. Any South Asian regional voice
    const anySouthAsian = voices.find((v) => {
      const c = getLangCode(v);
      return c.startsWith('pa-') || c.startsWith('hi-') || c.startsWith('en-pk') || c.startsWith('en-in');
    });
    if (anySouthAsian) return anySouthAsian;

    // 1e. Any female voice
    const anyFemale = voices.find(isFemaleVoice);
    if (anyFemale) return anyFemale;

    // Fallback default
    return voices.find((v) => v.default) || voices[0];
  }

  // ==========================================
  // 2. ROMAN URDU (ur_rm)
  // ==========================================
  if (lang === 'ur_rm') {
    // Roman Urdu sounds vastly more natural when spoken with a South Asian / Pakistani / Indian English or Urdu voice
    // because standard US/UK phonetics mispronounce Roman Urdu vowels ("hai", "aap", "kaise", "shukriya").

    // 2a. Female Urdu or South Asian English voice (ur-PK, en-PK, en-IN, hi-IN)
    const femaleSouthAsian = voices.find((v) => {
      const c = getLangCode(v);
      return (c.startsWith('ur-') || c.startsWith('en-pk') || c.startsWith('en-in') || c.startsWith('hi-') || c.startsWith('pa-')) && isFemaleVoice(v);
    });
    if (femaleSouthAsian) return femaleSouthAsian;

    // 2b. Any Urdu / South Asian regional voice
    const anySouthAsian = voices.find((v) => {
      const c = getLangCode(v);
      return c.startsWith('ur-') || c.startsWith('en-pk') || c.startsWith('en-in') || c.startsWith('hi-') || c.startsWith('pa-');
    });
    if (anySouthAsian) return anySouthAsian;

    // 2c. Female English voice
    const femaleEnglish = voices.find((v) => {
      const c = getLangCode(v);
      return c.startsWith('en') && isFemaleVoice(v);
    });
    if (femaleEnglish) return femaleEnglish;

    // 2d. Any female voice
    const anyFemale = voices.find(isFemaleVoice);
    if (anyFemale) return anyFemale;

    return voices.find((v) => v.default) || voices[0];
  }

  // ==========================================
  // 3. ENGLISH (en)
  // ==========================================
  // 3a. Female English voice (en-US, en-GB, en-AU, en-CA, en-IN)
  const femaleEnglish = voices.find((v) => {
    const c = getLangCode(v);
    return c.startsWith('en') && isFemaleVoice(v);
  });
  if (femaleEnglish) return femaleEnglish;

  // 3b. Any English voice
  const anyEnglish = voices.find((v) => getLangCode(v).startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // 3c. Any female voice
  const anyFemale = voices.find(isFemaleVoice);
  if (anyFemale) return anyFemale;

  return voices.find((v) => v.default) || voices[0];
};

/**
 * Pronunciation & cadence preparation layer strictly for TTS.
 * NEVER modifies the visible chat bubbles or saved conversation transcript.
 */
export const prepareSpeechText = (rawText, language = 'en') => {
  if (!rawText) return '';
  let text = String(rawText).trim();

  // Strip Markdown bold/italic or formatting symbols
  text = text.replace(/[*_#`~]/g, '');

  if (language === 'ur') {
    // Urdu Script: Ensure natural punctuation pauses
    text = text.replace(/۔/g, '. ').replace(/،/g, ', ');
    return text;
  }

  if (language === 'ur_rm') {
    // Roman Urdu: Add gentle cadence pauses after common introductory greetings & conversational markers
    // This allows the TTS engine to breathe and pronounce phrases with natural South Asian cadence.
    const greetings = [
      'Hey', 'Hi', 'Haan', 'Ji haan', 'Ji bilkul', 'Bilkul', 'Assalam o alaikum',
      'Assalam-o-Alaikum', 'Shukriya', 'Aap ka shukriya', 'Koi baat nahi',
      'Theek hai', 'Sounds like a plan', 'Good afternoon', 'Hello'
    ];

    for (const g of greetings) {
      const regex = new RegExp(`^${g}\\b(?![,!?.])`, 'i');
      if (regex.test(text)) {
        text = text.replace(regex, `${g},`);
        break;
      }
    }

    // Ensure question marks and sentence boundaries have adequate breathing spaces
    text = text.replace(/\?/g, '? ').replace(/!/g, '! ').replace(/\./g, '. ');
    return text.replace(/\s+/g, ' ').trim();
  }

  // English: Clean spacing and sentence boundaries
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Speak text using the best matching female/natural voice for the given language.
 */
export const speakWithBestVoice = async ({
  text,
  language = 'en',
  onStart = () => {},
  onEnd = () => {},
  onError = () => {}
}) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onError(new Error('SpeechSynthesis not supported'));
    return null;
  }

  window.speechSynthesis.cancel();

  if (!text || !text.trim()) {
    onEnd();
    return null;
  }

  const voices = await getAvailableVoicesAsync();
  const selectedVoice = selectBestVoice(voices, language);
  const speechText = prepareSpeechText(text, language);

  const utterance = new SpeechSynthesisUtterance(speechText);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  } else {
    // Default language fallback tags
    if (language === 'ur') {
      utterance.lang = 'ur-PK';
    } else if (language === 'ur_rm') {
      utterance.lang = 'ur-PK';
    } else {
      utterance.lang = 'en-US';
    }
  }

  // Tuned speech parameters for calm, natural cadence
  if (language === 'ur' || language === 'ur_rm') {
    utterance.rate = 0.90; // Slightly measured for clear Urdu syllable articulation
    utterance.pitch = 1.05; // Friendly, warm female tone
  } else {
    utterance.rate = 0.95; // Natural conversational English pace
    utterance.pitch = 1.05;
  }

  utterance.onstart = () => {
    onStart({ voice: selectedVoice, speechText });
  };

  utterance.onend = () => {
    onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis playback notice:', e);
    onError(e);
  };

  window.speechSynthesis.speak(utterance);

  return {
    voiceName: selectedVoice ? selectedVoice.name : 'System Default',
    voiceLang: selectedVoice ? selectedVoice.lang : utterance.lang,
    isFemale: isFemaleVoice(selectedVoice),
    speechText
  };
};

/**
 * Stop active speech synthesis
 */
export const stopSpeech = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
