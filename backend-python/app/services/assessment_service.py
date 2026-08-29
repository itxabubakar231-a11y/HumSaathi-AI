from typing import List, Dict, Any

CHILD_QUESTIONS = {
    'en': [
        {'id': 'c1', 'area': 'letters', 'skill': 'letters', 'prompt': 'Which letter is A?', 'options': ['A', 'B', 'C'], 'correctAnswer': 'A'},
        {'id': 'c2', 'area': 'letters', 'skill': 'letters', 'prompt': 'Which letter is M?', 'options': ['N', 'M', 'P'], 'correctAnswer': 'M'},
        {'id': 'c3', 'area': 'numbers', 'skill': 'numbers', 'prompt': 'Which number comes after 3?', 'options': ['2', '4', '5'], 'correctAnswer': '4'},
        {'id': 'c4', 'area': 'colors', 'skill': 'colors', 'prompt': 'What color is the sky on a clear day?', 'options': ['Blue', 'Red', 'Green'], 'correctAnswer': 'Blue'},
        {'id': 'c5', 'area': 'shapes', 'skill': 'shapes', 'prompt': 'How many sides does a triangle have?', 'options': ['2', '3', '4'], 'correctAnswer': '3'},
    ],
    'ur': [
        {'id': 'c1', 'area': 'letters', 'skill': 'letters', 'prompt': 'حرف A کون سا ہے؟', 'options': ['A', 'B', 'C'], 'correctAnswer': 'A'},
        {'id': 'c2', 'area': 'letters', 'skill': 'letters', 'prompt': 'حرف M کون سا ہے؟', 'options': ['N', 'M', 'P'], 'correctAnswer': 'M'},
        {'id': 'c3', 'area': 'numbers', 'skill': 'numbers', 'prompt': '3 کے بعد کون سا نمبر آتا ہے؟', 'options': ['2', '4', '5'], 'correctAnswer': '4'},
        {'id': 'c4', 'area': 'colors', 'skill': 'colors', 'prompt': 'صاف دن میں آسمان کا رنگ کیا ہوتا ہے؟', 'options': ['نیلا', 'سرخ', 'سبز'], 'correctAnswer': 'نیلا'},
        {'id': 'c5', 'area': 'shapes', 'skill': 'shapes', 'prompt': 'مثلث کے کتنے پہلو ہوتے ہیں؟', 'options': ['2', '3', '4'], 'correctAnswer': '3'},
    ],
    'ur_rm': [
        {'id': 'c1', 'area': 'letters', 'skill': 'letters', 'prompt': 'Kaun sa harf A hai?', 'options': ['A', 'B', 'C'], 'correctAnswer': 'A'},
        {'id': 'c2', 'area': 'letters', 'skill': 'letters', 'prompt': 'Kaun sa harf M hai?', 'options': ['N', 'M', 'P'], 'correctAnswer': 'M'},
        {'id': 'c3', 'area': 'numbers', 'skill': 'numbers', 'prompt': '3 ke baad kaun sa number aata hai?', 'options': ['2', '4', '5'], 'correctAnswer': '4'},
        {'id': 'c4', 'area': 'colors', 'skill': 'colors', 'prompt': 'Saaf din mein aasmaan ka rang kya hota hai?', 'options': ['Neela', 'Surkh', 'Sabz'], 'correctAnswer': 'Neela'},
        {'id': 'c5', 'area': 'shapes', 'skill': 'shapes', 'prompt': 'Musallas ke kitne pehlu hote hain?', 'options': ['2', '3', '4'], 'correctAnswer': '3'},
    ],
}

