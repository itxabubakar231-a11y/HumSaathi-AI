export function buildLetterContent(difficulty, language) {
  const pool = difficulty === 'beginner'
    ? ['A', 'B', 'C', 'D']
    : difficulty === 'easy'
      ? ['A', 'B', 'C', 'D', 'E', 'F', 'G']
      : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  const targets = shuffledPool.slice(0, 4);

  const questions = targets.map((target, idx) => {
    const distractors = pool.filter((l) => l !== target).sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);

    const prompts = {
      en: `Find the letter ${target}`,
      ur: `حرف ${target} تلاش کریں`,
      ur_rm: `Harf ${target} talash karein`,
    };

    const hints = {
      en: `Look carefully for the letter ${target}`,
      ur: `توجہ سے حرف ${target} کی شکل دیکھیں`,
      ur_rm: `Tawajjoh se harf ${target} ki shakal dekhein`,
    };

    return {
      id: `q${idx + 1}`,
      prompt: prompts[language] || prompts.en,
      options,
      correctAnswer: target,
      hint: hints[language] || hints.en,
    };
  });

  return { questions };
}

export function buildNumberContent(difficulty, language) {
  const max = difficulty === 'beginner' ? 5 : difficulty === 'easy' ? 10 : 20;
  const usedNumbers = new Set();
  const questions = [];

  for (let i = 0; i < 4; i++) {
    let n;
    let attempts = 0;
    do {
      n = Math.floor(Math.random() * (max - 1)) + 1;
      attempts++;
    } while (usedNumbers.has(n) && attempts < 10);
    usedNumbers.add(n);

    const correct = String(n + 1);
    const options = [String(Math.max(1, n - 1)), correct, String(n + 2)].filter((v) => Number(v) > 0);
    const unique = [...new Set(options)].sort(() => Math.random() - 0.5);

    const prompts = {
      en: `Which number comes after ${n}?`,
      ur: `${n} کے بعد کون سا نمبر آتا ہے؟`,
      ur_rm: `${n} ke baad kaun sa number aata hai?`,
    };

    const hints = {
      en: `Count forward from ${n}: ${n}, then comes...`,
      ur: `${n} سے آگے گنیں: ${n} کے فوراً بعد کیا آتا ہے؟`,
      ur_rm: `${n} se aage ginein: ${n} ke foran baad kya aata hai?`,
    };

    questions.push({
      id: `q${i + 1}`,
      prompt: prompts[language] || prompts.en,
      options: unique,
      correctAnswer: correct,
      hint: hints[language] || hints.en,
    });
  }

  return { questions };
}

export function buildShapeColorContent(difficulty, language) {
  const items = [
    { shape: 'circle', color: 'blue', label: { en: 'Blue circle', ur: 'نیلا دائرہ', ur_rm: 'Neela daaira' } },
    { shape: 'square', color: 'red', label: { en: 'Red square', ur: 'سرخ مربع', ur_rm: 'Surkh murabba' } },
    { shape: 'triangle', color: 'green', label: { en: 'Green triangle', ur: 'سبز مثلث', ur_rm: 'Sabz musallas' } },
    { shape: 'circle', color: 'green', label: { en: 'Green circle', ur: 'سبز دائرہ', ur_rm: 'Sabz daaira' } },
    { shape: 'square', color: 'blue', label: { en: 'Blue square', ur: 'نیلا مربع', ur_rm: 'Neela murabba' } },
    { shape: 'triangle', color: 'red', label: { en: 'Red triangle', ur: 'سرخ مثلث', ur_rm: 'Surkh musallas' } },
  ];

  const shuffledItems = [...items].sort(() => Math.random() - 0.5);
  const targets = shuffledItems.slice(0, 4);

  const questions = targets.map((target, idx) => {
    const distractors = items.filter((i) => i.shape !== target.shape || i.color !== target.color).slice(0, 2);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);

    const prompts = {
      en: `Tap the ${target.label.en}`,
      ur: `${target.label.ur} کو چھوئیں`,
      ur_rm: `${target.label.ur_rm} ko chhooein`,
    };

    const hints = {
      en: `Look for the ${target.color} color and ${target.shape} shape: ${target.label.en}`,
      ur: `رنگ اور شکل پر غور کریں: ${target.label.ur}`,
      ur_rm: `Rang aur shakal par ghor karein: ${target.label.ur_rm}`,
    };

    return {
      id: `q${idx + 1}`,
      prompt: prompts[language] || prompts.en,
      options: options.map((o) => o.label[language] || o.label.en),
      correctAnswer: target.label[language] || target.label.en,
      visual: options.map((o) => ({ shape: o.shape, color: o.color, label: o.label[language] || o.label.en })),
      hint: hints[language] || hints.en,
    };
  });

  return { questions };
}

