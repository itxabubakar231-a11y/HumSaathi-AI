import random
from typing import Dict, Any, List

def build_letter_content(difficulty: str, language: str) -> Dict[str, Any]:
    pool = (
        ['A', 'B', 'C', 'D']
        if difficulty == 'beginner'
        else ['A', 'B', 'C', 'D', 'E', 'F', 'G']
        if difficulty == 'easy'
        else ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
    )

    shuffled_pool = random.sample(pool, len(pool))
    targets = shuffled_pool[:4]

    questions = []
    for idx, target in enumerate(targets):
        remaining = [l for l in pool if l != target]
        distractors = random.sample(remaining, min(2, len(remaining)))
        options = random.sample([target] + distractors, len([target] + distractors))

        prompts = {
            'en': f'Find the letter {target}',
            'ur': f'حرف {target} تلاش کریں',
            'ur_rm': f'Harf {target} talash karein',
        }

        hints = {
            'en': f'Look carefully for the letter {target}',
            'ur': f'توجہ سے حرف {target} کی شکل دیکھیں',
            'ur_rm': f'Tawajjoh se harf {target} ki shakal dekhein',
        }

        questions.append({
            'id': f'q{idx + 1}',
            'prompt': prompts.get(language, prompts['en']),
            'options': options,
            'correctAnswer': target,
            'hint': hints.get(language, hints['en']),
        })

    return {'questions': questions}

def build_number_content(difficulty: str, language: str) -> Dict[str, Any]:
    max_val = 5 if difficulty == 'beginner' else 10 if difficulty == 'easy' else 20
    used_numbers = set()
    questions = []

    for i in range(4):
        n = random.randint(1, max(1, max_val - 1))
        attempts = 0
        while n in used_numbers and attempts < 10:
            n = random.randint(1, max(1, max_val - 1))
            attempts += 1
        used_numbers.add(n)

        correct = str(n + 1)
        raw_options = [str(max(1, n - 1)), correct, str(n + 2)]
        options = list(dict.fromkeys(raw_options))
        random.shuffle(options)

        prompts = {
            'en': f'Which number comes after {n}?',
            'ur': f'{n} کے بعد کون سا نمبر آتا ہے؟',
            'ur_rm': f'{n} ke baad kaun sa number aata hai?',
        }

        hints = {
            'en': f'Count forward from {n}: {n}, then comes...',
            'ur': f'{n} سے آگے گنیں: {n} کے فوراً بعد کیا آتا ہے؟',
            'ur_rm': f'{n} se aage ginein: {n} ke foran baad kya aata hai?',
        }

        questions.append({
            'id': f'q{i + 1}',
            'prompt': prompts.get(language, prompts['en']),
            'options': options,
            'correctAnswer': correct,
            'hint': hints.get(language, hints['en']),
        })

    return {'questions': questions}

def build_shape_color_content(difficulty: str, language: str) -> Dict[str, Any]:
    items = [
        {'shape': 'circle', 'color': 'blue', 'label': {'en': 'Blue circle', 'ur': 'نیلا دائرہ', 'ur_rm': 'Neela daaira'}},
        {'shape': 'square', 'color': 'red', 'label': {'en': 'Red square', 'ur': 'سرخ مربع', 'ur_rm': 'Surkh murabba'}},
        {'shape': 'triangle', 'color': 'green', 'label': {'en': 'Green triangle', 'ur': 'سبز مثلث', 'ur_rm': 'Sabz musallas'}},
        {'shape': 'circle', 'color': 'green', 'label': {'en': 'Green circle', 'ur': 'سبز دائرہ', 'ur_rm': 'Sabz daaira'}},
        {'shape': 'square', 'color': 'blue', 'label': {'en': 'Blue square', 'ur': 'نیلا مربع', 'ur_rm': 'Neela murabba'}},
        {'shape': 'triangle', 'color': 'red', 'label': {'en': 'Red triangle', 'ur': 'سرخ مثلث', 'ur_rm': 'Surkh musallas'}},
    ]

    shuffled = random.sample(items, len(items))
    targets = shuffled[:4]

    questions = []
    for idx, target in enumerate(targets):
        distractors = [i for i in items if i['shape'] != target['shape'] or i['color'] != target['color']][:2]
        options_items = random.sample([target] + distractors, len([target] + distractors))

        prompts = {
            'en': f"Tap the {target['label']['en']}",
            'ur': f"{target['label']['ur']} کو چھوئیں",
            'ur_rm': f"{target['label']['ur_rm']} ko chhooein",
        }

        hints = {
            'en': f"Look for the {target['color']} color and {target['shape']} shape: {target['label']['en']}",
            'ur': f"رنگ اور شکل پر غور کریں: {target['label']['ur']}",
            'ur_rm': f"Rang aur shakal par ghor karein: {target['label']['ur_rm']}",
        }

        questions.append({
            'id': f'q{idx + 1}',
            'prompt': prompts.get(language, prompts['en']),
            'options': [o['label'].get(language, o['label']['en']) for o in options_items],
            'correctAnswer': target['label'].get(language, target['label']['en']),
            'visual': [{'shape': o['shape'], 'color': o['color'], 'label': o['label'].get(language, o['label']['en'])} for o in options_items],
            'hint': hints.get(language, hints['en']),
        })

    return {'questions': questions}

