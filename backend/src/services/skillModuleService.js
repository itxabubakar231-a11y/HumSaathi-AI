import prisma from '../lib/prisma.js';
import { callAiChat, isAiAvailable } from './ai/aiService.js';
import { parseJson } from '../utils/constants.js';

export const SKILL_MODULES_DATA = {
  "teen": [
    {
      "id": "teen_reading_vocab",
      "skillKey": "reading_vocabulary",
      "type": "reading_vocabulary",
      "title": {
        "en": "Reading & Vocabulary 📚",
        "ur": "مطالعہ اور الفاظ 📚",
        "ur_rm": "Reading & Vocabulary 📚"
      },
      "description": {
        "en": "Real-world passages, vocabulary in context, meaning selection, and comprehension practice.",
        "ur": "حقیقی دنیا کے مضامین، سیاق و سباق میں الفاظ کا فہم، معانی کا انتخاب اور فہم و ادراک۔",
        "ur_rm": "Real-world passages, vocabulary in context, meaning selection, aur comprehension practice."
      },
      "icon": "📚",
      "scenarios": [
        {
          "id": "teen_rv_1",
          "difficulty": "easy",
          "category": "reading_comprehension",
          "title": {
            "en": "Digital Habits & Study Focus",
            "ur": "ڈیجیٹل عادات اور پڑھائی پر توجہ",
            "ur_rm": "Digital Habits & Study Focus"
          },
          "passage": {
            "en": "Passage: \"Digital distraction is a common challenge for students. Setting dedicated study blocks of 25 minutes (Pomodoro technique) helps retain focus, improve recall, and reduce cognitive fatigue.\"",
            "ur": "پیراگراف: \"ڈیجیٹل خلفشار طلباء کے لیے ایک عام چیلنج ہے۔ 25 منٹ کا مسلسل مطالعہ توجہ برقرار رکھنے، یادداشت کو بہتر بنانے اور ذہنی تھکاوٹ کو کم کرنے میں مدد کرتا ہے۔\"",
            "ur_rm": "Passage: \"Digital distraction students ke liye common challenge hai. 25-minute dedicated study blocks focus maintain rakhne aur cognitive fatigue kam karne mein help karte hain.\""
          },
          "vocabulary": {
            "en": "Key Words: Cognitive (mental/brain process), Retention (ability to remember), Discipline (self-control).",
            "ur": "اہم الفاظ: ادراک (ذہنی صلاحیت)، یادداشت (یاد رکھنے کی صلاحیت)، نظم و ضبط۔",
            "ur_rm": "Key Words: Cognitive (zehni salahiyat), Retention (yaad rakhne ki ability), Discipline (self-control)."
          },
          "situation": {
            "en": "You are reading an article on study habits before an exam week. The author explains how to reduce smartphone interruptions while studying.",
            "ur": "آپ امتحان کے ہفتے سے پہلے مطالعے کی عادات پر ایک مضمون پڑھ رہے ہیں۔ مصنف بتاتا ہے کہ پڑھائی کے دوران اسمارٹ فون کی مداخلت کو کیسے کم کیا جائے۔",
            "ur_rm": "Aap exam week se pehle study habits par article parh rahe hain. Author explain kar raha hai ke study ke waqt phone distractions kaise kam karein."
          },
          "prompt": {
            "en": "Based on the passage, what is the main benefit of dedicated 25-minute study blocks?",
            "ur": "پیراگراف کی روشنی میں، 25 منٹ کے مطالعے کا بنیادی فائدہ کیا ہے؟",
            "ur_rm": "Passage ke mutabiq, 25-minute study block ka main benefit kya hai?"
          },
          "options": [
            {
              "id": "opt_rv_1_a",
              "text": {
                "en": "It boosts concentration and memory retention while preventing mental burnout.",
                "ur": "یہ ذہنی تھکاوٹ کو روکتے ہوئے توجہ اور یادداشت کو بہتر بناتا ہے۔",
                "ur_rm": "Yeh focus aur memory retention improve karta hai aur mental fatigue kam karta hai."
              },
              "score": 95,
              "feedback": {
                "en": "Correct comprehension! You captured the central message of the passage accurately.",
                "ur": "بہترین فہم! آپ نے مضمون کے مرکزی پیغام کو درست طریقے سے سمجھا۔",
                "ur_rm": "Zabardast comprehension! Aap ne central point bilkul sahi samjha."
              },
              "consequences": {
                "en": "Applying structured study blocks helps you study smarter during exam prep.",
                "ur": "اس طریقے سے پڑھائی کرنے سے آپ امتحانات میں بہتر نتائج حاصل کر سکتے ہیں۔",
                "ur_rm": "Is technique se aap exams mein smart study kar sakte hain."
              }
            },
            {
              "id": "opt_rv_1_b",
              "text": {
                "en": "It gives you 25 minutes of unrestricted phone browsing between questions.",
                "ur": "یہ آپ کو سوالات کے درمیان 25 منٹ تک آزادانہ فون استعمال کرنے کی اجازت دیتا ہے۔",
                "ur_rm": "Yeh aap ko questions ke darmiyan 25 minutes phone browsing ki ijazat deta hai."
              },
              "score": 40,
              "feedback": {
                "en": "The passage states 25 minutes is for dedicated study, not social media browsing.",
                "ur": "پیراگراف کے مطابق 25 منٹ پڑھائی کے لیے ہیں، سوشل میڈیا کے لیے نہیں۔",
                "ur_rm": "Passage ke mutabiq 25 minutes dedicated study ke liye hain, social media ke liye nahi."
              },
              "consequences": {
                "en": "Misinterpreting study guidelines leads to unintended procrastination.",
                "ur": "رہنمائی کو غلط سمجھنے سے وقت ضائع ہو سکتا ہے۔",
                "ur_rm": "Guidelines misinterpret karne se waqt zaya hota hai."
              }
            },
            {
              "id": "opt_rv_1_c",
              "text": {
                "en": "It guarantees complete memorization of an entire textbook in a single evening.",
                "ur": "یہ ایک ہی شام میں پوری درسی کتاب کو مکمل طور پر یاد کرنے کی ضمانت دیتا ہے۔",
                "ur_rm": "Yeh aik hi shaam mein poori textbook memorize karne ki guarantee deta hai."
              },
              "score": 35,
              "feedback": {
                "en": "The passage describes manageable focus intervals, not overnight memorization shortcuts.",
                "ur": "مضمون میں منظم مطالعے کا ذکر ہے، راتوں رات کتابیں حفظ کرنے کا نہیں۔",
                "ur_rm": "Passage structured study intervals ki baat karta hai, shortcut memorization ki nahi."
              },
              "consequences": {
                "en": "Unrealistic study expectations can cause unnecessary exam stress.",
                "ur": "غیر حقیقت پسندانہ توقعات امتحانی تناؤ کا باعث بنتی ہیں۔",
                "ur_rm": "Unrealistic expectations se exam stress barh jata hai."
              }
            },
            {
              "id": "opt_rv_1_d",
              "text": {
                "en": "It eliminates the need to review difficult notes before semester tests.",
                "ur": "یہ سمسٹر ٹیسٹ سے پہلے مشکل نوٹس کو دوبارہ پڑھنے کی ضرورت ختم کر دیتا ہے۔",
                "ur_rm": "Yeh tests se pehle difficult notes review karne ki zaroorat khatam kar deta hai."
              },
              "score": 30,
              "feedback": {
                "en": "Study intervals improve focus during review, they do not replace regular revision.",
                "ur": "مطالعے کے وقفے فہم کو بہتر بناتے ہیں، لیکن باقاعدہ دہرائی کا متبادل نہیں ہیں۔",
                "ur_rm": "Study intervals focus barhate hain, revision ka substitute nahi hain."
              },
              "consequences": {
                "en": "Skipping regular revision increases the risk of forgetting key concepts.",
                "ur": "دہرائی چھوڑنے سے اہم تصورات بھولنے کا خطرہ رہتا ہے۔",
                "ur_rm": "Revision skip karne se key concepts bhoolne ka risk rehta hai."
              }
            }
          ]
        },
        {
          "id": "teen_rv_2",
          "difficulty": "easy",
          "category": "vocab_in_context",
          "title": {
            "en": "Vocabulary in Context: Morning Hydration & Energy",
            "ur": "سیاق و سباق میں الفاظ: صبح کی ہائیڈریشن اور توانائی",
            "ur_rm": "Vocabulary in Context: Morning Hydration & Energy"
          },
          "passage": {
            "en": "Passage: \"Beginning the day with intentional hydration elevates energy levels and enhances cognitive alertness throughout morning classes.\"",
            "ur": "پیراگراف: \"دن کا آغاز مناسب مقدار میں پانی پی کر کرنے سے توانائی کی سطح بلند ہوتی ہے اور صبح کی کلاسز میں ذہنی چوکسی میں اضافہ ہوتا ہے۔\"",
            "ur_rm": "Passage: \"Din ka aaghaz intentional hydration se karne se energy level barhta hai aur morning classes mein cognitive alertness behtar hoti hai.\""
          },
          "vocabulary": {
            "en": "Word Focus: Intentional (deliberate), Elevates (raises / boosts), Alertness (state of being attentive).",
            "ur": "الفاظ پر توجہ: ارادی (سوچ سمجھ کر)، بڑھانا (بلند کرنا)، چوکسی (ہوشیار رہنا)۔",
            "ur_rm": "Word Focus: Intentional (soch samajh kar), Elevates (barhana), Alertness (hoshiyar rehna)."
          },
          "situation": {
            "en": "You are reading a student health guide about staying energetic during school hours.",
            "ur": "آپ اسکول کے دوران چست رہنے کے حوالے سے صحت سے متعلق ایک گائیڈ پڑھ رہے ہیں۔",
            "ur_rm": "Aap school hours ke dauran energetic rehne ke mutaliq student health guide parh rahe hain."
          },
          "prompt": {
            "en": "In this sentence, what does the word \"elevates\" mean most nearly?",
            "ur": "اس جملے میں لفظ \"elevates\" کا قریبی ترین مطلب کیا ہے؟",
            "ur_rm": "Is sentence mein word \"elevates\" ka qareebi matlab kya hai?"
          },
          "options": [
            {
              "id": "opt_rv_2_a",
              "text": {
                "en": "Slows down or gradually diminishes morning stamina.",
                "ur": "صبح کی طاقت کو کم یا بتدریج سست کرتا ہے۔",
                "ur_rm": "Morning stamina ko slow ya diminish karta hai."
              },
              "score": 30,
              "feedback": {
                "en": "\"Elevates\" means to lift up, not to diminish or slow down.",
                "ur": "\"Elevates\" کا مطلب بڑھانا ہے، کم کرنا یا سست کرنا نہیں۔",
                "ur_rm": "\"Elevates\" ka matlab lift up karna hai, diminish karna nahi."
              },
              "consequences": {
                "en": "Confusing antonyms can cause misunderstandings of health guidance.",
                "ur": "متضاد الفاظ کی غلط فہمی سے صحت کے مشورے الٹ سمجھے جا سکتے ہیں۔",
                "ur_rm": "Antonyms confuse karne se health advice ulti samajh aati hai."
              }
            },
            {
              "id": "opt_rv_2_b",
              "text": {
                "en": "Measures or records physical hydration in milliliters.",
                "ur": "پانی کی جسمانی مقدار کو ملی لیٹر میں ناپتا یا ریکارڈ کرتا ہے۔",
                "ur_rm": "Physical hydration ko milliliters mein measure karta hai."
              },
              "score": 45,
              "feedback": {
                "en": "\"Elevates\" expresses an increase in state, not measurement instruments.",
                "ur": "\"Elevates\" معیار یا حالت میں اضافے کو ظاہر کرتا ہے، پیمائش کو نہیں۔",
                "ur_rm": "\"Elevates\" increase ko express karta hai, measurement ko nahi."
              },
              "consequences": {
                "en": "Looking at how words function in context clarifies author intent.",
                "ur": "سیاق و سباق پر دھیان دینے سے مصنف کا اصل مقصد واضح ہوتا ہے۔",
                "ur_rm": "Context dekhne se author ka actual intent clear hota hai."
              }
            },
            {
              "id": "opt_rv_2_c",
              "text": {
                "en": "Increases, raises, or boosts to a higher level.",
                "ur": "بڑھاتا ہے، بلند کرتا ہے یا اعلیٰ سطح پر لے جاتا ہے۔",
                "ur_rm": "Increases, raises, ya higher level par boost karta hai."
              },
              "score": 95,
              "feedback": {
                "en": "Spot on! \"Elevates\" means to lift up or raise energy levels.",
                "ur": "بالکل درست! \"Elevates\" کا مطلب توانائی کی سطح کو بڑھانا اور بلند کرنا ہے۔",
                "ur_rm": "Bilkul sahi! \"Elevates\" ka matlab energy level boost karna hai."
              },
              "consequences": {
                "en": "Expanding contextual vocabulary sharpens your reading and standardized testing performance.",
                "ur": "الفاظ کے ذخیرے میں وسعت آپ کے مطالعے اور ٹیسٹ کے نتائج کو بہتر بناتی ہے۔",
                "ur_rm": "Vocabulary expansion reading comprehension aur test score improve karta hai."
              }
            },
            {
              "id": "opt_rv_2_d",
              "text": {
                "en": "Replaces the need for breakfast entirely during school days.",
                "ur": "اسکول کے دنوں میں ناشتے کی ضرورت کو مکمل طور پر ختم کر دیتا ہے۔",
                "ur_rm": "School days mein breakfast ki zaroorat ko poori tarah replace karta hai."
              },
              "score": 35,
              "feedback": {
                "en": "Hydration enhances alertness, but the sentence does not claim it replaces breakfast.",
                "ur": "پانی پینا چوکسی بڑھاتا ہے، مگر ناشتے کا مکمل متبادل نہیں ہے۔",
                "ur_rm": "Hydration energy barhata hai lekin breakfast ko replace nahi karta."
              },
              "consequences": {
                "en": "Drawing accurate inferences prevents overgeneralizing text statements.",
                "ur": "صحیح نتائج اخذ کرنا متن کی حد سے زیادہ تشریح سے بچاتا ہے۔",
                "ur_rm": "Accurate inferences text ko overgeneralize hone se bachate hain."
              }
            }
          ]
        },
        {
          "id": "teen_rv_3",
          "difficulty": "medium",
          "category": "reading_comprehension",
          "title": {
            "en": "Online Security & Two-Factor Authentication",
            "ur": "آن لائن سیکیورٹی اور ٹو فیکٹر تصدیق",
            "ur_rm": "Online Security & Two-Factor Authentication"
          },
          "passage": {
            "en": "Passage: \"Cybersecurity experts recommend enabling two-factor authentication (2FA) across social and academic accounts. Even if a malicious actor compromises your password, they cannot breach the account without the secondary verification code.\"",
            "ur": "پیراگراف: \"سائبر سیکیورٹی کے ماہرین سوشل اور تعلیمی اکاؤنٹس پر ٹو فیکٹر تصدیق (2FA) فعال کرنے کا مشورہ دیتے ہیں۔ اگر کوئی بدنیتی پر مبنی شخص آپ کا پاس ورڈ حاصل بھی کر لے، تب بھی وہ ثانوی تصدیقی کوڈ کے بغیر اکاؤنٹ تک رسائی حاصل نہیں کر سکتا۔\"",
            "ur_rm": "Passage: \"Cybersecurity experts academic aur social accounts par 2FA activate karne ka mashwara dete hain. Agar password leak bhi ho jaye, to second verification code ke bina account hack nahi ho sakta.\""
          },
          "vocabulary": {
            "en": "Key Words: Malicious (harmful / deceitful), Compromises (exposes to danger), Breach (break through security).",
            "ur": "اہم الفاظ: بدنیتی پر مبنی (نقصان دہ)، افشا ہونا (خطرے میں ڈالنا)، نقب زنی (سیکیورٹی توڑنا)۔",
            "ur_rm": "Key Words: Malicious (nuqsaan pohanchane wala), Compromises (expose hona), Breach (security torna)."
          },
          "situation": {
            "en": "You are setting up your student portal account and reading the IT department safety advice.",
            "ur": "آپ اپنے اسٹوڈنٹ پورٹل اکاؤنٹ کو سیٹ اپ کر رہے ہیں اور آئی ٹی ڈیپارٹمنٹ کی حفاظتی ہدایات پڑھ رہے ہیں۔",
            "ur_rm": "Aap student portal account set up kar rahe hain aur IT safety instructions parh rahe hain."
          },
          "prompt": {
            "en": "Why is Two-Factor Authentication effective even if someone learns your password?",
            "ur": "اگر کسی کو آپ کا پاس ورڈ معلوم بھی ہو جائے تو بھی ٹو فیکٹر تصدیق کیوں موثر ہے؟",
            "ur_rm": "Agar kisi ko password pata chal jaye tab bhi 2FA kyun effective hai?"
          },
          "options": [
            {
              "id": "opt_rv_3_a",
              "text": {
                "en": "It automatically disables internet access on any device trying to log in.",
                "ur": "یہ لاگ ان کی کوشش کرنے والی ہر ڈیوائس پر انٹرنیٹ کنکشن منقطع کر دیتا ہے۔",
                "ur_rm": "Yeh login attempt karne wali device par internet band kar deta hai."
              },
              "score": 35,
              "feedback": {
                "en": "2FA requires an additional identity token; it cannot remotely shut down internet hardware.",
                "ur": "2FA صرف ثانوی تصدیقی کوڈ مانگتا ہے، انٹرنیٹ بند نہیں کرتا۔",
                "ur_rm": "2FA secondary code maangta hai, device internet disable nahi karta."
              },
              "consequences": {
                "en": "Understanding accurate tech concepts keeps your digital security realistic.",
                "ur": "تکنیکی اصولوں کو درست سمجھنا سیکیورٹی کو مضبوط بناتا ہے۔",
                "ur_rm": "Correct tech understanding security awareness strong rakhti hai."
              }
            },
            {
              "id": "opt_rv_3_b",
              "text": {
                "en": "Access still requires a separate temporary verification code delivered directly to your device.",
                "ur": "کیونکہ رسائی کے لیے اب بھی دوسرے عارضی کوڈ کی ضرورت ہوتی ہے جو صرف آپ کے ذاتی ڈیوائس پر آتا ہے۔",
                "ur_rm": "Access ke liye abhi bhi separate temporary code chahiye jo sirf aap ki device par aata hai."
              },
              "score": 95,
              "feedback": {
                "en": "Excellent analytical reading! You extracted the core security mechanism accurately.",
                "ur": "شاندار فہم! آپ نے اہم سیکیورٹی اصول کو درست طریقے سے سمجھا۔",
                "ur_rm": "Excellent reading! Aap ne core security rule bilkul sahi extract kiya."
              },
              "consequences": {
                "en": "Understanding technical passages empowers you to protect your digital identity safely.",
                "ur": "تکنیکی مضامین کو سمجھنا آپ کی ڈیجیٹل شناخت کو محفوظ رکھنے میں مدد دیتا ہے۔",
                "ur_rm": "Technical passages samajhna digital safety ke liye zaroori hai."
              }
            },
            {
              "id": "opt_rv_3_c",
              "text": {
                "en": "It instantly changes your password to a random 50-digit sequence automatically.",
                "ur": "یہ فوری طور پر آپ کے پاس ورڈ کو 50 ہندسوں کے بے ترتیب کوڈ میں بدل دیتا ہے۔",
                "ur_rm": "Yeh password ko automatically random 50-digit sequence mein change kar deta hai."
              },
              "score": 40,
              "feedback": {
                "en": "2FA adds a second verification step rather than modifying your original chosen password.",
                "ur": "2FA ایک اضافی تصدیقی قدم ہے، یہ آپ کا پاس ورڈ خود سے نہیں بدلتا۔",
                "ur_rm": "2FA second verification step add karta hai, password change nahi karta."
              },
              "consequences": {
                "en": "Knowing how authentication works avoids confusion during account recovery.",
                "ur": "تصدیقی طریقہ کار کو سمجھنا اکاؤنٹ بحالی میں آسانی پیدا کرتا ہے۔",
                "ur_rm": "Auth workflow samajhne se account recovery aasan hoti hai."
              }
            },
            {
              "id": "opt_rv_3_d",
              "text": {
                "en": "It alerts the local police department whenever an incorrect password is entered.",
                "ur": "غلط پاس ورڈ درج ہوتے ہی یہ فوری طور پر پولیس کو اطلاع بھیج دیتا ہے۔",
                "ur_rm": "Incorrect password par yeh police department ko automatic alert bhejta hai."
              },
              "score": 25,
              "feedback": {
                "en": "2FA is an account security protocol, not an automated law enforcement dispatch.",
                "ur": "2FA اکاؤنٹ کی حفاظت کا طریقہ ہے، قانونی کارروائی کا نظام نہیں۔",
                "ur_rm": "2FA account security protocol hai, police reporting system nahi."
              },
              "consequences": {
                "en": "Careful reading avoids unrealistic assumptions in technical procedures.",
                "ur": "غور سے پڑھنا غلط فہمیوں اور مبالغہ آرائی سے بچاتا ہے۔",
                "ur_rm": "Careful reading technical misconceptions se bachati hai."
              }
            }
          ]
        },
        {
          "id": "teen_rv_4",
          "difficulty": "medium",
          "category": "meaning_selection",
          "title": {
            "en": "Tone & Meaning: Text Message Nuance",
            "ur": "لہجہ اور معنی: ٹیکسٹ میسج کی باریکیاں",
            "ur_rm": "Tone & Meaning: Text Message Nuance"
          },
          "passage": {
            "en": "Passage: \"Because digital messages lack facial expression and vocal inflection, brief replies can easily be misconstrued as blunt or indifferent, even when the sender was simply in a hurry.\"",
            "ur": "پیراگراف: \"چونکہ ڈیجیٹل پیغامات میں چہرے کے تاثرات اور آواز کا اتار چڑھاؤ شامل نہیں ہوتا، اس لیے مختصر جوابات کو اکثر بے رخی یا سختی سمجھ لیا جاتا ہے، خواہ بھیجنے والا صرف جلدی میں ہو۔\"",
            "ur_rm": "Passage: \"Digital messages mein facial expressions aur voice tone na hone ki wajah se brief replies ko aksar rude ya indifferent samjha jata hai, chahe sender sirf jaldi mein ho.\""
          },
          "vocabulary": {
            "en": "Word Focus: Inflection (pitch/tone change in voice), Misconstrued (misunderstood), Indifferent (uninterested / uncaring).",
            "ur": "الفاظ پر توجہ: اتار چڑھاؤ (آواز کا لہجہ)، غلط فہمی (غلط مطلب نکالنا)، بے رخی (لاپرواہی)۔",
            "ur_rm": "Word Focus: Inflection (voice tone), Misconstrued (galat samjha jana), Indifferent (be-rukhi)."
          },
          "situation": {
            "en": "A classmate replies with just \"K.\" to your group project message, and you wonder if they are upset.",
            "ur": "ایک ہم جماعت نے آپ کے پروجیکٹ میسج کے جواب میں صرف \"K.\" لکھا ہے، اور آپ سوچ رہے ہیں کہ کیا وہ ناراض ہیں۔",
            "ur_rm": "Aik classmate ne aap ke project message par sirf \"K.\" likha hai, aur aap soch rahe hain ke kya woh naraz hai."
          },
          "prompt": {
            "en": "What does the passage suggest you should keep in mind before assuming bad intentions from a short text?",
            "ur": "مضمون کے مطابق مختصر میسج سے ناراضگی کا اندازہ لگانے سے پہلے کیا ذہن میں رکھنا چاہیے؟",
            "ur_rm": "Passage ke mutabiq short text se bad intention assume karne se pehle kya sochna chahiye?"
          },
          "options": [
            {
              "id": "opt_rv_4_a",
              "text": {
                "en": "Assume they dislike working with you and immediately leave the project group.",
                "ur": "یہ فرض کریں کہ وہ آپ کے ساتھ کام نہیں کرنا چاہتے اور پروجیکٹ گروپ چھوڑ دیں۔",
                "ur_rm": "Yeh assume karein ke woh aap ko pasand nahi karte aur group chor dein."
              },
              "score": 40,
              "feedback": {
                "en": "Reacting abruptly without clarifying tone escalates unnecessary peer conflict.",
                "ur": "بغیر وضاحت کے فوراً ردعمل دینا ساتھیوں میں بلاوجہ تنازعہ پیدا کرتا ہے۔",
                "ur_rm": "Bina clarification reaction dene se peer conflict barhta hai."
              },
              "consequences": {
                "en": "Impulsive assumptions can damage valuable student friendships.",
                "ur": "جلد بازی میں مفروضے قائم کرنے سے دوستی متاثر ہو سکتی ہے۔",
                "ur_rm": "Impulsive assumptions dosti ko nuqsaan pohanchate hain."
              }
            },
            {
              "id": "opt_rv_4_b",
              "text": {
                "en": "Send multiple angry messages demanding an immediate apology for being blunt.",
                "ur": "سخت لہجے پر معافی مانگنے کے لیے فوری طور پر غصے والے کئی پیغامات بھیجیں۔",
                "ur_rm": "Blunt tone par clarification ke bajaye angry messages send karein."
              },
              "score": 30,
              "feedback": {
                "en": "Escalating anger when the sender may just be rushing creates preventable friction.",
                "ur": "غصے کا اظہار کرنے سے پہلے حقیقت جاننا ضروری ہے کیونکہ وہ جلدی میں بھی ہو سکتے ہیں۔",
                "ur_rm": "Aggressive response preventable misunderstandings create karta hai."
              },
              "consequences": {
                "en": "Aggressive texting harms team collaboration and mutual trust.",
                "ur": "جارحانہ پیغامات ٹیم کے باہمی اعتماد کو مجروح کرتے ہیں۔",
                "ur_rm": "Aggressive texting team trust ko kharab karti hai."
              }
            },
            {
              "id": "opt_rv_4_c",
              "text": {
                "en": "Ignore all project work until the teacher notices the group communication breakdown.",
                "ur": "پروجیکٹ کا تمام کام روک دیں جب تک کہ استاد کو رابطے میں تعطل کا علم نہ ہو۔",
                "ur_rm": "Project ka kaam rok dein jab tak teacher notice na karein."
              },
              "score": 50,
              "feedback": {
                "en": "Passive avoidance stalls academic deadlines without solving communication ambiguities.",
                "ur": "کام روک دینے سے ڈیڈ لائن متاثر ہوتی ہے اور مسئلہ حل نہیں ہوتا۔",
                "ur_rm": "Avoidance se academic deadline miss hoti hai aur clarity nahi milti."
              },
              "consequences": {
                "en": "Stalling work impacts grades for the entire collaborative group.",
                "ur": "کام میں تاخیر پورے گروپ کے نمبرات کو متاثر کرتی ہے۔",
                "ur_rm": "Delay poori team ke grades ko effect karta hai."
              }
            },
            {
              "id": "opt_rv_4_d",
              "text": {
                "en": "Recognize that short text lacks tone, and politely clarify in person or on a call before judging.",
                "ur": "سمجھیں کہ تحریر میں لہجہ غائب ہوتا ہے، اور رائے قائم کرنے سے پہلے شائستگی سے بات کر کے وضاحت حاصل کریں۔",
                "ur_rm": "Samjhein ke text mein tone missing hoti hai, aur politely in-person ya call par clarify karein."
              },
              "score": 95,
              "feedback": {
                "en": "Superb social intelligence and reading application! Clarification prevents misunderstandings.",
                "ur": "شاندار سماجی سمجھ بوجھ! بات چیت سے وضاحت حاصل کرنا غلط فہمیوں کا بہترین حل ہے۔",
                "ur_rm": "Superb emotional intelligence! Direct clarification misunderstandings ko rokti hai."
              },
              "consequences": {
                "en": "Patient communication preserves friendships and keeps group projects running smoothly.",
                "ur": "تحمل سے بات چیت دوستی کو قائم رکھتی ہے اور پروجیکٹس کو کامیاب بناتی ہے۔",
                "ur_rm": "Patient communication friendships aur group harmony maintain rakhti hai."
              }
            }
          ]
        },
        {
          "id": "teen_rv_5",
          "difficulty": "challenging",
          "category": "critical_comprehension",
          "title": {
            "en": "Critical Reading: Evaluating Source Credibility",
            "ur": "تنقیدی مطالعہ: ذرائع کی ساکھ کا جائزہ",
            "ur_rm": "Critical Reading: Evaluating Source Credibility"
          },
          "passage": {
            "en": "Passage: \"When researching scientific claims online, discerning readers corroborate sensational headlines by cross-referencing primary peer-reviewed journals rather than relying solely on viral social media summaries.\"",
            "ur": "پیراگراف: \"آن لائن سائنسی دعووں کی تحقیق کرتے وقت، باشعور قارئین سنسنی خیز سرخیوں پر اندھا اعتماد کرنے کے بجائے معتبر تحقیقی جرائد سے معلومات کی تصدیق کرتے ہیں۔\"",
            "ur_rm": "Passage: \"Online scientific claims par research karte waqt, critical readers viral social media posts ke bajaye peer-reviewed journals se information cross-check karte hain.\""
          },
          "vocabulary": {
            "en": "Key Words: Corroborate (verify / confirm with evidence), Discerning (having good judgment), Peer-reviewed (evaluated by independent experts).",
            "ur": "اہم الفاظ: تصدیق کرنا (ثبوت سے ثابت کرنا)، باشعور (صاحبِ بصیرت)، ماہرین سے تصدیق شدہ۔",
            "ur_rm": "Key Words: Corroborate (evidence se confirm karna), Discerning (samajhdaar), Peer-reviewed (experts se verified)."
          },
          "situation": {
            "en": "You are writing a science essay on renewable solar technology and see a viral post claiming a 1000% efficiency breakthrough.",
            "ur": "آپ شمسی توانائی کی ٹیکنالوجی پر ایک سائنسی مضمون لکھ رہے ہیں اور وائرل پوسٹ میں 1000 فیصد کارکردگی کا دعویٰ دیکھتے ہیں۔",
            "ur_rm": "Aap solar energy par science essay likh rahe hain aur viral post mein 1000% efficiency ka claim dekhte hain."
          },
          "prompt": {
            "en": "What is the recommended critical reading approach before including this claim in your school essay?",
            "ur": "اپنے اسکول کے مضمون میں اس دعوے کو شامل کرنے سے پہلے تنقیدی مطالعے کا کون سا طریقہ تجویز کیا گیا ہے؟",
            "ur_rm": "School essay mein claim add karne se pehle recommended reading approach kya hai?"
          },
          "options": [
            {
              "id": "opt_rv_5_a",
              "text": {
                "en": "Immediately quote the viral post as the main fact because it has thousands of likes.",
                "ur": "وائرل پوسٹ کو فوراً بنیادی حقیقت کے طور پر نقل کریں کیونکہ اس کے ہزاروں لائیکس ہیں۔",
                "ur_rm": "Viral post ko instantly main fact quote karein kyunki uske thousands of likes hain."
              },
              "score": 35,
              "feedback": {
                "en": "Social media popularity is not scientific verification; claims require evidence-based sources.",
                "ur": "سوشل میڈیا کی مقبولیت سائنسی سچائی کا ثبوت نہیں ہے، معلومات کی تصدیق ضروری ہے۔",
                "ur_rm": "Popularity scientific truth ka proof nahi hai; credible sources zaroori hain."
              },
              "consequences": {
                "en": "Citing unverified viral posts lowers academic paper credibility and grades.",
                "ur": "غیر مصدقہ پوسٹس نقل کرنے سے تعلیمی مضمون کا معیار اور نمبر کم ہوتے ہیں۔",
                "ur_rm": "Unverified sources cite karne se essay credibility decrease hoti hai."
              }
            },
            {
              "id": "opt_rv_5_b",
              "text": {
                "en": "Copy the exact headline words and change your entire science thesis statement without checking.",
                "ur": "سرخی کے الفاظ ہو بہو کاپی کریں اور بغیر تصدیق اپنے پورے مضمون کا نظریہ تبدیل کر دیں۔",
                "ur_rm": "Headline copy karein aur bina verification apna scientific thesis change kar dein."
              },
              "score": 40,
              "feedback": {
                "en": "Sensational headlines frequently exaggerate or distort preliminary experimental findings.",
                "ur": "سنسنی خیز سرخیاں اکثر ابتدائی تجربات کو بڑھا چڑھا کر پیش کرتی ہیں۔",
                "ur_rm": "Headlines aksar scientific findings ko exaggerate karti hain."
              },
              "consequences": {
                "en": "Shifting project direction based on rumors leads to faulty academic conclusions.",
                "ur": "افواہوں کی بنیاد پر کام کی سمت بدلنا غلط نتائج پر پہنچاتا ہے۔",
                "ur_rm": "Rumors par thesis change karne se scientific accuracy kharab hoti hai."
              }
            },
            {
              "id": "opt_rv_5_c",
              "text": {
                "en": "Cross-reference and corroborate the headline against verified, peer-reviewed scientific journals.",
                "ur": "معتبر اور ماہرین سے تصدیق شدہ سائنسی جرائد سے سرخی کے دعوے کی تصدیق اور موازنہ کریں۔",
                "ur_rm": "Verified peer-reviewed scientific journals se headline claim ko cross-check aur corroborate karein."
              },
              "score": 95,
              "feedback": {
                "en": "Masterful critical analysis! Independent corroboration is the golden standard of research.",
                "ur": "لاجواب تنقیدی صلاحیت! آزادانہ ذرائع سے تصدیق کرنا تحقیق کا بہترین اصول ہے۔",
                "ur_rm": "Masterful critical thinking! Peer-reviewed verification research ka golden standard hai."
              },
              "consequences": {
                "en": "Fact-checking sources produces high-grade school projects and builds sharp critical thinking.",
                "ur": "حقائق کی تصدیق کرنا اعلیٰ تعلیمی کارکردگی اور پختہ شعور کی بنیاد ہے۔",
                "ur_rm": "Fact-checking se academic excellence aur strong reasoning skills develop hoti hain."
              }
            },
            {
              "id": "opt_rv_5_d",
              "text": {
                "en": "Ask a friend on social media if they believe the post sounds exciting.",
                "ur": "سوشل میڈیا پر دوست سے پوچھیں کہ کیا یہ پوسٹ دلچسپ لگتی ہے۔",
                "ur_rm": "Social media par friend se poochein ke kya post exciting lagti hai."
              },
              "score": 30,
              "feedback": {
                "en": "Personal opinions and excitement do not replace verified empirical research.",
                "ur": "ذاتی رائے اور جوش سائنسی تحقیق اور ٹھوس شواہد کا متبادل نہیں بن سکتے۔",
                "ur_rm": "Personal opinion verified empirical data ka replacement nahi hai."
              },
              "consequences": {
                "en": "Relying on casual opinions leaves scientific essays vulnerable to debunked myths.",
                "ur": "محض آراء پر انحصار مضمون کو غلط معلومات کا شکار کر سکتا ہے۔",
                "ur_rm": "Casual opinions par depend karne se myths enter ho sakti hain."
              }
            }
          ]
        }
      ]
    },
    {
      "id": "teen_problem_solving",
      "skillKey": "problem_solving",
      "type": "problem_solving",
      "title": {
        "en": "Problem Solving 🧩",
        "ur": "مسائل کا حل 🧩",
        "ur_rm": "Problem Solving 🧩"
      },
      "description": {
        "en": "Real teen dilemma analysis, pros & cons evaluation, action planning, and constructive decision making.",
        "ur": "نوجوانوں کے حقیقی مسائل کا تجزیہ، فوائد و نقصانات کا جائزہ، حکمت عملی اور باوقار فیصلہ سازی۔",
        "ur_rm": "Real teen dilemmas, pros & cons analysis, action planning, aur constructive decision making."
      },
      "icon": "🧩",
      "scenarios": [
        {
          "id": "teen_ps_1",
          "difficulty": "easy",
          "category": "budget_planning",
          "title": {
            "en": "Monthly Pocket Money & Transport Budget",
            "ur": "ماہانہ جیب خرچ اور سفری بجٹ",
            "ur_rm": "Monthly Pocket Money & Transport Budget"
          },
          "situation": {
            "en": "You receive Rs. 4,000 monthly pocket allowance. Daily school bus van fee is Rs. 2,500. You need Rs. 800 for stationery supplies and want to buy an optional video game skin for Rs. 1,200.",
            "ur": "آپ کو ماہانہ 4,000 روپے جیب خرچ ملتا ہے۔ اسکول وین کی فیس 2,500 روپے ہے۔ آپ کو اسٹیشنری کے لیے 800 روپے درکار ہیں اور آپ 1,200 روپے کی ویڈیو گیم اسکن خریدنا چاہتے ہیں۔",
            "ur_rm": "Aap ko monthly Rs. 4,000 allowance milti hai. School van fee Rs. 2,500 hai. Stationery ke liye Rs. 800 chahiye aur optional game skin Rs. 1,200 ki hai."
          },
          "prompt": {
            "en": "What is the financially responsible decision to ensure your transport and school needs are fully met?",
            "ur": "اپنے سفری اور تعلیمی اخراجات کو یقینی بنانے کے لیے مالی طور پر ذمہ دارانہ فیصلہ کیا ہوگا؟",
            "ur_rm": "Transport aur stationery zarooriyat poori karne ke liye financially responsible decision kya hoga?"
          },
          "options": [
            {
              "id": "opt_ps_1_a",
              "text": {
                "en": "Buy the game skin first (Rs. 1,200) and ask the van driver to wait until next month for payment.",
                "ur": "پہلے گیم اسکن خریدیں اور وین ڈرائیور سے کہیں کہ فیس اگلے ماہ تک مؤخر کر دے۔",
                "ur_rm": "Pehle game skin khareedein aur van driver se kahein ke fee next month le lein."
              },
              "score": 35,
              "feedback": {
                "en": "Delaying essential transport commitments leads to service suspension and stress.",
                "ur": "بنیادی سفری فیس روکنے سے اسکول وین کی سروس معطل ہو سکتی ہے۔",
                "ur_rm": "Essential transport fee delay karne se van service cancel ho sakti hai."
              },
              "consequences": {
                "en": "Risking school transit creates daily attendance problems.",
                "ur": "سفر کا انتظام خراب ہونے سے اسکول حاضری متاثر ہوتی ہے۔",
                "ur_rm": "Daily attendance disturb hone ka risk rehta hai."
              }
            },
            {
              "id": "opt_ps_1_b",
              "text": {
                "en": "Pay van fee (Rs. 2,500) and stationery (Rs. 800) first, saving remaining Rs. 700 toward the game skin next month.",
                "ur": "پہلے وین فیس (2,500) اور اسٹیشنری (800) ادا کریں، اور باقی 700 روپے اگلے ماہ گیم کے لیے بچا لیں۔",
                "ur_rm": "Pehle van fee (Rs. 2,500) aur stationery (Rs. 800) dein, baki Rs. 700 game ke liye save karein."
              },
              "score": 95,
              "feedback": {
                "en": "Outstanding financial maturity! Needs come before wants, and incremental savings achieve long-term goals.",
                "ur": "شاندار مالیاتی سمجھ بوجھ! ضروریات کو ترجیح دینا اور بچت کرنا کامیاب فیصلے کی علامت ہے۔",
                "ur_rm": "Outstanding financial planning! Needs pehle aur savings se goals achieve hote hain."
              },
              "consequences": {
                "en": "You stay stress-free with guaranteed transit, necessary school supplies, and steady savings.",
                "ur": "آپ سکون کے ساتھ اسکول جا سکتے ہیں اور آپ کے پاس ضروری سامان اور بچت دونوں موجود رہتے ہیں۔",
                "ur_rm": "Guaranteed transit aur stationery ke sath healthy savings habit banti hai."
              }
            },
            {
              "id": "opt_ps_1_c",
              "text": {
                "en": "Spend the entire Rs. 4,000 on snacks with friends and worry about bills later.",
                "ur": "پورا جیب خرچ دوستوں کے ساتھ کھانوں میں خرچ کر دیں اور بلز کی فکر بعد میں کریں۔",
                "ur_rm": "Poora Rs. 4,000 doston ke sath snacks par spend karein aur bills baad mein sochein."
              },
              "score": 25,
              "feedback": {
                "en": "Impulse spending on treats leaves you unable to cover essential transport and school supplies.",
                "ur": "سارا پیسہ دعوتوں پر اڑانے سے بنیادی ضروریات ادھوری رہ جاتی ہیں۔",
                "ur_rm": "Impulsive treat spending se basic utilities ke paise khatam ho jate hain."
              },
              "consequences": {
                "en": "Running out of money in week one creates unnecessary panic and debt.",
                "ur": "مہینے کے شروع میں رقم ختم ہونے سے پریشانی اور قرض کا سامنا کرنا پڑتا ہے۔",
                "ur_rm": "Month ke start mein balance zero hone se debt aur stress barhta hai."
              }
            },
            {
              "id": "opt_ps_1_d",
              "text": {
                "en": "Borrow money from classmates with interest to buy both the skin and stationery right away.",
                "ur": "اسکن اور اسٹیشنری فوری خریدنے کے لیے کلاس فیلو سے سود پر پیسے ادھار لیں۔",
                "ur_rm": "Classmates se interest par paise borrow karein dono cheezein lene ke liye."
              },
              "score": 30,
              "feedback": {
                "en": "Borrowing from peers for entertainment creates peer conflict and financial burden.",
                "ur": "تفریح کے لیے ساتھیوں سے ادھار لینا تعلقات اور بجٹ دونوں کو خراب کرتا ہے۔",
                "ur_rm": "Peer borrowing entertainment ke liye unnecessary debt spiral create karti hai."
              },
              "consequences": {
                "en": "Peer debt strains friendships and builds unhealthy financial habits.",
                "ur": "دوستوں سے قرض لینا دوستی میں کھچاؤ اور بری عادات پیدا کرتا ہے۔",
                "ur_rm": "Friendships kharab hoti hain aur peer pressure barhta hai."
              }
            }
          ]
        },
        {
          "id": "teen_ps_2",
          "difficulty": "easy",
          "category": "time_management",
          "title": {
            "en": "Weekend Study Schedule vs Sports Match",
            "ur": "ہفتہ وار مطالعہ کا شیڈول بمقابلہ اسپورٹس میچ",
            "ur_rm": "Weekend Study Schedule vs Sports Match"
          },
          "situation": {
            "en": "You have an important Monday Math quiz and an English essay due. Your neighborhood cricket/football team has a tournament match on Saturday afternoon from 3 PM to 6 PM.",
            "ur": "پیر کے روز آپ کا ریاضی کا اہم کوئز ہے اور انگریزی کا مضمون جمع کروانا ہے۔ ہفتے کی سہ پہر 3 سے 6 بجے تک محلے کا کرکٹ میچ بھی ہے۔",
            "ur_rm": "Monday ko important Math quiz aur English essay due hai. Saturday afternoon 3 PM se 6 PM tak tournament match bhi hai."
          },
          "prompt": {
            "en": "How can you organize your weekend schedule to perform well on the quiz without missing the tournament match?",
            "ur": "آپ اپنے شیڈول کو کس طرح ترتیب دے سکتے ہیں تاکہ میچ بھی نہ چھوٹے اور ٹیسٹ کی تیاری بھی مکمل ہو جائے؟",
            "ur_rm": "Schedule kaise organize karein taake tournament match bhi ho aur Monday test preparation bhi?"
          },
          "options": [
            {
              "id": "opt_ps_2_a",
              "text": {
                "en": "Study Math Friday evening and Saturday morning (9-12 AM), play the match in the afternoon, and finish the essay Sunday.",
                "ur": "جمعہ کی شام اور ہفتے کی صبح (9 سے 12) ریاضی پڑھیں، دوپہر کو میچ کھیلیں اور اتوار کو مضمون مکمل کریں۔",
                "ur_rm": "Friday evening aur Saturday morning Math parhein, afternoon mein match khelein, aur Sunday essay complete karein."
              },
              "score": 95,
              "feedback": {
                "en": "Brilliant time allocation! Proactive task scheduling creates balanced room for academics and recreation.",
                "ur": "وقت کی بہترین تقسیم! پہلے سے منصوبہ بندی پڑھائی اور کھیل دونوں میں توازن پیدا کرتی ہے۔",
                "ur_rm": "Brilliant schedule balance! Advance planning se study aur sports dono manage hote hain."
              },
              "consequences": {
                "en": "You enjoy the match fully with zero guilt and earn high test scores on Monday.",
                "ur": "آپ بغیر کسی پریشانی کے میچ کا لطف اٹھاتے ہیں اور پیر کے ٹیسٹ میں اچھے نمبر حاصل کرتے ہیں۔",
                "ur_rm": "Zero stress ke sath sports enjoy hota hai aur quiz grades high aate hain."
              }
            },
            {
              "id": "opt_ps_2_b",
              "text": {
                "en": "Play the tournament all Saturday, hang out all Sunday, and study from 2 AM to 5 AM Monday morning.",
                "ur": "ہفتہ اور اتوار پورا دن کھیلیں اور پیر کی صبح 2 بجے سے 5 بجے تک رات جاگ کر پڑھیں۔",
                "ur_rm": "Poora weekend khelein aur Monday subah 2 AM se 5 AM tak late night cramming karein."
              },
              "score": 35,
              "feedback": {
                "en": "Sleep deprivation before an exam severely impairs memory recall and mathematical reasoning.",
                "ur": "امتحان سے پہلے نیند کی کمی یادداشت اور ریاضی حل کرنے کی صلاحیت کو کمزور کرتی ہے۔",
                "ur_rm": "Sleep deprivation exam ke waqt memory recall aur mental focus damage karti hai."
              },
              "consequences": {
                "en": "You feel exhausted during the quiz and risk making careless calculation errors.",
                "ur": "تھکاوٹ کی وجہ سے کوئز کے دوران آسان غلطیاں ہو سکتی ہیں۔",
                "ur_rm": "Exhaustion se careless mistakes hoti hain aur marks drop hote hain."
              }
            },
            {
              "id": "opt_ps_2_c",
              "text": {
                "en": "Cancel playing the tournament completely and sit in your room staring at the book without taking breaks.",
                "ur": "میچ کھیلنا مکمل کینسل کر دیں اور بغیر وقفے کے سارا دن کمرے میں کتاب لے کر بیٹھے رہیں۔",
                "ur_rm": "Tournament completely cancel karein aur bina break poora din book ko stare karte rahein."
              },
              "score": 45,
              "feedback": {
                "en": "Rigid overstudying without physical movement causes mental fatigue and burnout.",
                "ur": "بغیر وقفے اور تفریح کے مسلسل پڑھنے سے دماغ بوجھل ہو جاتا ہے۔",
                "ur_rm": "Overstudying without breaks mental fatigue aur frustration barhati hai."
              },
              "consequences": {
                "en": "You feel resentful and experience lower focus due to prolonged sedentary exhaustion.",
                "ur": "تھکاوٹ اور بے دلی کی وجہ سے پڑھائی کی رفتار سست ہو جاتی ہے۔",
                "ur_rm": "Focus slow ho jata hai aur burnout feel hota hai."
              }
            },
            {
              "id": "opt_ps_2_d",
              "text": {
                "en": "Ask your classmate to write the English essay for you in exchange for letting them play in your cricket spot.",
                "ur": "اپنے کلاس فیلو سے کہیں کہ وہ آپ کے بدلے مضمون لکھ دے اور آپ اسے اپنی جگہ میچ کھلائیں گے۔",
                "ur_rm": "Classmate se kahein ke woh essay likh de match spot ke badle."
              },
              "score": 30,
              "feedback": {
                "en": "Academic dishonesty violates school policies and prevents you from developing writing skills.",
                "ur": "کسی اور سے کام کروانا تعلیمی اصولوں کے خلاف ہے اور آپ کی صلاحیتوں کو روکتا ہے۔",
                "ur_rm": "Plagiarism school rules violate karti hai aur writing skills develop nahi hone deti."
              },
              "consequences": {
                "en": "Risk of academic penalty, detention, and loss of teacher trust.",
                "ur": "اسکول میں جرمانے اور اساتذہ کے اعتماد کے نقصان کا خطرہ رہتا ہے۔",
                "ur_rm": "Academic penalty aur zero score lagne ka khatra hota hai."
              }
            }
          ]
        },
        {
          "id": "teen_ps_3",
          "difficulty": "medium",
          "category": "peer_dynamics",
          "title": {
            "en": "Group Assignment Unequal Workload",
            "ur": "گروپ اسائنمنٹ میں کام کی غیر منصفانہ تقسیم",
            "ur_rm": "Group Assignment Unequal Workload"
          },
          "situation": {
            "en": "In a 3-person history project due on Thursday, you completed your research section and presentation slides. One teammate has not responded to messages, and the other is only offering excuses.",
            "ur": "جمعرات کو جمع کروائے جانے والے 3 رکنی تاریخ کے پروجیکٹ میں، آپ نے اپنی تحقیق اور سلائیڈز مکمل کر لی ہیں۔ ایک ساتھی پیغامات کا جواب نہیں دے رہا اور دوسرا صرف بہانے بنا رہا ہے۔",
            "ur_rm": "Thursday ko due 3-person history project mein aap ne research aur slides complete kar li hain. Aik teammate reply nahi kar raha aur doosra excuses de raha hai."
          },
          "prompt": {
            "en": "What is the most constructive, fair way to resolve the stalled project workflow?",
            "ur": "پروجیکٹ کے رکے ہوئے کام کو آگے بڑھانے کا سب سے منصفانہ اور تعمیری طریقہ کیا ہوگا؟",
            "ur_rm": "Stalled project workflow ko fair aur constructive tareeqe se resolve karne ka best step kya hai?"
          },
          "options": [
            {
              "id": "opt_ps_3_a",
              "text": {
                "en": "Post an angry public complaint about your teammates on the class social media group.",
                "ur": "کلاس کے سوشل میڈیا گروپ پر اپنے ساتھیوں کے خلاف غصے بھری پوسٹ شیئر کریں۔",
                "ur_rm": "Class social media group par teammates ke khilaf public angry post karein."
              },
              "score": 30,
              "feedback": {
                "en": "Public callouts provoke hostility and defensive reactions without moving the project forward.",
                "ur": "سرعام تنقید تلخی پیدا کرتی ہے اور اس سے کام مکمل نہیں ہوتا۔",
                "ur_rm": "Public callouts team conflict barhate hain aur task complete nahi hota."
              },
              "consequences": {
                "en": "Breaks team trust and leads to unnecessary peer drama.",
                "ur": "ساتھیوں میں نفرت اور کلاس میں بدمزگی پیدا ہوتی ہے۔",
                "ur_rm": "Team hostility create hoti hai aur problem solve nahi hoti."
              }
            },
            {
              "id": "opt_ps_3_b",
              "text": {
                "en": "Stay awake all night doing their parts yourself, then remove their names right before submitting without warning.",
                "ur": "ساری رات جاگ کر ان کا کام خود کریں، پھر جمع کرواتے وقت بغیر بتائے ان کے نام ہٹا دیں۔",
                "ur_rm": "Raat bhar jag kar unka kaam khud karein aur submit karte waqt bina bataye unka naam remove karein."
              },
              "score": 55,
              "feedback": {
                "en": "Taking on 100% of the burden enables free-riding, causes exhaustion, and sudden removal creates disputes.",
                "ur": "سارا بوجھ خود اٹھانا تھکاوٹ پیدا کرتا ہے اور بغیر اطلاع نام ہٹانا جھگڑے کا باعث بنتا ہے۔",
                "ur_rm": "Burnout hota hai aur last-minute escalation se grading conflicts hote hain."
              },
              "consequences": {
                "en": "You suffer intense physical burnout while unresolved team conflicts reach the principal.",
                "ur": "آپ شدید تھکاوٹ کا شکار ہوتے ہیں اور معاملہ اساتذہ تک پہنچ کر پیچیدہ ہو جاتا ہے۔",
                "ur_rm": "Severe stress hota hai aur teacher ke samne confusing dispute banta hai."
              }
            },
            {
              "id": "opt_ps_3_c",
              "text": {
                "en": "Schedule a quick 10-minute in-person team check-in, set clear sub-deadlines, and if ignored, politely brief the teacher with documented milestones.",
                "ur": "ساتھیوں کے ساتھ 10 منٹ کی فوری میٹنگ کریں، کام کے واضح حصے طے کریں، اور اگر پھر بھی جواب نہ ملے تو شائستگی سے استاد کو آگاہ کریں۔",
                "ur_rm": "10-minute team check-in schedule karein, specific deadlines dein, aur agar reply na aaye to teacher ko politely update karein."
              },
              "score": 95,
              "feedback": {
                "en": "Exemplary project leadership! Direct communication coupled with objective documentation protects both deadlines and fairness.",
                "ur": "شاندار قائدانہ صلاحیت! براہ راست گفتگو اور واضح ریکارڈ رکھنا کام کو انصاف کے ساتھ مکمل کرواتا ہے۔",
                "ur_rm": "Exemplary leadership! Clear check-ins aur documented milestones fairness guarantee karte hain."
              },
              "consequences": {
                "en": "Clear task boundaries encourage participation, and the teacher provides fair individual grading.",
                "ur": "واضح حدود ساتھیوں کو کام پر آمادہ کرتی ہیں اور استاد ہر طالب علم کو منصفانہ نمبر دیتے ہیں۔",
                "ur_rm": "Project on time submit hota hai aur teacher fair individual evaluation karte hain."
              }
            },
            {
              "id": "opt_ps_3_d",
              "text": {
                "en": "Delete your completed slides and tell the teacher your group decided not to submit.",
                "ur": "اپنی بنائی ہوئی سلائیڈز ڈیلیٹ کر دیں اور استاد سے کہیں کہ گروپ نے پروجیکٹ نہ کرنے کا فیصلہ کیا ہے۔",
                "ur_rm": "Apni banai hui slides delete karein aur teacher se kahein ke group project nahi karega."
              },
              "score": 20,
              "feedback": {
                "en": "Self-sabotaging your own hard work harms your own GPA over temporary frustration.",
                "ur": "غصے میں اپنی محنت ضائع کرنا آپ کے اپنے نتائج کو نقصان پہنچاتا ہے۔",
                "ur_rm": "Apna kaam destroy karna self-sabotage hai jo sirf aap ke grades giraega."
              },
              "consequences": {
                "en": "You receive a zero score despite having done excellent quality preparation.",
                "ur": "بہترین کام کرنے کے باوجود آپ کو صفر نمبر ملنے کا خطرہ ہوگا۔",
                "ur_rm": "Preparedness ke bawajood zero marks receive hote hain."
              }
            }
          ]
        },
        {
          "id": "teen_ps_4",
          "difficulty": "medium",
          "category": "resource_sharing",
          "title": {
            "en": "Science Fair Equipment Sharing Conflict",
            "ur": "سائنس فیئر میں سامان کے اشتراک کا تنازعہ",
            "ur_rm": "Science Fair Equipment Sharing Conflict"
          },
          "situation": {
            "en": "Both your team and another class group need the school physics lab multimeter and digital scale for 45 minutes to calibrate your science fair project before Friday inspection.",
            "ur": "جمعہ کی انسپیکشن سے پہلے آپ کی ٹیم اور دوسری کلاس کی ٹیم دونوں کو اپنے پروجیکٹ کے لیے فزکس لیب کے ملٹی میٹر اور ڈیجیٹل اسکیل کی 45 منٹ کے لیے بیک وقت ضرورت ہے۔",
            "ur_rm": "Friday inspection se pehle aap ki team aur doosre group dono ko physics lab multimeter aur digital scale 45 minutes ke liye chahiye."
          },
          "prompt": {
            "en": "How can both groups test their projects without arguing or monopolizing lab equipment?",
            "ur": "دونوں گروپس بغیر جھگڑے اور سامان پر قبضہ کیے اپنے پروجیکٹ کی پیمائش کیسے مکمل کر سکتے ہیں؟",
            "ur_rm": "Dono groups bina argue kiye aur lab apparatus monopolize kiye testing kaise poori karein?"
          },
          "options": [
            {
              "id": "opt_ps_4_a",
              "text": {
                "en": "Grab the multimeter first and hide it in your backpack until the other group leaves the lab.",
                "ur": "سامان کو پہلے اٹھا کر اپنے بیگ میں چھپا لیں جب تک کہ دوسرا گروپ لیب سے چلا نہ جائے۔",
                "ur_rm": "Apparatus pehle utha kar bag mein chupa lein jab tak doosra group chala na jaye."
              },
              "score": 25,
              "feedback": {
                "en": "Hiding communal school equipment violates school rules and provokes disciplinary consequences.",
                "ur": "اسکول کا سامان چھپانا لیب کے قواعد کے خلاف ہے اور تادیبی کارروائی کا باعث بنتا ہے۔",
                "ur_rm": "Lab equipment hide karna discipline breach hai."
              },
              "consequences": {
                "en": "Lab teacher bans your group from using physics apparatus for the exhibition.",
                "ur": "لیب انچارج آپ کی ٹیم پر سامان کے استعمال پر پابندی لگا سکتے ہیں۔",
                "ur_rm": "Lab access revoke ho sakti hai exhibition ke liye."
              }
            },
            {
              "id": "opt_ps_4_b",
              "text": {
                "en": "Argue loudly that your project is more advanced so your team has priority rights.",
                "ur": "اونچی آواز میں بحث کریں کہ ہمارا پروجیکٹ زیادہ اہم ہے اس لیے ہمیں ترجیح ملنی چاہیے۔",
                "ur_rm": "Loudly argue karein ke hamara project advanced hai isliye priority hamari hai."
              },
              "score": 35,
              "feedback": {
                "en": "Asserting superiority creates resentment and disruption in shared academic spaces.",
                "ur": "برتری جتانے سے تلخی پیدا ہوتی ہے اور مشترکہ ماحول خراب ہوتا ہے۔",
                "ur_rm": "Aggressive arguing shared learning environment ko disrupt karta hai."
              },
              "consequences": {
                "en": "Creates peer friction and disrupts the entire science laboratory.",
                "ur": "کلاس فیلوز میں کشیدگی اور لیب میں ہنگامہ آرائی جنم لیتی ہے۔",
                "ur_rm": "Peer hostility create hoti hai aur time waste hota hai."
              }
            },
            {
              "id": "opt_rv_4_c",
              "text": {
                "en": "Give up completely, pack your bags, and present your project uncalibrated.",
                "ur": "مکمل طور پر ہمت ہار دیں اور بغیر پیمائش کے ہی اپنا نامکمل پروجیکٹ پیش کر دیں۔",
                "ur_rm": "Give up karein aur uncalibrated project present kar dein."
              },
              "score": 30,
              "feedback": {
                "en": "Passive withdrawal surrenders marks when simple scheduling negotiation would solve the issue.",
                "ur": "ہمت ہار دینے سے نمبر کٹ جاتے ہیں جبکہ معمولی گفتگو سے مسئلہ حل ہو سکتا تھا۔",
                "ur_rm": "Passive surrender se avoidable marks deduction hoti hai."
              },
              "consequences": {
                "en": "Project fails calibration test and loses points at the science fair.",
                "ur": "پروجیکٹ نمائش میں درست کام نہ کرنے کی وجہ سے فیل ہو سکتا ہے۔",
                "ur_rm": "Science fair evaluation mein low score milta hai."
              }
            },
            {
              "id": "opt_ps_4_d",
              "text": {
                "en": "Agree on a structured time split: Group A uses the multimeter while Group B records weights, then swap after 20 minutes.",
                "ur": "وقت کا منصفانہ معاہدہ کریں: گروپ A پہلے 20 منٹ میٹر استعمال کرے اور گروپ B وزن کرے، پھر سامان کا تبادلہ کر لیں۔",
                "ur_rm": "Time split par agree karein: Group A 20 min multimeter use kare, Group B scale, phir swap karein."
              },
              "score": 95,
              "feedback": {
                "en": "Superb collaborative problem solving! Time-sliced resource sharing maximizes efficiency for both teams.",
                "ur": "شاندار باہمی تعاون! وقت کی منصفانہ تقسیم سے دونوں ٹیموں کا کام بغیر کسی تاخیر کے مکمل ہو جاتا ہے۔",
                "ur_rm": "Superb collaborative solution! Time-sharing se dono teams ka task smoothly complete hota hai."
              },
              "consequences": {
                "en": "Both projects are calibrated accurately and ready for winning presentation.",
                "ur": "دونوں پروجیکٹس وقت پر تیار ہو جاتے ہیں اور سب کو اچھے نتائج ملتے ہیں۔",
                "ur_rm": "Dono projects accurate calibration ke sath ready ho jate hain."
              }
            }
          ]
        },
        {
          "id": "teen_ps_5",
          "difficulty": "challenging",
          "category": "peer_boundaries",
          "title": {
            "en": "Peer Pressure & Borrowed Laptop Dilemma",
            "ur": "دوستوں کا دباؤ اور لیپ ٹاپ ادھار مانگنے کا مسئلہ",
            "ur_rm": "Peer Pressure & Borrowed Laptop Dilemma"
          },
          "situation": {
            "en": "Your parents bought you a laptop strictly for your studies and warned not to lend it out. A close friend who forgot their tablet at home is pressuring you to lend them your laptop during lunch break to play games outside on the school ground.",
            "ur": "آپ کے والدین نے آپ کو پڑھائی کے لیے لیپ ٹاپ لے کر دیا ہے اور باہر لے جانے سے منع کیا ہے۔ ایک قریبی دوست لنچ کے دوران اسکول گراؤنڈ میں گیم کھیلنے کے لیے لیپ ٹاپ مانگ رہا ہے۔",
            "ur_rm": "Parents ne study laptop strictly school study ke liye diya hai aur lend karne se mana kiya hai. Close friend lunch mein ground mein games khelne ke liye laptop maang raha hai."
          },
          "prompt": {
            "en": "What is the most assertive, mature response that respects parental boundaries while treating your friend with dignity?",
            "ur": "والدین کے اعتماد کو برقرار رکھتے ہوئے اور دوست کے احترام کے ساتھ سب سے پختہ جواب کیا ہوگا؟",
            "ur_rm": "Parental trust maintain karte hue aur friend ko respectfully handle karne ka best response kya hai?"
          },
          "options": [
            {
              "id": "opt_ps_5_a",
              "text": {
                "en": "Lend it immediately because you fear your friend will stop talking to you if you say no.",
                "ur": "فوراً لیپ ٹاپ دے دیں کیونکہ آپ کو ڈر ہے کہ انکار کرنے سے وہ دوستی ختم کر دے گا۔",
                "ur_rm": "Darr ki wajah se instantly de dein ke friend naraz na ho jaye."
              },
              "score": 40,
              "feedback": {
                "en": "Surrendering personal boundaries under peer pressure compromises parental trust and risks hardware damage.",
                "ur": "دباؤ میں آ کر اصول توڑنا والدین کے اعتماد کو ٹھیس پہنچاتا ہے اور سامان کے نقصان کا خطرہ ہوتا ہے۔",
                "ur_rm": "Peer pressure mein rules break karne se hardware damage aur trust issue hota hai."
              },
              "consequences": {
                "en": "Laptop gets dropped in the dust, leading to costly screen repair and lost parental trust.",
                "ur": "گراؤنڈ میں گرنے سے اسکرین ٹوٹنے کا خطرہ اور والدین کا اعتماد ختم ہو سکتا ہے۔",
                "ur_rm": "Accidental drop damage aur parental disappointment face karni par sakti hai."
              }
            },
            {
              "id": "opt_ps_5_b",
              "text": {
                "en": "Politely and firmly state: \"My parents made a strict rule not to lend my laptop outside, so I cannot give it. But we can play a game on the school computer lab PCs together during recess.\"",
                "ur": "شائستگی اور اعتماد سے کہیں: \"والدین نے باہر دینے سے منع کیا ہے اس لیے میں نہیں دے سکتا، البتہ ہم لیب کے کمپیوٹر پر ساتھ گیم کھیل سکتے ہیں۔\"",
                "ur_rm": "Politely firmly bolein: \"Parents ne bahar lend karne se mana kiya hai, lekin hum school computer lab mein sath game khel sakte hain.\""
              },
              "score": 95,
              "feedback": {
                "en": "Outstanding boundary setting! You maintained parental integrity firmly without being rude, offering a positive alternative.",
                "ur": "شاندار خود اعتمادی! آپ نے بغیر بدتمیزی کے اپنے اصول قائم رکھے اور ایک مثبت متبادل بھی پیش کیا۔",
                "ur_rm": "Outstanding boundary assertiveness! Clear refusal ke sath constructive alternative best outcome deta hai."
              },
              "consequences": {
                "en": "You protect your expensive laptop, honor your parents' trust, and maintain healthy friendship dynamics.",
                "ur": "آپ کا قیمتی لیپ ٹاپ محفوظ رہتا ہے، والدین کا اعتماد بڑھتا ہے اور دوستی کا بھرم قائم رہتا ہے۔",
                "ur_rm": "Laptop safe rehta hai, parental trust strong hota hai aur self-respect barhti hai."
              }
            },
            {
              "id": "opt_ps_5_c",
              "text": {
                "en": "Shout at your friend in front of everyone and call them irresponsible for forgetting their tablet.",
                "ur": "سب کے سامنے دوست پر چیخیں اور اپنا ٹیبلٹ بھولنے پر اسے غیر ذمہ دار کہیں۔",
                "ur_rm": "Friend par loudly shout karein aur sab ke samne irresponsible bole."
              },
              "score": 30,
              "feedback": {
                "en": "Aggressive outbursts humiliate peers and turn a simple boundary negotiation into a toxic argument.",
                "ur": "سب کے سامنے غصہ کرنا دوستی کو ختم کر دیتا ہے اور بلاوجہ جھگڑا بڑھاتا ہے۔",
                "ur_rm": "Loud aggression friendship todti hai aur unnecessary scene create karti hai."
              },
              "consequences": {
                "en": "Damages friendship and creates embarrassing drama in the school cafeteria.",
                "ur": "دوستوں میں بدنامی اور تعلقات ہمیشہ کے لیے خراب ہو سکتے ہیں۔",
                "ur_rm": "Friendship break hoti hai aur school mein embarrassment create hoti hai."
              }
            },
            {
              "id": "opt_ps_5_d",
              "text": {
                "en": "Lie and say the laptop battery is completely dead, even though you just fully charged it.",
                "ur": "جھوٹ بولیں کہ بیٹری ختم ہو گئی ہے، حالانکہ آپ نے ابھی چارج کیا تھا۔",
                "ur_rm": "Lie karein ke battery dead hai halanke poori charge hai."
              },
              "score": 45,
              "feedback": {
                "en": "Dishonest excuses avoid direct boundaries; if they see you using it later, trust is shattered.",
                "ur": "جھوٹے بہانے سچ سامنے آنے پر شرمندگی اور بے اعتمادی کا باعث بنتے ہیں۔",
                "ur_rm": "Lying avoids real boundary setting aur baad mein pakre jane par trust toot-ta hai."
              },
              "consequences": {
                "en": "Your friend sees you turn it on later and feels deceived and hurt.",
                "ur": "بعد میں لیپ ٹاپ آن دیکھ کر دوست خود کو دھوکہ دہی کا شکار سمجھے گا۔",
                "ur_rm": "Friend deceives feel karega jab woh aap ko laptop use karte dekhega."
              }
            }
          ]
        }
      ]
    },
    {
      "id": "teen_communication",
      "skillKey": "communication_scenarios",
      "type": "communication",
      "title": {
        "en": "Practice Scenarios 💬",
        "ur": "عملی منظرنامے 💬",
        "ur_rm": "Practice Scenarios 💬"
      },
      "description": {
        "en": "Interactive roleplay conversations: classroom, peer support, family discussions, and school events.",
        "ur": "باہمی گفتگو کے منظرنامے: کلاس روم، دوستوں کا تعاون، خاندانی بات چیت اور اسکول کے پروگرام۔",
        "ur_rm": "Interactive roleplay: classroom, peer support, family discussions, aur school events."
      },
      "icon": "💬",
      "redirectToScenarios": true,
      "scenarios": []
    }
  ],
  "adult": [
    {
      "id": "adult_functional_reading",
      "skillKey": "functional_reading",
      "type": "functional_reading",
      "title": {
        "en": "Functional Reading 📄",
        "ur": "عملی مطالعہ 📄",
        "ur_rm": "Functional Reading 📄"
      },
      "description": {
        "en": "Official forms, utility invoices, workplace safety notices, transit schedules, and contract terms.",
        "ur": "سرکاری فارم، یوٹیلیٹی بلز، دفتری حفاظتی ہدایات، ٹرانزٹ شیڈول اور ملازمت کے معاہدے۔",
        "ur_rm": "Official forms, utility bills, workplace safety notices, transit schedules, aur contracts."
      },
      "icon": "📄",
      "scenarios": [
        {
          "id": "adult_fr_1",
          "difficulty": "easy",
          "category": "safety_notice",
          "title": {
            "en": "Office Fire Evacuation Procedure Notice",
            "ur": "دفتر میں آگ لگنے کی صورت میں انخلاء کی ہدایات",
            "ur_rm": "Office Fire Evacuation Procedure Notice"
          },
          "passage": {
            "en": "Notice: \"In the event of a fire alarm, immediately evacuate via Stairwell B located adjacent to the cafeteria. Do NOT use elevators. Assemble at designated Assembly Point 3 in the North Parking Lot and await roll call.\"",
            "ur": "نوٹس: \"فائر الارم بجنے کی صورت میں فوری طور پر کیفے ٹیریا کے ساتھ موجود سیڑھی B کے ذریعے عمارت خالی کریں۔ لفٹ کا استعمال ہرگز نہ کریں۔ نارتھ پارکنگ لاٹ میں اسمبلی پوائنٹ 3 پر اکٹھے ہوں اور حاضری کا انتظار کریں۔\"",
            "ur_rm": "Notice: \"Fire alarm bajne par cafeteria ke sath Stairwell B se foran bahar niklein. Elevators use na karein. North Parking Lot mein Assembly Point 3 par jama hon aur roll call ka wait karein.\""
          },
          "situation": {
            "en": "You hear a continuous fire alarm siren during your afternoon office shift.",
            "ur": "آپ دوپہر کے دفتری اوقات میں مسلسل فائر الارم کا سائرن سنتے ہیں۔",
            "ur_rm": "Aap afternoon shift ke dauran continuous fire alarm siren sunte hain."
          },
          "prompt": {
            "en": "According to the official building safety notice, what is the mandatory evacuation procedure?",
            "ur": "عمارت کی حفاظتی ہدایات کے مطابق انخلاء کا لازمی طریقہ کار کیا ہے؟",
            "ur_rm": "Building safety notice ke mutabiq mandatory evacuation procedure kya hai?"
          },
          "options": [
            {
              "id": "opt_fr_1_a",
              "text": {
                "en": "Take the main express elevator down to the basement to wait for the alarm to stop.",
                "ur": "مین ایکسپریس لفٹ لے کر بیسمنٹ میں جائیں اور الارم رکنے کا انتظار کریں۔",
                "ur_rm": "Main express elevator se basement jayein aur alarm stop hone ka wait karein."
              },
              "score": 25,
              "feedback": {
                "en": "Elevators can lose power or trap passengers inside shafts during building electrical cutoffs.",
                "ur": "آگ لگنے پر لفٹ کی بجلی بند ہو سکتی ہے جس سے اندر پھنس جانے کا شدید خطرہ ہوتا ہے۔",
                "ur_rm": "Fire emergency mein elevators shaft mein trap hone ka severe hazard hota hai."
              },
              "consequences": {
                "en": "Extreme danger of being trapped in an elevator shaft during power outages.",
                "ur": "بجلی بند ہونے کی صورت میں جان کو شدید خطرہ لاحق ہو سکتا ہے۔",
                "ur_rm": "Elevator trapping hazard during emergency power cuts."
              }
            },
            {
              "id": "opt_fr_1_b",
              "text": {
                "en": "Stay at your desk packing your personal laptop and bag until the security guard arrives.",
                "ur": "اپنی ڈیسک پر بیٹھے رہیں اور گارڈ کے آنے تک اپنا لیپ ٹاپ اور سامان پیک کرتے رہیں۔",
                "ur_rm": "Desk par laptop aur personal bag pack karte rahein jab tak guard na aaye."
              },
              "score": 35,
              "feedback": {
                "en": "Delaying evacuation to gather personal belongings risks smoke inhalation.",
                "ur": "سامان سمیٹنے کے لیے رکنا دھوئیں اور آگ کے خطرے کو بڑھاتا ہے۔",
                "ur_rm": "Personal belongings gather karne mein delay smoke inhalation ka risk barhati hai."
              },
              "consequences": {
                "en": "Valuable escape time is lost as hallways fill with dangerous toxic smoke.",
                "ur": "دھواں بھر جانے سے بحفاظت باہر نکلنے کا قیمتی وقت ضائع ہو جاتا ہے۔",
                "ur_rm": "Escape time lose ho jata hai aur smoke hazard barhta hai."
              }
            },
            {
              "id": "opt_fr_1_c",
              "text": {
                "en": "Immediately exit via Stairwell B (no elevators) and assemble at North Parking Lot Point 3.",
                "ur": "فوری طور پر سیڑھی B سے نکلیں (لفٹ نہ لیں) اور نارتھ پارکنگ لاٹ کے اسمبلی پوائنٹ 3 پر جمع ہوں۔",
                "ur_rm": "Foran Stairwell B se exit karein (no elevators) aur North Parking Lot Point 3 par assemble hon."
              },
              "score": 95,
              "feedback": {
                "en": "Flawless safety protocol execution! Following stairwell and designated assembly rules guarantees personal safety.",
                "ur": "حفاظتی اصولوں پر بہترین عمل! سیڑھیوں کا استعمال اور مخصوص جگہ پہنچنا جان کی حفاظت یقینی بناتا ہے۔",
                "ur_rm": "Flawless emergency protocol execution! Stairwell use aur assembly point personal safety guarantee karta hai."
              },
              "consequences": {
                "en": "You exit the building swiftly and ensure you are accounted for during safety roll call.",
                "ur": "آپ بحفاظت باہر نکل آتے ہیں اور حاضری کے دوران آپ کی حفاظت کی تصدیق ہو جاتی ہے۔",
                "ur_rm": "Swift safe exit hota hai aur safety roll call mein presence verify hoti hai."
              }
            },
            {
              "id": "opt_fr_1_d",
              "text": {
                "en": "Walk up to the roof to take photos of the emergency vehicles arriving.",
                "ur": "چھت پر چلے جائیں تاکہ ایمرجنسی گاڑیوں کے آنے کی تصاویر بنا سکیں۔",
                "ur_rm": "Roof par chale jayein emergency rescue vehicles ki photos lene ke liye."
              },
              "score": 20,
              "feedback": {
                "en": "Moving upward toward rooftops traps occupants as heat and smoke naturally rise.",
                "ur": "چھت کی طرف جانا خطرناک ہے کیونکہ دھواں اور گرمی اوپر کی طرف اٹھتے ہیں۔",
                "ur_rm": "Upward roof movement trap karti hai kyunki heat aur smoke upar rise hote hain."
              },
              "consequences": {
                "en": "Severe risk of smoke asphyxiation and blocked exit routes.",
                "ur": "راستے بند ہونے اور دھوئیں سے دم گھٹنے کا شدید خطرہ رہتا ہے۔",
                "ur_rm": "Critical smoke hazard aur exit blockage."
              }
            }
          ]
        },
        {
          "id": "adult_fr_2",
          "difficulty": "easy",
          "category": "utility_bill",
          "title": {
            "en": "Electricity & Gas Utility Invoice Reading",
            "ur": "بجلی اور گیس کے یوٹیلیٹی بل کا مطالعہ",
            "ur_rm": "Electricity & Gas Utility Invoice Reading"
          },
          "passage": {
            "en": "Invoice: \"Billing Period: 01-Nov to 30-Nov. Current Charges: Rs. 6,450. Due Date: 15-Dec. Late Payment Surcharge of Rs. 650 applies after 15-Dec. Online Payments accepted via 1Bill Consumer ID: 1009823481.\"",
            "ur": "بل: \"بلنگ کی مدت: 01 نومبر تا 30 نومبر۔ موجودہ واجبات: 6,450 روپے۔ آخری تاریخ: 15 دسمبر۔ 15 دسمبر کے بعد 650 روپے لیٹ فیس لاگو ہوگی۔ آن لائن ادائیگی بذریعہ 1Bill کنزیومر آئی ڈی: 1009823481۔\"",
            "ur_rm": "Invoice: \"Billing Period: 01-Nov to 30-Nov. Current Charges: Rs. 6,450. Due Date: 15-Dec. Late Surcharge: Rs. 650 after 15-Dec. 1Bill Consumer ID: 1009823481.\""
          },
          "situation": {
            "en": "You receive your monthly household electric bill on December 5th and want to pay without penalty.",
            "ur": "آپ کو 5 دسمبر کو بجلی کا بل ملتا ہے اور آپ اضافی جرمانے کے بغیر ادائیگی کرنا چاہتے ہیں۔",
            "ur_rm": "Aap ko 5 December ko electric bill milta hai aur aap bina late fee pay karna chahte hain."
          },
          "prompt": {
            "en": "What is the required payment amount and deadline to avoid the Rs. 650 surcharge?",
            "ur": "650 روپے کے اضافی سرچارج سے بچنے کے لیے واجب الادا رقم اور آخری تاریخ کیا ہے؟",
            "ur_rm": "Rs. 650 late surcharge avoid karne ke liye required amount aur due date kya hai?"
          },
          "options": [
            {
              "id": "opt_fr_2_a",
              "text": {
                "en": "Pay Rs. 6,450 on or before 15-December using the 1Bill Consumer ID.",
                "ur": "15 دسمبر تک 1Bill کنزیومر آئی ڈی کے ذریعے 6,450 روپے ادا کریں۔",
                "ur_rm": "15-Dec tak 1Bill Consumer ID use karke Rs. 6,450 pay karein."
              },
              "score": 95,
              "feedback": {
                "en": "Accurate practical invoice comprehension! Paying on or before due date prevents late penalties.",
                "ur": "بل کی بالکل درست فہم! آخری تاریخ سے پہلے ادائیگی اضافی فیس سے محفوظ رکھتی ہے۔",
                "ur_rm": "Accurate bill comprehension! Due date se pehle payment late surcharge se bachati hai."
              },
              "consequences": {
                "en": "You protect your personal monthly budget from avoidable Rs. 650 late fees.",
                "ur": "آپ اپنے ماہانہ بجٹ کو 650 روپے کے غیر ضروری جرمانے سے بچا لیتے ہیں۔",
                "ur_rm": "Monthly budget Rs. 650 unnecessary fine se save ho jata hai."
              }
            },
            {
              "id": "opt_fr_2_b",
              "text": {
                "en": "Wait until 30-December and pay Rs. 6,450 ignoring the surcharge notice.",
                "ur": "30 دسمبر تک انتظار کریں اور سرچارج کو نظر انداز کر کے 6,450 روپے دیں۔",
                "ur_rm": "30-Dec tak wait karein aur surcharge ignore karke Rs. 6,450 dein."
              },
              "score": 40,
              "feedback": {
                "en": "Paying past due date without surcharge leaves an unpaid balance, triggering service disconnection.",
                "ur": "آخری تاریخ کے بعد کم رقم ادا کرنے سے بقایا جات جمع ہو جاتے ہیں اور کنکشن کٹ سکتا ہے۔",
                "ur_rm": "Late payment without penalty fee meter disconnection notice trigger kar sakti hai."
              },
              "consequences": {
                "en": "Late penalty carries over to next month with interest and disconnection warnings.",
                "ur": "اگلے ماہ کے بل میں جرمانہ شامل ہو کر آئے گا اور کنکشن کٹنے کا خطرہ ہوگا۔",
                "ur_rm": "Fine carry forward hota hai aur utility connection risk par aata hai."
              }
            },
            {
              "id": "opt_fr_2_c",
              "text": {
                "en": "Pay Rs. 650 only, assuming that covers the entire monthly electricity cost.",
                "ur": "صرف 650 روپے ادا کریں یہ سمجھ کر کہ یہ پورے مہینے کا بل ہے۔",
                "ur_rm": "Sirf Rs. 650 pay karein yeh samajh kar ke yeh poora bill hai."
              },
              "score": 30,
              "feedback": {
                "en": "Rs. 650 is only the late penalty fee, not the total electricity usage charge of Rs. 6,450.",
                "ur": "650 روپے صرف جرمانے کی رقم ہے، اصل بل 6,450 روپے ہے۔",
                "ur_rm": "Rs. 650 late fine hai, total monthly usage bill Rs. 6,450 hai."
              },
              "consequences": {
                "en": "Severely underpaying triggers immediate meter disconnection notice.",
                "ur": "کم بل ادا کرنے سے بجلی کا میٹر فوری منقطع ہو سکتا ہے۔",
                "ur_rm": "Underpayment se immediate power cutoff notice aati hai."
              }
            },
            {
              "id": "opt_fr_2_d",
              "text": {
                "en": "Tear up the paper bill because all paper invoices are purely informational.",
                "ur": "کاغذی بل کو پھاڑ دیں کیونکہ یہ صرف اطلاع کے لیے ہوتا ہے۔",
                "ur_rm": "Paper bill phaad dein kyunki yeh sirf informational hota hai."
              },
              "score": 20,
              "feedback": {
                "en": "Utility bills are legal payment demands; ignoring them leads to meter removal and legal notices.",
                "ur": "یوٹیلیٹی بل قانونی ادائیگی کے لیے ہوتے ہیں، انہیں نظر انداز کرنے سے قانونی کارروائی ہو سکتی ہے۔",
                "ur_rm": "Utility bills legally binding payment invoices hain jinhe ignore nahi kiya ja sakta."
              },
              "consequences": {
                "en": "Immediate power disconnection and heavy reconnection penalties.",
                "ur": "بجلی کٹ جائے گی اور دوبارہ کنکشن کے لیے بھاری فیس دینا پڑے گی۔",
                "ur_rm": "Service disconnect aur heavy restoration fee lagti hai."
              }
            }
          ]
        },
        {
          "id": "adult_fr_3",
          "difficulty": "medium",
          "category": "transit_advisory",
          "title": {
            "en": "Metro Train Maintenance & Service Disruption Notice",
            "ur": "میٹرو ٹرین مرمت اور سروس معطلی کا نوٹس",
            "ur_rm": "Metro Train Maintenance & Service Disruption Notice"
          },
          "passage": {
            "en": "Transit Alert: \"Track overhaul scheduled for Red Line between Central Station and University Junction this Saturday. Shuttle Bus Route 12 will operate every 10 minutes outside Exit 4. Metro smart cards are valid on shuttle buses without extra fare.\"",
            "ur": "ٹرانزٹ الرٹ: \"اس ہفتے کے روز ریڈ لائن پر سینٹرل اسٹیشن اور یونیورسٹی جنکشن کے درمیان ٹریک کی مرمت کی جائے گی۔ شٹل بس روٹ 12 ایگزٹ 4 کے باہر سے ہر 10 منٹ بعد چلے گی۔ میٹرو اسمارٹ کارڈ بغیر اضافی کرائے کے شٹل بسوں پر قابل قبول ہوگا۔\"",
            "ur_rm": "Transit Alert: \"Saturday ko Red Line par Central Station se University Junction tak track repair hogi. Shuttle Bus Route 12 Exit 4 se har 10 minutes baad chalegi. Metro cards valid hain bina extra fare.\""
          },
          "situation": {
            "en": "You have an important job interview at University Junction at 10:30 AM this Saturday.",
            "ur": "اس ہفتے صبح 10:30 بجے یونیورسٹی جنکشن کے قریب آپ کا ایک اہم ملازمت کا انٹرویو ہے۔",
            "ur_rm": "Is Saturday subah 10:30 AM par University Junction ke paas aap ka important job interview hai."
          },
          "prompt": {
            "en": "How should you plan your commute on Saturday to reach your interview on time?",
            "ur": "ہفتے کے روز وقت پر انٹرویو پہنچنے کے لیے آپ کو اپنے سفر کی کیا منصوبہ بندی کرنی چاہیے؟",
            "ur_rm": "Saturday ko interview par time par pohnchne ke liye commute kaise plan karein?"
          },
          "options": [
            {
              "id": "opt_fr_3_a",
              "text": {
                "en": "Wait on the Red Line train platform at Central Station expecting normal train arrivals.",
                "ur": "سینٹرل اسٹیشن کے پلیٹ فارم پر عام ٹرین کے آنے کا انتظار کرتے رہیں۔",
                "ur_rm": "Central Station platform par train arrival ka wait karte rahein."
              },
              "score": 35,
              "feedback": {
                "en": "The notice clearly states the track is closed for overhaul on Saturday; no trains will run on that segment.",
                "ur": "نوٹس میں واضح ہے کہ اس سیکشن پر ٹرینیں بند رہیں گی، پلیٹ فارم پر انتظار وقت ضائع کرے گا۔",
                "ur_rm": "Track closed hai maintenance ke liye, normal trains nahi chalengi."
              },
              "consequences": {
                "en": "You arrive 45 minutes late and miss your job interview opportunity.",
                "ur": "آپ انٹرویو کے لیے تاخیر کا شکار ہو جائیں گے جس سے ملازمت کا موقع ضائع ہو سکتا ہے۔",
                "ur_rm": "Interview miss hone aur opportunity lose hone ka severe risk."
              }
            },
            {
              "id": "opt_fr_3_b",
              "text": {
                "en": "Walk along the train tracks between Central Station and University Junction on foot.",
                "ur": "سینٹرل اسٹیشن سے یونیورسٹی تک ریلوے ٹریک کے ساتھ ساتھ پیدل چلنا شروع کر دیں۔",
                "ur_rm": "Train tracks par paidal walk karna start karein."
              },
              "score": 20,
              "feedback": {
                "en": "Walking on active railway maintenance tracks is strictly illegal and life-threatening.",
                "ur": "ریلوے ٹریک پر پیدل چلنا غیر قانونی اور جان لیوا خطرناک ہے۔",
                "ur_rm": "Railway tracks par trespassing illegal aur life-threatening hai."
              },
              "consequences": {
                "en": "Arrest by transit security and severe bodily hazard from heavy maintenance machinery.",
                "ur": "سیکیورٹی اہلکاروں کی گرفتاری اور حادثے کا شدید خطرہ۔",
                "ur_rm": "Transit police detention aur physical safety hazard."
              }
            },
            {
              "id": "opt_fr_3_c",
              "text": {
                "en": "Purchase a completely new private bus ticket without checking your Metro smart card.",
                "ur": "میٹرو کارڈ کی سہولت دیکھے بغیر پرائیویٹ بس کا نیا مہنگا ٹکٹ خریدیں۔",
                "ur_rm": "Metro smart card check kiye bina new expensive private ticket khareedein."
              },
              "score": 50,
              "feedback": {
                "en": "The notice states Shuttle Bus Route 12 accepts your existing Metro smart card with zero extra fare.",
                "ur": "نوٹس کے مطابق شٹل بس 12 میٹرو کارڈ پر مفت دستیاب ہے، اضافی ٹکٹ کی ضرورت نہیں۔",
                "ur_rm": "Shuttle bus existing metro card par free hai, new ticket purchase unnecessary expense hai."
              },
              "consequences": {
                "en": "Unnecessary out-of-pocket transit expense due to overlooking notice details.",
                "ur": "تفصیلات نہ پڑھنے سے بلاوجہ اضافی رقم خرچ ہو جاتی ہے۔",
                "ur_rm": "Unnecessary money spend hoti hai."
              }
            },
            {
              "id": "opt_fr_3_d",
              "text": {
                "en": "Leave 20 minutes earlier, take the Red Line to Central Station, and board Shuttle Bus Route 12 outside Exit 4 with your Metro card.",
                "ur": "20 منٹ پہلے نکلیں، سینٹرل اسٹیشن تک ٹرین لیں اور ایگزٹ 4 کے باہر سے شٹل بس 12 پر میٹرو کارڈ سے سفر کریں۔",
                "ur_rm": "20 min pehle niklein, Central Station pohnchein aur Exit 4 se Shuttle Bus 12 par Metro card use karein."
              },
              "score": 95,
              "feedback": {
                "en": "Perfect logistical planning! Factoring in shuttle transfer time ensures calm and punctual arrival.",
                "ur": "بہترین سفری منصوبہ بندی! شٹل کے وقت کا حساب رکھ کر نکلنا وقت پر پہنچنے کا ضامن ہے۔",
                "ur_rm": "Perfect transit route planning! Shuttle transfer time calculate karke interview par on-time arrival guaranteed."
              },
              "consequences": {
                "en": "You reach University Junction 15 minutes before interview time, poised and relaxed.",
                "ur": "آپ وقت سے 15 منٹ پہلے پرسکون انداز میں انٹرویو کے لیے پہنچ جاتے ہیں۔",
                "ur_rm": "Relaxed state mein 15 min early arrival for successful interview."
              }
            }
          ]
        },
        {
          "id": "adult_fr_4",
          "difficulty": "medium",
          "category": "employment_policy",
          "title": {
            "en": "Employment Contract: Annual & Sick Leave Policy",
            "ur": "ملازمت کا معاہدہ: سالانہ اور بیماری کی رخصت کی پالیسی",
            "ur_rm": "Employment Contract: Annual & Sick Leave Policy"
          },
          "passage": {
            "en": "Policy: \"Full-time employees receive 14 days Annual Leave and 10 days Medical Leave per year. Annual leave requires supervisor approval 3 business days in advance. Medical leave exceeding 2 consecutive days mandates a physician certificate upon return.\"",
            "ur": "پالیسی: \"کل وقتی ملازمین کو سالانہ 14 دن کی رخصت اور 10 دن کی میڈیکل رخصت ملتی ہے۔ سالانہ چھٹی کے لیے 3 کاروباری دن پہلے سپروائزر کی منظوری ضروری ہے۔ 2 دن سے زائد بیماری کی چھٹی پر واپسی پر ڈاکٹر کا سرٹیفکیٹ جمع کروانا لازمی ہے۔\"",
            "ur_rm": "Policy: \"Full-time employees ko 14 days Annual Leave aur 10 days Sick Leave milti hai. Annual leave ke liye 3 business days advance supervisor approval chahiye. 2 consecutive sick days se zyada par doctor certificate mandatory hai.\""
          },
          "situation": {
            "en": "You want to take a planned 2-day personal leave next Thursday and Friday to attend a family wedding.",
            "ur": "آپ اگلے جمعرات اور جمعہ کو خاندانی شادی میں شرکت کے لیے 2 دن کی باقاعدہ چھٹی لینا چاہتے ہیں۔",
            "ur_rm": "Aap next Thursday aur Friday ko family wedding ke liye 2-day planned leave lena chahte hain."
          },
          "prompt": {
            "en": "According to the company policy, what step is required to take this planned annual leave properly?",
            "ur": "کمپنی پالیسی کے مطابق باقاعدہ سالانہ چھٹی کی منظوری کے لیے کیا قدم اٹھانا ضروری ہے؟",
            "ur_rm": "Company policy ke mutabiq planned annual leave properly apply karne ke liye kya step zaroori hai?"
          },
          "options": [
            {
              "id": "opt_fr_4_a",
              "text": {
                "en": "Simply not show up on Thursday and send a text message on Friday evening.",
                "ur": "جمعرات کو خاموشی سے چھٹی کر لیں اور جمعہ کی شام ایک ٹیکسٹ میسج بھیج دیں۔",
                "ur_rm": "Thursday ko quietly absent ho jayein aur Friday evening ko text message karein."
              },
              "score": 30,
              "feedback": {
                "en": "Unannounced absence without advance approval constitutes unauthorized leave and disciplinary warnings.",
                "ur": "بغیر اطلاع چھٹی غیر حاضری شمار ہوتی ہے جس پر تادیبی کارروائی ہو سکتی ہے۔",
                "ur_rm": "Unannounced absence policy violation hai jo official disciplinary warning trigger karti hai."
              },
              "consequences": {
                "en": "Salary deduction for unauthorized absence and formal reprimand on your HR record.",
                "ur": "تنخواہ میں کٹوتی اور ملازمت کے ریکارڈ میں منفی اندراج کا خطرہ۔",
                "ur_rm": "Pay deduction aur negative HR record mark hota hai."
              }
            },
            {
              "id": "opt_fr_4_b",
              "text": {
                "en": "Submit an Annual Leave request on the company HR portal at least 3 business days before Thursday.",
                "ur": "جمعرات سے کم از کم 3 کاروباری دن پہلے کمپنی پورٹل پر چھٹی کی درخواست جمع کروائیں۔",
                "ur_rm": "Thursday se at least 3 business days pehle HR portal par Annual Leave request submit karein."
              },
              "score": 95,
              "feedback": {
                "en": "Perfect professional workplace compliance! Following contract policy maintains professional standing.",
                "ur": "پیشہ ورانہ قواعد کی بہترین پاسداری! پالیسی پر عمل کرنا ملازم کے وقار کو بلند کرتا ہے۔",
                "ur_rm": "Perfect workplace professionalism! Advance notice policy compliance ensure karta hai."
              },
              "consequences": {
                "en": "Your leave is formally approved with full paid status and coverage arranged smoothly.",
                "ur": "آپ کی چھٹی بغیر تنخواہ کٹوتی کے منظور ہو جاتی ہے اور دفتر میں کام متاثر نہیں ہوتا۔",
                "ur_rm": "Paid leave formal approval milta hai aur workplace smooth rehta hai."
              }
            },
            {
              "id": "opt_fr_4_c",
              "text": {
                "en": "Falsely claim you have the flu to use medical leave without advance notice.",
                "ur": "جھوٹا بہانہ بنائیں کہ آپ کو نزلہ ہے تاکہ پیشگی اطلاع کے بغیر بیماری کی چھٹی مل سکے۔",
                "ur_rm": "Fake sick leave claim karein advance notice avoid karne ke liye."
              },
              "score": 35,
              "feedback": {
                "en": "Falsifying medical leave violates integrity policies and risks immediate contract termination.",
                "ur": "طبی چھٹی کا جھوٹا دعویٰ کرنا دھوکہ دہی کے زمرے میں آتا ہے جو ملازمت ختم کر سکتا ہے۔",
                "ur_rm": "False medical claim integrity breach hai jo employment termination ka risk ban sakta hai."
              },
              "consequences": {
                "en": "Severe integrity breach if photos from the wedding surface on social media.",
                "ur": "سوشل میڈیا پر تصویریں آنے سے فراڈ ثابت ہونے پر ملازمت سے برطرفی کا خطرہ۔",
                "ur_rm": "Integrity violation se immediate job loss ka risk rehta hai."
              }
            },
            {
              "id": "opt_fr_4_d",
              "text": {
                "en": "Ask a coworker to clock in your attendance card while you are at the wedding.",
                "ur": "کسی ساتھی سے کہیں کہ وہ آپ کی جگہ حاضری کا کارڈ پنچ کر دے۔",
                "ur_rm": "Coworker se kahein ke woh aap ki proxy attendance mark kar de."
              },
              "score": 20,
              "feedback": {
                "en": "Buddy punching/proxy attendance is fraud under labor regulations and leads to dismissal.",
                "ur": "کسی دوسرے سے جعلی حاضری لگوانا سنگین فراڈ ہے جس پر دونوں ملازمین کو نکالا جا سکتا ہے۔",
                "ur_rm": "Proxy attendance severe fraud hai jo dismissal trigger karta hai."
              },
              "consequences": {
                "en": "Immediate disciplinary dismissal for both you and the assisting coworker.",
                "ur": "آپ اور آپ کے ساتھی دونوں کی فوری برطرفی کا خطرہ۔",
                "ur_rm": "Immediate employment dismissal for both parties."
              }
            }
          ]
        },
        {
          "id": "adult_fr_5",
          "difficulty": "challenging",
          "category": "security_alert",
          "title": {
            "en": "Bank Security SMS Alert & Phishing Warning",
            "ur": "بینک سیکیورٹی ایس ایم ایس الرٹ اور فراڈ سے بچاؤ",
            "ur_rm": "Bank Security SMS Alert & Phishing Warning"
          },
          "passage": {
            "en": "Bank Advisory: \"HBL / Meezan Bank never sends SMS messages with links requesting password, ATM PIN, or OTP verification. If you receive a message claiming account suspension with an unverified web link, do NOT click it. Report immediately to 111-000-425.\"",
            "ur": "بینک کی ہدایات: \"بینک کبھی بھی پاس ورڈ، اے ٹی ایم پن، یا او ٹی پی مانگنے کے لیے لنکس پر مشتمل ایس ایم ایس نہیں بھیجتا۔ اگر اکاؤنٹ بند ہونے کا پیغام کسی غیر تصدیق شدہ لنک کے ساتھ موصول ہو تو اس پر کلک ہرگز نہ کریں۔ فوری طور پر 111-000-425 پر اطلاع دیں۔\"",
            "ur_rm": "Bank Advisory: \"Bank kabhi bhi password, ATM PIN ya OTP verification links SMS par nahi bhejta. Agar account blocked ka SMS link ke sath aaye to click NA karein. Direct helpline 111-000-425 par report karein.\""
          },
          "situation": {
            "en": "You receive an urgent SMS: \"Your account is BLOCKED due to KYC. Click http://bank-kyc-update.com/verify to restore immediately.\"",
            "ur": "آپ کو ایک فوری ایس ایم ایس ملتا ہے: \"کے وائی سی کی وجہ سے آپ کا اکاؤنٹ بند کر دیا گیا ہے۔ بحالی کے لیے ابھی لنک پر کلک کریں۔\"",
            "ur_rm": "Aap ko urgent SMS aata hai: \"Your account is BLOCKED due to KYC. Click http://bank-kyc-update.com/verify to restore.\""
          },
          "prompt": {
            "en": "According to the official banking security notice, what is the safest action to take?",
            "ur": "بینک کی باضابطہ حفاظتی ہدایات کے مطابق سب سے محفوظ قدم کیا ہے؟",
            "ur_rm": "Official bank security advisory ke mutabiq safest action kya hai?"
          },
          "options": [
            {
              "id": "opt_fr_5_a",
              "text": {
                "en": "Click the link quickly and enter your CNIC and ATM PIN before the account gets permanently deleted.",
                "ur": "فوری طور پر لنک پر کلک کریں اور اپنا شناختی کارڈ نمبر اور اے ٹی ایم پن درج کریں۔",
                "ur_rm": "Foran link par click karein aur CNIC aur ATM PIN enter karein."
              },
              "score": 25,
              "feedback": {
                "en": "Phishing links steal banking credentials instantly; genuine banks never ask for PINs via web links.",
                "ur": "جعلی لنکس بینکنگ کی تفصیلات چوری کرتے ہیں، اصل بینک کبھی ویب لنک پر پن کوڈ نہیں مانگتے۔",
                "ur_rm": "Phishing websites credentials steal karti hain; bank kabhi PIN link par nahi maangta."
              },
              "consequences": {
                "en": "Financial fraud: cybercriminals drain your bank balance within minutes.",
                "ur": "اکاؤنٹ سے تمام رقوم کی چوری اور مالی نقصان کا سامنا۔",
                "ur_rm": "Immediate account balance drain by cybercriminals."
              }
            },
            {
              "id": "opt_fr_5_b",
              "text": {
                "en": "Forward the SMS to all your family WhatsApp groups asking if they got it too.",
                "ur": "میسج کو تمام فیملی واٹس ایپ گروپس میں فارورڈ کر کے پوچھیں کہ کیا انہیں بھی ملا ہے۔",
                "ur_rm": "SMS ko family WhatsApp groups par forward karein."
              },
              "score": 45,
              "feedback": {
                "en": "Forwarding phishing links spreads security risks to less tech-savvy family members.",
                "ur": "فراڈ والے لنکس فارورڈ کرنے سے دیگر افراد بھی دھوکے کا شکار ہو سکتے ہیں۔",
                "ur_rm": "Phishing links forward karne se family members ke hack hone ka risk barhta hai."
              },
              "consequences": {
                "en": "Family members might accidentally click the dangerous link and lose funds.",
                "ur": "خاندان کے دیگر افراد انجانے میں کلک کر کے نقصان اٹھا سکتے ہیں۔",
                "ur_rm": "Family members financial scam ka shikaar ho sakte hain."
              }
            },
            {
              "id": "opt_fr_5_c",
              "text": {
                "en": "Do NOT click the link; verify your account status directly via the official banking app or official helpline (111-000-425).",
                "ur": "لنک پر کلک نہ کریں؛ بینک کی آفیشل ایپ یا ہیلپ لائن (111-000-425) سے براہ راست تصدیق کریں۔",
                "ur_rm": "Link click NA karein; official banking app ya helpline (111-000-425) se account verify karein."
              },
              "score": 95,
              "feedback": {
                "en": "Masterful fraud awareness! Bypassing unverified links and contacting certified channels eliminates phishing risks.",
                "ur": "فراڈ سے بچاؤ کا بہترین فیصلہ! غیر تصدیق شدہ لنکس کو چھوڑ کر باضابطہ ہیلپ لائن سے رابطہ کرنا بالکل درست عمل ہے۔",
                "ur_rm": "Masterful security hygiene! Direct official channel verification phishing ko 100% defeat karti hai."
              },
              "consequences": {
                "en": "Your account, savings, and personal identity remain 100% secure.",
                "ur": "آپ کا اکاؤنٹ اور تمام جمع پونجی مکمل طور پر محفوظ رہتی ہے۔",
                "ur_rm": "Bank balance aur credentials 100% secure rehte hain."
              }
            },
            {
              "id": "opt_fr_5_d",
              "text": {
                "en": "Reply to the SMS text with angry insults demanding they unblock your card.",
                "ur": "ایس ایم ایس کا غصے سے جواب دیں اور کارڈ فوری بحال کرنے کا مطالبہ کریں۔",
                "ur_rm": "SMS par angry reply bhej kar card unblock karne ka demand karein."
              },
              "score": 30,
              "feedback": {
                "en": "Replying to scam numbers confirms your phone number is active and invites more scam attempts.",
                "ur": "فراڈ نمبرز پر جواب دینے سے وہ تصدیق کر لیتے ہیں کہ نمبر چالو ہے، جس سے مزید دھوکہ دہی کے پیغامات آتے ہیں۔",
                "ur_rm": "Scam number par reply karne se number active confirm hota hai aur spam barhta hai."
              },
              "consequences": {
                "en": "Your phone number is marked as active and receives heavy waves of scam spam.",
                "ur": "آپ کا نمبر فراڈ گروپس میں فعال نشان زد ہو جاتا ہے۔",
                "ur_rm": "Increased spam and scam targeting on your phone."
              }
            }
          ]
        }
      ]
    },
    {
      "id": "adult_problem_solving",
      "skillKey": "problem_solving",
      "type": "problem_solving",
      "title": {
        "en": "Everyday Problem Solving 🧩",
        "ur": "روزمرہ مسائل کا حل 🧩",
        "ur_rm": "Everyday Problem Solving 🧩"
      },
      "description": {
        "en": "Budget comparison, transit contingencies, service overcharges, workplace deadlines, and household maintenance.",
        "ur": "بجٹ کا موازنہ، سفری متبادل، بل کے تنازعات، دفتری ترجیحات اور گھریلو مرمت کے عملی فیصلے کریں۔",
        "ur_rm": "Budget comparison, transit choices, service overcharges, workplace deadlines, aur household maintenance."
      },
      "icon": "🧩",
      "scenarios": [
        {
          "id": "adult_ps_1",
          "difficulty": "easy",
          "category": "smart_shopping",
          "title": {
            "en": "Grocery Store Unit Price & Bulk Value",
            "ur": "گروسری اسٹور میں قیمت اور وزن کا موازنہ",
            "ur_rm": "Grocery Store Unit Price & Bulk Value"
          },
          "situation": {
            "en": "At the supermarket, cooking oil Brand A sells a 1-liter bottle for Rs. 550. A 5-liter tin of the same brand sells for Rs. 2,400. You have sufficient monthly grocery budget.",
            "ur": "سپر مارکیٹ میں کوکنگ آئل کی 1 لیٹر کی بوتل 550 روپے کی ہے، جبکہ اسی برانڈ کا 5 لیٹر کا کین 2,400 روپے کا ہے۔ آپ کے پاس پورے مہینے کا گروسری بجٹ موجود ہے۔",
            "ur_rm": "Supermarket mein cooking oil 1-liter bottle Rs. 550 ki hai aur 5-liter tin Rs. 2,400 ka hai. Aap ke paas monthly grocery budget available hai."
          },
          "prompt": {
            "en": "Calculating unit prices, which purchasing decision saves more money for your monthly household consumption?",
            "ur": "فی لیٹر قیمت کا موازنہ کرتے ہوئے، کون سا فیصلہ ماہانہ گھریلو خرچ میں زیادہ بچت فراہم کرتا ہے؟",
            "ur_rm": "Per liter unit price compare karte hue konsa option monthly budget mein zyada bachat karega?"
          },
          "options": [
            {
              "id": "opt_ps_1_a",
              "text": {
                "en": "Buy five separate 1-liter bottles for Rs. 2,750 because small bottles look easier to carry.",
                "ur": "5 الگ الگ بوتلیں 2,750 روپے میں خریدیں کیونکہ چھوٹی بوتلیں پکڑنا آسان لگتا ہے۔",
                "ur_rm": "Five 1-liter bottles Rs. 2,750 mein lein kyunki small bottles easy lagti hain."
              },
              "score": 40,
              "feedback": {
                "en": "Buying five 1-liter bottles costs Rs. 2,750 (Rs. 550 x 5), which is Rs. 350 more expensive than the 5-liter tin.",
                "ur": "پانچ بوتلیں 2,750 روپے کی پڑیں گی جو کہ 5 لیٹر کے کین سے 350 روپے زیادہ مہنگی ہیں۔",
                "ur_rm": "Five 1L bottles Rs. 2,750 cost karti hain jo 5L tin se Rs. 350 mehngi hain."
              },
              "consequences": {
                "en": "You overspend Rs. 350 needlessly on packaging rather than oil volume.",
                "ur": "آپ پیکنگ کی وجہ سے 350 روپے اضافی خرچ کر دیتے ہیں۔",
                "ur_rm": "Avoidable Rs. 350 loss on basic groceries."
              }
            },
            {
              "id": "opt_ps_1_b",
              "text": {
                "en": "Buy the 5-liter tin for Rs. 2,400 (Rs. 480/liter), saving Rs. 350 compared to five separate bottles.",
                "ur": "5 لیٹر کا کین 2,400 روپے (480 روپے فی لیٹر) میں خریدیں اور الگ بوتلوں کے مقابلے میں 350 روپے بچائیں۔",
                "ur_rm": "5-liter tin Rs. 2,400 mein khareedein (Rs. 480/L), separate bottles ke muqable mein Rs. 350 bacha kar."
              },
              "score": 95,
              "feedback": {
                "en": "Smart adult financial numeracy! Calculating price-per-unit reveals significant bulk savings.",
                "ur": "شاندار گھریلو بجٹ فہم! فی لیٹر قیمت کا حساب کر کے خریداری کرنا سمجھداری کی علامت ہے۔",
                "ur_rm": "Smart grocery budgeting! Unit price calculation se direct household savings hoti hain."
              },
              "consequences": {
                "en": "You save Rs. 350 directly on essential groceries to allocate toward other household needs.",
                "ur": "آپ کی بچت دوسرے گھریلو ضروریات کے لیے کام آتی ہے۔",
                "ur_rm": "Rs. 350 savings build buffer in monthly household expenses."
              }
            },
            {
              "id": "opt_ps_1_c",
              "text": {
                "en": "Avoid buying cooking oil altogether and purchase 10 packets of chips instead.",
                "ur": "کوکنگ آئل خریدنا چھوڑ دیں اور اس کے بجائے چپس کے 10 پیکٹ خرید لیں۔",
                "ur_rm": "Cooking oil chhor kar 10 packets chips khareed lein."
              },
              "score": 20,
              "feedback": {
                "en": "Replacing necessary household staples with junk food disrupts family meal preparation.",
                "ur": "ضروری گھریلو راشن کو غیر معیاری اشیاء سے بدلنا باورچی خانے کے بجٹ کو خراب کرتا ہے۔",
                "ur_rm": "Essential staples ko junk food se replace karna domestic budget aur health ko hurt karta hai."
              },
              "consequences": {
                "en": "Kitchen runs out of basic cooking supplies by mid-week.",
                "ur": "ہفتے کے دوران کھانا بنانے کا سامان ختم ہو جائے گا۔",
                "ur_rm": "Kitchen supplies deficit during regular week."
              }
            },
            {
              "id": "opt_ps_1_d",
              "text": {
                "en": "Borrow cooking oil from three different neighbors every single day.",
                "ur": "روزانہ تین مختلف پڑوسیوں سے کھانا پکانے کے لیے تیل مانگتے رہیں۔",
                "ur_rm": "Daily 3 different neighbors se oil borrow karte rahein."
              },
              "score": 30,
              "feedback": {
                "en": "Relying continually on neighbors for daily staples strains community relationships.",
                "ur": "روزمرہ کی چیزوں کے لیے پڑوسیوں پر انحصار سماجی تعلقات کو متاثر کرتا ہے۔",
                "ur_rm": "Continuous staple borrowing neighbor relations ko awkward banata hai."
              },
              "consequences": {
                "en": "Creates social awkwardness and tension with neighbors.",
                "ur": "پڑوسیوں میں ناگواری پیدا ہوتی ہے۔",
                "ur_rm": "Community reputation aur dignity compromise hoti hai."
              }
            }
          ]
        },
        {
          "id": "adult_ps_2",
          "difficulty": "easy",
          "category": "commute_decision",
          "title": {
            "en": "Commute Decision: Metro vs Rickshaw on Rainy Morning",
            "ur": "سفر کا فیصلہ: بارش کی صبح میٹرو بمقابلہ رکشہ",
            "ur_rm": "Commute Decision: Metro vs Rickshaw on Rainy Morning"
          },
          "situation": {
            "en": "It is heavily raining, and main roads are starting to flood with traffic jams. You have an important 9:00 AM office presentation. A direct rickshaw costs Rs. 400 (risk of gridlock). Metro train costs Rs. 50 (10 min walk with umbrella, runs on elevated track).",
            "ur": "شدید بارش ہو رہی ہے اور سڑکوں پر ٹریفک جام ہو رہا ہے۔ صبح 9 بجے دفتر میں آپ کی اہم پریزنٹیشن ہے۔ رکشہ 400 روپے مانگ رہا ہے (جام میں پھنسنے کا خطرہ)، جبکہ میٹرو 50 روپے کی ہے (10 منٹ پیدل چھتری کے ساتھ، اونچے ٹریک پر بلا تعطل چلتی ہے)۔",
            "ur_rm": "Heavy rain aur road flooding hai. 9:00 AM office presentation hai. Direct rickshaw Rs. 400 hai (traffic risk), Metro Rs. 50 hai (10 min walk, uninterrupted elevated track)."
          },
          "prompt": {
            "en": "Which transit choice provides the most reliable timing and financial value to ensure on-time arrival?",
            "ur": "وقت پر پہنچنے اور پیسے کی بچت کے لیے سب سے قابل اعتماد فیصلہ کیا ہوگا؟",
            "ur_rm": "Reliable timing aur financial value ke mutabiq on-time arrival ke liye best commute choice kya hai?"
          },
          "options": [
            {
              "id": "opt_ps_2_a",
              "text": {
                "en": "Take the rickshaw and hope the driver finds flooded shortcuts through deep water.",
                "ur": "رکشہ لیں اور امید کریں کہ ڈرائیور گہرے پانی سے کوئی شارٹ کٹ نکال لے گا۔",
                "ur_rm": "Rickshaw lein aur hope karein ke flooded shortcut se nikal jaye."
              },
              "score": 35,
              "feedback": {
                "en": "Rickshaws frequently stall in flooded streets during heavy rain, guaranteeing massive delays.",
                "ur": "بارش کے پانی میں رکشے بند ہو جاتے ہیں جس سے دفتر پہنچنے میں شدید تاخیر ہو سکتی ہے۔",
                "ur_rm": "Flooded roads par rickshaws stall ho jate hain aur heavy traffic delay hota hai."
              },
              "consequences": {
                "en": "Rickshaw gets stuck in flooded intersection; you miss the 9:00 AM presentation.",
                "ur": "پانی میں پھنس جانے کی وجہ سے اہم پریزنٹیشن چھوٹ جائے گی۔",
                "ur_rm": "Presentation missed due to vehicle breakdown in rain."
              }
            },
            {
              "id": "opt_ps_2_b",
              "text": {
                "en": "Stand outside in the rain for 45 minutes waiting for a friend with a motorbike.",
                "ur": "موٹر سائیکل والے دوست کے انتظار میں بارش میں 45 منٹ کھڑے رہیں۔",
                "ur_rm": "Rain mein 45 min motorbike friend ka wait karein."
              },
              "score": 30,
              "feedback": {
                "en": "Motorbike travel in torrential rain is hazardous and leaves your clothes drenched.",
                "ur": "شدید بارش میں موٹر سائیکل پر سفر کرنا خطرناک ہے اور کپڑے گیلے ہو جاتے ہیں۔",
                "ur_rm": "Motorbike in heavy rain dangerous hai aur clothes soaked ho jate hain."
              },
              "consequences": {
                "en": "You arrive completely soaked and cold, unprepared for a professional meeting.",
                "ur": "گیلے کپڑوں کے ساتھ دفتر پہنچنا پیشہ ورانہ تاثر کو خراب کرتا ہے۔",
                "ur_rm": "Unprofessional wet appearance and high illness risk."
              }
            },
            {
              "id": "opt_ps_2_c",
              "text": {
                "en": "Go back to sleep and send a text saying rain made travel impossible in the city.",
                "ur": "واپس سو جائیں اور میسج کر دیں کہ شہر میں بارش کی وجہ سے آنا ناممکن ہے۔",
                "ur_rm": "Wapas so jayein aur message karein ke rain ki wajah se nahi aa sakte."
              },
              "score": 40,
              "feedback": {
                "en": "Canceling important presentations when reliable metro transit exists harms work reliability.",
                "ur": "جب میٹرو کا محفوظ متبادل موجود ہو تو چھٹی کرنا غیر ذمہ دارانہ عمل ہے۔",
                "ur_rm": "Viable transit option hone par absence call karna professional reputation hurt karta hai."
              },
              "consequences": {
                "en": "Management questions your commitment when other colleagues arrive via metro.",
                "ur": "مینجمنٹ آپ کے کام کے جذبے پر سوال اٹھا سکتی ہے۔",
                "ur_rm": "Career credibility damaged when others commute successfully."
              }
            },
            {
              "id": "opt_ps_2_d",
              "text": {
                "en": "Use an umbrella, walk 10 minutes to the elevated Metro station, pay Rs. 50, and bypass all surface road traffic.",
                "ur": "چھتری لے کر 10 منٹ چل کر میٹرو اسٹیشن جائیں، 50 روپے کا ٹکٹ لیں اور ٹریفک سے بے نیاز ہو کر وقت پر پہنچیں۔",
                "ur_rm": "Umbrella use karein, 10 min walk karke elevated Metro lein (Rs. 50) aur road traffic bypass karein."
              },
              "score": 95,
              "feedback": {
                "en": "Exceptional urban transit decision! Elevated rail avoids traffic jams and guarantees punctual arrival at a fraction of the cost.",
                "ur": "شاندار سفری حکمت عملی! میٹرو ٹرین سڑک کے ٹریفک سے بچاتی ہے اور کم خرچ میں وقت پر پہنچاتی ہے۔",
                "ur_rm": "Exceptional transit problem solving! Elevated metro ensures zero traffic delay and saves Rs. 350."
              },
              "consequences": {
                "en": "You arrive at the office by 8:45 AM dry, prepared, and deliver a successful presentation.",
                "ur": "آپ وقت سے 15 منٹ پہلے صاف ستھرے انداز میں پہنچ کر شاندار پریزنٹیشن دیتے ہیں۔",
                "ur_rm": "Dry, punctual 8:45 AM arrival with successful professional presentation."
              }
            }
          ]
        },
        {
          "id": "adult_ps_3",
          "difficulty": "medium",
          "category": "consumer_rights",
          "title": {
            "en": "Disputed Supermarket Billing Overcharge",
            "ur": "سپر مارکیٹ کے بل میں اضافی رقم کا تنازعہ",
            "ur_rm": "Disputed Supermarket Billing Overcharge"
          },
          "situation": {
            "en": "You review your grocery store receipt after paying and notice you were charged Rs. 850 for a box of laundry detergent listed on the shelf for Rs. 550. The cashier line is busy.",
            "ur": "خریداری کے بعد بل چیک کرنے پر آپ دیکھتے ہیں کہ سرف کے ڈبے کی قیمت شیلف پر 550 روپے درج تھی مگر بل میں 850 روپے وصول کیے گئے ہیں۔ کاؤنٹر پر رش ہے۔",
            "ur_rm": "Grocery receipt check karne par pata chala ke laundry detergent shelf price Rs. 550 tha magar bill mein Rs. 850 charge hua hai. Counter par rush hai."
          },
          "prompt": {
            "en": "What is the most assertive, polite, and effective way to get your rightful Rs. 300 refund?",
            "ur": "اپنے جائز 300 روپے واپس حاصل کرنے کا سب سے باوقار اور موثر طریقہ کیا ہوگا؟",
            "ur_rm": "Rightful Rs. 300 refund lene ke liye most assertive aur polite method kya hai?"
          },
          "options": [
            {
              "id": "opt_ps_3_a",
              "text": {
                "en": "Take the receipt and detergent to the Customer Service / Manager Desk, calmly explain the price discrepancy, and request a barcode price correction.",
                "ur": "بل اور سرف لے کر کسٹمر سروس ڈیسک پر جائیں، آرام سے قیمت کا فرق دکھائیں اور 300 روپے کی درستگی کروائیں۔",
                "ur_rm": "Receipt aur detergent Customer Service Desk le jayein, calmly price discrepancy explain karein aur correction lein."
              },
              "score": 95,
              "feedback": {
                "en": "Exemplary consumer rights assertiveness! Addressing the dedicated service desk with receipt proof resolves disputes calmly.",
                "ur": "صارفین کے حقوق کے لیے بہترین طریقہ کار! رسید کے ساتھ کسٹمر سروس سے بات کرنا فوری حل فراہم کرتا ہے۔",
                "ur_rm": "Exemplary consumer assertiveness! Proof ke sath customer service jana calm refund ensure karta hai."
              },
              "consequences": {
                "en": "Customer service updates their scanning system and promptly refunds your Rs. 300 cash.",
                "ur": "کسٹمر سروس سسٹم کو درست کرتی ہے اور آپ کے 300 روپے فوری واپس مل جاتے ہیں۔",
                "ur_rm": "System updated and immediate Rs. 300 refund received."
              }
            },
            {
              "id": "opt_ps_3_b",
              "text": {
                "en": "Scream at the young cashier across the store and accuse them of intentionally stealing your money.",
                "ur": "کیشیئر پر سب کے سامنے چلائیں اور الزام لگائیں کہ اس نے جان بوجھ کر پیسے چرائے ہیں۔",
                "ur_rm": "Cashier par publicly shout karein aur theft ka accusation lagayein."
              },
              "score": 30,
              "feedback": {
                "en": "Aggression toward frontline cashiers who do not set barcode prices creates conflict without speeding up refunds.",
                "ur": "کیشیئر پر غصہ کرنا بلاوجہ بدزبانی ہے کیونکہ قیمتیں کمپیوٹر سسٹم میں طے ہوتی ہیں۔",
                "ur_rm": "Cashiers par aggression unnecessary conflict create karti hai."
              },
              "consequences": {
                "en": "Store security gets involved and you experience humiliating public confrontation.",
                "ur": "سیکیورٹی کی مداخلت سے بدمزگی اور شرمندگی کا سامنا کرنا پڑتا ہے۔",
                "ur_rm": "Security escalation and unnecessary embarrassment."
              }
            },
            {
              "id": "opt_ps_3_c",
              "text": {
                "en": "Walk out of the store in silence and post an anonymous negative review online.",
                "ur": "خاموشی سے اسٹور سے باہر نکل آئیں اور انٹرنیٹ پر گمنام منفی تبصرہ لکھ دیں۔",
                "ur_rm": "Quietly walk out karein aur online anonymous negative review likhein."
              },
              "score": 45,
              "feedback": {
                "en": "Passive online venting fails to recover your hard-earned money when immediate in-store remedy was available.",
                "ur": "خاموشی اختیار کرنے سے آپ کے پیسے ضائع ہو جاتے ہیں جبکہ فوری شکایت سے مسئلہ حل ہو سکتا تھا۔",
                "ur_rm": "Passive venting se financial loss recover nahi hota."
              },
              "consequences": {
                "en": "You permanently lose Rs. 300 while the store barcode error remains uncorrected for others.",
                "ur": "آپ کے 300 روپے ضائع ہو جاتے ہیں اور غلطی بھی برقرار رہتی ہے۔",
                "ur_rm": "Permanent Rs. 300 loss and uncorrected barcode error."
              }
            },
            {
              "id": "opt_ps_3_d",
              "text": {
                "en": "Grab an extra snack from the shelf and walk out without paying to \"even the score\".",
                "ur": "شیلف سے کوئی دوسرا سنیک اٹھا کر بغیر بتائے نکل جائیں تاکہ حساب برابر ہو جائے۔",
                "ur_rm": "Shelf se extra item pick karke bina payment exit karein score even karne ke liye."
              },
              "score": 20,
              "feedback": {
                "en": "Taking items without authorization is shoplifting under criminal law regardless of prior overcharges.",
                "ur": "بغیر ادائیگی چیز اٹھانا قانوناً جرم ہے خواہ بل میں غلطی ہوئی ہو۔",
                "ur_rm": "Shoplifting criminal offense hai regardless of billing errors."
              },
              "consequences": {
                "en": "Detention by police for shoplifting and criminal record consequences.",
                "ur": "پولیس کی گرفتاری اور قانونی کارروائی کا خطرہ۔",
                "ur_rm": "Police arrest and criminal record consequences."
              }
            }
          ]
        },
        {
          "id": "adult_ps_4",
          "difficulty": "medium",
          "category": "workplace_priorities",
          "title": {
            "en": "Overlapping Urgent Workplace Deadlines",
            "ur": "دفتر میں بیک وقت دو اہم کاموں کی ڈیڈ لائن",
            "ur_rm": "Overlapping Urgent Workplace Deadlines"
          },
          "situation": {
            "en": "Your manager asks you to finalize an urgent client financial audit report by 4:00 PM today. At 1:00 PM, another senior department head requests an urgent vendor payment verification \"immediately\". You cannot finish both thoroughly alone in 3 hours.",
            "ur": "آپ کے مینیجر نے آج شام 4 بجے تک کلائنٹ کی فنانشل رپورٹ مانگی ہے۔ دوپہر 1 بجے ایک دوسرے سینئر افسر نے وینڈر پیمنٹ کی تصدیق کا فوری کام دے دیا۔ آپ اکیلے 3 گھنٹے میں دونوں کام مکمل نہیں کر سکتے۔",
            "ur_rm": "Manager ne 4:00 PM tak client audit report maangi hai. 1:00 PM par senior head ne vendor payment verification \"immediately\" manga hai. Dono 3 hours mein akele impossible hain."
          },
          "prompt": {
            "en": "How do you handle these competing requests professionally without missing the primary deadline or delivering flawed work?",
            "ur": "بغیر کسی غلطی کے دونوں کاموں کو پیشہ ورانہ طریقے سے سنبھالنے کے لیے آپ کیا کریں گے؟",
            "ur_rm": "Competing urgent requests ko professionally kaise triage karein bina quality kharab kiye?"
          },
          "options": [
            {
              "id": "opt_ps_4_a",
              "text": {
                "en": "Rush through both tasks simultaneously at double speed, skipping calculations and validation checks.",
                "ur": "بغیر جانچ پڑتال کے دونوں کاموں کو جلد بازی میں تیزی سے نبٹانے کی کوشش کریں۔",
                "ur_rm": "Dono tasks double speed mein rush karein validation checks skip karke."
              },
              "score": 35,
              "feedback": {
                "en": "Rushing complex financial data introduces critical errors that can cost the company millions.",
                "ur": "مالیاتی اعداد و شمار میں جلد بازی سنگین غلطیوں کا باعث بنتی ہے جو ادارے کے لیے نقصان دہ ہے۔",
                "ur_rm": "Rushing calculations financial reports mein severe errors introduce karta hai."
              },
              "consequences": {
                "en": "Audit report contains embarrassing calculation errors discovered by the external client.",
                "ur": "کلائنٹ کی جانب سے غلطیاں سامنے آنے پر کمپنی میں بدنامی ہوتی ہے۔",
                "ur_rm": "Critical audit errors discovered by client leading to severe reprimand."
              }
            },
            {
              "id": "opt_ps_4_b",
              "text": {
                "en": "Ignore the second senior head completely and pretend you never received their request.",
                "ur": "دوسرے افسر کے کام کو مکمل نظر انداز کر دیں اور ظاہر کریں کہ آپ کو پیغام ملا ہی نہیں تھا۔",
                "ur_rm": "Senior head ko completely ignore karein aur pretend karein email nahi mili."
              },
              "score": 45,
              "feedback": {
                "en": "Silent avoidance causes operational gridlock and damages interdepartmental trust.",
                "ur": "خاموشی سے کام نظر انداز کرنا دفتری تعلقات اور کام کو متاثر کرتا ہے۔",
                "ur_rm": "Silent avoidance interdepartmental bottlenecks aur friction create karta hai."
              },
              "consequences": {
                "en": "Senior department head files an official complaint with your director regarding unresponsive behavior.",
                "ur": "دوسرے ڈیپارٹمنٹ کی جانب سے اعلیٰ حکام کو شکایت کی جا سکتی ہے۔",
                "ur_rm": "Formal complaint filed for lack of communication."
              }
            },
            {
              "id": "opt_ps_4_c",
              "text": {
                "en": "Speak directly to your primary manager: \"I am working on the 4 PM audit report. Senior Head requested vendor verification. Which takes priority, or can vendor verification be scheduled for 5 PM?\"",
                "ur": "اپنے مینیجر کو فوری آگاہ کریں: \"میں 4 بجے کی رپورٹ پر کام کر رہا ہوں۔ دوسرے ڈیپارٹمنٹ نے بھی کام دیا ہے۔ کس کو ترجیح دینی چاہیے، یا کیا وینڈر کام 5 بجے تک ہو سکتا ہے؟\"",
                "ur_rm": "Primary manager se directly communicate karein: \"Audit report 4 PM tak scheduled hai. Vendor verification ki priority kya hai ya 5 PM tak adjust karein?\""
              },
              "score": 95,
              "feedback": {
                "en": "Outstanding executive communication! Transparent priority alignment enables managers to manage resource allocation effectively.",
                "ur": "لاجواب دفتری انداز! ترجیحات کا بروقت تعین افسران کو کام کی بہتر تقسیم میں مدد دیتا ہے۔",
                "ur_rm": "Outstanding workplace communication! Transparent workload triage enables managers to reallocate tasks smoothly."
              },
              "consequences": {
                "en": "Manager assigns the vendor check to a teammate, enabling you to finish the 4 PM audit report flawlessly.",
                "ur": "مینیجر دوسرا کام کسی اور کو سونپ دیتا ہے اور آپ کی رپورٹ وقت پر مکمل ہو جاتی ہے۔",
                "ur_rm": "Tasks successfully rebalanced; 4 PM client audit delivered with 100% accuracy."
              }
            },
            {
              "id": "opt_ps_4_d",
              "text": {
                "en": "Turn off your computer at 2:00 PM and leave the office early to avoid confrontation.",
                "ur": "دوپہر 2 بجے کمپیوٹر بند کریں اور پریشانی سے بچنے کے لیے دفتر سے جلدی نکل جائیں۔",
                "ur_rm": "2:00 PM par system shutdown karein aur confrontation avoid karne ke liye office chhor dein."
              },
              "score": 20,
              "feedback": {
                "en": "Abandoning post during critical project deadlines violates employment obligations.",
                "ur": "اہم ڈیڈ لائن کے دوران کام چھوڑ کر چلے جانا سنگین غفلت ہے۔",
                "ur_rm": "Job abandonment during critical deadlines disciplinary action trigger karti hai."
              },
              "consequences": {
                "en": "Immediate HR inquiry for abandoning office duties during core hours.",
                "ur": "دفتری اوقات میں بغیر بتائے جانے پر سخت تادیبی کارروائی کا خطرہ۔",
                "ur_rm": "Immediate suspension notice for unauthorized work abandonment."
              }
            }
          ]
        },
        {
          "id": "adult_ps_5",
          "difficulty": "challenging",
          "category": "home_maintenance",
          "title": {
            "en": "Emergency Home Plumbing Leak on Weekend",
            "ur": "ہفتہ وار چھٹی پر گھر کے پائپ کا اچانک لیکیج",
            "ur_rm": "Emergency Home Plumbing Leak on Weekend"
          },
          "situation": {
            "en": "On Sunday morning, a pipe under your bathroom sink bursts, spraying water rapidly across the floor toward the hallway carpet. You live in a rented second-floor apartment.",
            "ur": "اتوار کی صبح باتھ روم کے سنک کا پائپ پھٹ جاتا ہے اور پانی تیزی سے فرش اور ہال کے قالین کی طرف پھیل رہا ہے۔ آپ دوسری منزل پر کرائے کے فلیٹ میں رہتے ہیں۔",
            "ur_rm": "Sunday morning bathroom sink pipe burst ho jata hai aur paani hallway carpet ki taraf tezi se spread ho raha hai. Aap 2nd floor rented apartment mein rehte hain."
          },
          "prompt": {
            "en": "What is the immediate, damage-minimizing sequence of actions you must take?",
            "ur": "نقصان سے بچنے کے لیے آپ کو فوری طور پر کون سا قدم اٹھانا چاہیے؟",
            "ur_rm": "Immediate damage minimize karne ke liye sequence of actions kya honi chahiye?"
          },
          "options": [
            {
              "id": "opt_ps_5_a",
              "text": {
                "en": "Place a single small teacup under the spraying pipe and wait until Monday to tell the landlord.",
                "ur": "پائپ کے نیچے چائے کی چھوٹی پیالی رکھ دیں اور پیر تک مالک مکان کو بتانے کا انتظار کریں۔",
                "ur_rm": "Chota teacup rakh dein aur Monday tak landlord ko batane ka wait karein."
              },
              "score": 30,
              "feedback": {
                "en": "A small cup overflows in 5 seconds; delaying action floods the building and damages downstairs apartments.",
                "ur": "چھوٹی پیالی چند سیکنڈ میں بھر جائے گی اور تاخیر سے نیچے والے فلیٹس کو بھی نقصان پہنچے گا۔",
                "ur_rm": "Severe flooding downstairs apartment ko damage karegi."
              },
              "consequences": {
                "en": "Extensive water damage to ceilings below, resulting in tens of thousands in repair liability.",
                "ur": "عمارت کو شدید نقصان پہنچے گا جس کا بھاری جرمانہ آپ کو بھرنا پڑے گا۔",
                "ur_rm": "Huge financial liability for downstairs structural water damage."
              }
            },
            {
              "id": "opt_ps_5_b",
              "text": {
                "en": "Immediately shut off the main water isolation valve under the sink or main meter, place towels/buckets, and call an emergency plumber.",
                "ur": "فوری طور پر سنک کے نیچے یا مین والو سے پانی کا کنکشن بند کریں، تولیے اور بالٹی رکھیں اور ایمرجنسی پلمبر کو بلائیں۔",
                "ur_rm": "Immediately main water isolation valve band karein, towels/buckets place karein aur emergency plumber ko call karein."
              },
              "score": 95,
              "feedback": {
                "en": "Masterful emergency household triage! Cutting the water source at the root stops flooding in under 30 seconds.",
                "ur": "شاندار گھریلو ایمرجنسی حکمت عملی! مین والو بند کرنے سے پانی کا بہاؤ چند سیکنڈ میں رک جاتا ہے۔",
                "ur_rm": "Masterful emergency response! Main valve cutoff stops damage at root within seconds."
              },
              "consequences": {
                "en": "Flooding is halted immediately, protecting apartment floors, carpets, and downstairs neighbors.",
                "ur": "پانی فوری رک جاتا ہے اور قالین و مکان بڑے نقصان سے محفوظ رہتے ہیں۔",
                "ur_rm": "Apartment structural safety preserved; minimal repair cost."
              }
            },
            {
              "id": "opt_ps_5_c",
              "text": {
                "en": "Take photos of the leak for social media stories before doing anything else.",
                "ur": "کچھ بھی کرنے سے پہلے سوشل میڈیا پر اسٹوری ڈالنے کے لیے ویڈیوز اور تصاویر بنائیں۔",
                "ur_rm": "Pehle social media story ke liye photos videos banayein."
              },
              "score": 20,
              "feedback": {
                "en": "Wasting crucial minutes on social media allows hundreds of liters of water to destroy flooring.",
                "ur": "تصاویر میں وقت ضائع کرنے سے سینکڑوں لیٹر پانی گھر کو برباد کر دیتا ہے۔",
                "ur_rm": "Crucial minutes waste karne se property severely damage hoti hai."
              },
              "consequences": {
                "en": "Floorboards warp and electrical wiring shorts out while recording videos.",
                "ur": "فرش اور بجلی کی وائرنگ تباہ ہونے سے شارٹ سرکٹ کا خطرہ ہوتا ہے۔",
                "ur_rm": "Flooring ruined and electrical short-circuit hazard."
              }
            },
            {
              "id": "opt_ps_5_d",
              "text": {
                "en": "Leave the apartment door open and go to the shopping mall for the day.",
                "ur": "گھر کا دروازہ کھلا چھوڑ دیں اور سارا دن مال میں خریداری کے لیے چلے جائیں۔",
                "ur_rm": "Door open chhor kar poora din shopping mall chale jayein."
              },
              "score": 15,
              "feedback": {
                "en": "Gross negligence during active household flooding causes catastrophic property destruction.",
                "ur": "پانی بہتا چھوڑ کر چلے جانا مجرمانہ غفلت ہے جس سے پوری عمارت کو خطرہ ہو سکتا ہے۔",
                "ur_rm": "Gross negligence criminal civil liability attract karti hai."
              },
              "consequences": {
                "en": "Building evacuation and legal lawsuit from landlord for gross negligence.",
                "ur": "مالک مکان کی جانب سے قانونی دعویٰ اور بھاری ہرجانے کا سامنا۔",
                "ur_rm": "Severe legal lawsuit and lease cancellation."
              }
            }
          ]
        }
      ]
    },
    {
      "id": "adult_everyday_comm",
      "skillKey": "communication_scenarios",
      "type": "communication",
      "title": {
        "en": "Everyday Scenarios 💬",
        "ur": "روزمرہ منظرنامے 💬",
        "ur_rm": "Everyday Scenarios 💬"
      },
      "description": {
        "en": "Real-world adult roleplays: bank inquiries, utility offices, job interviews, and clinic visits.",
        "ur": "بڑوں کے حقیقی منظرنامے: بینک معلومات، سرکاری و نجی دفاتر، نوکری کے انٹرویو اور کلینک وزٹ۔",
        "ur_rm": "Adult roleplays: bank inquiries, utility offices, job interviews, aur clinic visits."
      },
      "icon": "💬",
      "redirectToScenarios": true,
      "scenarios": []
    }
  ]
};