export function buildCountingContent(difficulty, language) {
  const itemPool = [
    { en: 'apples', ur: 'سیب', ur_rm: 'sayb', icon: '🍎' },
    { en: 'stars', ur: 'ستارے', ur_rm: 'sitaray', icon: '⭐' },
    { en: 'balloons', ur: 'غبارے', ur_rm: 'ghubaray', icon: '🎈' },
    { en: 'cars', ur: 'گاڑیاں', ur_rm: 'gariyan', icon: '🚗' },
    { en: 'teddy bears', ur: 'کھلونے بھالو', ur_rm: 'teddy bears', icon: '🧸' },
    { en: 'kittens', ur: 'بلی کے بچے', ur_rm: 'billi ke bachay', icon: '🐱' },
    { en: 'balls', ur: 'گیندیں', ur_rm: 'geindein', icon: '⚽' },
    { en: 'flowers', ur: 'پھول', ur_rm: 'phool', icon: '🌸' },
  ];

  const shuffledPool = [...itemPool].sort(() => Math.random() - 0.5);
  const min = difficulty === 'beginner' ? 2 : difficulty === 'easy' ? 3 : 4;
  const max = difficulty === 'beginner' ? 5 : difficulty === 'easy' ? 7 : 10;

  const usedCounts = new Set();
  const questions = [];

  for (let i = 0; i < 4; i++) {
    const item = shuffledPool[i % shuffledPool.length];
    let count;
    let attempts = 0;
    do {
      count = Math.floor(Math.random() * (max - min + 1)) + min;
      attempts++;
    } while (usedCounts.has(count) && attempts < 10);
    usedCounts.add(count);

    const correct = String(count);
    const d1 = String(Math.max(1, count - 1));
    const d2 = String(count + (count > 2 ? 1 : 2));
    const options = [...new Set([d1, correct, d2])].sort(() => Math.random() - 0.5);

    const prompts = {
      en: `How many ${item.en} do you see?`,
      ur: `آپ کو کتنے ${item.ur} نظر آ رہے ہیں؟`,
      ur_rm: `Aap ko kitne ${item.ur_rm} nazar aa rahe hain?`,
    };

    const hints = {
      en: `Touch and count each ${item.icon} one by one: 1, 2, 3...`,
      ur: `ہر ایک ${item.icon} کو ایک ایک کر کے گنیں: ۱، ۲، ۳...`,
      ur_rm: `Har aik ${item.icon} ko aik aik kar ke ginein: 1, 2, 3...`,
    };

    questions.push({
      id: `q${i + 1}`,
      prompt: prompts[language] || prompts.en,
      options,
      correctAnswer: correct,
      visualPrompt: {
        type: 'counting',
        icon: item.icon,
        count,
        label: item[language] || item.en,
      },
      hint: hints[language] || hints.en,
    });
  }

  return { questions };
}

