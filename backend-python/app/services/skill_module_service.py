from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User, Progress
from app.services.ai.ai_service import call_ai_chat, is_ai_available

SKILL_MODULES_DATA = {
    'teen': [
        {
            'id': 'teen_reading_vocab',
            'skillKey': 'reading_vocabulary',
            'type': 'reading_vocabulary',
            'title': {
                'en': 'Reading & Vocabulary 📚',
                'ur': 'مطالعہ اور الفاظ 📚',
                'ur_rm': 'Reading & Vocabulary 📚',
            },
            'description': {
                'en': 'Short passage reading, vocabulary building, and comprehension understanding.',
                'ur': 'مختصر پیراگراف کا مطالعہ، الفاظ کے ذخیرے میں اضافہ اور فہم و ادراک۔',
                'ur_rm': 'Short passage reading, vocabulary building aur comprehension understanding.',
            },
            'icon': '📚',
            'scenarios': [
                {
                    'id': 'teen_rv_1',
                    'title': {
                        'en': 'Digital Habit & Study Focus',
                        'ur': 'ڈیجیٹل عادات اور پڑھائی پر توجہ',
                        'ur_rm': 'Digital Habit & Study Focus',
                    },
                    'passage': {
                        'en': 'Passage: "Digital distraction is a common challenge for students. Setting dedicated study blocks of 25 minutes (Pomodoro technique) helps retain focus, improve recall, and reduce cognitive fatigue."',
                        'ur': 'پیراگراف: "ڈیجیٹل خلفشار طلباء کے لیے ایک عام چیلنج ہے۔ 25 منٹ کا مسلسل مطالعہ توجہ برقرار رکھنے، یادداشت کو بہتر بنانے اور ذہنی تھکاوٹ کو کم کرنے میں مدد کرتا ہے۔"',
                        'ur_rm': 'Passage: "Digital distraction students ke liye common challenge hai. 25-minute dedicated study blocks focus maintain rakhne aur cognitive fatigue kam karne mein help karte hain."',
                    },
                    'vocabulary': {
                        'en': 'Key Words: Cognitive (mental/brain process), Retention (ability to remember), Discipline (self-control).',
                        'ur': 'اہم الفاظ: ادراک (ذہنی صلاحیت)، یادداشت (یاد رکھنے کی صلاحیت)، نظم و ضبط۔',
                        'ur_rm': 'Key Words: Cognitive (zehni salahiyat), Retention (yaad rakhne ki abilty), Discipline (self-control).',
                    },
                    'situation': {
                        'en': 'You are reading an article on study habits before an exam week. The author explains how to reduce smartphone interruptions while studying.',
                        'ur': 'آپ امتحان کے ہفتے سے پہلے مطالعے کی عادات پر ایک مضمون پڑھ رہے ہیں۔ مصنف بتاتا ہے کہ پڑھائی کے دوران اسمارٹ فون کی مداخلت کو کیسے کم کیا جائے۔',
                        'ur_rm': 'Aap exam week se pehle study habits par article parh rahe hain. Author explain kar raha hai ke study ke waqt phone distractions kaise kam karein.',
                    },
                    'prompt': {
                        'en': 'Based on the passage, what is the main benefit of dedicated 25-minute study blocks?',
                        'ur': 'پیراگراف کی روشنی میں، 25 منٹ کے مطالعے کا بنیادی فائدہ کیا ہے؟',
                        'ur_rm': 'Passage ke mutabiq, 25-minute study block ka main benefit kya hai?',
                    },
                    'options': [
                        {
                            'id': 'opt_rv_1',
                            'text': {
                                'en': 'It improves focus and memory retention while preventing mental fatigue.',
                                'ur': 'یہ ذہنی تھکاوٹ کو روکتے ہوئے توجہ اور یادداشت کو بہتر بناتا ہے۔',
                                'ur_rm': 'Yeh focus aur memory retention improve karta hai aur mental fatigue kam karta hai.',
                            },
                            'score': 95,
                            'feedback': {
                                'en': 'Correct comprehension! You captured the central message of the passage accurately.',
                                'ur': 'بہترین فہم! آپ نے مضمون کے مرکزی پیغام کو درست طریقے سے سمجھا۔',
                                'ur_rm': 'Zabardast comprehension! Aap ne central point bilkul sahi samjha.',
                            },
                            'consequences': {
                                'en': 'Applying structured study blocks helps you study smarter during exam prep.',
                                'ur': 'اس طریقے سے پڑھائی کرنے سے آپ امتحانات میں بہتر نتائج حاصل کر سکتے ہیں۔',
                                'ur_rm': 'Is technique se aap exams mein smart study kar sakte hain.',
                            },
                        },
                        {
                            'id': 'opt_rv_2',
                            'text': {
                                'en': 'It allows you to use your phone for 25 minutes non-stop.',
                                'ur': 'یہ آپ کو 25 منٹ تک مسلسل فون استعمال کرنے کی اجازت دیتا ہے۔',
                                'ur_rm': 'Yeh aap ko 25 minutes non-stop phone use karne ki permission deta hai.',
                            },
                            'score': 40,
                            'feedback': {
                                'en': 'Notice the passage states study blocks of 25 minutes, not phone usage time.',
                                'ur': 'توجہ دیں، مضمون میں 25 منٹ پڑھائی کی بات کی گئی ہے، فون کے استعمال کی نہیں۔',
                                'ur_rm': 'Dhyan dein, passage mein 25 minutes study block ki baat hui hai, phone usage ki nahi.',
                            },
                            'consequences': {
                                'en': 'Misinterpreting instructions can lead to missed study goals.',
                                'ur': 'ہدایات کو غلط سمجھنے سے پڑھائی کا نقصان ہو سکتا ہے۔',
                                'ur_rm': 'Instructions misinterpret karne se study goals poore nahi hote.',
                            },
                        },
                    ],
                },
            ],
        },
        {
            'id': 'teen_problem_solving',
            'skillKey': 'problem_solving',
            'type': 'problem_solving',
            'title': {
                'en': 'Problem Solving 🧩',
                'ur': 'مسائل کا حل 🧩',
                'ur_rm': 'Problem Solving 🧩',
            },
            'description': {
                'en': 'Analyze school, friendship, and project challenges, think through solutions, and evaluate outcomes.',
                'ur': 'اسکول، دوستی، اور پروجیکٹ کے مسائل کا تجزیہ کریں، حل تلاش کریں اور نتائج کو سمجھیں۔',
                'ur_rm': 'School, dosti, aur project ke masail analyze karein, solution dhoondein aur consequences samjhein.',
            },
            'icon': '🧩',
            'scenarios': [
                {
                    'id': 'teen_ps_1',
                    'title': {
                        'en': 'Unresponsive Group Project Partner',
                        'ur': 'گروپ پروجیکٹ پارٹنر جو جواب نہیں دے رہا',
                        'ur_rm': 'Group Project Partner Jo Jawab Nahi De Raha',
                    },
                    'situation': {
                        'en': 'You and a classmate have a science presentation due in 2 days. Your partner was supposed to finish the slides, but hasn’t responded to messages for 24 hours. The deadline is approaching fast.',
                        'ur': 'آپ اور آپ کے ہم جماعت کو 2 دن میں سائنس کی پریزنٹیشن جمع کرانی ہے۔ آپ کے پارٹنر کو سلائیڈز مکمل کرنی تھیں لیکن وہ 24 گھنٹے سے پیغامات کا جواب نہیں دے رہا۔ ڈیڈلائن قریب ہے۔',
                        'ur_rm': 'Aap aur aap ke classmate ko 2 din mein science presentation deni hai. Partner ko slides banani theen magar woh 24 hours se reply nahi kar raha. Deadline qareeb hai.',
                    },
                    'prompt': {
                        'en': 'What is the best way to handle this situation?',
                        'ur': 'اس صورتحال سے نمٹنے کا بہترین طریقہ کیا ہے؟',
                        'ur_rm': 'Is situation ko handle karne ka behtareen tareeqa kya hai?',
                    },
                    'options': [
                        {
                            'id': 'opt_1',
                            'text': {
                                'en': 'Send a polite, clear message setting a check-in time, start a backup outline, and inform the teacher if there is no response by evening.',
                                'ur': 'ایک شائستہ اور واضح پیغام بھیجیں جس میں ٹائم لائن بتائیں، بیک اپ آؤٹ لائن شروع کریں، اور اگر شام تک جواب نہ آئے تو ٹیچر کو آگاہ کریں۔',
                                'ur_rm': 'Aik polite aur clear message bhejein timeline ke sath, backup outline shuru karein, aur shaam tak reply na aane par teacher ko inform karein.',
                            },
                            'score': 95,
                            'feedback': {
                                'en': 'Excellent approach! This stays proactive, respectful, and ensures you protect your project grade without unnecessary drama.',
                                'ur': 'بہترین طریقہ! یہ ذمہ دارانہ، باوقار ہے اور آپ کے گریڈ کو محفوظ رکھتا ہے۔',
                                'ur_rm': 'Zabardast approach! Yeh proactive aur respectful hai aur aap ke grade ko safe rakhta hai.',
                            },
                            'consequences': {
                                'en': 'You maintain control over your grade while giving your partner a clear chance to contribute.',
                                'ur': 'آپ کو اپنے کام پر کنٹرول ملتا ہے اور ساتھی کو بھی موقع ملتا ہے۔',
                                'ur_rm': 'Aap ka kaam time par hoga aur partner ko bhi mauqa milega.',
                            },
                            'betterApproach': {
                                'en': 'Keep screenshots of communications in case the teacher asks for verification.',
                                'ur': 'پیغامات کا ریکارڈ رکھیں تاکہ ضرورت پڑنے پر ٹیچر کو دکھا سکیں۔',
                                'ur_rm': 'Messages ka record rakhein agar teacher verification maange.',
                            },
                        },
                        {
                            'id': 'opt_2',
                            'text': {
                                'en': 'Do the entire project alone right away and do not put your partner’s name on it.',
                                'ur': 'فورا سارا کام اکیلے خود کریں اور پارٹنر کا نام بالکل شامل نہ کریں۔',
                                'ur_rm': 'Foran saara kaam akele karein aur partner ka naam include na karein.',
                            },
                            'score': 60,
                            'feedback': {
                                'en': 'Understandable frustration, but doing it alone without communicating first can create conflict and unnecessary stress.',
                                'ur': 'آپ کا غصہ سمجھ آتا ہے، لیکن بات کیے بغیر ایسا کرنے سے کشیدگی بڑھ سکتی ہے۔',
                                'ur_rm': 'Gussa samajh aata hai, magar bina baat kiye akele sab karna stress barhata hai.',
                            },
                            'consequences': {
                                'en': 'You carry double the workload and might face a conflict when presenting.',
                                'ur': 'آپ پر کام کا دوگنا بوجھ آئے گا اور پریزنٹیشن کے وقت مسئلہ ہو سکتا ہے۔',
                                'ur_rm': 'Aap par extra stress aayega aur presentation ke time behs ho sakti hai.',
                            },
                        },
                    ],
                },
            ],
        },
        {
            'id': 'teen_communication',
            'skillKey': 'communication',
            'type': 'communication',
            'title': {
                'en': 'Communication 💬',
                'ur': 'گفتگو اور سماجی مہارتیں 💬',
                'ur_rm': 'Communication 💬',
            },
            'description': {
                'en': 'Everyday communication scenarios, choosing appropriate responses, and practicing respectful interactions.',
                'ur': 'روزمرہ کی گفتگو کے حالات، مناسب جوابات کا انتخاب اور باوقار انداز۔',
                'ur_rm': 'Everyday communication scenarios, choosing appropriate responses, aur situation-based practice.',
            },
            'icon': '💬',
            'redirectToScenarios': True,
            'categoryFilter': 'teen',
        },
    ],
    'adult': [
        {
            'id': 'adult_functional_reading',
            'skillKey': 'functional_reading',
            'type': 'functional_reading',
            'title': {
                'en': 'Functional Reading 📄',
                'ur': 'عملی مطالعہ 📄',
                'ur_rm': 'Functional Reading 📄',
            },
            'description': {
                'en': 'Read street signs, official messages, shop notices, and workplace instructions accurately.',
                'ur': 'سڑک کے اشارے، سرکاری پیغامات، دکانوں کے نوٹس اور کام کی ہدایات درست طریقے سے پڑھیں۔',
                'ur_rm': 'Read street/shop signs, simple messages, aur workplace instructions accurately.',
            },
            'icon': '📄',
            'scenarios': [
                {
                    'id': 'adult_fr_1',
                    'title': {
                        'en': 'Workplace Safety & Maintenance Notice',
                        'ur': 'کام کی جگہ پر تحفظ اور دیکھ بھال کا نوٹس',
                        'ur_rm': 'Workplace Safety Notice',
                    },
                    'passage': {
                        'en': 'Notice: "LIFT 2 IS UNDER MAINTENANCE TODAY UNTIL 3:00 PM. PLEASE USE LIFT 1 OR STAIRS FOR FLOORS 1-4. FOR HEAVY FREIGHT DELIVERIES, CONTACT BUILDING SECURITY."',
                        'ur': 'نوٹس: "لفٹ 2 کی آج شام 3 بجے تک دیکھ بھال جاری ہے۔ براہ کرم منزل 1-4 کے لیے لفٹ 1 یا سیڑھیاں استعمال کریں۔ بھاری سامان کی فراہمی کے لیے بلڈنگ سیکورٹی سے رابطہ کریں۔"',
                        'ur_rm': 'Notice: "LIFT 2 UNDER MAINTENANCE TODAY UNTIL 3:00 PM. USE LIFT 1 OR STAIRS FOR FLOORS 1-4. FOR HEAVY FREIGHT, CONTACT SECURITY."',
                    },
                    'vocabulary': {
                        'en': 'Key Words: Maintenance (repair work), Freight (heavy goods), Security (safety staff).',
                        'ur': 'اہم الفاظ: دیکھ بھال (مرمت کا کام)، مال برداری (بھاری سامان)، سیکیورٹی۔',
                        'ur_rm': 'Key Words: Maintenance (repair work), Freight (heavy goods), Security.',
                    },
                    'situation': {
                        'en': 'You arrive at your office building carrying a light briefcase and need to get to the 3rd floor at 11:00 AM.',
                        'ur': 'آپ صبح 11 بجے ہلکے بریف کیس کے ساتھ اپنے دفتر پہنچتے ہیں اور آپ کو تیسری منزل پر جانا ہے۔',
                        'ur_rm': 'Aap 11:00 AM par office pahunchte hain aur 3rd floor par jana hai.',
                    },
                    'prompt': {
                        'en': 'Based on the notice, what is the correct action to take?',
                        'ur': 'نوٹس کے مطابق آپ کو کیا اقدام کرنا چاہیے؟',
                        'ur_rm': 'Notice ke mutabiq sahi action kya hai?',
                    },
                    'options': [
                        {
                            'id': 'opt_fr_1',
                            'text': {
                                'en': 'Use Lift 1 or take the stairs to reach the 3rd floor.',
                                'ur': 'تیسری منزل پر جانے کے لیے لفٹ 1 یا سیڑھیاں استعمال کریں۔',
                                'ur_rm': 'Lift 1 use karein ya stairs se 3rd floor jayein.',
                            },
                            'score': 95,
                            'feedback': {
                                'en': 'Accurate functional reading! You correctly followed the notice directions.',
                                'ur': 'درست مطالعہ! آپ نے نوٹس کی ہدایات پر صحیح عمل کیا۔',
                                'ur_rm': 'Sahi functional reading! Aap ne notice follow kiya.',
                            },
                            'consequences': {
                                'en': 'You reach your meeting smoothly without waiting at a disabled lift.',
                                'ur': 'آپ بنا کسی تاخیر کے اپنی میٹنگ میں وقت پر پہنچ گئے۔',
                                'ur_rm': 'Aap time par 3rd floor pahunch jayenge.',
                            },
                        },
                        {
                            'id': 'opt_fr_2',
                            'text': {
                                'en': 'Call building security to carry your light briefcase.',
                                'ur': 'ہلکے بریف کیس کے لیے بلڈنگ سیکورٹی کو کال کریں۔',
                                'ur_rm': 'Light briefcase ke liye security ko call karein.',
                            },
                            'score': 35,
                            'feedback': {
                                'en': 'Notice that security assistance is only specified for heavy freight deliveries.',
                                'ur': 'نوٹس میں سیکورٹی کی مدد صرف بھاری سامان کی فراہمی کے لیے لکھی گئی ہے۔',
                                'ur_rm': 'Security help sirf heavy freight delivery ke liye likhi hai.',
                            },
                        },
                    ],
                },
            ],
        },
        {
            'id': 'adult_problem_solving',
            'skillKey': 'problem_solving',
            'type': 'problem_solving',
            'title': {
                'en': 'Everyday Problem Solving 🧩',
                'ur': 'روزمرہ مسائل کا حل 🧩',
                'ur_rm': 'Everyday Problem Solving 🧩',
            },
            'description': {
                'en': 'Practical decisions involving shopping, price comparisons, time scheduling, money management, and daily logistics.',
                'ur': 'خریداری، قیمتوں کا موازنہ، وقت کا شیڈول، رقم کا انتظام اور روزمرہ کے فیصلے کریں۔',
                'ur_rm': 'Shopping, time, money management, and practical daily decisions.',
            },
            'icon': '🧩',
            'scenarios': [
                {
                    'id': 'adult_ps_1',
                    'title': {
                        'en': 'Grocery Budget & Best Value Choice',
                        'ur': 'گروسری بجٹ اور بہترین قیمت کا انتخاب',
                        'ur_rm': 'Grocery Budget & Best Value Choice',
                    },
                    'situation': {
                        'en': 'You have Rs. 1,000 to buy cooking oil for the month. Brand A costs Rs. 850 for 1 Liter. Brand B costs Rs. 950 for 1.5 Liters (on special discount). You want maximum value within budget.',
                        'ur': 'آپ کے پاس گروسری کے لیے 1000 روپے ہیں۔ برانڈ A کی قیمت 1 لیٹر کی 850 روپے ہے۔ برانڈ B خصوصی رعایت پر 1.5 لیٹر 950 روپے کا دے رہا ہے۔ آپ بجٹ میں بہترین مقدار چاہتے ہیں۔',
                        'ur_rm': 'Aap ke paas Rs. 1,000 hain. Brand A 1 Liter Rs. 850 ka hai. Brand B 1.5 Liters discount par Rs. 950 ka hai. Aap budget mein best value chahte hain.',
                    },
                    'prompt': {
                        'en': 'Which buying choice gives you the best everyday value within your Rs. 1,000 budget?',
                        'ur': '1000 روپے کے بجٹ میں کون سا انتخاب آپ کو بہترین مقدار دیتا ہے؟',
                        'ur_rm': 'Rs. 1,000 budget mein konsa option best value deta hai?',
                    },
                    'options': [
                        {
                            'id': 'ad_ps_opt_1',
                            'text': {
                                'en': 'Buy Brand B (1.5L for Rs. 950) because it stays within your Rs. 1,000 limit and provides 50% more volume for just Rs. 100 more.',
                                'ur': 'برانڈ B (1.5 لیٹر 950 روپے میں) خریدیں کیونکہ یہ 1000 روپے کے اندر رہتا ہے اور صرف 100 روپے اضافے پر 50٪ زیادہ مقدار دیتا ہے۔',
                                'ur_rm': 'Brand B lein (1.5L for Rs. 950) kyunki yeh Rs. 1,000 budget mein hai aur Rs. 100 extra par 50% ziada oil milta hai.',
                            },
                            'score': 95,
                            'feedback': {
                                'en': 'Smart everyday financial decision! You calculated unit value while strictly respecting your budget limit.',
                                'ur': 'زبردست مالیاتی فیصلہ! آپ نے بجٹ کا احترام کرتے ہوئے بہترین بچت کی۔',
                                'ur_rm': 'Smart everyday money decision! Aap ne budget ke andar best value calculate ki.',
                            },
                            'consequences': {
                                'en': 'You save money in the long run and remain Rs. 50 under your cash limit.',
                                'ur': 'آپ طویل المدتی بچت کرتے ہیں اور 50 روپے نقد باقی رہتے ہیں۔',
                                'ur_rm': 'Long run mein bachat hogi aur Rs. 50 cash bhi bach jayenge.',
                            },
                        },
                        {
                            'id': 'ad_ps_opt_2',
                            'text': {
                                'en': 'Buy Brand A (1L for Rs. 850) and also buy a Rs. 300 snack on credit.',
                                'ur': 'برانڈ A خریدیں اور ساتھ میں 300 روپے کا سنیک ادھار پر لیں۔',
                                'ur_rm': 'Brand A khareedein aur 300 ka snack credit par lein.',
                            },
                            'score': 40,
                            'feedback': {
                                'en': 'Going over your budget on credit causes unnecessary financial stress.',
                                'ur': 'بجٹ سے تجاوز کرنے سے مالی پریشانی ہو سکتی ہے۔',
                                'ur_rm': 'Budget se aage jana financial stress paida karta hai.',
                            },
                        },
                    ],
                },
            ],
        },
        {
            'id': 'adult_everyday_comm',
            'skillKey': 'everyday_communication',
            'type': 'everyday_communication',
            'title': {
                'en': 'Everyday Communication 🗣️',
                'ur': 'روزمرہ گفتگو 🗣️',
                'ur_rm': 'Everyday Communication 🗣️',
            },
            'description': {
                'en': 'Asking for help politely, making clear requests, asking for directions, and communicating respectfully.',
                'ur': 'شائستگی سے مدد مانگنا، واضح درخواست کرنا، راستے پوچھنا اور باوقار گفتگو۔',
                'ur_rm': 'Asking for help, making requests, asking directions, and responding politely.',
            },
            'icon': '🗣️',
            'redirectToScenarios': True,
            'categoryFilter': 'adult',
        },
    ],
}