def build_counting_content(difficulty: str, language: str) -> Dict[str, Any]:
    item_pool = [
        {'en': 'apples', 'ur': 'سیب', 'ur_rm': 'sayb', 'icon': '🍎'},
        {'en': 'stars', 'ur': 'ستارے', 'ur_rm': 'sitaray', 'icon': '⭐'},
        {'en': 'balloons', 'ur': 'غبارے', 'ur_rm': 'ghubaray', 'icon': '🎈'},
        {'en': 'cars', 'ur': 'گاڑیاں', 'ur_rm': 'gariyan', 'icon': '🚗'},
        {'en': 'teddy bears', 'ur': 'کھلونے بھالو', 'ur_rm': 'teddy bears', 'icon': '🧸'},
        {'en': 'kittens', 'ur': 'بلی کے بچے', 'ur_rm': 'billi ke bachay', 'icon': '🐱'},
        {'en': 'balls', 'ur': 'گیندیں', 'ur_rm': 'geindein', 'icon': '⚽'},
        {'en': 'flowers', 'ur': 'پھول', 'ur_rm': 'phool', 'icon': '🌸'},
    ]

    shuffled_pool = random.sample(item_pool, len(item_pool))
    min_val = 2 if difficulty == 'beginner' else 3 if difficulty == 'easy' else 4
    max_val = 5 if difficulty == 'beginner' else 7 if difficulty == 'easy' else 10

    used_counts = set()
    questions = []

    for i in range(4):
        item = shuffled_pool[i % len(shuffled_pool)]
        count = random.randint(min_val, max_val)
        attempts = 0
        while count in used_counts and attempts < 10:
            count = random.randint(min_val, max_val)
            attempts += 1
        used_counts.add(count)

        correct = str(count)
        d1 = str(max(1, count - 1))
        d2 = str(count + (1 if count > 2 else 2))
        options = list(dict.fromkeys([d1, correct, d2]))
        random.shuffle(options)

        prompts = {
            'en': f"How many {item['en']} do you see?",
            'ur': f"آپ کو کتنے {item['ur']} نظر آ رہے ہیں؟",
            'ur_rm': f"Aap ko kitne {item['ur_rm']} nazar aa rahe hain?",
        }

        hints = {
            'en': f"Touch and count each {item['icon']} one by one: 1, 2, 3...",
            'ur': f"ہر ایک {item['icon']} کو ایک ایک کر کے گنیں: ۱، ۲، ۳...",
            'ur_rm': f"Har aik {item['icon']} ko aik aik kar ke ginein: 1, 2, 3...",
        }

        questions.append({
            'id': f'q{i + 1}',
            'prompt': prompts.get(language, prompts['en']),
            'options': options,
            'correctAnswer': correct,
            'visualPrompt': {
                'type': 'counting',
                'icon': item['icon'],
                'count': count,
                'label': item.get(language, item['en']),
            },
            'hint': hints.get(language, hints['en']),
        })

    return {'questions': questions}