export function buildAnimalMatchingContent(difficulty, language) {
  const animals = [
    { en: 'Dog', ur: 'کتا', ur_rm: 'Kutta', icon: '🐶' },
    { en: 'Cat', ur: 'بلی', ur_rm: 'Billi', icon: '🐱' },
    { en: 'Bird', ur: 'پرندہ', ur_rm: 'Parinda', icon: '🐦' },
    { en: 'Fish', ur: 'مچھلی', ur_rm: 'Machli', icon: '🐟' },
    { en: 'Cow', ur: 'گائے', ur_rm: 'Gaaye', icon: '🐮' },
    { en: 'Lion', ur: 'شیر', ur_rm: 'Sher', icon: '🦁' },
    { en: 'Elephant', ur: 'ہاتھی', ur_rm: 'Haathi', icon: '🐘' },
    { en: 'Rabbit', ur: 'خرگوش', ur_rm: 'Khargosh', icon: '🐰' },
  ];

  const shuffled = [...animals].sort(() => Math.random() - 0.5);
  const targets = shuffled.slice(0, 4);

  const questions = targets.map((target, idx) => {
    const distractors = animals
      .filter((a) => a.en !== target.en)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const options = [target, ...distractors]
      .map((a) => a[language] || a.en)
      .sort(() => Math.random() - 0.5);

    const prompts = {
      en: `Which animal is this?`,
      ur: `یہ کون سا جانور ہے؟`,
      ur_rm: `Yeh kaun sa janwar hai?`,
    };

    const hints = {
      en: `Look at the animal: it is a ${target.en}`,
      ur: `جانور کی تصویر کو دیکھیں: یہ ${target.ur} ہے`,
      ur_rm: `Janwar ki tasveer ko dekhein: yeh ${target.ur_rm} hai`,
    };

    return {
      id: `q${idx + 1}`,
      prompt: prompts[language] || prompts.en,
      options,
      correctAnswer: target[language] || target.en,
      visualPrompt: {
        type: 'animal',
        icon: target.icon,
        label: target[language] || target.en,
      },
      hint: hints[language] || hints.en,
    };
  });

  return { questions };
}

export function buildEmotionLearningContent(difficulty, language) {
  const emotions = [
    { en: 'Happy', ur: 'خوش', ur_rm: 'Khush', icon: '😊', clue: 'smiling with joy' },
    { en: 'Sad', ur: 'اداس', ur_rm: 'Udaas', icon: '😢', clue: 'feeling blue' },
    { en: 'Angry', ur: 'غصہ', ur_rm: 'Gussa', icon: '😠', clue: 'crossed brows' },
    { en: 'Tired', ur: 'تھکا ہوا', ur_rm: 'Thaka hua', icon: '🥱', clue: 'sleepy and yawning' },
    { en: 'Surprised', ur: 'حیران', ur_rm: 'Hairan', icon: '😮', clue: 'wide open eyes' },
  ];

  const shuffled = [...emotions].sort(() => Math.random() - 0.5);
  const targets = shuffled.slice(0, 4);

  const questions = targets.map((target, idx) => {
    const distractors = emotions
      .filter((e) => e.en !== target.en)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const options = [target, ...distractors]
      .map((e) => e[language] || e.en)
      .sort(() => Math.random() - 0.5);

    const prompts = {
      en: `What feeling does this face show?`,
      ur: `یہ چہرہ کون سا احساس ظاہر کر رہا ہے؟`,
      ur_rm: `Yeh chehra kaun sa ehsaas zahir kar raha hai?`,
    };

    const hints = {
      en: `Look at the gentle expression: the face is ${target.en.toLowerCase()}`,
      ur: `چہرے کے تاثر کو دیکھیں: یہ ${target.ur} ہے`,
      ur_rm: `Chehre ke taasur ko dekhein: yeh ${target.ur_rm} hai`,
    };

    return {
      id: `q${idx + 1}`,
      prompt: prompts[language] || prompts.en,
      options,
      correctAnswer: target[language] || target.en,
      visualPrompt: {
        type: 'emotion',
        icon: target.icon,
        label: target[language] || target.en,
      },
      hint: hints[language] || hints.en,
    };
  });

  return { questions };
}