TEEN_QUESTIONS = {
    'en': [
        {'id': 't1', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': 'What does "grateful" mean?', 'options': ['Thankful', 'Angry', 'Tired'], 'correctAnswer': 'Thankful'},
        {'id': 't2', 'area': 'reading', 'skill': 'reading', 'prompt': 'If the sign says "Quiet Zone", you should:', 'options': ['Whisper or stay silent', 'Shout', 'Run'], 'correctAnswer': 'Whisper or stay silent'},
        {'id': 't3', 'area': 'problem_solving', 'skill': 'problem_solving', 'prompt': 'You have Rs. 50 and a snack costs Rs. 30. How much is left?', 'options': ['Rs. 10', 'Rs. 20', 'Rs. 30'], 'correctAnswer': 'Rs. 20'},
        {'id': 't4', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': 'Which word means "to help"?', 'options': ['Assist', 'Ignore', 'Hide'], 'correctAnswer': 'Assist'},
        {'id': 't5', 'area': 'reading', 'skill': 'reading', 'prompt': '"Please wait in line" means:', 'options': ['Stand in order patiently', 'Cut in front', 'Leave immediately'], 'correctAnswer': 'Stand in order patiently'},
    ],
    'ur': [
        {'id': 't1', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': '"شکرگزار" کا مطلب کیا ہے؟', 'options': ['ممنون', 'غصہ', 'تھکا'], 'correctAnswer': 'ممنون'},
        {'id': 't2', 'area': 'reading', 'skill': 'reading', 'prompt': 'اگر نشان "خاموش علاقہ" کہتا ہے تو آپ:', 'options': ['آہستہ بولیں', 'چلائیں', 'دوڑیں'], 'correctAnswer': 'آہستہ بولیں'},
        {'id': 't3', 'area': 'problem_solving', 'skill': 'problem_solving', 'prompt': 'آپ کے پاس 50 روپے ہیں، ناشتہ 30 روپے کا ہے۔ کتنے بچیں گے؟', 'options': ['10', '20', '30'], 'correctAnswer': '20'},
        {'id': 't4', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': 'کون سا لفظ "مدد" کا مطلب ہے؟', 'options': ['مدد کرنا', 'نظر انداز', 'چھپانا'], 'correctAnswer': 'مدد کرنا'},
        {'id': 't5', 'area': 'reading', 'skill': 'reading', 'prompt': '"براہ کرم قطار میں انتظار کریں" کا مطلب:', 'options': ['صبر سے قطار میں کھڑے رہیں', 'آگے بڑھ جائیں', 'فوراً چلے جائیں'], 'correctAnswer': 'صبر سے قطار میں کھڑے رہیں'},
    ],
    'ur_rm': [
        {'id': 't1', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': '"Shukar guzar" ka matlab kya hai?', 'options': ['Mamnoon', 'Gussa', 'Thaka'], 'correctAnswer': 'Mamnoon'},
        {'id': 't2', 'area': 'reading', 'skill': 'reading', 'prompt': 'Agar nishaan "Khamosh ilaqa" kehta hai to aap:', 'options': ['Aahista bolain', 'Chillayen', 'Dorain'], 'correctAnswer': 'Aahista bolain'},
        {'id': 't3', 'area': 'problem_solving', 'skill': 'problem_solving', 'prompt': 'Aap ke paas 50 rupay hain, naashta 30 ka hai. Kitne bachenge?', 'options': ['10', '20', '30'], 'correctAnswer': '20'},
        {'id': 't4', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': 'Kaun sa lafz "madad" ka matlab hai?', 'options': ['Madad karna', 'Nazar andaaz', 'Chhupana'], 'correctAnswer': 'Madad karna'},
        {'id': 't5', 'area': 'reading', 'skill': 'reading', 'prompt': '"Barah e karam qataar mein intezar karein" ka matlab:', 'options': ['Sabr se qataar mein khade rahein', 'Aage barh jayein', 'Foran chale jayein'], 'correctAnswer': 'Sabr se qataar mein khade rahein'},
    ],
}

ADULT_QUESTIONS = {
    'en': [
        {'id': 'a1', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': 'What does "appointment" mean?', 'options': ['A scheduled meeting', 'A type of food', 'A bus ticket'], 'correctAnswer': 'A scheduled meeting'},
        {'id': 'a2', 'area': 'reading', 'skill': 'reading', 'prompt': 'A bill due on the 15th means you should pay:', 'options': ['By the 15th', 'Never', 'Only next year'], 'correctAnswer': 'By the 15th'},
        {'id': 'a3', 'area': 'problem_solving', 'skill': 'problem_solving', 'prompt': 'If a recipe needs 2 cups of rice and you double it, you need:', 'options': ['4 cups', '1 cup', '2 cups'], 'correctAnswer': '4 cups'},
        {'id': 'a4', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': '"Receipt" is:', 'options': ['Proof of payment', 'A greeting card', 'A weather report'], 'correctAnswer': 'Proof of payment'},
        {'id': 'a5', 'area': 'reading', 'skill': 'reading', 'prompt': '"Employees only" on a door means:', 'options': ['Only staff may enter', 'Everyone welcome', 'Open 24 hours'], 'correctAnswer': 'Only staff may enter'},
    ],
    'ur': [
        {'id': 'a1', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': '"Appointment" کا مطلب کیا ہے؟', 'options': ['طے شدہ ملاقات', 'قسم کا کھانا', 'بس ٹکٹ'], 'correctAnswer': 'طے شدہ ملاقات'},
        {'id': 'a2', 'area': 'reading', 'skill': 'reading', 'prompt': '15 تاریخ کو واجب الادا بل کا مطلب:', 'options': ['15 تک ادا کریں', 'کبھی نہیں', 'اگلے سال'], 'correctAnswer': '15 تک ادا کریں'},
        {'id': 'a3', 'area': 'problem_solving', 'skill': 'problem_solving', 'prompt': 'اگر ترکیب میں 2 کپ چاول چاہیے اور آپ دگنا کریں:', 'options': ['4 کپ', '1 کپ', '2 کپ'], 'correctAnswer': '4 کپ'},
        {'id': 'a4', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': '"Receipt" کیا ہے؟', 'options': ['ادائیگی کا ثبوت', 'Greeting card', 'موسم کی رپورٹ'], 'correctAnswer': 'ادائیگی کا ثبوت'},
        {'id': 'a5', 'area': 'reading', 'skill': 'reading', 'prompt': 'دروازے پر "صرف ملازمین" کا مطلب:', 'options': ['صرف عملہ داخل ہو سکتا ہے', 'سب خوش آمدید', '24 گھنٹے کھلا'], 'correctAnswer': 'صرف عملہ داخل ہو سکتا ہے'},
    ],
    'ur_rm': [
        {'id': 'a1', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': '"Appointment" ka matlab kya hai?', 'options': ['Tay shuda mulaqaat', 'Qism ka khana', 'Bus ticket'], 'correctAnswer': 'Tay shuda mulaqaat'},
        {'id': 'a2', 'area': 'reading', 'skill': 'reading', 'prompt': '15 tareekh ko wajib ul ada bill ka matlab:', 'options': ['15 tak ada karein', 'Kabhi nahi', 'Agle saal'], 'correctAnswer': '15 tak ada karein'},
        {'id': 'a3', 'area': 'problem_solving', 'skill': 'problem_solving', 'prompt': 'Agar tarkeeb mein 2 cup chawal chahiye aur aap dugna karein:', 'options': ['4 cup', '1 cup', '2 cup'], 'correctAnswer': '4 cup'},
        {'id': 'a4', 'area': 'vocabulary', 'skill': 'vocabulary', 'prompt': '"Receipt" kya hai?', 'options': ['Adaiygi ka saboot', 'Greeting card', 'Mausam ki report'], 'correctAnswer': 'Adaiygi ka saboot'},
        {'id': 'a5', 'area': 'reading', 'skill': 'reading', 'prompt': 'Darwaze par "Sirf mulazmeen" ka matlab:', 'options': ['Sirf staff dakhil ho sakta hai', 'Sab khush amdeed', '24 ghante khula'], 'correctAnswer': 'Sirf mulazmeen dakhil ho sakta hai'},
    ],
}

def get_assessment_questions(persona: str, language: str = 'en') -> List[Dict[str, Any]]:
    lang = language or 'en'
    if persona == 'child':
        return CHILD_QUESTIONS.get(lang, CHILD_QUESTIONS['en'])
    if persona == 'teen':
        return TEEN_QUESTIONS.get(lang, TEEN_QUESTIONS['en'])
    return ADULT_QUESTIONS.get(lang, ADULT_QUESTIONS['en'])