def build_animal_matching_content(difficulty: str, language: str) -> Dict[str, Any]:
    animals = [
        {'en': 'Dog', 'ur': 'کتا', 'ur_rm': 'Kutta', 'icon': '🐶'},
        {'en': 'Cat', 'ur': 'بلی', 'ur_rm': 'Billi', 'icon': '🐱'},
        {'en': 'Bird', 'ur': 'پرندہ', 'ur_rm': 'Parinda', 'icon': '🐦'},
        {'en': 'Fish', 'ur': 'مچھلی', 'ur_rm': 'Machli', 'icon': '🐟'},
        {'en': 'Cow', 'ur': 'گائے', 'ur_rm': 'Gaaye', 'icon': '🐮'},
        {'en': 'Lion', 'ur': 'شیر', 'ur_rm': 'Sher', 'icon': '🦁'},
        {'en': 'Elephant', 'ur': 'ہاتھی', 'ur_rm': 'Haathi', 'icon': '🐘'},
        {'en': 'Rabbit', 'ur': 'خرگوش', 'ur_rm': 'Khargosh', 'icon': '🐰'},
    ]

    shuffled = random.sample(animals, len(animals))
    targets = shuffled[:4]

    questions = []
    for idx, target in enumerate(targets):
        remaining = [a for a in animals if a['en'] != target['en']]
        distractors = random.sample(remaining, min(2, len(remaining)))
        options = [a.get(language, a['en']) for a in [target] + distractors]
        random.shuffle(options)

        prompts = {
            'en': 'Which animal is this?',
            'ur': 'یہ کون سا جانور ہے؟',
            'ur_rm': 'Yeh kaun sa janwar hai?',
        }

        hints = {
            'en': f"Look at the animal: it is a {target['en']}",
            'ur': f"جانور کی تصویر کو دیکھیں: یہ {target['ur']} ہے",
            'ur_rm': f"Janwar ki tasveer ko dekhein: yeh {target['ur_rm']} hai",
        }

        questions.append({
            'id': f'q{idx + 1}',
            'prompt': prompts.get(language, prompts['en']),
            'options': options,
            'correctAnswer': target.get(language, target['en']),
            'visualPrompt': {
                'type': 'animal',
                'icon': target['icon'],
                'label': target.get(language, target['en']),
            },
            'hint': hints.get(language, hints['en']),
        })

    return {'questions': questions}

def build_emotion_learning_content(difficulty: str, language: str) -> Dict[str, Any]:
    emotions = [
        {'en': 'Happy', 'ur': 'خوش', 'ur_rm': 'Khush', 'icon': '😊', 'clue': 'smiling with joy'},
        {'en': 'Sad', 'ur': 'اداس', 'ur_rm': 'Udaas', 'icon': '😢', 'clue': 'feeling blue'},
        {'en': 'Angry', 'ur': 'غصہ', 'ur_rm': 'Gussa', 'icon': '😠', 'clue': 'crossed brows'},
        {'en': 'Tired', 'ur': 'تھکا ہوا', 'ur_rm': 'Thaka hua', 'icon': '🥱', 'clue': 'sleepy and yawning'},
        {'en': 'Surprised', 'ur': 'حیران', 'ur_rm': 'Hairan', 'icon': '😮', 'clue': 'wide open eyes'},
    ]

    shuffled = random.sample(emotions, len(emotions))
    targets = shuffled[:4]

    questions = []
    for idx, target in enumerate(targets):
        remaining = [e for e in emotions if e['en'] != target['en']]
        distractors = random.sample(remaining, min(2, len(remaining)))
        options = [e.get(language, e['en']) for e in [target] + distractors]
        random.shuffle(options)

        prompts = {
            'en': 'What feeling does this face show?',
            'ur': 'یہ چہرہ کون سا احساس ظاہر کر رہا ہے؟',
            'ur_rm': 'Yeh chehra kaun sa ehsaas zahir kar raha hai?',
        }

        hints = {
            'en': f"Look at the gentle expression: the face is {target['en'].lower()}",
            'ur': f"چہرے کے تاثر کو دیکھیں: یہ {target['ur']} ہے",
            'ur_rm': f"Chehre ke taasur ko dekhein: yeh {target['ur_rm']} hai",
        }

        questions.append({
            'id': f'q{idx + 1}',
            'prompt': prompts.get(language, prompts['en']),
            'options': options,
            'correctAnswer': target.get(language, target['en']),
            'visualPrompt': {
                'type': 'emotion',
                'icon': target['icon'],
                'label': target.get(language, target['en']),
            },
            'hint': hints.get(language, hints['en']),
        })

    return {'questions': questions}