export function buildRoutineSequencingContent(difficulty, language) {
  const morningRoutine = [
    { en: 'Wake up', ur: 'جاگنا', ur_rm: 'Jaagna', icon: '⏰' },
    { en: 'Brush teeth', ur: 'دانت صاف کرنا', ur_rm: 'Daant saaf karna', icon: '🪥' },
    { en: 'Eat breakfast', ur: 'ناشتہ کرنا', ur_rm: 'Naashta karna', icon: '🥣' },
    { en: 'Go to school', ur: 'سکول جانا', ur_rm: 'School jaana', icon: '🎒' },
  ];

  const eveningRoutine = [
    { en: 'Eat dinner', ur: 'رات کا کھانا کھانا', ur_rm: 'Raat ka khana', icon: '🍲' },
    { en: 'Wash hands & face', ur: 'ہاتھ منہ دھونا', ur_rm: 'Haath munh dhona', icon: '🧼' },
    { en: 'Read a story', ur: 'کہانی پڑھنا', ur_rm: 'Kahani parhna', icon: '📖' },
    { en: 'Go to sleep', ur: 'سو جانا', ur_rm: 'So jaana', icon: '🌙' },
  ];

  const sequences = [
    { name: 'morning', list: morningRoutine },
    { name: 'evening', list: eveningRoutine },
  ];

  const tasks = [
    { seq: morningRoutine, currentIdx: 0, nextIdx: 1 },
    { seq: morningRoutine, currentIdx: 1, nextIdx: 2 },
    { seq: eveningRoutine, currentIdx: 0, nextIdx: 1 },
    { seq: eveningRoutine, currentIdx: 2, nextIdx: 3 },
  ];

  const questions = tasks.map((task, i) => {
    const current = task.seq[task.currentIdx];
    const correctNext = task.seq[task.nextIdx];

    const distractors = task.seq
      .filter((s) => s.en !== correctNext.en && s.en !== current.en)
      .concat(eveningRoutine.filter((s) => s.en !== correctNext.en && s.en !== current.en))
      .slice(0, 2);

    const options = [correctNext, ...distractors]
      .map((s) => s[language] || s.en)
      .sort(() => Math.random() - 0.5);

    const prompts = {
      en: `After "${current.en}", what comes next?`,
      ur: `"${current.ur}" کے بعد کیا آتا ہے؟`,
      ur_rm: `"${current.ur_rm}" ke baad kya aata hai?`,
    };

    const hints = {
      en: `Think about your routine: after ${current.en}, it is time to ${correctNext.en.toLowerCase()}`,
      ur: `سوچیں: ${current.ur} کے بعد اگلا قدم ${correctNext.ur} ہے۔`,
      ur_rm: `Sochein: ${current.ur_rm} ke baad agla step ${correctNext.ur_rm} hai.`,
    };

    return {
      id: `q${i + 1}`,
      prompt: prompts[language] || prompts.en,
      options,
      correctAnswer: correctNext[language] || correctNext.en,
      visualPrompt: {
        type: 'routine',
        icon: current.icon,
        label: current[language] || current.en,
      },
      hint: hints[language] || hints.en,
    };
  });

  return { questions };
}

export const activityBuilders = {
  letter: buildLetterContent,
  number: buildNumberContent,
  shape_color_match: buildShapeColorContent,
  counting: buildCountingContent,
  animal_matching: buildAnimalMatchingContent,
  emotion_learning: buildEmotionLearningContent,
  routine_sequencing: buildRoutineSequencingContent,
};

export function getActivityContent(type, difficulty, language) {
  const builder = activityBuilders[type];
  if (!builder) throw new Error(`Unknown activity type: ${type}`);
  return builder(difficulty, language);
}