def get_skill_modules(persona: str, language: str = 'en') -> List[Dict[str, Any]]:
    p = 'adult' if persona == 'adult' else 'teen'
    modules = SKILL_MODULES_DATA.get(p, SKILL_MODULES_DATA['teen'])

    return [
        {
            'id': m['id'],
            'skillKey': m['skillKey'],
            'type': m['type'],
            'icon': m['icon'],
            'title': m['title'].get(language, m['title']['en']),
            'description': m['description'].get(language, m['description']['en']),
            'scenarioCount': len(m.get('scenarios', [])),
            'redirectToScenarios': bool(m.get('redirectToScenarios')),
        }
        for m in modules
    ]

def get_skill_module_details(module_id: str, language: str = 'en') -> Optional[Dict[str, Any]]:
    found = None
    persona = 'teen'

    for p in ['teen', 'adult']:
        match = next((m for m in SKILL_MODULES_DATA[p] if m['id'] == module_id), None)
        if match:
            found = match
            persona = p
            break

    if not found:
        return None

    return {
        'id': found['id'],
        'skillKey': found['skillKey'],
        'type': found['type'],
        'icon': found['icon'],
        'persona': persona,
        'title': found['title'].get(language, found['title']['en']),
        'description': found['description'].get(language, found['description']['en']),
        'redirectToScenarios': bool(found.get('redirectToScenarios')),
        'scenarios': [
            {
                'id': s['id'],
                'title': s['title'].get(language, s['title']['en']),
                'passage': s['passage'].get(language, s['passage']['en']) if s.get('passage') else None,
                'vocabulary': s['vocabulary'].get(language, s['vocabulary']['en']) if s.get('vocabulary') else None,
                'situation': s['situation'].get(language, s['situation']['en']),
                'prompt': s['prompt'].get(language, s['prompt']['en']),
                'options': [
                    {
                        'id': o['id'],
                        'text': o['text'].get(language, o['text']['en']),
                    }
                    for o in s.get('options', [])
                ],
            }
            for s in found.get('scenarios', [])
        ],
    }