function getSkillModules(persona, language = 'en') {
  const p = persona === 'adult' ? 'adult' : 'teen';
  const modules = SKILL_MODULES_DATA[p] || SKILL_MODULES_DATA.teen;

  return modules.map((m) => ({
    id: m.id,
    skillKey: m.skillKey,
    type: m.type,
    icon: m.icon,
    title: m.title[language] || m.title.en,
    description: m.description[language] || m.description.en,
    scenarioCount: m.scenarios ? m.scenarios.length : 0,
    redirectToScenarios: Boolean(m.redirectToScenarios),
  }));
}

export async function getSkillModuleDetails(moduleId, language = 'en', difficulty = null) {
  let found = null;
  let persona = 'teen';

  for (const p of ['teen', 'adult']) {
    const match = SKILL_MODULES_DATA[p].find((m) => m.id === moduleId);
    if (match) {
      found = match;
      persona = p;
      break;
    }
  }

  if (!found) return null;

  const allScenarios = found.scenarios || [];
  let filteredScenarios = allScenarios;
  if (difficulty) {
    const diffFiltered = allScenarios.filter((s) => s.difficulty === difficulty);
    if (diffFiltered.length > 0) {
      filteredScenarios = diffFiltered;
    }
  }

  return {
    id: found.id,
    skillKey: found.skillKey,
    type: found.type,
    icon: found.icon,
    persona,
    title: found.title[language] || found.title.en,
    description: found.description[language] || found.description.en,
    redirectToScenarios: Boolean(found.redirectToScenarios),
    scenarios: filteredScenarios.map((s) => ({
      id: s.id,
      difficulty: s.difficulty || 'easy',
      category: s.category || 'general',
      title: s.title[language] || s.title.en,
      passage: s.passage ? (s.passage[language] || s.passage.en) : null,
      vocabulary: s.vocabulary ? (s.vocabulary[language] || s.vocabulary.en) : null,
      situation: s.situation[language] || s.situation.en,
      prompt: s.prompt[language] || s.prompt.en,
      options: (s.options || []).map((o) => ({
        id: o.id,
        text: o.text[language] || o.text.en,
      })),
    })),
  };
}

