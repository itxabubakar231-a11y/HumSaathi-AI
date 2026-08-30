import prisma from '../lib/prisma.js';
import { callAiChat, isAiAvailable } from './ai/aiService.js';
import { parseJson } from '../utils/constants.js';

export const SKILL_MODULES_DATA = {
  teen: [
    {
      id: 'teen_reading_vocab',
      skillKey: 'reading_vocabulary',
      type: 'reading_vocabulary',
      title: {
        en: 'Reading & Vocabulary 📚',
        ur: 'مطالعہ اور الفاظ 📚',
        ur_rm: 'Reading & Vocabulary 📚',
      },
      description: {
        en: 'Real-world passages, vocabulary in context, meaning selection, and comprehension practice.',
        ur: 'حقیقی دنیا کے مضامین، سیاق و سباق میں الفاظ کا فہم، معانی کا انتخاب اور فہم و ادراک۔',
        ur_rm: 'Real-world passages, vocabulary in context, meaning selection, aur comprehension practice.',
      },
      icon: '📚',
      scenarios: [
        {
          id: 'teen_rv_1',
          difficulty: 'easy',
          category: 'reading_comprehension',
          title: {
            en: 'Digital Habits & Study Focus',
            ur: 'ڈیجیٹل عادات اور پڑھائی پر توجہ',
            ur_rm: 'Digital Habits & Study Focus',
          },
          passage: {
            en: 'Passage: "Digital distraction is a common challenge for students. Setting dedicated study blocks of 25 minutes (Pomodoro technique) helps retain focus, improve recall, and reduce cognitive fatigue."',
            ur: 'پیراگراف: "ڈیجیٹل خلفشار طلباء کے لیے ایک عام چیلنج ہے۔ 25 منٹ کا مسلسل مطالعہ توجہ برقرار رکھنے، یادداشت کو بہتر بنانے اور ذہنی تھکاوٹ کو کم کرنے میں مدد کرتا ہے۔"',
            ur_rm: 'Passage: "Digital distraction students ke liye common challenge hai. 25-minute dedicated study blocks focus maintain rakhne aur cognitive fatigue kam karne mein help karte hain."',
          },
          vocabulary: {
            en: 'Key Words: Cognitive (mental/brain process), Retention (ability to remember), Discipline (self-control).',
            ur: 'اہم الفاظ: ادراک (ذہنی صلاحیت)، یادداشت (یاد رکھنے کی صلاحیت)، نظم و ضبط۔',
            ur_rm: 'Key Words: Cognitive (zehni salahiyat), Retention (yaad rakhne ki ability), Discipline (self-control).',
          },
          situation: {
            en: 'You are reading an article on study habits before an exam week. The author explains how to reduce smartphone interruptions while studying.',
            ur: 'آپ امتحان کے ہفتے سے پہلے مطالعے کی عادات پر ایک مضمون پڑھ رہے ہیں۔ مصنف بتاتا ہے کہ پڑھائی کے دوران اسمارٹ فون کی مداخلت کو کیسے کم کیا جائے۔',
            ur_rm: 'Aap exam week se pehle study habits par article parh rahe hain. Author explain kar raha hai ke study ke waqt phone distractions kaise kam karein.',
          },
          prompt: {
            en: 'Based on the passage, what is the main benefit of dedicated 25-minute study blocks?',
            ur: 'پیراگراف کی روشنی میں، 25 منٹ کے مطالعے کا بنیادی فائدہ کیا ہے؟',
            ur_rm: 'Passage ke mutabiq, 25-minute study block ka main benefit kya hai?',
          },
          options: [
            {
              id: 'opt_rv_1',
              text: {
                en: 'It improves focus and memory retention while preventing mental fatigue.',
                ur: 'یہ ذہنی تھکاوٹ کو روکتے ہوئے توجہ اور یادداشت کو بہتر بناتا ہے۔',
                'ur_rm': 'Yeh focus aur memory retention improve karta hai aur mental fatigue kam karta hai.',
              },
              score: 95,
              feedback: {
                en: 'Correct comprehension! You captured the central message of the passage accurately.',
                ur: 'بہترین فہم! آپ نے مضمون کے مرکزی پیغام کو درست طریقے سے سمجھا۔',
                ur_rm: 'Zabardast comprehension! Aap ne central point bilkul sahi samjha.',
              },
              consequences: {
                en: 'Applying structured study blocks helps you study smarter during exam prep.',
                ur: 'اس طریقے سے پڑھائی کرنے سے آپ امتحانات میں بہتر نتائج حاصل کر سکتے ہیں۔',
                ur_rm: 'Is technique se aap exams mein smart study kar sakte hain.',
              },
            },
            {
              id: 'opt_rv_2',
              text: {
                en: 'It allows you to use your phone for 25 minutes non-stop.',
                ur: 'یہ آپ کو 25 منٹ تک مسلسل فون استعمال کرنے کی اجازت دیتا ہے۔',
                ur_rm: 'Yeh aap ko 25 minutes non-stop phone use karne ki permission deta hai.',
              },
              score: 40,
              feedback: {
                en: 'Notice the passage states study blocks of 25 minutes, not phone usage time.',
                ur: 'توجہ دیں، مضمون میں 25 منٹ پڑھائی کی بات کی گئی ہے، فون کے استعمال کی نہیں۔',
                ur_rm: 'Dhyan dein, passage mein 25 minutes study block ki baat hui hai, phone usage ki nahi.',
              },
              consequences: {
                en: 'Misinterpreting instructions can lead to missed study goals.',
                ur: 'ہدایات کو غلط سمجھنے سے پڑھائی کا نقصان ہو سکتا ہے۔',
                ur_rm: 'Instructions misinterpret karne se study goals poore nahi hote.',
              },
            },
          ],
        },
        {
          id: 'teen_rv_2',
          difficulty: 'easy',
          category: 'vocab_in_context',
          title: {
            en: 'Vocabulary in Context: Morning Hydration & Energy',
            ur: 'سیاق و سباق میں الفاظ: صبح کی ہائیڈریشن اور توانائی',
            ur_rm: 'Vocabulary in Context: Morning Hydration & Energy',
          },
          passage: {
            en: 'Passage: "Beginning the day with intentional hydration elevates energy levels and enhances cognitive alertness throughout morning classes."',
            ur: 'پیراگراف: "دن کا آغاز مناسب مقدار میں پانی پی کر کرنے سے توانائی کی سطح بلند ہوتی ہے اور صبح کی کلاسز میں ذہنی چوکسی میں اضافہ ہوتا ہے۔"',
            ur_rm: 'Passage: "Din ka aaghaz intentional hydration se karne se energy level barhta hai aur morning classes mein cognitive alertness behtar hoti hai."',
          },
          vocabulary: {
            en: 'Word Focus: Intentional (done on purpose / deliberate), Elevates (raises / boosts), Alertness (state of being awake and attentive).',
            ur: 'الفاظ پر توجہ: ارادی (سوچ سمجھ کر کیا گیا)، بڑھانا (بلند کرنا)، چوکسی (ہوشیار رہنا)۔',
            ur_rm: 'Word Focus: Intentional (soch samajh kar), Elevates (barhana), Alertness (hoshiyar rehna).',
          },
          situation: {
            en: 'You are reading a student health guide about staying energetic during school hours.',
            ur: 'آپ اسکول کے دوران چست رہنے کے حوالے سے صحت سے متعلق ایک گائیڈ پڑھ رہے ہیں۔',
            ur_rm: 'Aap school hours ke dauran energetic rehne ke mutaliq student health guide parh rahe hain.',
          },
          prompt: {
            en: 'In this sentence, what does the word "elevates" mean most nearly?',
            ur: 'اس جملے میں لفظ "elevates" کا قریبی ترین مطلب کیا ہے؟',
            ur_rm: 'Is sentence mein word "elevates" ka qareebi matlab kya hai?',
          },
          options: [
            {
              id: 'opt_rv_2_1',
              text: {
                en: 'Increases or boosts (makes higher)',
                ur: 'بڑھاتا ہے یا بلند کرتا ہے',
                ur_rm: 'Increases ya boost karta hai (barhata hai)',
              },
              score: 95,
              feedback: {
                en: 'Spot on! "Elevates" means to raise or lift up energy levels.',
                ur: 'بالکل درست! "Elevates" کا مطلب توانائی کی سطح کو بڑھانا ہے۔',
                ur_rm: 'Bilkul sahi! "Elevates" ka matlab energy barhana hai.',
              },
              consequences: {
                en: 'Understanding words from context strengthens your reading speed and comprehension.',
                ur: 'سیاق و سباق سے الفاظ سمجھنا آپ کے مطالعے کی رفتار کو تیز کرتا ہے۔',
                ur_rm: 'Context se words samajhna reading comprehension tez karta hai.',
              },
            },
            {
              id: 'opt_rv_2_2',
              text: {
                en: 'Slows down or decreases',
                ur: 'کم کرتا ہے یا رفتار دھیمی کرتا ہے',
                ur_rm: 'Slow karta hai ya kam karta hai',
              },
              score: 30,
              feedback: {
                en: '"Elevates" comes from elevator (to go up), meaning it increases energy, not decreases.',
                ur: '"Elevates" بلندی کی طرف اشارہ کرتا ہے، اس کا مطلب کم ہونا نہیں ہے۔',
                ur_rm: '"Elevates" ka matlab increase karna hai, kam karna nahi.',
              },
              consequences: {
                en: 'Confusing antonyms can change the meaning of instructions.',
                ur: 'الفاظ کے متضاد کو غلط سمجھنے سے مفہوم بدل سکتا ہے۔',
                ur_rm: 'Antonyms confuse hone se meaning change ho jata hai.',
              },
            },
          ],
        },
        {
          id: 'teen_rv_3',
          difficulty: 'medium',
          category: 'reading_comprehension',
          title: {
            en: 'Online Security & Two-Factor Authentication',
            ur: 'آن لائن سیکیورٹی اور ٹو فیکٹر تصدیق',
            ur_rm: 'Online Security & Two-Factor Authentication',
          },
          passage: {
            en: 'Passage: "Cybersecurity experts recommend enabling two-factor authentication (2FA) across social and academic accounts. Even if a malicious actor compromises your password, they cannot breach the account without the secondary verification code."',
            ur: 'پیراگراف: "سائبر سیکیورٹی کے ماہرین سوشل اور تعلیمی اکاؤنٹس پر ٹو فیکٹر تصدیق (2FA) فعال کرنے کا مشورہ دیتے ہیں۔ اگر کوئی بدنیتی پر مبنی شخص آپ کا پاس ورڈ حاصل بھی کر لے، تب بھی وہ ثانوی تصدیقی کوڈ کے بغیر اکاؤنٹ تک رسائی حاصل نہیں کر سکتا۔"',
            ur_rm: 'Passage: "Cybersecurity experts academic aur social accounts par 2FA activate karne ka mashwara dete hain. Agar password leak bhi ho jaye, to second verification code ke bina account hack nahi ho sakta."',
          },
          vocabulary: {
            en: 'Key Words: Malicious (harmful / deceitful), Compromises (exposes to danger), Breach (break through security).',
            ur: 'اہم الفاظ: بدنیتی پر مبنی (نقصان دہ)، افشا ہونا (خطرے میں ڈالنا)، نقب زنی (سیکیورٹی توڑنا)۔',
            ur_rm: 'Key Words: Malicious (nuqsaan pohanchane wala), Compromises (expose hona), Breach (security torna).',
          },
          situation: {
            en: 'You are setting up your student portal account and reading the IT department safety advice.',
            ur: 'آپ اپنے اسٹوڈنٹ پورٹل اکاؤنٹ کو سیٹ اپ کر رہے ہیں اور آئی ٹی ڈیپارٹمنٹ کی حفاظتی ہدایات پڑھ رہے ہیں۔',
            ur_rm: 'Aap student portal account set up kar rahe hain aur IT safety instructions parh rahe hain.',
          },
          prompt: {
            en: 'Why is Two-Factor Authentication effective even if someone learns your password?',
            ur: 'اگر کسی کو آپ کا پاس ورڈ معلوم بھی ہو جائے تو بھی ٹو فیکٹر تصدیق کیوں موثر ہے؟',
            ur_rm: 'Agar kisi ko password pata chal jaye tab bhi 2FA kyun effective hai?',
          },
          options: [
            {
              id: 'opt_rv_3_1',
              text: {
                en: 'Because access still requires a second temporary code sent only to your personal device.',
                ur: 'کیونکہ رسائی کے لیے اب بھی دوسرے عارضی کوڈ کی ضرورت ہوتی ہے جو صرف آپ کے ذاتی ڈیوائس پر آتا ہے۔',
                ur_rm: 'Kyunki access ke liye abhi bhi second temporary code chahiye hota hai jo sirf aap ke phone par aata hai.',
              },
              score: 95,
              feedback: {
                en: 'Excellent analytical reading! You extracted the core security mechanism accurately.',
                ur: 'شاندار فہم! آپ نے اہم سیکیورٹی اصول کو درست طریقے سے سمجھا۔',
                ur_rm: 'Excellent reading! Aap ne core security rule bilkul sahi extract kiya.',
              },
              consequences: {
                en: 'Understanding technical passages empowers you to protect your digital identity safely.',
                ur: 'تکنیکی مضامین کو سمجھنا آپ کی ڈیجیٹل شناخت کو محفوظ رکھنے میں مدد دیتا ہے۔',
                ur_rm: 'Technical passages samajhna digital safety ke liye zaroori hai.',
              },
            },
            {
              id: 'opt_rv_3_2',
              text: {
                en: 'Because it automatically deletes your account whenever an unknown device logs in.',
                ur: 'کیونکہ یہ کسی نامعلوم ڈیوائس کے لاگ ان ہوتے ہی آپ کے اکاؤنٹ کو خود بخود ڈیلیٹ کر دیتا ہے۔',
                ur_rm: 'Kyunki yeh unknown device par account delete kar deta hai.',
              },
              score: 35,
              feedback: {
                en: 'Review the passage: 2FA blocks unauthorized access by requiring a verification code, not by deleting accounts.',
                ur: 'پیراگراف پر غور کریں: 2FA کوڈ مانگ کر رسائی روکتا ہے، اکاؤنٹ ڈیلیٹ نہیں کرتا۔',
                ur_rm: 'Passage review karein: 2FA verification code maangta hai, account delete nahi karta.',
              },
              consequences: {
                en: 'Careful reading avoids false assumptions in technical procedures.',
                ur: 'غور سے پڑھنا غلط فہمیوں سے بچاتا ہے۔',
                ur_rm: 'Dhyan se parhna misconceptions se bachata hai.',
              },
            },
          ],
        },
        {
          id: 'teen_rv_4',
          difficulty: 'medium',
          category: 'meaning_selection',
          title: {
            en: 'Tone & Meaning: Text Message Nuance',
            ur: 'لہجہ اور معنی: ٹیکسٹ میسج کی باریکیاں',
            ur_rm: 'Tone & Meaning: Text Message Nuance',
          },
          passage: {
            en: 'Passage: "Because digital messages lack facial expression and vocal inflection, brief replies can easily be misconstrued as blunt or indifferent, even when the sender was simply in a hurry."',
            ur: 'پیراگراف: "چونکہ ڈیجیٹل پیغامات میں چہرے کے تاثرات اور آواز کا اتار چڑھاؤ شامل نہیں ہوتا، اس لیے مختصر جوابات کو اکثر بے رخی یا سختی سمجھ لیا جاتا ہے، خواہ بھیجنے والا صرف جلدی میں ہو۔"',
            ur_rm: 'Passage: "Digital text messages mein facial expressions aur voice tone nahi hoti, is liye brief replies ko log ghalati se rude samajh lete hain halanke sender sirf jaldi mein hota hai."',
          },
          vocabulary: {
            en: 'Key Words: Inflection (modulation of voice pitch), Misconstrued (misinterpreted / misunderstood), Blunt (uncompromisingly direct).',
            ur: 'اہم الفاظ: آواز کا اتار چڑھاؤ، غلط سمجھنا (غلط مفہوم نکالنا)، دو ٹوک (بے لاگ)۔',
            ur_rm: 'Key Words: Inflection (awaaz ka utaar charhao), Misconstrued (ghalat samajhna), Blunt (seedha/sakht).',
          },
          situation: {
            en: 'You receive a one-word reply "Fine." from a teammate while working on an assignment.',
            ur: 'ایک پروجیکٹ کے دوران آپ کو اپنے ساتھی سے "ٹھیک ہے" کا مختصر جواب ملتا ہے۔',
            ur_rm: 'Aap ko assignment ke dauran classmate se one-word reply milta hai.',
          },
          prompt: {
            en: 'What does the passage suggest you should keep in mind before assuming a short text is hostile?',
            ur: 'مضمون کے مطابق مختصر پیغام کو برا سمجھنے سے پہلے کیا بات ذہن میں رکھنی چاہیے؟',
            ur_rm: 'Short text ko rude samajhne se pehle passage ke mutabiq kya baat zehan mein rakhni chahiye?',
          },
          options: [
            {
              id: 'opt_rv_4_1',
              text: {
                en: 'Text lacks tone and body language, so the sender might just be busy rather than upset.',
                ur: 'ٹیکسٹ میں آواز کا تاثر نہیں ہوتا، اس لیے بھیجنے والا شاید مصروف ہو نہ کہ ناراض۔',
                ur_rm: 'Text mein tone nahi hoti, is liye sender shayad busy ho na ke naraz.',
              },
              score: 95,
              feedback: {
                en: 'Insightful comprehension! You accurately applied context to social communication.',
                ur: 'بہترین فہم! آپ نے سماجی رابطے کے اصول کو درست طریقے سے سمجھا۔',
                ur_rm: 'Zabardast comprehension! Aap ne text tone ka point sahi samjha.',
              },
              consequences: {
                en: 'This emotional intelligence prevents unnecessary peer conflicts.',
                ur: 'یہ حکمت عملی دوستوں کے درمیان غلط فہمیوں اور جھگڑوں کو روکتی ہے۔',
                ur_rm: 'Yeh understanding dosto ke darmiyan misunderstandings ko rokti hai.',
              },
            },
            {
              id: 'opt_rv_4_2',
              text: {
                en: 'Short texts always mean the friendship is over.',
                ur: 'مختصر ٹیکسٹ کا ہمیشہ مطلب ہوتا ہے کہ دوستی ختم ہو گئی ہے۔',
                ur_rm: 'Short text ka hamesha matlab dosti khatam hona hota hai.',
              },
              score: 30,
              feedback: {
                en: 'Remember that brevity is often just a sign of being busy, not hostility.',
                ur: 'یاد رکھیں کہ مختصر جواب اکثر جلدی کی علامت ہوتا ہے، ناراضگی کی نہیں۔',
                ur_rm: 'Brevity aksar busy hone ki nishani hoti hai, narazgi ki nahi.',
              },
              consequences: {
                en: 'Jumping to conclusions can cause unnecessary anxiety.',
                ur: 'جلد بازی میں فیصلہ کرنا پریشانی کا باعث بنتا ہے۔',
                ur_rm: 'Bina soche conclusion nikalne se stress barhta hai.',
              },
            },
          ],
        },
        {
          id: 'teen_rv_5',
          difficulty: 'challenging',
          category: 'sentence_completion',
          title: {
            en: 'Environmental Science: Microgrids & Sustainability',
            ur: 'ماحولیاتی سائنس: مائیکرو گرڈز اور پائیداری',
            ur_rm: 'Environmental Science: Microgrids & Sustainability',
          },
          passage: {
            en: 'Passage: "Urban communities are increasingly adopting decentralized solar microgrids. While initial installation requires significant capital expenditure, the long-term amortized savings and reduced carbon emissions make it an economically viable initiative."',
            ur: 'پیراگراف: "شہری علاقے تیزی سے شمسی مائیکرو گرڈز اپنا رہے ہیں۔ اگرچہ تنصیب پر ابتدائی اخراجات کافی ہوتے ہیں، لیکن طویل مدتی بچت اور کاربن کے اخراج میں کمی اسے معاشی طور پر ایک فائدہ مند منصوبہ بناتی ہے۔"',
            ur_rm: 'Passage: "Urban areas solar microgrids adopt kar rahe hain. Halanke initial cost ziada hoti hai, magar long-term savings aur kam emissions isko economically viable initiative banate hain."',
          },
          vocabulary: {
            en: 'Key Words: Decentralized (distributed rather than controlled by one central hub), Amortized (costs spread over time), Viable (feasible / capable of succeeding).',
            ur: 'اہم الفاظ: غیر متمرکز (مختلف جگہوں پر پھیلا ہوا)، طویل مدتی تقسیم شدہ لاگت، قابل عمل (کامیاب ہونے کے قابل)۔',
            ur_rm: 'Key Words: Decentralized (distributed), Amortized (waqt ke sath cost divide hona), Viable (feasible/kamyaab).',
          },
          situation: {
            en: 'You are preparing for an environmental science presentation and synthesizing key academic concepts.',
            ur: 'آپ ماحولیاتی سائنس کی پریزنٹیشن کی تیاری کر رہے ہیں اور اہم نکات کا خلاصہ کر رہے ہیں۔',
            ur_rm: 'Aap environmental science presentation ki tayyari kar rahe hain aur key concepts summarize kar rahe hain.',
          },
          prompt: {
            en: 'Complete this sentence correctly based on the passage: "Solar microgrids are considered viable because ______."',
            ur: 'پیراگراف کی بنیاد پر جملہ مکمل کریں: "شمسی مائیکرو گرڈز کو فائدہ مند سمجھا جاتا ہے کیونکہ ______۔"',
            ur_rm: 'Passage ke mutabiq sentence complete karein: "Solar microgrids viable hain kyunki ______."',
          },
          options: [
            {
              id: 'opt_rv_5_1',
              text: {
                en: 'Their long-term financial savings and environmental benefits outweigh the initial setup cost.',
                ur: 'ان کی طویل مدتی مالی بچت اور ماحولیاتی فوائد ابتدائی اخراجات سے کہیں زیادہ وزنی ہیں۔',
                ur_rm: 'Unki long-term savings aur environmental benefits initial setup cost se barh kar hain.',
              },
              score: 95,
              feedback: {
                en: 'Superb advanced comprehension! You synthesized technical vocabulary and causal relationships masterfully.',
                ur: 'شاندار فہم! آپ نے تکنیکی الفاظ اور منطقی ربط کو بہترین انداز میں سمجھا۔',
                ur_rm: 'Superb comprehension! Aap ne technical terms aur causal links ko master kiya.',
              },
              consequences: {
                en: 'Mastering academic text synthesis prepares you for high school and college research excellence.',
                ur: 'علمی مضامین کی تلخیص پر عبور آپ کو اعلیٰ تعلیمی امتحانات کے لیے تیار کرتا ہے۔',
                ur_rm: 'Academic text synthesis seekhna future research mein bohot help karta hai.',
              },
            },
            {
              id: 'opt_rv_5_2',
              text: {
                en: 'They cost zero money to manufacture and install.',
                ur: 'ان کی تیاری اور تنصیب پر بالکل کوئی رقم خرچ نہیں ہوتی۔',
                ur_rm: 'Inko install karne par zero cost aati hai.',
              },
              score: 35,
              feedback: {
                en: 'Notice the passage specifically states that initial installation requires significant capital expenditure.',
                ur: 'غور کریں، مضمون میں لکھا ہے کہ ابتدائی تنصیب کے لیے خطیر رقم درکار ہوتی ہے۔',
                ur_rm: 'Passage check karein: initial installation requires significant expenditure.',
              },
              consequences: {
                en: 'Paying attention to qualifying clauses ensures accurate facts.',
                ur: 'ہدایات اور شرائط پر غور کرنے سے حقائق درست رہتے ہیں۔',
                ur_rm: 'Details par dhyan dena zaroori hai.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'teen_problem_solving',
      skillKey: 'problem_solving',
      type: 'problem_solving',
      title: {
        en: 'Problem Solving 🧩',
        ur: 'مسائل کا حل 🧩',
        ur_rm: 'Problem Solving 🧩',
      },
      description: {
        en: 'Practical budget management, scheduling decisions, logical reasoning, and peer collaboration.',
        ur: 'عملی بجٹ کا انتظام، شیڈولنگ کے فیصلے، منطقی استدلال اور دوستوں کے ساتھ تعاون۔',
        ur_rm: 'Practical budget management, scheduling decisions, logical reasoning, aur peer collaboration.',
      },
      icon: '🧩',
      scenarios: [
        {
          id: 'teen_ps_1',
          difficulty: 'easy',
          category: 'budget_math',
          title: {
            en: 'Pocket Money & Goal Savings',
            ur: 'پاکٹ منی اور بچت کا ہدف',
            ur_rm: 'Pocket Money & Goal Savings',
          },
          situation: {
            en: 'You receive Rs. 1,500 monthly pocket money. You want to buy a Rs. 2,400 scientific calculator for school in 2 months. You also need Rs. 300 per month for essential stationery.',
            ur: 'آپ کو ماہانہ 1500 روپے جیب خرچ ملتا ہے۔ آپ کو اسکول کے لیے 2 ماہ میں 2400 روپے کا سائنسی کیلکولیٹر خریدنا ہے۔ آپ کو اسٹیشنری کے لیے ماہانہ 300 روپے بھی درکار ہیں۔',
            ur_rm: 'Aap ko monthly Rs. 1,500 pocket money milti hai. 2 months mein school ke liye Rs. 2,400 ka calculator lena hai, aur monthly Rs. 300 stationery par kharch hota hai.',
          },
          prompt: {
            en: 'How can you structure your monthly spending to reach your Rs. 2,400 goal in 2 months?',
            ur: '2 ماہ میں 2400 روپے کے ہدف تک پہنچنے کے لیے آپ اپنے ماہانہ اخراجات کو کیسے ترتیب دیں گے؟',
            ur_rm: '2 months mein Rs. 2,400 goal reach karne ke liye monthly spending kaise plan karein?',
          },
          options: [
            {
              id: 'opt_ps_1_1',
              text: {
                en: 'Save Rs. 1,200/month, spend Rs. 300/month on stationery, leaving Rs. 0 for snacks (Rs. 1,200 x 2 = Rs. 2,400).',
                ur: 'ماہانہ 1200 روپے بچائیں، اسٹیشنری پر 300 روپے خرچ کریں (1200 × 2 = 2400 روپے)۔',
                ur_rm: 'Monthly Rs. 1,200 save karein, Rs. 300 stationery par kharch karein (1,200 x 2 = Rs. 2,400).',
              },
              score: 95,
              feedback: {
                en: 'Great financial logic! You calculated exact savings required (Rs. 1,200/month) while keeping essential stationery covered.',
                ur: 'زبردست مالی منصوبہ بندی! آپ نے ضروری اخراجات کا خیال رکھتے ہوئے ہدف حاصل کر لیا۔',
                ur_rm: 'Zabardast financial logic! Stationery cover karte hue exact savings calculate ki.',
              },
              consequences: {
                en: 'You achieve your calculator goal without borrowing money or falling short on supplies.',
                ur: 'آپ ادھار لیے بغیر وقت پر اپنا کیلکولیٹر خرید سکتے ہیں۔',
                ur_rm: 'Aap bina borrow kiye time par calculator khareed lenge.',
              },
              betterApproach: {
                en: 'Track your daily savings in a notebook or phone notes to stay disciplined.',
                ur: 'بچت کا حساب کسی ڈائری یا فون نوٹ میں محفوظ رکھیں۔',
                ur_rm: 'Daily savings ko notebook mein note karein.',
              },
            },
            {
              id: 'opt_ps_1_2',
              text: {
                en: 'Spend Rs. 1,000 on snacks each month and hope for extra cash from relatives.',
                ur: 'ماہانہ 1000 روپے اسنیکس پر خرچ کریں اور رشتہ داروں سے اضافی رقم کی امید رکھیں۔',
                ur_rm: 'Monthly Rs. 1,000 snacks par kharch karein aur relatives se umeed rakhein.',
              },
              score: 35,
              feedback: {
                en: 'Relying on uncertain external gifts makes your educational goal vulnerable to failure.',
                ur: 'غیر یقینی ذرائع پر بھروسہ کرنے سے تعلیمی مقاصد ادھورے رہ سکتے ہیں۔',
                ur_rm: 'Uncertain paison par rely karne se goal miss ho sakta hai.',
              },
              consequences: {
                en: 'You will likely not have the calculator when exam season arrives.',
                ur: 'امتحانات کے وقت کیلکولیٹر نہ ہونے سے پریشانی ہو سکتی ہے۔',
                ur_rm: 'Exams ke time calculator na hone se problem hogi.',
              },
            },
          ],
        },
        {
          id: 'teen_ps_2',
          difficulty: 'easy',
          category: 'time_management',
          title: {
            en: 'Balancing Exam Revision & Team Practice',
            ur: 'امتحان کی دہرائی اور ٹیم پریکٹس کا توازن',
            ur_rm: 'Balancing Exam Revision & Team Practice',
          },
          situation: {
            en: 'You have an important science exam in 3 days with 6 chapters left to revise. Your football team has a 2-hour practice session today from 4:00 PM to 6:00 PM.',
            ur: 'آپ کا 3 دن بعد سائنس کا اہم امتحان ہے اور 6 اسباق کی دہرائی باقی ہے۔ آج شام 4 سے 6 بجے تک فٹ بال ٹیم کی 2 گھنٹے پریکٹس بھی ہے۔',
            ur_rm: '3 din mein science exam hai aur 6 chapters revise karne hain. Aaj 4:00 PM to 6:00 PM football practice bhi hai.',
          },
          prompt: {
            en: 'What is the most balanced and disciplined schedule for today and tomorrow?',
            ur: 'آج اور کل کے لیے سب سے متوازن اور منظم شیڈول کیا ہوگا؟',
            ur_rm: 'Aaj aur kal ke liye sab se balanced schedule kya hoga?',
          },
          options: [
            {
              id: 'opt_ps_2_1',
              text: {
                en: 'Attend practice to stay active, then dedicate 7:00-9:30 PM to revise 2 chapters today, scheduling 2 chapters each for the next 2 days.',
                ur: 'پریکٹس میں شرکت کریں، پھر شام 7 سے 9:30 بجے 2 اسباق دہرائیں، اور اگلے 2 دنوں میں 2، 2 اسباق مکمل کریں۔',
                ur_rm: 'Practice attend karein, phir 7:00-9:30 PM aaj 2 chapters revise karein aur agle 2 din mein 2-2 chapters complete karein.',
              },
              score: 95,
              feedback: {
                en: 'Outstanding time management! Breaking the 6 chapters into 2 per day keeps stress low while honoring team commitments.',
                ur: 'شاندار ٹائم مینجمنٹ! روزانہ 2 اسباق کا ہدف رکھنے سے دباؤ کم رہتا ہے اور کام بھی مکمل ہو جاتا ہے۔',
                ur_rm: 'Zabardast time management! 2 chapters daily se balance maintain rehta hai.',
              },
              consequences: {
                en: 'You maintain physical wellness, support your teammates, and thoroughly finish revision before the exam.',
                ur: 'آپ کی صحت بہتر رہتی ہے اور امتحان کی تیاری بھی مکمل ہو جاتی ہے۔',
                ur_rm: 'Health bhi achi rahegi aur exam prep bhi time par hogi.',
              },
            },
            {
              id: 'opt_ps_2_2',
              text: {
                en: 'Skip study entirely today, play video games after practice, and study all 6 chapters the night before the exam.',
                ur: 'آج پڑھائی چھوڑ دیں، گیمز کھیلیں اور امتحان کی رات تمام 6 اسباق ایک ساتھ پڑھیں۔',
                ur_rm: 'Aaj bilkul na parhein aur exam se pehle wali raat sab 6 chapters cram karein.',
              },
              score: 30,
              feedback: {
                en: 'Cramming 6 chapters in one night causes cognitive overload and poor recall during the exam.',
                ur: 'ایک ہی رات میں سارا سلیبس پڑھنے سے ذہنی تھکاوٹ اور بھولنے کا خدشہ ہوتا ہے۔',
                ur_rm: 'Last night cramming se recall kharab hota hai.',
              },
              consequences: {
                en: 'High exam anxiety and avoidable grade drops.',
                ur: 'امتحان میں پریشانی اور نمبر کم آنے کا امکان۔',
                ur_rm: 'Exam anxiety aur marks kam hone ka khatra.',
              },
            },
          ],
        },
        {
          id: 'teen_ps_3',
          difficulty: 'medium',
          category: 'decision_making',
          title: {
            en: 'Unresponsive Group Project Partner',
            ur: 'گروپ پروجیکٹ پارٹنر جو جواب نہیں دے رہا',
            ur_rm: 'Group Project Partner Jo Jawab Nahi De Raha',
          },
          situation: {
            en: 'You and a classmate have a science presentation due in 2 days. Your partner was supposed to finish the slides, but hasn’t responded to messages for 24 hours. The deadline is approaching fast.',
            ur: 'آپ اور آپ کے ہم جماعت کو 2 دن میں سائنس کی پریزنٹیشن جمع کرانی ہے۔ آپ کے پارٹنر کو سلائیڈز مکمل کرنی تھیں لیکن وہ 24 گھنٹے سے پیغامات کا جواب نہیں دے رہا۔ ڈیڈلائن قریب ہے۔',
            ur_rm: 'Aap aur aap ke classmate ko 2 din mein science presentation deni hai. Partner ko slides banani theen magar woh 24 hours se reply nahi kar raha. Deadline qareeb hai.',
          },
          prompt: {
            en: 'What is the best way to handle this situation proactively and respectfully?',
            ur: 'اس صورتحال سے باوقار اور ذمہ دارانہ انداز میں نمٹنے کا بہترین طریقہ کیا ہے؟',
            ur_rm: 'Is situation ko respectfully aur proactively handle karne ka behtareen tareeqa kya hai?',
          },
          options: [
            {
              id: 'opt_ps_3_1',
              text: {
                en: 'Send a polite check-in setting a clear 6:00 PM deadline, build a backup outline, and notify the teacher if there is no response.',
                ur: 'شام 6 بجے کی واضح ڈیڈلائن کے ساتھ شائستہ پیغام بھیجیں، بیک اپ آؤٹ لائن تیار کریں، اور جواب نہ آنے پر استاد کو آگاہ کریں۔',
                ur_rm: 'Shaam 6:00 PM ki clear deadline ke sath polite message bhejein, backup outline banayein, aur reply na aane par teacher ko inform karein.',
              },
              score: 95,
              feedback: {
                en: 'Excellent approach! This stays proactive, respectful, and ensures you protect your project grade without unnecessary drama.',
                ur: 'بہترین طریقہ! یہ ذمہ دارانہ، باوقار ہے اور آپ کے گریڈ کو محفوظ رکھتا ہے۔',
                ur_rm: 'Zabardast approach! Yeh proactive aur respectful hai aur aap ke grade ko safe rakhta hai.',
              },
              consequences: {
                en: 'You maintain control over your grade while giving your partner a clear chance to contribute.',
                ur: 'آپ کو اپنے کام پر کنٹرول ملتا ہے اور ساتھی کو بھی موقع ملتا ہے۔',
                ur_rm: 'Aap ka kaam time par hoga aur partner ko bhi mauqa milega.',
              },
              betterApproach: {
                en: 'Keep a copy of timestamps and drafts in case the teacher asks for group contribution records.',
                ur: 'پیغامات اور ڈرافٹ کا ریکارڈ محفوظ رکھیں۔',
                ur_rm: 'Messages aur drafts ka record rakhein.',
              },
            },
            {
              id: 'opt_ps_3_2',
              text: {
                en: 'Do the entire project alone right away and remove your partner’s name without saying anything.',
                ur: 'فورا سارا کام اکیلے خود کریں اور پارٹنر کا نام بنا کچھ کہے ہٹا دیں۔',
                ur_rm: 'Foran saara kaam akele karein aur partner ka naam bina bataye remove kar dein.',
              },
              score: 55,
              feedback: {
                en: 'Understandable frustration, but acting without clear communication can lead to classroom conflict.',
                ur: 'غصہ سمجھ آتا ہے، لیکن بات کیے بغیر ایسا کرنے سے تنازعہ کھڑا ہو سکتا ہے۔',
                ur_rm: 'Frustration samajh aati hai magar bina communication ke conflict barhta hai.',
              },
              consequences: {
                en: 'You bear double the workload and face potential disputes during presentation.',
                ur: 'آپ پر دوگنا بوجھ آئے گا اور پریزنٹیشن کے وقت بدمزگی ہو سکتی ہے۔',
                ur_rm: 'Workload double ho jata hai aur presentation par dispute ho sakta hai.',
              },
            },
          ],
        },
        {
          id: 'teen_ps_4',
          difficulty: 'medium',
          category: 'decision_making',
          title: {
            en: 'Handling Peer Pressure & Academic Commitments',
            ur: 'ہم عمروں کا دباؤ اور پڑھائی کی ذمہ داریاں',
            ur_rm: 'Handling Peer Pressure & Academic Commitments',
          },
          situation: {
            en: 'Your close friends invite you to an outing that lasts until midnight on a Sunday. You have a scholarship qualification test on Monday morning at 8:00 AM.',
            ur: 'آپ کے قریبی دوست آپ کو اتوار کی رات گئے تک آؤٹنگ کی دعوت دیتے ہیں۔ پیر کی صبح 8 بجے آپ کا اسکالرشپ کا اہم ٹیسٹ ہے۔',
            ur_rm: 'Friends aap ko Sunday late night outing par invite karte hain. Monday morning 8:00 AM aap ka scholarship test hai.',
          },
          prompt: {
            en: 'How do you communicate your boundary assertively while preserving your friendships?',
            ur: 'دوستی برقرار رکھتے ہوئے آپ پراعتماد اور شائستہ انداز میں کیسے انکار کریں گے؟',
            ur_rm: 'Dosti kharab kiye bina politely boundary kaise set karein?',
          },
          options: [
            {
              id: 'opt_ps_4_1',
              text: {
                en: 'Politely decline the late-night part, offer to hang out for a short 1-hour coffee earlier in the afternoon, and wish them fun.',
                ur: 'رات کے وقت جانے سے شائستگی سے معذرت کریں، دوپہر میں ایک گھنٹے کے لیے ملنے کی پیشکش کریں اور انہیں دعائیں دیں۔',
                ur_rm: 'Late night se politely mana karein, afternoon mein 1 hour milne ka propose karein aur wish them fun.',
              },
              score: 95,
              feedback: {
                en: 'Mature and diplomatic! You prioritize your long-term educational opportunity while maintaining warmth with friends.',
                ur: 'بہترین اور دانشمندانہ فیصلہ! آپ نے دوستی کا احترام کرتے ہوئے اپنے اہم مقصد کو ترجیح دی۔',
                ur_rm: 'Mature decision! Aap ne goal ko priority di aur friends ko bhi respect di.',
              },
              consequences: {
                en: 'You get 8 hours of restorative sleep, perform at your peak on the test, and friends respect your focus.',
                ur: 'آپ پرسکون نیند لیتے ہیں، ٹیسٹ میں بہترین کارکردگی دکھاتے ہیں اور دوست بھی آپ کے فیصلے کی قدر کرتے ہیں۔',
                ur_rm: 'Good sleep milti hai, test acha hota hai aur friends respect karte hain.',
              },
            },
            {
              id: 'opt_ps_4_2',
              text: {
                en: 'Go out until midnight to avoid feeling left out, then attempt the scholarship test on 3 hours of sleep.',
                ur: 'اکیلا پن محسوس نہ کرنے کے لیے دیر رات تک باہر رہیں اور 3 گھنٹے کی نیند کے ساتھ امتحان دیں۔',
                ur_rm: 'Outing par chale jayein aur 3 hours ki sleep ke sath test dein.',
              },
              score: 30,
              feedback: {
                en: 'Sleep deprivation severely impairs working memory and cognitive problem-solving speed.',
                ur: 'نیند کی کمی امتحان میں یادداشت اور سوچنے کی رفتار کو شدید متاثر کرتی ہے۔',
                ur_rm: 'Sleep loss se exam performance drop hoti hai.',
              },
              consequences: {
                en: 'Risking the scholarship opportunity for a routine weekend hangout.',
                ur: 'ایک معمولی آؤٹنگ کے لیے بڑے تعلیمی موقع کو خطرے میں ڈالنا۔',
                ur_rm: 'Major scholarship opportunity risk par lag jati hai.',
              },
            },
          ],
        },
        {
          id: 'teen_ps_5',
          difficulty: 'challenging',
          category: 'budget_math',
          title: {
            en: 'Science Fair Model: Logistics, Budget & Risk Assessment',
            ur: 'سائنس فیئر ماڈل: لاجسٹکس، بجٹ اور رسک کا جائزہ',
            ur_rm: 'Science Fair Model: Logistics, Budget & Risk Assessment',
          },
          situation: {
            en: 'You have an approved school project budget of Rs. 5,000 to build an automated greenhouse model. The project deadline is in 4 days. Supplier A offers all parts for Rs. 4,400 with guaranteed next-day delivery. Supplier B offers the same parts for Rs. 3,600 with standard delivery (3 to 6 days).',
            ur: 'آٹومیٹڈ گرین ہاؤس ماڈل کے لیے آپ کا 5000 روپے کا بجٹ منظور ہوا ہے۔ ڈیڈلائن 4 دن میں ہے۔ دکاندار A تمام پرزے 4400 روپے میں اگلے دن کی یقینی ڈیلیوری کے ساتھ دیتا ہے۔ دکاندار B وہی پرزے 3600 روپے میں 3 سے 6 دن میں ڈیلیور کرتا ہے۔',
            ur_rm: 'School project ke liye Rs. 5,000 budget hai. Deadline 4 din mein hai. Shop A Rs. 4,400 mein 1-day delivery deta hai. Shop B Rs. 3,600 mein 3-6 days delivery deta hai.',
          },
          prompt: {
            en: 'Which purchasing decision best balances project risk, time constraints, and budget limits?',
            ur: 'وقت، بجٹ اور ڈیڈلائن کے خطرے کو سامنے رکھتے ہوئے کون سا فیصلہ بہترین ہے؟',
            ur_rm: 'Project risk, deadline aur budget ko balance karte hue best decision kya hai?',
          },
          options: [
            {
              id: 'opt_ps_5_1',
              text: {
                en: 'Order from Supplier A (Rs. 4,400) because it stays within your Rs. 5,000 budget and guarantees 3 full days to assemble and test the model before deadline.',
                ur: 'دکاندار A (4400 روپے) سے آرڈر کریں کیونکہ یہ 5000 روپے کے بجٹ میں ہے اور ماڈل بنانے کے لیے 3 پورے دن مل جاتے ہیں۔',
                ur_rm: 'Shop A se order karein (Rs. 4,400) kyunki yeh budget mein hai aur assembly/testing ke liye 3 din secure hote hain.',
              },
              score: 95,
              feedback: {
                en: 'Superb risk mitigation! Saving Rs. 800 with Supplier B is not worth the high risk of missing the entire science fair deadline.',
                ur: 'شاندار تجزیاتی فیصلہ! 800 روپے بچانے کے لیے ڈیڈلائن چھوٹنے کا خطرہ مول لینا درست نہیں۔',
                ur_rm: 'Zabardast risk assessment! 800 bachat ke liye project deadline risk karna dangerous tha.',
              },
              consequences: {
                en: 'Your model is built and tested smoothly, eliminating last-minute panic.',
                ur: 'آپ کا ماڈل وقت پر تیار ہو جاتا ہے اور پریشانی سے بچاؤ ہوتا ہے۔',
                ur_rm: 'Model time par ready ho jata hai bina kisi panic ke.',
              },
            },
            {
              id: 'opt_ps_5_2',
              text: {
                en: 'Order from Supplier B to save Rs. 800 and hope delivery arrives on day 3 instead of day 6.',
                ur: '800 روپے بچانے کے لیے دکاندار B سے آرڈر کریں اور امید کریں کہ سامان چھٹے دن کے بجائے تیسرے دن آ جائے۔',
                ur_rm: 'Shop B se order karein Rs. 800 bachane ke liye aur umeed karein ke day 3 par delivery aa jaye.',
              },
              score: 40,
              feedback: {
                en: 'If the delivery takes 5 or 6 days, you will receive parts after the competition is over.',
                ur: 'اگر ڈیلیوری میں 5 دن لگ گئے تو مقابلہ ختم ہونے کے بعد سامان آئے گا جس کا کوئی فائدہ نہیں۔',
                ur_rm: 'Agar delivery late hui to competition nikal jayega.',
              },
              consequences: {
                en: 'High probability of disqualification due to unsubmitted project.',
                ur: 'پروجیکٹ جمع نہ ہونے کی وجہ سے نااہلی کا خطرہ۔',
                ur_rm: 'Project submit na hone par disqualification ka risk.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'teen_communication',
      skillKey: 'communication',
      type: 'communication',
      title: {
        en: 'Communication 💬',
        ur: 'گفتگو اور سماجی مہارتیں 💬',
        ur_rm: 'Communication 💬',
      },
      description: {
        en: 'Practice talking to teachers, making friends, handling misunderstandings, and group discussions.',
        ur: 'اساتذہ سے بات چیت، دوست بنانے، غلط فہمیاں دور کرنے اور گروہی گفتگو کی مشق۔',
        ur_rm: 'Teachers se baat, dosti banana, misunderstandings handle karna aur group discussion practice.',
      },
      icon: '💬',
      redirectToScenarios: true,
      categoryFilter: 'teen',
    },
  ],
  adult: [
    {
      id: 'adult_functional_reading',
      skillKey: 'functional_reading',
      type: 'functional_reading',
      title: {
        en: 'Functional Reading 📄',
        ur: 'عملی مطالعہ 📄',
        ur_rm: 'Functional Reading 📄',
      },
      description: {
        en: 'Read workplace notices, transit schedules, SMS alerts, utility invoices, and official instructions.',
        ur: 'دفتری نوٹس، ٹرانزٹ شیڈول، سیکیورٹی الرٹس، یوٹیلیٹی بلز اور سرکاری ہدایات پڑھیں۔',
        ur_rm: 'Workplace notices, transit schedules, SMS alerts, utility invoices, aur official instructions.',
      },
      icon: '📄',
      scenarios: [
        {
          id: 'adult_fr_1',
          difficulty: 'easy',
          category: 'workplace_safety',
          title: {
            en: 'Workplace Safety & Maintenance Notice',
            ur: 'کام کی جگہ پر تحفظ اور دیکھ بھال کا نوٹس',
            ur_rm: 'Workplace Safety Notice',
          },
          passage: {
            en: 'Notice: "LIFT 2 IS UNDER MAINTENANCE TODAY UNTIL 3:00 PM. PLEASE USE LIFT 1 OR STAIRS FOR FLOORS 1-4. FOR HEAVY FREIGHT DELIVERIES, CONTACT BUILDING SECURITY."',
            ur: 'نوٹس: "لفٹ 2 کی آج شام 3 بجے تک دیکھ بھال جاری ہے۔ براہ کرم منزل 1-4 کے لیے لفٹ 1 یا سیڑھیاں استعمال کریں۔ بھاری سامان کی فراہمی کے لیے بلڈنگ سیکورٹی سے رابطہ کریں۔"',
            ur_rm: 'Notice: "LIFT 2 UNDER MAINTENANCE TODAY UNTIL 3:00 PM. USE LIFT 1 OR STAIRS FOR FLOORS 1-4. FOR HEAVY FREIGHT, CONTACT SECURITY."',
          },
          vocabulary: {
            en: 'Key Words: Maintenance (repair work), Freight (heavy goods), Security (safety staff).',
            ur: 'اہم الفاظ: دیکھ بھال (مرمت کا کام)، مال برداری (بھاری سامان)، سیکیورٹی۔',
            ur_rm: 'Key Words: Maintenance (repair work), Freight (heavy goods), Security.',
          },
          situation: {
            en: 'You arrive at your office building carrying a light briefcase and need to get to the 3rd floor at 11:00 AM.',
            ur: 'آپ صبح 11 بجے ہلکے بریف کیس کے ساتھ اپنے دفتر پہنچتے ہیں اور آپ کو تیسری منزل پر جانا ہے۔',
            ur_rm: 'Aap 11:00 AM par office pahunchte hain aur 3rd floor par jana hai.',
          },
          prompt: {
            en: 'Based on the notice, what is the correct action to take?',
            ur: 'نوٹس کے مطابق آپ کو کیا اقدام کرنا چاہیے؟',
            ur_rm: 'Notice ke mutabiq sahi action kya hai?',
          },
          options: [
            {
              id: 'opt_fr_1',
              text: {
                en: 'Use Lift 1 or take the stairs to reach the 3rd floor.',
                ur: 'تیسری منزل پر جانے کے لیے لفٹ 1 یا سیڑھیاں استعمال کریں۔',
                ur_rm: 'Lift 1 use karein ya stairs se 3rd floor jayein.',
              },
              score: 95,
              feedback: {
                en: 'Accurate functional reading! You correctly followed the notice directions.',
                ur: 'درست مطالعہ! آپ نے نوٹس کی ہدایات پر صحیح عمل کیا۔',
                ur_rm: 'Sahi functional reading! Aap ne notice follow kiya.',
              },
              consequences: {
                en: 'You reach your meeting smoothly without waiting at a disabled lift.',
                ur: 'آپ بنا کسی تاخیر کے اپنی میٹنگ میں وقت پر پہنچ گئے۔',
                ur_rm: 'Aap time par 3rd floor pahunch jayenge.',
              },
            },
            {
              id: 'opt_fr_2',
              text: {
                en: 'Call building security to carry your light briefcase.',
                ur: 'ہلکے بریف کیس کے لیے بلڈنگ سیکورٹی کو کال کریں۔',
                ur_rm: 'Light briefcase ke liye security ko call karein.',
              },
              score: 35,
              feedback: {
                en: 'Notice that security assistance is only specified for heavy freight deliveries.',
                ur: 'نوٹس میں سیکورٹی کی مدد صرف بھاری سامان کی فراہمی کے لیے لکھی گئی ہے۔',
                ur_rm: 'Security help sirf heavy freight delivery ke liye likhi hai.',
              },
            },
          ],
        },
        {
          id: 'adult_fr_2',
          difficulty: 'easy',
          category: 'bills_forms',
          title: {
            en: 'Banking Security SMS Alert & Action',
            ur: 'بینکنگ سیکیورٹی ایس ایم ایس الرٹ اور کارروائی',
            ur_rm: 'Banking Security SMS Alert & Action',
          },
          passage: {
            en: 'SMS: "ALERT: Online transaction of Rs. 4,500 at StoreXYZ is pending OTP 839210. Do NOT share OTP with anyone. If you did not initiate this, immediately call fraud helpline at 111-000-222 to block your card."',
            ur: 'ایس ایم ایس: "انتباہ: StoreXYZ پر 4,500 روپے کی آن لائن ٹرانزیکشن زیر التوا ہے۔ او ٹی پی 839210 کسی سے شیئر نہ کریں۔ اگر آپ نے یہ خریداری نہیں کی تو فورا فراڈ ہیلپ لائن 111-000-222 پر کال کر کے اپنا کارڈ بلاک کروائیں۔"',
            ur_rm: 'SMS: "ALERT: Online payment Rs. 4,500 pending OTP 839210. Do NOT share OTP. Agar aap ne yeh transaction nahi ki to foran helpline 111-000-222 par call kar ke card block karein."',
          },
          vocabulary: {
            en: 'Key Words: Transaction (financial transfer/payment), Initiate (start/authorize), Helpline (official support phone number).',
            ur: 'اہم الفاظ: ٹرانزیکشن (مالی لین دین)، آغاز کرنا (شروع کرنا)، ہیلپ لائن (معاون فون نمبر)۔',
            ur_rm: 'Key Words: Transaction (paison ka len den), Initiate (start karna), Helpline (support number).',
          },
          situation: {
            en: 'You are relaxing at home and receive this SMS out of nowhere. You did not buy anything from StoreXYZ.',
            ur: 'آپ گھر پر آرام کر رہے ہیں اور اچانک آپ کو یہ ایس ایم ایس موصول ہوتا ہے۔ آپ نے StoreXYZ سے کوئی خریداری نہیں کی۔',
            ur_rm: 'Aap ghar par hain aur achanak yeh SMS aata hai. Aap ne StoreXYZ se kuch nahi khareeda.',
          },
          prompt: {
            en: 'What is the immediate, secure action you should take according to the SMS instructions?',
            ur: 'پیغام کی ہدایات کے مطابق آپ کو فوری طور پر کیا محفوظ قدم اٹھانا چاہیے؟',
            ur_rm: 'SMS ke mutabiq aap ko foran kya safe action lena chahiye?',
          },
          options: [
            {
              id: 'opt_fr_2_1',
              text: {
                en: 'Do not share the OTP with anyone and immediately call 111-000-222 to block the card.',
                ur: 'کسی سے او ٹی پی شیئر نہ کریں اور کارڈ بلاک کروانے کے لیے فوری طور پر 111-000-222 پر کال کریں۔',
                ur_rm: 'Kisi ko OTP na dein aur foran 111-000-222 par call kar ke card block karein.',
              },
              score: 95,
              feedback: {
                en: 'Flawless safety response! You followed the critical security guidance precisely.',
                ur: 'شاندار سیکیورٹی رسپانس! آپ نے ہدایات پر بالکل صحیح عمل کیا۔',
                ur_rm: 'Perfect safety action! Aap ne bank security instructions accurately follow keen.',
              },
              consequences: {
                en: 'Your bank account is protected from unauthorized deductions.',
                ur: 'آپ کا بینک اکاؤنٹ غیر قانونی کٹوتی سے محفوظ رہتا ہے۔',
                ur_rm: 'Aap ke account se paise deduct nahi honge.',
              },
            },
            {
              id: 'opt_fr_2_2',
              text: {
                en: 'Reply to the SMS with your PIN number.',
                ur: 'ایس ایم ایس کے جواب میں اپنا پن نمبر لکھ کر بھیجیں۔',
                ur_rm: 'SMS ke reply mein apna PIN code likh kar bhejein.',
              },
              score: 20,
              feedback: {
                en: 'Never send your PIN or OTP via SMS. Banks never ask for your confidential codes.',
                ur: 'کبھی بھی اپنا پن یا او ٹی پی کسی کو نہ بھیجیں۔ بینک کبھی خفیہ کوڈ نہیں مانگتا۔',
                ur_rm: 'PIN ya OTP kabhi kisi ko SMS par send na karein.',
              },
              consequences: {
                en: 'Sharing credentials leads to direct financial loss.',
                ur: 'خفیہ کوڈ دینے سے مالی نقصان ہو سکتا ہے۔',
                ur_rm: 'Financial loss ho sakta hai.',
              },
            },
          ],
        },
        {
          id: 'adult_fr_3',
          difficulty: 'medium',
          category: 'transit_schedule',
          title: {
            en: 'Metro Transit Schedule & Track Work Notice',
            ur: 'میٹرو ٹرانزٹ شیڈول اور ٹریک کے کام کا نوٹس',
            ur_rm: 'Metro Transit Schedule & Track Work Notice',
          },
          passage: {
            en: 'Schedule Memo: "METRO RED LINE: Trains depart every 8 minutes. Due to maintenance between City Center and Tech Park, expect a 15-minute transfer delay at Central Junction. Commuters with shifts starting at 9:00 AM should arrive at Central Junction no later than 8:25 AM."',
            ur: 'شیڈول میمو: "میٹرو ریڈ لائن: ٹرینیں ہر 8 منٹ بعد روانہ ہوتی ہیں۔ سٹی سینٹر اور ٹیک پارک کے درمیان ٹریک کے کام کی وجہ سے سنٹرل جنکشن پر 15 منٹ کی تاخیر متوقع ہے۔ وہ مسافر جن کی ڈیوٹی صبح 9 بجے شروع ہوتی ہے وہ صبح 8:25 بجے تک سنٹرل جنکشن پہنچیں۔"',
            ur_rm: 'Memo: "RED LINE: Trains every 8 mins. Track maintenance delay of 15 mins at Central Junction. Workers with 9:00 AM shift must arrive at Central Junction by 8:25 AM."',
          },
          vocabulary: {
            en: 'Key Words: Commuters (daily travelers), Transfer delay (waiting time between connecting trains), Central Junction (interchange station).',
            ur: 'اہم الفاظ: روزانہ سفر کرنے والے، تاخیر (کنیکٹنگ ٹرین کا انتظار)، جنکشن (مرکزی اسٹیشن)۔',
            ur_rm: 'Key Words: Commuters (musafir), Transfer delay (wait time), Central Junction.',
          },
          situation: {
            en: 'You have an important morning shift starting at 9:00 AM at Tech Park and you are planning your departure from home.',
            ur: 'آپ کی ٹیک پارک میں صبح 9 بجے اہم ڈیوٹی شروع ہوتی ہے اور آپ گھر سے نکلنے کا وقت طے کر رہے ہیں۔',
            ur_rm: 'Aap ki 9:00 AM shift hai Tech Park mein aur aap departure plan kar rahe hain.',
          },
          prompt: {
            en: 'According to the notice, what is the latest time you should reach Central Junction to ensure you are not late for your 9:00 AM shift?',
            ur: 'نوٹس کے مطابق، 9 بجے کی ڈیوٹی پر وقت پر پہنچنے کے لیے آپ کو زیادہ سے زیادہ کس وقت تک سنٹرل جنکشن پہنچنا چاہیے؟',
            ur_rm: 'Notice ke mutabiq 9:00 AM shift ke liye Central Junction kab tak pahunchna zaroori hai?',
          },
          options: [
            {
              id: 'opt_fr_3_1',
              text: {
                en: 'By 8:25 AM at the latest to accommodate the 15-minute transfer delay.',
                ur: '15 منٹ کی تاخیر کو مدنظر رکھتے ہوئے زیادہ سے زیادہ صبح 8:25 بجے تک۔',
                ur_rm: '8:25 AM tak latest taake 15-minute transfer delay manage ho sake.',
              },
              score: 95,
              feedback: {
                en: 'Great attention to schedule details! You extracted the exact operational time benchmark.',
                ur: 'بہترین تجزیہ! آپ نے شیڈول کے اہم وقت کو بالکل درست طریقے سے تلاش کیا۔',
                ur_rm: 'Accurate reading! Aap ne schedule ka key benchmark correctly identify kiya.',
              },
              consequences: {
                en: 'You arrive at work reliably on time and maintain high workplace professionalism.',
                ur: 'آپ وقت پر دفتر پہنچتے ہیں اور آپ کی ساکھ بہتر رہتی ہے۔',
                ur_rm: 'Aap time par office pahunch kar workplace punctuality maintain karte hain.',
              },
            },
            {
              id: 'opt_fr_3_2',
              text: {
                en: 'Arrive at Central Junction at 8:55 AM.',
                ur: 'صبح 8:55 بجے سنٹرل جنکشن پہنچیں۔',
                ur_rm: '8:55 AM par Central Junction pahunchein.',
              },
              score: 30,
              feedback: {
                en: 'With the 15-minute transfer delay, arriving at 8:55 AM will make you late for your 9:00 AM shift.',
                ur: '15 منٹ کی تاخیر کے ساتھ 8:55 بجے پہنچنے سے آپ ڈیوٹی پر تاخیر کا شکار ہو جائیں گے۔',
                ur_rm: '15-minute delay ki wajah se 8:55 AM par late ho jayenge.',
              },
              consequences: {
                en: 'Late arrivals can lead to official workplace warnings.',
                ur: 'دیر سے پہنچنے پر سرزنش ہو سکتی ہے۔',
                ur_rm: 'Workplace warning mil sakti hai.',
              },
            },
          ],
        },
        {
          id: 'adult_fr_4',
          difficulty: 'medium',
          category: 'bills_forms',
          title: {
            en: 'Understanding Electricity Bill & Payment Options',
            ur: 'بجلی کے بل اور ادائیگی کے اختیارات کا فہم',
            ur_rm: 'Electricity Bill & Payment Options',
          },
          passage: {
            en: 'Invoice: "ELECTRICITY BILL: Amount Payable within Due Date: Rs. 6,800. Due Date: 15-SEP. Late Payment Surcharge: Rs. 650. Amount Payable after Due Date: Rs. 7,450. Payments via Mobile Banking App receive an instant Rs. 100 cashback discount."',
            ur: 'بل کا خلاصہ: "بجلی کا بل: مقررہ تاریخ کے اندر قابل ادا رقم: 6,800 روپے۔ مقررہ تاریخ: 15 ستمبر۔ تاخیر پر اضافی چارجز: 650 روپے۔ تاریخ کے بعد قابل ادا رقم: 7,450 روپے۔ موبائل بینکنگ ایپ سے ادائیگی پر 100 روپے کی فوری چھوٹ۔"',
            ur_rm: 'Bill Summary: "Payable within Due Date: Rs. 6,800. Due Date: 15-SEP. Late Fee: Rs. 650. Amount after Due Date: Rs. 7,450. Mobile Banking App payments get instant Rs. 100 cashback."',
          },
          vocabulary: {
            en: 'Key Words: Surcharge (additional charge / late penalty fee), Due Date (deadline for payment), Cashback (discount refunded directly).',
            ur: 'اہم الفاظ: سرچارج (اضافی جرمانہ فیس)، مقررہ تاریخ (آخری تاریخ)، کیش بیک (رعایت)۔',
            ur_rm: 'Key Words: Surcharge (late fee), Due Date (aakhri tareekh), Cashback (discount).',
          },
          situation: {
            en: 'Today is September 12th. You have Rs. 7,000 in your mobile banking account and want to pay your bill before the deadline.',
            ur: 'آج 12 ستمبر ہے۔ آپ کے موبائل بینکنگ اکاؤنٹ میں 7000 روپے ہیں اور آپ مقررہ تاریخ سے پہلے بل ادا کرنا چاہتے ہیں۔',
            ur_rm: 'Aaj 12th Sept hai. Mobile bank account mein Rs. 7,000 hain aur bill pay karna hai.',
          },
          prompt: {
            en: 'How much will you actually pay if you pay on Sept 12th using your Mobile Banking App?',
            ur: 'اگر آپ 12 ستمبر کو موبائل بینکنگ ایپ سے ادائیگی کریں تو آپ کو کتنی رقم ادا کرنی ہوگی؟',
            ur_rm: 'Agar aap 12th Sept ko Mobile Banking App se pay karein to actual cost kya hogi?',
          },
          options: [
            {
              id: 'opt_fr_4_1',
              text: {
                en: 'Rs. 6,700 (Rs. 6,800 on-time amount minus Rs. 100 mobile app discount, saving the Rs. 650 late surcharge).',
                ur: '6,700 روپے (6,800 روپے بل مائنس 100 روپے ایپ ڈسکاؤنٹ، اور 650 روپے جرمانے کی بچت)۔',
                ur_rm: 'Rs. 6,700 (Rs. 6,800 bill minus Rs. 100 app cashback, late fee bachat ke sath).',
              },
              score: 95,
              feedback: {
                en: 'Brilliant functional calculation! You avoided the late surcharge and maximized the mobile discount.',
                ur: 'زبردست حساب کتاب! آپ نے جرمانے سے بچتے ہوئے ڈسکاؤنٹ بھی حاصل کر لیا۔',
                ur_rm: 'Smart everyday financial reading! Late fee se bache aur discount bhi lia.',
              },
              consequences: {
                en: 'You save Rs. 750 in total compared to paying late at a bank counter.',
                ur: 'آپ نے تاخیر کے مقابلے میں مجموعی طور پر 750 روپے بچائے۔',
                ur_rm: 'Aap ne total Rs. 750 ki bachat ki.',
              },
            },
            {
              id: 'opt_fr_4_2',
              text: {
                en: 'Rs. 7,450 because surcharge applies immediately on all bills.',
                ur: '7,450 روپے کیونکہ تمام بلوں پر فوری جرمانہ لاگو ہوتا ہے۔',
                ur_rm: 'Rs. 7,450 kyunki surcharge lag jata hai.',
              },
              score: 35,
              feedback: {
                en: 'Today is Sept 12th, which is before the Sept 15th due date. Surcharge only applies after Sept 15th.',
                ur: 'آج 12 ستمبر ہے جو 15 ستمبر سے پہلے ہے۔ جرمانہ 15 ستمبر کے بعد لگتا ہے۔',
                ur_rm: 'Aaj 12th Sept hai jo due date se pehle hai. Surcharge sirf after due date lagta hai.',
              },
              consequences: {
                en: 'Paying attention to dates saves money on monthly household bills.',
                ur: 'تاریخوں پر توجہ دینے سے ماہانہ اخراجات میں بچت ہوتی ہے۔',
                ur_rm: 'Dates par dhyan dena bachat karwata hai.',
              },
            },
          ],
        },
        {
          id: 'adult_fr_5',
          difficulty: 'challenging',
          category: 'workplace_safety',
          title: {
            en: 'Workplace Leave Policy & Form Submission Requirements',
            ur: 'دفتر کی رخصت کی پالیسی اور فارم جمع کرانے کی شرائط',
            ur_rm: 'Workplace Leave Policy & Form Submission',
          },
          passage: {
            en: 'Company Handbook Sec 4.2: "Planned annual leaves exceeding 2 consecutive days require submission of Form HR-02 at least 5 business days prior to the proposed start date, accompanied by manager pre-approval. Medical leaves require doctor documentation submitted within 48 hours of return."',
            ur: 'کمپنی ہینڈ بک سیکشن 4.2: "2 سے زیادہ مسلسل دنوں کی منصوبہ بند سالانہ چھٹیوں کے لیے تجویز کردہ تاریخ سے کم از کم 5 دفتری دن پہلے مینیجر کی منظوری کے ساتھ فارم HR-02 جمع کرانا ضروری ہے۔ بیماری کی چھٹیوں کے لیے واپسی کے 48 گھنٹے کے اندر ڈاکٹر کا سرٹیفکیٹ درکار ہے۔"',
            ur_rm: 'Handbook Sec 4.2: "Annual leave > 2 consecutive days requires Form HR-02 at least 5 business days prior with manager approval. Medical leave needs doctor note within 48 hours of return."',
          },
          vocabulary: {
            en: 'Key Words: Consecutive (following continuously in unbroken order), Prior to (before), Business days (working days excluding weekends).',
            ur: 'اہم الفاظ: مسلسل (بغیر وقفے کے لگاتار)، پہلے (پیشگی)، دفتری دن (ہفتہ وار چھٹیوں کے علاوہ)۔',
            ur_rm: 'Key Words: Consecutive (lagataar), Prior to (pehle), Business days (working days).',
          },
          situation: {
            en: 'You plan to take 4 days of annual leave starting on Monday, October 16th. You want to follow the official company policy strictly.',
            ur: 'آپ پیر 16 اکتوبر سے 4 دن کی سالانہ چھٹیاں لینا چاہتے ہیں اور کمپنی کی پالیسی پر سختی سے عمل کرنا چاہتے ہیں۔',
            ur_rm: 'Aap Monday 16th Oct se 4 days annual leave lena chahte hain aur policy follow karni hai.',
          },
          prompt: {
            en: 'According to the policy, what must you do to have your 4-day annual leave approved?',
            ur: 'پالیسی کے مطابق 4 دن کی چھٹیوں کی منظوری کے لیے آپ کو کیا کرنا ہوگا؟',
            ur_rm: 'Policy ke mutabiq 4 days annual leave approve karwane ke liye kya karna zaroori hai?',
          },
          options: [
            {
              id: 'opt_fr_5_1',
              text: {
                en: 'Submit Form HR-02 with manager pre-approval at least 5 business days before October 16th.',
                ur: '16 اکتوبر سے کم از کم 5 دفتری دن پہلے مینیجر کی پیشگی منظوری کے ساتھ فارم HR-02 جمع کرائیں۔',
                ur_rm: '16th Oct se kam az kam 5 business days pehle manager approval ke sath Form HR-02 submit karein.',
              },
              score: 95,
              feedback: {
                en: 'Masterful reading comprehension of official workplace guidelines!',
                ur: 'دفتری قواعد و ضوابط پر بہترین فہم و ادراک!',
                ur_rm: 'Excellent reading of official workplace policy rules!',
              },
              consequences: {
                en: 'Your leave is officially sanctioned, protecting your paid time off and job security.',
                ur: 'آپ کی چھٹیاں باضابطہ طور پر منظور ہو جاتی ہیں اور تنخواہ محفوظ رہتی ہے۔',
                ur_rm: 'Aap ki leave formally approve ho jati hai aur job secure rehti hai.',
              },
            },
            {
              id: 'opt_fr_5_2',
              text: {
                en: 'Just send a text message on the morning of October 16th without submitting Form HR-02.',
                ur: 'بغیر فارم جمع کرائے صرف 16 اکتوبر کی صبح ایک ٹیکسٹ میسج بھیج دیں۔',
                ur_rm: 'Form HR-02 ke bina 16th Oct ki morning bas text message bhej dein.',
              },
              score: 30,
              feedback: {
                en: 'Leaves longer than 2 days require Form HR-02 at least 5 days in advance, not sudden day-of texts.',
                ur: '2 دن سے زیادہ چھٹیوں کے لیے 5 دن پہلے باقاعدہ فارم ضروری ہوتا ہے۔',
                ur_rm: '2 days se ziada leave ke liye 5 days prior form zaroori hota hai.',
              },
              consequences: {
                en: 'Unapproved absence can be recorded as unpaid leave or misconduct.',
                ur: 'غیر منظور شدہ غیر حاضری پر تنخواہ کٹ سکتی ہے۔',
                ur_rm: 'Unpaid leave ya disciplinary notice lag sakta hai.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'adult_problem_solving',
      skillKey: 'problem_solving',
      type: 'problem_solving',
      title: {
        en: 'Everyday Problem Solving 🧩',
        ur: 'روزمرہ مسائل کا حل 🧩',
        ur_rm: 'Everyday Problem Solving 🧩',
      },
      description: {
        en: 'Practical decisions involving shopping, price comparisons, time scheduling, money management, and workplace priorities.',
        ur: 'خریداری، قیمتوں کا موازنہ، وقت کا شیڈول، رقم کا انتظام اور دفتری ترجیحات کے عملی فیصلے کریں۔',
        ur_rm: 'Shopping, time, money management, workplace priorities, aur practical daily decisions.',
      },
      icon: '🧩',
      scenarios: [
        {
          id: 'adult_ps_1',
          difficulty: 'easy',
          category: 'budget_math',
          title: {
            en: 'Grocery Budget & Best Unit Value Choice',
            ur: 'گروسری بجٹ اور بہترین قیمت کا انتخاب',
            ur_rm: 'Grocery Budget & Best Value Choice',
          },
          situation: {
            en: 'You have Rs. 1,000 to buy cooking oil for the month. Brand A costs Rs. 850 for 1 Liter. Brand B costs Rs. 950 for 1.5 Liters (on special discount). You want maximum value within budget.',
            ur: 'آپ کے پاس گروسری کے لیے 1000 روپے ہیں۔ برانڈ A کی قیمت 1 لیٹر کی 850 روپے ہے۔ برانڈ B خصوصی رعایت پر 1.5 لیٹر 950 روپے کا دے رہا ہے۔ آپ بجٹ میں بہترین مقدار چاہتے ہیں۔',
            ur_rm: 'Aap ke paas Rs. 1,000 hain. Brand A 1 Liter Rs. 850 ka hai. Brand B 1.5 Liters discount par Rs. 950 ka hai. Aap budget mein best value chahte hain.',
          },
          prompt: {
            en: 'Which buying choice gives you the best everyday value within your Rs. 1,000 budget?',
            ur: '1000 روپے کے بجٹ میں کون سا انتخاب آپ کو بہترین مقدار دیتا ہے؟',
            ur_rm: 'Rs. 1,000 budget mein konsa option best value deta hai?',
          },
          options: [
            {
              id: 'ad_ps_opt_1',
              text: {
                en: 'Buy Brand B (1.5L for Rs. 950) because it stays within your Rs. 1,000 limit and provides 50% more volume for just Rs. 100 more.',
                ur: 'برانڈ B (1.5 لیٹر 950 روپے میں) خریدیں کیونکہ یہ 1000 روپے کے اندر رہتا ہے اور صرف 100 روپے اضافے پر 50٪ زیادہ مقدار دیتا ہے۔',
                ur_rm: 'Brand B lein (1.5L for Rs. 950) kyunki yeh Rs. 1,000 budget mein hai aur Rs. 100 extra par 50% ziada oil milta hai.',
              },
              score: 95,
              feedback: {
                en: 'Smart everyday financial decision! You calculated unit value while strictly respecting your budget limit.',
                ur: 'زبردست مالیاتی فیصلہ! آپ نے بجٹ کا احترام کرتے ہوئے بہترین بچت کی۔',
                ur_rm: 'Smart everyday money decision! Aap ne budget ke andar best value calculate ki.',
              },
              consequences: {
                en: 'You save money in the long run and remain Rs. 50 under your cash limit.',
                ur: 'آپ طویل المدتی بچت کرتے ہیں اور 50 روپے نقد باقی رہتے ہیں۔',
                ur_rm: 'Long run mein bachat hogi aur Rs. 50 cash bhi bach jayenge.',
              },
            },
            {
              id: 'ad_ps_opt_2',
              text: {
                en: 'Buy Brand A (1L for Rs. 850) and also buy a Rs. 300 snack on credit.',
                ur: 'برانڈ A خریدیں اور ساتھ میں 300 روپے کا سنیک ادھار پر لیں۔',
                ur_rm: 'Brand A khareedein aur 300 ka snack credit par lein.',
              },
              score: 40,
              feedback: {
                en: 'Going over your budget on credit causes unnecessary financial stress.',
                ur: 'بجٹ سے تجاوز کرنے سے مالی پریشانی ہو سکتی ہے۔',
                ur_rm: 'Budget se aage jana financial stress paida karta hai.',
              },
            },
          ],
        },
        {
          id: 'adult_ps_2',
          difficulty: 'easy',
          category: 'time_management',
          title: {
            en: 'Transit Choice: Cost vs Time Constraint',
            ur: 'سفر کا انتخاب: لاگت بمقابلہ وقت کا دباؤ',
            ur_rm: 'Transit Choice: Cost vs Time Constraint',
          },
          situation: {
            en: 'It is 9:15 AM. You have an important job interview at 10:00 AM across town. You have Rs. 400 cash. Metro costs Rs. 80 and takes 30 minutes. An app taxi costs Rs. 550 and takes 25 minutes. Walking takes 60 minutes.',
            ur: 'صبح 9:15 بجے ہیں۔ صبح 10:00 بجے شہر کے دوسرے کونے میں آپ کا ملازمت کا انٹرویو ہے۔ آپ کے پاس 400 روپے نقد ہیں۔ میٹرو کا کرایہ 80 روپے ہے اور 30 منٹ لگتے ہیں۔ ٹیکسی 550 روپے کی ہے اور 25 منٹ لگتے ہیں۔ پیدل 60 منٹ لگتے ہیں۔',
            ur_rm: '9:15 AM hain. 10:00 AM interview hai. Rs. 400 cash hai. Metro Rs. 80 (30 mins). Taxi Rs. 550 (25 mins). Walk 60 mins.',
          },
          prompt: {
            en: 'Which transportation option guarantees you arrive on time within your Rs. 400 cash limit?',
            ur: '400 روپے کے بجٹ میں وقت پر پہنچنے کے لیے کون سا سفری انتخاب سب سے درست ہے؟',
            ur_rm: 'Rs. 400 budget mein time par interview pahunchne ke liye best option kya hai?',
          },
          options: [
            {
              id: 'ad_ps_opt_2_1',
              text: {
                en: 'Take the Metro (Rs. 80, arriving at ~9:45 AM, comfortably 15 minutes before your interview and well under budget).',
                ur: 'میٹرو لیں (80 روپے، صبح 9:45 پر پہنچیں گے، انٹرویو سے 15 منٹ پہلے اور بجٹ کے اندر)۔',
                ur_rm: 'Metro lein (Rs. 80, 9:45 AM arrival, 15 mins pehle aur budget ke andar).',
              },
              score: 95,
              feedback: {
                en: 'Perfect logistical decision! Metro fits your budget and provides a calm 15-minute buffer before your interview.',
                ur: 'بہترین فیصلہ! میٹرو آپ کے بجٹ میں ہے اور انٹرویو سے پہلے پرسکون ہونے کے لیے 15 منٹ کا وقت بھی ملتا ہے۔',
                ur_rm: 'Perfect transit choice! Budget ke andar time buffer ke sath pahunchenge.',
              },
              consequences: {
                en: 'You arrive relaxed, punctual, and have Rs. 320 remaining for return travel.',
                ur: 'آپ پرسکون اور وقت پر پہنچتے ہیں اور واپسی کے لیے 320 روپے بھی بچتے ہیں۔',
                ur_rm: 'Time par arrival hogi aur return journey ke liye paise bhi bachenge.',
              },
            },
            {
              id: 'ad_ps_opt_2_2',
              text: {
                en: 'Walk to save Rs. 80 even though it will make you 15 minutes late for the interview.',
                ur: '80 روپے بچانے کے لیے پیدل چلیں اگرچہ اس سے آپ انٹرویو میں 15 منٹ لیٹ ہو جائیں گے۔',
                ur_rm: 'Rs. 80 bachane ke liye walk karein halanke interview mein 15 mins late ho jayenge.',
              },
              score: 25,
              feedback: {
                en: 'Punctuality at an interview is critical; being late damages your chances significantly.',
                ur: 'انٹرویو میں وقت کی پابندی انتہائی اہم ہے۔ دیر سے پہنچنے سے موقع ضائع ہو سکتا ہے۔',
                ur_rm: 'Interview punctuality critical hoti hai, late hona job chance kharab karta hai.',
              },
              consequences: {
                en: 'Being late to an interview creates a negative first impression.',
                ur: 'دیر سے پہنچنا منفی تاثر پیدا کرتا ہے۔',
                ur_rm: 'Negative first impression ban jata hai.',
              },
            },
          ],
        },
        {
          id: 'adult_ps_3',
          difficulty: 'medium',
          category: 'decision_making',
          title: {
            en: 'Handling an Overcharge on an Internet Invoice',
            ur: 'انٹرنیٹ کے بل میں اضافی چارجز کا مسئلہ حل کرنا',
            ur_rm: 'Handling an Overcharge on an Internet Invoice',
          },
          situation: {
            en: 'Your regular monthly home internet bill is Rs. 2,000. This month you receive a bill for Rs. 3,500 due to a streaming add-on you never ordered. The payment due date is in 4 days.',
            ur: 'آپ کا انٹرنیٹ کا ماہانہ بل 2,000 روپے ہوتا ہے۔ اس ماہ آپ کو 3,500 روپے کا بل موصول ہوا ہے جس میں ایک غیر ضروری اسٹریمنگ پیکیج شامل کیا گیا ہے جو آپ نے نہیں مانگا تھا۔ آخری تاریخ میں 4 دن باقی ہیں۔',
            ur_rm: 'Regular internet bill Rs. 2,000 hai. Is month Rs. 3,500 aaya hai unrequested add-on ki wajah se. Due date 4 din mein hai.',
          },
          prompt: {
            en: 'What is the most constructive and effective way to resolve this before due date?',
            ur: 'آخری تاریخ سے پہلے اس مسئلے کو پرسکون اور موثر انداز میں حل کرنے کا بہترین طریقہ کیا ہے؟',
            ur_rm: 'Due date se pehle calmly issue resolve karne ka best way kya hai?',
          },
          options: [
            {
              id: 'ad_ps_opt_3_1',
              text: {
                en: 'Call the service provider helpline with your account number, explain the unauthorized add-on calmly, and request an amended invoice before paying.',
                ur: 'اپنے اکاؤنٹ نمبر کے ساتھ ہیلپ لائن پر کال کریں، شائستگی سے اضافی پیکج کی وضاحت کریں، اور درست شدہ بل کی درخواست کریں۔',
                ur_rm: 'Helpline par account number ke sath call karein, politely issue explain karein aur amended bill request karein.',
              },
              score: 95,
              feedback: {
                en: 'Spot on! Resolving billing disputes calmly with customer support with account details gets corrections processed quickly.',
                ur: 'بہترین طریقہ! پرسکون انداز میں ہیلپ لائن سے رابطہ کرنے سے بل کی درستگی جلد ہو جاتی ہے۔',
                ur_rm: 'Great communication! Customer support se calmly baat kar ke issue jaldi solve hota hai.',
              },
              consequences: {
                en: 'The wrongful Rs. 1,500 charge is reversed and your account remains in good standing.',
                ur: 'اضافی 1500 روپے ختم ہو جاتے ہیں اور آپ کا کنکشن بحال رہتا ہے۔',
                ur_rm: 'Extra charge reverse ho jata hai.',
              },
            },
            {
              id: 'ad_ps_opt_3_2',
              text: {
                en: 'Ignore the bill completely and do not pay anything.',
                ur: 'بل کو بالکل نظر انداز کر دیں اور کوئی رقم ادا نہ کریں۔',
                ur_rm: 'Bill ko ignore karein aur kuch pay na karein.',
              },
              score: 30,
              feedback: {
                en: 'Ignoring bills leads to service disconnection and reconnection penalty fees.',
                ur: 'بل نظر انداز کرنے سے کنکشن کٹ سکتا ہے اور دوبارہ بحالی کی فیس لگتی ہے۔',
                ur_rm: 'Disconnection aur penalty fee lag sakti hai.',
              },
              consequences: {
                en: 'Loss of internet service and damaged credit history.',
                ur: 'انٹرنیٹ کی بندش اور پریشانی۔',
                ur_rm: 'Internet band ho sakta hai.',
              },
            },
          ],
        },
        {
          id: 'adult_ps_4',
          difficulty: 'medium',
          category: 'workplace_safety',
          title: {
            en: 'Workplace Prioritization: Conflicting Supervisor Requests',
            ur: 'دفتری ترجیحات: مینیجر کے بیک وقت دو ضروری کام',
            ur_rm: 'Workplace Prioritization: Conflicting Tasks',
          },
          situation: {
            en: 'At 2:00 PM, you are finishing a client invoice report due at 3:30 PM (takes 1 hour). Your manager walks up and asks you to urgently verify shipment records (takes 1.5 hours). You cannot complete both before 3:30 PM alone.',
            ur: 'دوپہر 2 بجے آپ کلائنٹ کے بل کی رپورٹ مکمل کر رہے ہیں جو 3:30 بجے جمع کرانی ہے (1 گھنٹہ درکار ہے)۔ آپ کے مینیجر آ کر شپمنٹ ریکارڈ کی فوری جانچ کا کہتے ہیں (1.5 گھنٹے درکار ہیں)۔ آپ اکیلے دونوں کام 3:30 تک مکمل نہیں کر سکتے۔',
            ur_rm: '2:00 PM par client report 3:30 PM tak complete karni hai (1 hr work). Manager ne shipment verify karne ko bola (1.5 hr work). Dono 3:30 tak impossible hain.',
          },
          prompt: {
            en: 'How should you communicate with your manager to manage priorities professionally?',
            ur: 'پیشہ ورانہ انداز میں ترجیحات طے کرنے کے لیے آپ مینیجر سے کیسے بات کریں گے؟',
            ur_rm: 'Professionally priorities manage karne ke liye manager se kaise baat karein?',
          },
          options: [
            {
              id: 'ad_ps_opt_4_1',
              text: {
                en: 'Explain both deadlines clearly to your manager and ask which task they would like you to prioritize first for 3:30 PM.',
                ur: 'مینیجر کو دونوں کاموں کی ڈیڈلائن شائستگی سے بتائیں اور پوچھیں کہ 3:30 بجے کے لیے کس کام کو اولین ترجیح دی جائے۔',
                ur_rm: 'Manager ko dono deadlines explain karein aur puchein ke 3:30 PM ke liye kis task ko pehle prioritize karein.',
              },
              score: 95,
              feedback: {
                en: 'Outstanding professional clarity! Empowering your manager to prioritize tasks prevents hidden delays.',
                ur: 'شاندار پیشہ ورانہ انداز! مینیجر کو صورتحال سے آگاہ کر کے ترجیح پوچھنا تاخیر سے بچاتا ہے۔',
                ur_rm: 'Excellent workplace communication! Proactive clarity prevents missed expectations.',
              },
              consequences: {
                en: 'Your manager appreciates your transparency and reassigns or reschedules the other task.',
                ur: 'مینیجر آپ کی دیانت داری کی قدر کرتا ہے اور کام کا وقت ایڈجسٹ کر دیتا ہے۔',
                ur_rm: 'Manager workload adjust kar deta hai.',
              },
            },
            {
              id: 'ad_ps_opt_4_2',
              text: {
                en: 'Say yes to both, panic, rush through both, and deliver incomplete errors on both.',
                ur: 'دونوں پر ہاں کہہ دیں، پریشان ہوں، اور جلد بازی میں دونوں میں غلطیاں کر دیں۔',
                ur_rm: 'Dono par yes bol kar panic karein aur dono mein errors deliver karein.',
              },
              score: 30,
              feedback: {
                en: 'Overpromising and delivering flawed work damages workplace reliability.',
                ur: 'طاقت سے زیادہ کام کا وعدہ کرنا اور غلطیاں کرنا ساکھ کو نقصان پہنچاتا ہے۔',
                ur_rm: 'Overpromising quality kharab karti hai.',
              },
              consequences: {
                en: 'Errors in financial reports and disappointed clients.',
                ur: 'کلائنٹ کی ناراضگی اور غلط رپورٹنگ۔',
                ur_rm: 'Client dissatisfaction aur errors.',
              },
            },
          ],
        },
        {
          id: 'adult_ps_5',
          difficulty: 'challenging',
          category: 'budget_math',
          title: {
            en: 'Equipment Decision: Rental vs Purchase Analysis',
            ur: 'سامان کا فیصلہ: کرایہ بمقابلہ خریداری کا مالی تجزیہ',
            ur_rm: 'Equipment Decision: Rental vs Purchase Analysis',
          },
          situation: {
            en: 'You have a 4-month freelance contract requiring a specialized commercial tool. Renting costs Rs. 2,000/month (total Rs. 8,000). Buying used costs Rs. 10,000, but has a guaranteed resale buyback of Rs. 6,000 after 4 months (net cost Rs. 4,000). You have Rs. 11,000 in your business reserve.',
            ur: 'آپ کا 4 ماہ کا فری لانس کام ہے جس کے لیے ایک خاص مشین درکار ہے۔ کرایہ 2000 روپے ماہانہ ہے (کل 8000 روپے)۔ استعمال شدہ مشین 10,000 روپے میں مل رہی ہے جو 4 ماہ بعد 6000 روپے میں باآسانی بک جائے گی (خالص لاگت 4000 روپے)۔ آپ کے پاس 11,000 روپے کا فنڈ موجود ہے۔',
            ur_rm: '4-month freelance contract ke liye equipment chahiye. Rent: Rs. 2,000/month (Total Rs. 8,000). Buy used: Rs. 10,000 with Rs. 6,000 resale (Net cost Rs. 4,000). Reserve fund Rs. 11,000 hai.',
          },
          prompt: {
            en: 'Which option minimizes your net expenses over the 4-month contract while staying within available funds?',
            ur: 'موجودہ فنڈز کے اندر رہتے ہوئے 4 ماہ کے دوران کون سا آپشن آپ کے خالص اخراجات کو کم ترین سطح پر لاتا ہے؟',
            ur_rm: 'Available funds ke andar net expenses minimum karne ke liye best option kya hai?',
          },
          options: [
            {
              id: 'ad_ps_opt_5_1',
              text: {
                en: 'Buy used for Rs. 10,000 and resell for Rs. 6,000, resulting in a net cost of Rs. 4,000 (saving Rs. 4,000 compared to renting).',
                ur: '10,000 روپے میں خریدیں اور 6000 روپے میں واپس بیچیں، جس سے خالص لاگت 4000 روپے آئے گی (کرائے کے مقابلے میں 4000 روپے کی بچت)۔',
                ur_rm: 'Buy used for Rs. 10,000 aur Rs. 6,000 mein resell karein, net cost Rs. 4,000 (Rs. 4,000 bachat vs rent).',
              },
              score: 95,
              feedback: {
                en: 'Exceptional financial reasoning! You evaluated total lifecycle cost and capitalized on your cash reserve.',
                ur: 'شاندار کاروباری اور مالیاتی تجزیہ! آپ نے خالص لاگت کا حساب لگا کر بڑی بچت کی۔',
                ur_rm: 'Exceptional business calculation! Net cost analyze kar ke Rs. 4,000 bachaye.',
              },
              consequences: {
                en: 'You retain an extra Rs. 4,000 profit at the end of the 4-month project.',
                ur: 'پروجیکٹ کے اختتام پر آپ کو 4000 روپے کا اضافی منافع حاصل ہوتا ہے۔',
                ur_rm: 'Extra Rs. 4,000 profit bachta hai.',
              },
            },
            {
              id: 'ad_ps_opt_5_2',
              text: {
                en: 'Rent for Rs. 8,000 because monthly payments feel smaller even though you lose Rs. 4,000 more overall.',
                ur: '8000 روپے کرایہ دیں کیونکہ ماہانہ قسط کم لگتی ہے اگرچہ مجموعی طور پر 4000 روپے زیادہ ضائع ہوتے ہیں۔',
                ur_rm: 'Rs. 8,000 rent dein kyunki monthly payment choti lagti hai halanke net loss Rs. 4,000 ziada hai.',
              },
              score: 45,
              feedback: {
                en: 'Always calculate net total expenditure rather than relying on monthly illusion when capital is available.',
                ur: 'جب فنڈز موجود ہوں تو کل خالص اخراجات کا حساب لگانا زیادہ فائدہ مند ہوتا ہے۔',
                ur_rm: 'Available funds hone par net total cost compare karni chahiye.',
              },
              consequences: {
                en: 'Unnecessary profit drain on freelance earnings.',
                ur: 'کمائی میں سے غیر ضروری اخراجات کا ضیاع۔',
                ur_rm: 'Profit loss ho jata hai.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'adult_everyday_comm',
      skillKey: 'everyday_communication',
      type: 'everyday_communication',
      title: {
        en: 'Everyday Communication 🗣️',
        ur: 'روزمرہ گفتگو 🗣️',
        ur_rm: 'Everyday Communication 🗣️',
      },
      description: {
        en: 'Workplace communication, requesting assistance, appointment scheduling, and polite professional discussions.',
        ur: 'دفتری بات چیت، مدد کی درخواست، اپائنٹمنٹ شیڈولنگ اور باوقار پیشہ ورانہ گفتگو۔',
        ur_rm: 'Workplace communication, requesting assistance, appointment scheduling, aur respectful professional conversations.',
      },
      icon: '🗣️',
      redirectToScenarios: true,
      categoryFilter: 'adult',
    },
  ],
};

export async function getSkillModules(persona, language = 'en') {
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