async def evaluate_skill_solution(
    db: Session,
    user_id: str,
    module_id: str,
    scenario_id: str,
    option_id: Optional[str] = None,
    custom_solution: Optional[str] = None,
) -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    language = user.language or "en"
    module_def = None
    scenario = None
    selected_option = None

    for p in ['teen', 'adult']:
        m = next((mod for mod in SKILL_MODULES_DATA[p] if mod['id'] == module_id), None)
        if m:
            module_def = m
            scenario = next((s for s in m.get('scenarios', []) if s['id'] == scenario_id), None)
            if scenario and option_id:
                selected_option = next((o for o in scenario.get('options', []) if o['id'] == option_id), None)
            break

    score = 85
    feedback_text = ""
    consequences_text = ""
    better_approach_text = ""

    if selected_option:
        score = selected_option.get('score', 85)
        feedback_text = selected_option['feedback'].get(language, selected_option['feedback']['en'])
        consequences_text = selected_option['consequences'].get(language, selected_option['consequences']['en'])
        better_approach = selected_option.get('betterApproach', {})
        better_approach_text = better_approach.get(language, better_approach.get('en', ''))

    if custom_solution and is_ai_available() and scenario:
        prompt = (
            f"You are an empathetic life-skills mentor for HumSaathi AI.\n"
            f"Scenario: {scenario['situation'].get(language, scenario['situation']['en'])}\n"
            f"User's custom proposal: \"{custom_solution}\"\n"
            f"Persona: {user.persona}. Language: {language}.\n\n"
            f"Evaluate this response in JSON format:\n"
            f'{{\n  "score": 85,\n  "feedback": "<encouraging feedback>",\n  "consequences": "<real-world outcome>",\n  "betterApproach": "<constructive tip>"\n}}'
        )
        messages = [
            {"role": "system", "content": "Return valid JSON only."},
            {"role": "user", "content": prompt},
        ]
        ai_eval = await call_ai_chat(messages, temperature=0.3)
        if ai_eval and isinstance(ai_eval, dict):
            score = int(ai_eval.get("score", score))
            feedback_text = ai_eval.get("feedback", feedback_text)
            consequences_text = ai_eval.get("consequences", consequences_text)
            better_approach_text = ai_eval.get("betterApproach", better_approach_text)

    # Upsert Progress for this skillKey
    skill_key = module_def.get('skillKey', 'problem_solving') if module_def else 'problem_solving'
    existing = db.query(Progress).filter(Progress.userId == user_id, Progress.skill == skill_key).first()

    prev_attempts = existing.attempts if existing else 0
    prev_accuracy = existing.accuracy if existing else 0.0
    new_attempts = prev_attempts + 1
    new_accuracy = ((prev_accuracy * prev_attempts) + (score / 100)) / new_attempts

    if existing:
        existing.accuracy = new_accuracy
        existing.attempts = new_attempts
        existing.updatedAt = datetime.utcnow()
    else:
        p = Progress(
            userId=user_id,
            skill=skill_key,
            level="easy",
            accuracy=new_accuracy,
            attempts=1,
        )
        db.add(p)

    db.commit()

    return {
        "score": score,
        "feedback": feedback_text,
        "consequences": consequences_text,
        "betterApproach": better_approach_text,
    }