def build_routine_sequencing_content(difficulty: str, language: str) -> Dict[str, Any]:
    morning_routine = [
        {'en': 'Wake up', 'ur': 'جاگنا', 'ur_rm': 'Jaagna', 'icon': '⏰'},
        {'en': 'Brush teeth', 'ur': 'دانت صاف کرنا', 'ur_rm': 'Daant saaf karna', 'icon': '🪥'},
        {'en': 'Eat breakfast', 'ur': 'ناشتہ کرنا', 'ur_rm': 'Naashta karna', 'icon': '🥣'},
        {'en': 'Go to school', 'ur': 'سکول جانا', 'ur_rm': 'School jaana', 'icon': '🎒'},
    ]

    evening_routine = [
        {'en': 'Eat dinner', 'ur': 'رات کا کھانا کھانا', 'ur_rm': 'Raat ka khana', 'icon': '🍲'},
        {'en': 'Wash hands & face', 'ur': 'ہاتھ منہ دھونا', 'ur_rm': 'Haath munh dhona', 'icon': '🧼'},
        {'en': 'Read a story', 'ur': 'کہانی پڑھنا', 'ur_rm': 'Kahani parhna', 'icon': '📖'},
        {'en': 'Go to sleep', 'ur': 'سو جانا', 'ur_rm': 'So jaana', 'icon': '🌙'},
    ]

    tasks = [
        {'seq': morning_routine, 'currentIdx': 0, 'nextIdx': 1},
        {'seq': morning_routine, 'currentIdx': 1, 'nextIdx': 2},
        {'seq': evening_routine, 'currentIdx': 0, 'nextIdx': 1},
        {'seq': evening_routine, 'currentIdx': 2, 'nextIdx': 3},
    ]

    questions = []
    for i, task in enumerate(tasks):
        current = task['seq'][task['currentIdx']]
        correct_next = task['seq'][task['nextIdx']]

        distractors = [
            s for s in task['seq']
            if s['en'] != correct_next['en'] and s['en'] != current['en']
        ] + [
            s for s in evening_routine
            if s['en'] != correct_next['en'] and s['en'] != current['en']
        ]
        distractors = distractors[:2]

        options = [s.get(language, s['en']) for s in [correct_next] + distractors]
        random.shuffle(options)

        prompts = {
            'en': f'After "{current["en"]}", what comes next?',
            'ur': f'"{current["ur"]}" کے بعد کیا آتا ہے؟',
            'ur_rm': f'"{current["ur_rm"]}" ke baad kya aata hai?',
        }

        hints = {
            'en': f'Think about your routine: after {current["en"]}, it is time to {correct_next["en"].lower()}',
            'ur': f'سوچیں: {current["ur"]} کے بعد اگلا قدم {correct_next["ur"]} ہے۔',
            'ur_rm': f'Sochein: {current["ur_rm"]} ke baad agla step {correct_next["ur_rm"]} hai.',
        }

        questions.append({
            'id': f'q{i + 1}',
            'prompt': prompts.get(language, prompts['en']),
            'options': options,
            'correctAnswer': correct_next.get(language, correct_next['en']),
            'visualPrompt': {
                'type': 'routine',
                'icon': current['icon'],
                'label': current.get(language, current['en']),
            },
            'hint': hints.get(language, hints['en']),
        })

    return {'questions': questions}

ACTIVITY_BUILDERS = {
    'letter': build_letter_content,
    'number': build_number_content,
    'shape_color_match': build_shape_color_content,
    'counting': build_counting_content,
    'animal_matching': build_animal_matching_content,
    'emotion_learning': build_emotion_learning_content,
    'routine_sequencing': build_routine_sequencing_content,
}

def get_activity_content(activity_type: str, difficulty: str, language: str) -> Dict[str, Any]:
    builder = ACTIVITY_BUILDERS.get(activity_type)
    if not builder:
        # Fallback to letter
        builder = build_letter_content
    return builder(difficulty, language)