export async function evaluateSkillSolution({ userId, moduleId, scenarioId, optionId, customSolution }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const language = user.language || 'en';
  const persona = user.persona || 'teen';

  let scenario = null;
  let selectedOption = null;
  let moduleDef = null;

  for (const p of ['teen', 'adult']) {
    const m = SKILL_MODULES_DATA[p].find((mod) => mod.id === moduleId);
    if (m) {
      moduleDef = m;
      scenario = (m.scenarios || []).find((s) => s.id === scenarioId);
      if (scenario && optionId) {
        selectedOption = (scenario.options || []).find((o) => o.id === optionId);
        if (!selectedOption) {
          const matches = (scenario.options || []).filter((o) => o.id.startsWith(optionId) || optionId.startsWith(o.id));
          if (matches.length > 0) {
            selectedOption = matches.reduce((best, cur) => (cur.score > best.score ? cur : best), matches[0]);
          }
        }
      }
      break;
    }
  }

  let score = 85;
  let feedbackText = '';
  let consequencesText = '';
  let betterApproachText = '';

  if (selectedOption) {
    score = selectedOption.score || 85;
    feedbackText = selectedOption.feedback[language] || selectedOption.feedback.en;
    consequencesText = selectedOption.consequences[language] || selectedOption.consequences.en;
    betterApproachText = selectedOption.betterApproach?.[language] || selectedOption.betterApproach?.en || '';
  }

  if (isAiAvailable() && (customSolution || !selectedOption)) {
    const prompt = `Evaluate a learner's solution to this real-world scenario for HumSaathi AI.
Persona: ${persona} (language: ${language})
Skill: ${moduleDef?.skillKey || 'problem_solving'}
Scenario: ${scenario?.situation?.[language] || scenario?.situation?.en || ''}
Learner Solution: ${customSolution || selectedOption?.text?.[language] || ''}

Provide JSON only:
{
  "score": <0-100 score on effectiveness>,
  "feedback": "<supportive, ${persona === 'adult' ? 'mature, practical' : 'age-appropriate, encouraging'} feedback (max 2 sentences)>",
  "consequences": "<analysis of likely outcomes/consequences (max 2 sentences)>",
  "betterApproach": "<constructive suggestion for an even better approach (max 1 sentence)>"
}`;

    const aiResult = await callAiChat([
      { role: 'system', content: 'Return valid JSON only. Non-judgmental educational feedback.' },
      { role: 'user', content: prompt },
    ]);

    if (aiResult && aiResult.score !== undefined) {
      score = aiResult.score;
      feedbackText = aiResult.feedback || feedbackText;
      consequencesText = aiResult.consequences || consequencesText;
      betterApproachText = aiResult.betterApproach || betterApproachText;
    }
  }

  const skillKey = moduleDef?.skillKey || 'problem_solving';
  await updateProgressForSkill(userId, skillKey, score);

  return {
    score,
    feedback: feedbackText,
    consequences: consequencesText,
    betterApproach: betterApproachText,
    skillKey,
  };
}

async function updateProgressForSkill(userId, skill, score) {
  const existing = await prisma.progress.findUnique({
    where: { userId_skill: { userId, skill } },
  });

  const prevAttempts = existing?.attempts || 0;
  const prevAccuracy = existing?.accuracy || 0;
  const newAttempts = prevAttempts + 1;
  const newAccuracy = ((prevAccuracy * prevAttempts) + (score / 100)) / newAttempts;

  let level = 'easy';
  if (newAccuracy >= 0.85) level = 'advanced';
  else if (newAccuracy >= 0.65) level = 'medium';

  await prisma.progress.upsert({
    where: { userId_skill: { userId, skill } },
    create: {
      userId,
      skill,
      level,
      accuracy: newAccuracy,
      attempts: 1,
    },
    update: {
      level,
      accuracy: newAccuracy,
      attempts: newAttempts,
    },
  });
}
