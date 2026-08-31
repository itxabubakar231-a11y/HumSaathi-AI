import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.conversation import CommunicationScenario, ConversationSession
from app.schemas.common import parse_json, stringify_json
from app.services.ai.ai_service import call_ai_chat, is_ai_available
from app.data.scenarios import DEFAULT_SCENARIOS

logger = logging.getLogger("humsaathi-conversation")

FALLBACK_SCRIPTS = {
    # 1. Asking a teacher for help
    'scenario_teacher_help': {
        'en': [
            "Sure, I can help you! What assignment or problem are you working on right now?",
            "Ah, that can be tricky. Let us look at it together. Try reading the first question out loud.",
            "You are doing great! Does that explanation help you understand how to solve it?",
            "Perfect! You are very welcome. Let me know if you need anything else. Good luck!",
        ],
        'ur': [
            "جی بالکل، میں آپ کی مدد کر سکتا ہوں! آپ ابھی کس کام یا مسئلے پر کام کر رہے ہیں؟",
            "اہ، یہ تھوڑا مشکل ہو سکتا ہے۔ آئیے مل کر اسے دیکھیں۔ پہلا سوال اونچی آواز میں پڑھیں۔",
            "آپ بہت اچھا کر رہے ہیں! کیا اس وضاحت سے آپ کو سمجھنے میں مدد ملی؟",
            "بہترین! آپ کو خوش آمدید۔ اگر آپ کو کسی اور چیز کی ضرورت ہو تو مجھے بتائیں۔ گڈ لک!",
        ],
        'ur_rm': [
            "Sure, main aap ki madad kar sakta hoon! Aap abhi kis assignment ya problem par kaam kar rahe hain?",
            "Ah, yeh thora mushkil ho sakta hai. Aaiye mil kar ise dekhein. Pehla sawal oonchi awaaz mein parhein.",
            "Aap bohot acha kar rahe hain! Kya is explanation se aap ko samajhne mein madad mili?",
            "Perfect! You are very welcome. Agar aap ko kisi aur cheez ki zaroorat ho to mujhe batayein. Good luck!",
        ],
    },
    'Asking a teacher for help': {
        'en': [
            "Sure, I can help you! What assignment or problem are you working on right now?",
            "Ah, that can be tricky. Let us look at it together. Try reading the first question out loud.",
            "You are doing great! Does that explanation help you understand how to solve it?",
            "Perfect! You are very welcome. Let me know if you need anything else. Good luck!",
        ],
        'ur': [
            "جی بالکل، میں آپ کی مدد کر سکتا ہوں! آپ ابھی کس کام یا مسئلے پر کام کر رہے ہیں؟",
            "اہ، یہ تھوڑا مشکل ہو سکتا ہے۔ آئیے مل کر اسے دیکھیں۔ پہلا سوال اونچی آواز میں پڑھیں۔",
            "آپ بہت اچھا کر رہے ہیں! کیا اس وضاحت سے آپ کو سمجھنے میں مدد ملی؟",
            "بہترین! آپ کو خوش آمدید۔ اگر آپ کو کسی اور چیز کی ضرورت ہو تو مجھے بتائیں۔ گڈ لک!",
        ],
        'ur_rm': [
            "Sure, main aap ki madad kar sakta hoon! Aap abhi kis assignment ya problem par kaam kar rahe hain?",
            "Ah, yeh thora mushkil ho sakta hai. Aaiye mil kar ise dekhein. Pehla sawal oonchi awaaz mein parhein.",
            "Aap bohot acha kar rahe hain! Kya is explanation se aap ko samajhne mein madad mili?",
            "Perfect! You are very welcome. Agar aap ko kisi aur cheez ki zaroorat ho to mujhe batayein. Good luck!",
        ],
    },

    # 2. Telling a teacher something is not understood
    'scenario_teacher_confused': {
        'en': [
            "Oh, thanks for telling me! Which part of the lesson was confusing for you?",
            "I see. Let me explain that part again using a simpler example. Does that make more sense now?",
            "That is wonderful. I am glad you asked. It is always good to speak up when you do not understand.",
            "You are welcome! Keep up the great work in class.",
        ],
        'ur': [
            "اوہ، مجھے بتانے کا شکریہ! سبق کا کون سا حصہ آپ کے لیے الجھن کا باعث تھا؟",
            "اچھا۔ آئیے میں اس حصے کو ایک آسان مثال کے ساتھ دوبارہ سمجھاتا ہوں۔ کیا اب یہ سمجھ آ رہا ہے؟",
            "یہ تو بہت اچھا ہے۔ مجھے خوشی ہے کہ آپ نے پوچھا۔ جب سمجھ نہ آئے تو پوچھنا ہمیشہ اچھا ہوتا ہے۔",
            "خوش آمدید! کلاس میں اسی طرح اچھا کام کرتے رہیں۔",
        ],
        'ur_rm': [
            "Oh, mujhe batane ka shukriya! Sabak ka kaun sa part aap ke liye confusing tha?",
            "I see. Aaiye main us part ko aik aasaan example ke sath dobara samjhata hoon. Kya ab samajh aya?",
            "Yeh to bohot acha hai. Mujhe khushi hui ke aap ne pucha. Jab samajh na aaye to bolna hamesha acha hota hai.",
            "You are welcome! Class mein isi tarah acha kaam karte rahein.",
        ],
    },
    'Telling a teacher something is not understood': {
        'en': [
            "Oh, thanks for telling me! Which part of the lesson was confusing for you?",
            "I see. Let me explain that part again using a simpler example. Does that make more sense now?",
            "That is wonderful. I am glad you asked. It is always good to speak up when you do not understand.",
            "You are welcome! Keep up the great work in class.",
        ],
        'ur': [
            "اوہ، مجھے بتانے کا شکریہ! سبق کا کون سا حصہ آپ کے لیے الجھن کا باعث تھا؟",
            "اچھا۔ آئیے میں اس حصے کو ایک آسان مثال کے ساتھ دوبارہ سمجھاتا ہوں۔ کیا اب یہ سمجھ آ رہا ہے؟",
            "یہ تو بہت اچھا ہے۔ مجھے خوشی ہے کہ آپ نے پوچھا۔ جب سمجھ نہ آئے تو پوچھنا ہمیشہ اچھا ہوتا ہے۔",
            "خوش آمدید! کلاس میں اسی طرح اچھا کام کرتے رہیں۔",
        ],
        'ur_rm': [
            "Oh, mujhe batane ka shukriya! Sabak ka kaun sa part aap ke liye confusing tha?",
            "I see. Aaiye main us part ko aik aasaan example ke sath dobara samjhata hoon. Kya ab samajh aya?",
            "Yeh to bohot acha hai. Mujhe khushi hui ke aap ne pucha. Jab samajh na aaye to bolna hamesha acha hota hai.",
            "You are welcome! Class mein isi tarah acha kaam karte rahein.",
        ],
    },

    # 3. Meeting someone new
    'scenario_new_person': {
        'en': [
            "Nice to meet you! Where do you live, or what do you like to do in your free time?",
            "That sounds really cool! I like playing games and drawing. What is your favorite game or hobby?",
            "Awesome! I would love to play that together sometime. Shall we walk to the class/group together?",
            "Sounds like a plan! Let's go.",
        ],
        'ur': [
            "آپ سے مل کر اچھا لگا! آپ کہاں رہتے ہیں، یا آپ فارغ وقت میں کیا کرنا پسند کرتے ہیں؟",
            "یہ واقعی بہت اچھا ہے! مجھے گیمز کھیلنا اور ڈرائنگ کرنا پسند ہے۔ آپ کا پسندیدہ کھیل یا شوق کیا ہے؟",
            "بہت اچھے! میں کبھی اسے مل کر کھیلنا پسند کروں گا۔ کیا ہم کلاس/گروپ میں ایک ساتھ چلیں؟",
            "بالکل! آئیے چلتے ہیں۔",
        ],
        'ur_rm': [
            "Nice to meet you! Aap kahan rehte hain, ya aap free time mein kya karna pasand karte hain?",
            "Yeh to bohot cool hai! Mujhe games khelna aur drawing pasand hai. Aap ka favorite game ya hobby kya hai?",
            "Awesome! Main kabhi ise mil kar khelna pasand karunga. Kya hum class/group mein ek sath chalein?",
            "Bilkul! Aaiye chalte hain.",
        ],
    },
    'Meeting someone new': {
        'en': [
            "Nice to meet you! Where do you live, or what do you like to do in your free time?",
            "That sounds really cool! I like playing games and drawing. What is your favorite game or hobby?",
            "Awesome! I would love to play that together sometime. Shall we walk to the class/group together?",
            "Sounds like a plan! Let's go.",
        ],
        'ur': [
            "آپ سے مل کر اچھا لگا! آپ کہاں رہتے ہیں، یا آپ فارغ وقت میں کیا کرنا پسند کرتے ہیں؟",
            "یہ واقعی بہت اچھا ہے! مجھے گیمز کھیلنا اور ڈرائنگ کرنا پسند ہے۔ آپ کا پسندیدہ کھیل یا شوق کیا ہے؟",
            "بہت اچھے! میں کبھی اسے مل کر کھیلنا پسند کروں گا۔ کیا ہم کلاس/گروپ میں ایک ساتھ چلیں؟",
            "بالکل! آئیے چلتے ہیں۔",
        ],
        'ur_rm': [
            "Nice to meet you! Aap kahan rehte hain, ya aap free time mein kya karna pasand karte hain?",
            "Yeh to bohot cool hai! Mujhe games khelna aur drawing pasand hai. Aap ka favorite game ya hobby kya hai?",
            "Awesome! Main kabhi ise mil kar khelna pasand karunga. Kya hum class/group mein ek sath chalein?",
            "Bilkul! Aaiye chalte hain.",
        ],
    },

    # 4. Talking to a friend
    'scenario_talking_friend': {
        'en': [
            "I'm doing well, thanks! Just hanging out. Do you have any fun plans for this weekend?",
            "Oh, that sounds like a lot of fun! I was thinking of watching a movie or going to the park. Would you like to join?",
            "Awesome! Let us coordinate with our parents and meet up on Saturday afternoon.",
            "Cool, talk to you later!",
        ],
        'ur': [
            "میں ٹھیک ہوں، شکریہ! بس ایسے ہی گھوم رہا ہوں۔ کیا آپ کا اس ویک اینڈ پر کوئی تفریحی پلان ہے؟",
            "اوہ، یہ تو بہت ہی تفریحی لگتا ہے! میں فلم دیکھنے یا پارک جانے کا سوچ رہا تھا۔ کیا آپ شامل ہونا چاہیں گے؟",
            "زبردست! آئیے اپنے والدین سے بات کرتے ہیں اور ہفتے کی دوپہر کو ملتے ہیں۔",
            "ٹھیک ہے، بعد میں بات ہوتی ہے!",
        ],
        'ur_rm': [
            "Main theek hoon, shukriya! Bas aise hi ghoom raha hoon. Kya aap ka is weekend par koi fun plan hai?",
            "Oh, yeh to bohot mazedar lagta hai! Main movie dekhne ya park jaane ka soch raha tha. Kya aap join karna chahenge?",
            "Awesome! Aaiye apne parents se baat karte hain aur Saturday afternoon ko milte hain.",
            "Cool, baad mein baat hoti hai!",
        ],
    },
    'Talking to a friend': {
        'en': [
            "I'm doing well, thanks! Just hanging out. Do you have any fun plans for this weekend?",
            "Oh, that sounds like a lot of fun! I was thinking of watching a movie or going to the park. Would you like to join?",
            "Awesome! Let us coordinate with our parents and meet up on Saturday afternoon.",
            "Cool, talk to you later!",
        ],
        'ur': [
            "میں ٹھیک ہوں، شکریہ! بس ایسے ہی گھوم رہا ہوں۔ کیا آپ کا اس ویک اینڈ پر کوئی تفریحی پلان ہے؟",
            "اوہ، یہ تو بہت ہی تفریحی لگتا ہے! میں فلم دیکھنے یا پارک جانے کا سوچ رہا تھا۔ کیا آپ شامل ہونا چاہیں گے؟",
            "زبردست! آئیے اپنے والدین سے بات کرتے ہیں اور ہفتے کی دوپہر کو ملتے ہیں۔",
            "ٹھیک ہے، بعد میں بات ہوتی ہے!",
        ],
        'ur_rm': [
            "Main theek hoon, shukriya! Bas aise hi ghoom raha hoon. Kya aap ka is weekend par koi fun plan hai?",
            "Oh, yeh to bohot mazedar lagta hai! Main movie dekhne ya park jaane ka soch raha tha. Kya aap join karna chahenge?",
            "Awesome! Aaiye apne parents se baat karte hain aur Saturday afternoon ko milte hain.",
            "Cool, baad mein baat hoti hai!",
        ],
    },

    # 5. Buying something from a shop
    'scenario_shop_buying': {
        'en': [
            "Ah yes, we have that right here. It costs Rs. 50. Would you like anything else with it?",
            "Okay, that will be Rs. 50 in total. You can place the money on the counter.",
            "Thank you! Here is your item and your change. Have a wonderful day!",
            "Thank you! Goodbye!",
        ],
        'ur': [
            "جی ہاں، یہ ہمارے پاس بالکل یہاں موجود ہے۔ اس کی قیمت 50 روپے ہے۔ کیا آپ کو اس کے ساتھ کچھ اور چاہیے؟",
            "ٹھیک ہے، کل 50 روپے ہو گئے۔ آپ رقم کاؤنٹر پر رکھ سکتے ہیں۔",
            "شکریہ! یہ آپ کی چیز اور بقایا رقم ہے۔ آپ کا دن اچھا گزرے!",
            "شکریہ! اللہ حافظ!",
        ],
        'ur_rm': [
            "Ah yes, yeh hamare paas yahin par hai. Iski price Rs. 50 hai. Kya aap ko iske sath kuch aur chahiye?",
            "Okay, total Rs. 50 ho gaye. Aap paise counter par rakh sakte hain.",
            "Shukriya! Yeh aap ki cheez aur baqi paise. Aap ka din acha guzre!",
            "Shukriya! Khuda hafiz!",
        ],
    },
    'Buying something from a shop': {
        'en': [
            "Ah yes, we have that right here. It costs Rs. 50. Would you like anything else with it?",
            "Okay, that will be Rs. 50 in total. You can place the money on the counter.",
            "Thank you! Here is your item and your change. Have a wonderful day!",
            "Thank you! Goodbye!",
        ],
        'ur': [
            "جی ہاں، یہ ہمارے پاس بالکل یہاں موجود ہے۔ اس کی قیمت 50 روپے ہے۔ کیا آپ کو اس کے ساتھ کچھ اور چاہیے؟",
            "ٹھیک ہے، کل 50 روپے ہو گئے۔ آپ رقم کاؤنٹر پر رکھ سکتے ہیں۔",
            "شکریہ! یہ آپ کی چیز اور بقایا رقم ہے۔ آپ کا دن اچھا گزرے!",
            "شکریہ! اللہ حافظ!",
        ],
        'ur_rm': [
            "Ah yes, yeh hamare paas yahin par hai. Iski price Rs. 50 hai. Kya aap ko iske sath kuch aur chahiye?",
            "Okay, total Rs. 50 ho gaye. Aap paise counter par rakh sakte hain.",
            "Shukriya! Yeh aap ki cheez aur baqi paise. Aap ka din acha guzre!",
            "Shukriya! Khuda hafiz!",
        ],
    },

    # 6. Asking someone for help/directions
    'scenario_directions_help': {
        'en': [
            "Oh, the library? Yes, it is very close. Go straight down this block and turn left at the next signal.",
            "You are welcome! Once you turn left, you will see a large blue building on your right. That is it.",
            "No problem at all! Happy to help. Have a safe walk there.",
            "Take care! Bye.",
        ],
        'ur': [
            "اوہ، لائبریری؟ جی ہاں، یہ بہت قریب ہے۔ اس بلاک پر سیدھے جائیں اور اگلے سگنل پر بائیں مڑیں۔",
            "خوش آمدید! جب آپ بائیں مڑیں گے، تو آپ کو اپنے دائیں طرف ایک بڑی نیلی عمارت نظر آئے گی۔ وہی لائبریری ہے۔",
            "کوئی مسئلہ نہیں! مدد کر کے خوشی ہوئی۔ وہاں محفوظ طریقے سے پہنچیں۔",
            "اپنا خیال رکھیں! اللہ حافظ۔",
        ],
        'ur_rm': [
            "Oh, library? Haan, yeh bohot qareeb hai. Is block par seedhe jayein aur agle signal par baayein murein.",
            "You are welcome! Jab aap baayein murenge, to aap ko right side par aik badi blue building nazar aayegi. Wahi hai.",
            "Koi masla nahi! Madad kar ke khushi hui. Safe walk rahe aap ki.",
            "Take care! Bye.",
        ],
    },
    'Asking someone for help/directions': {
        'en': [
            "Oh, the library? Yes, it is very close. Go straight down this block and turn left at the next signal.",
            "You are welcome! Once you turn left, you will see a large blue building on your right. That is it.",
            "No problem at all! Happy to help. Have a safe walk there.",
            "Take care! Bye.",
        ],
        'ur': [
            "اوہ، لائبریری؟ جی ہاں، یہ بہت قریب ہے۔ اس بلاک پر سیدھے جائیں اور اگلے سگنل پر بائیں مڑیں۔",
            "خوش آمدید! جب آپ بائیں مڑیں گے، تو آپ کو اپنے دائیں طرف ایک بڑی نیلی عمارت نظر آئے گی۔ وہی لائبریری ہے۔",
            "کوئی مسئلہ نہیں! مدد کر کے خوشی ہوئی۔ وہاں محفوظ طریقے سے پہنچیں۔",
            "اپنا خیال رکھیں! اللہ حافظ۔",
        ],
        'ur_rm': [
            "Oh, library? Haan, yeh bohot qareeb hai. Is block par seedhe jayein aur agle signal par baayein murein.",
            "You are welcome! Jab aap baayein murenge, to aap ko right side par aik badi blue building nazar aayegi. Wahi hai.",
            "Koi masla nahi! Madad kar ke khushi hui. Safe walk rahe aap ki.",
            "Take care! Bye.",
        ],
    },
    'scenario_child_lost_item': {
        'en': [
            "Don't worry! Let's check the lost and found shelf together. What color was your notebook?",
            "Ah, here is a blue math notebook with a sticker on it! Is this the one?",
            "Wonderful! Let's write your name inside so it doesn't get lost again.",
            "You are very welcome! Have a great day in class.",
        ],
        'ur': [
            "پریشان نہ ہوں! آئیے مل کر گمشدہ اشیاء کی الماری میں دیکھتے ہیں۔ آپ کی نوٹ بک کا رنگ کیا تھا؟",
            "اہ، یہ دیکھیں ایک نیلی نوٹ بک جس پر اسٹیکر لگا ہے۔ کیا یہ وہی ہے؟",
            "بہت خوب! آئیے اس پر آپ کا نام لکھ دیتے ہیں تاکہ یہ دوبارہ گم نہ ہو۔",
            "خوش آمدید! کلاس میں اپنا کام جاری رکھیں۔",
        ],
        'ur_rm': [
            "Pareshan na hon! Aaiye mil kar lost-and-found shelf check karte hain. Aap ki notebook ka color kya tha?",
            "Ah, yeh dekhein aik blue notebook sticker ke sath! Kya yeh wahi hai?",
            "Wonderful! Aaiye is par aap ka naam likh dete hain taake dobara lost na ho.",
            "You are welcome! Class mein acha kaam karein.",
        ],
    },
    'Asking for a Lost Item at School': {
        'en': [
            "Don't worry! Let's check the lost and found shelf together. What color was your notebook?",
            "Ah, here is a blue math notebook with a sticker on it! Is this the one?",
            "Wonderful! Let's write your name inside so it doesn't get lost again.",
            "You are very welcome! Have a great day in class.",
        ],
        'ur': [
            "پریشان نہ ہوں! آئیے مل کر گمشدہ اشیاء کی الماری میں دیکھتے ہیں۔ آپ کی نوٹ بک کا رنگ کیا تھا؟",
            "اہ، یہ دیکھیں ایک نیلی نوٹ بک جس پر اسٹیکر لگا ہے۔ کیا یہ وہی ہے؟",
            "بہت خوب! آئیے اس پر آپ کا نام لکھ دیتے ہیں تاکہ یہ دوبارہ گم نہ ہو۔",
            "خوش آمدید! کلاس میں اپنا کام جاری رکھیں۔",
        ],
        'ur_rm': [
            "Pareshan na hon! Aaiye mil kar lost-and-found shelf check karte hain. Aap ki notebook ka color kya tha?",
            "Ah, yeh dekhein aik blue notebook sticker ke sath! Kya yeh wahi hai?",
            "Wonderful! Aaiye is par aap ka naam likh dete hain taake dobara lost na ho.",
            "You are welcome! Class mein acha kaam karein.",
        ],
    },

    # 7. Joining a Group Discussion
    'scenario_group_discussion': {
        'en': [
            "Hey! Sure, we are discussing the history project topic. What do you think about doing ancient civilizations?",
            "That is a really interesting perspective! How should we divide the research sections?",
            "Awesome ideas. Let us write those down on our shared notes document.",
            "Great discussing with you! Let's get started on the first part.",
        ],
        'ur': [
            "ارے! جی ہاں، ہم تاریخ کے پروجیکٹ پر بات کر رہے ہیں۔ قدیم تہذیبوں کے بارے میں آپ کی کیا رائے ہے؟",
            "یہ واقعی ایک بہترین نکتہ ہے! ہم ریسرچ کا کام کیسے تقسیم کریں؟",
            "زبردست خیالات ہیں۔ آئیے ان کو نوٹس میں لکھ لیتے ہیں۔",
            "آپ کے ساتھ بات کر کے اچھا لگا! آئیے پہلے حصے پر کام شروع کرتے ہیں۔",
        ],
        'ur_rm': [
            "Hey! Haan, hum history project topic discuss kar rahe hain. Ancient civilizations ke baare mein aap ka kya khayal hai?",
            "Yeh bohot acha perspective hai! Hum research sections kaise divide karein?",
            "Awesome ideas! Aaiye inko notes document mein likh lete hain.",
            "Great discussion! Aaiye pehle part par kaam shuru karte hain.",
        ],
    },
    'Joining a Group Discussion': {
        'en': [
            "Hey! Sure, we are discussing the history project topic. What do you think about doing ancient civilizations?",
            "That is a really interesting perspective! How should we divide the research sections?",
            "Awesome ideas. Let us write those down on our shared notes document.",
            "Great discussing with you! Let's get started on the first part.",
        ],
        'ur': [
            "ارے! جی ہاں، ہم تاریخ کے پروجیکٹ پر بات کر رہے ہیں۔ قدیم تہذیبوں کے بارے میں آپ کی کیا رائے ہے؟",
            "یہ واقعی ایک بہترین نکتہ ہے! ہم ریسرچ کا کام کیسے تقسیم کریں؟",
            "زبردست خیالات ہیں۔ آئیے ان کو نوٹس میں لکھ لیتے ہیں۔",
            "آپ کے ساتھ بات کر کے اچھا لگا! آئیے پہلے حصے پر کام شروع کرتے ہیں۔",
        ],
        'ur_rm': [
            "Hey! Haan, hum history project topic discuss kar rahe hain. Ancient civilizations ke baare mein aap ka kya khayal hai?",
            "Yeh bohot acha perspective hai! Hum research sections kaise divide karein?",
            "Awesome ideas! Aaiye inko notes document mein likh lete hain.",
            "Great discussion! Aaiye pehle part par kaam shuru karte hain.",
        ],
    },

    # 8. Expressing Preferences in a Social Group
    'scenario_teen_express_pref': {
        'en': [
            "Oh, that place sounds delicious! What is your favorite dish there?",
            "Sounds like a great choice. Let's check with the rest of the group to make sure everyone is happy with that.",
            "Awesome, everyone agreed on that spot! Let's head over right after class.",
            "See you there!",
        ],
        'ur': [
            "اوہ، وہ جگہ بہت اچھی لگتی ہے! وہاں آپ کی پسندیدہ ڈش کیا ہے؟",
            "یہ بہترین انتخاب ہے۔ آئیے باقی دوستوں سے بھی تصدیق کر لیں تاکہ سب راضی ہوں۔",
            "زبردست، سب دوست متفق ہیں! کلاس کے بعد وہیں چلتے ہیں۔",
            "وہیں ملتے ہیں!",
        ],
        'ur_rm': [
            "Oh, woh jagah bohot achi hai! Wahan aap ki favorite dish kya hai?",
            "Bohot acha choice hai. Baqi friends se bhi confirm kar lete hain.",
            "Awesome, sab agree kar gaye! Class ke baad wahan chalte hain.",
            "Wahan milte hain!",
        ],
    },
    'Expressing Preferences in a Social Group': {
        'en': [
            "Oh, that place sounds delicious! What is your favorite dish there?",
            "Sounds like a great choice. Let's check with the rest of the group to make sure everyone is happy with that.",
            "Awesome, everyone agreed on that spot! Let's head over right after class.",
            "See you there!",
        ],
        'ur': [
            "اوہ، وہ جگہ بہت اچھی لگتی ہے! وہاں آپ کی پسندیدہ ڈش کیا ہے؟",
            "یہ بہترین انتخاب ہے۔ آئیے باقی دوستوں سے بھی تصدیق کر لیں تاکہ سب راضی ہوں۔",
            "زبردست، سب دوست متفق ہیں! کلاس کے بعد وہیں چلتے ہیں۔",
            "وہیں ملتے ہیں!",
        ],
        'ur_rm': [
            "Oh, woh jagah bohot achi hai! Wahan aap ki favorite dish kya hai?",
            "Bohot acha choice hai. Baqi friends se bhi confirm kar lete hain.",
            "Awesome, sab agree kar gaye! Class ke baad wahan chalte hain.",
            "Wahan milte hain!",
        ],
    },

    # 9. Requesting an Assignment Extension
    'scenario_teen_teacher_extension': {
        'en': [
            "Hello! Yes, what assignment did you want to discuss with me?",
            "I appreciate you explaining your situation in advance rather than after the deadline. What submission time are you proposing?",
            "That sounds fair. Let's agree on tomorrow by 4:00 PM. Make sure to submit through the portal.",
            "You are welcome! Work hard and see you tomorrow.",
        ],
        'ur': [
            "ہیلو! جی ہاں، آپ کس اسائنمنٹ کے حوالے سے بات کرنا چاہتے تھے؟",
            "ڈیڈلائن گزرنے کے بعد نہیں بلکہ پہلے آ کر وجہ بتانے کا شکریہ۔ آپ کس وقت تک جمع کروا سکتے ہیں؟",
            "یہ مناسب ہے۔ کل شام 4 بجے تک پورٹل پر جمع کروا دیں۔",
            "خوش آمدید! محنت سے کام مکمل کریں اور کل ملتے ہیں۔",
        ],
        'ur_rm': [
            "Hello! Haan, aap kis assignment ke baare mein baat karna chahte the?",
            "Advance mein aakar explain karne ka shukriya. Aap kab tak submit kar sakte hain?",
            "Theek hai, kal 4:00 PM tak portal par submit kar dein.",
            "You are welcome! Kal milte hain.",
        ],
    },
    'Requesting an Assignment Extension': {
        'en': [
            "Hello! Yes, what assignment did you want to discuss with me?",
            "I appreciate you explaining your situation in advance rather than after the deadline. What submission time are you proposing?",
            "That sounds fair. Let's agree on tomorrow by 4:00 PM. Make sure to submit through the portal.",
            "You are welcome! Work hard and see you tomorrow.",
        ],
        'ur': [
            "ہیلو! جی ہاں، آپ کس اسائنمنٹ کے حوالے سے بات کرنا چاہتے تھے؟",
            "ڈیڈلائن گزرنے کے بعد نہیں بلکہ پہلے آ کر وجہ بتانے کا شکریہ۔ آپ کس وقت تک جمع کروا سکتے ہیں؟",
            "یہ مناسب ہے۔ کل شام 4 بجے تک پورٹل پر جمع کروا دیں۔",
            "خوش آمدید! محنت سے کام مکمل کریں اور کل ملتے ہیں۔",
        ],
        'ur_rm': [
            "Hello! Haan, aap kis assignment ke baare mein baat karna chahte the?",
            "Advance mein aakar explain karne ka shukriya. Aap kab tak submit kar sakte hain?",
            "Theek hai, kal 4:00 PM tak portal par submit kar dein.",
            "You are welcome! Kal milte hain.",
        ],
    },

    # 10. Resolving a Team Project Disagreement
    'scenario_teen_peer_dispute': {
        'en': [
            "Thanks for bringing this up calmly. Why do you feel the digital presentation will work better?",
            "I see your point about interactive charts. What if we create the digital slides and print key infographics for our table?",
            "That combines the best of both ideas! Let's divide the tasks so we finish early.",
            "Great teamwork! Let's get started.",
        ],
        'ur': [
            "پرسکون انداز میں بات کرنے کا شکریہ۔ آپ کے خیال میں ڈیجیٹل پریزنٹیشن کیوں بہتر ہے؟",
            "میں آپ کا نکتہ سمجھتی ہوں۔ کیسا رہے گا اگر ہم سلائیڈز بنائیں اور اہم چارٹس پرنٹ کر کے ٹیبل پر لگا دیں؟",
            "یہ دونوں خیالات کا بہترین امتزاج ہے! آئیے کام تقسیم کر کے جلدی مکمل کرتے ہیں۔",
            "شاندار ٹیم ورک! آئیے کام شروع کرتے ہیں۔",
        ],
        'ur_rm': [
            "Calmly baat karne ka shukriya. Aap ko digital presentation kyun better lagti hai?",
            "Aap ka point acha hai. Kaisa rahega agar hum slides banayein aur main charts print bhi kar lein?",
            "Dono ideas combine ho gaye! Aaiye tasks divide karte hain.",
            "Great teamwork! Kaam shuru karte hain.",
        ],
    },
    'Resolving a Team Project Disagreement': {
        'en': [
            "Thanks for bringing this up calmly. Why do you feel the digital presentation will work better?",
            "I see your point about interactive charts. What if we create the digital slides and print key infographics for our table?",
            "That combines the best of both ideas! Let's divide the tasks so we finish early.",
            "Great teamwork! Let's get started.",
        ],
        'ur': [
            "پرسکون انداز میں بات کرنے کا شکریہ۔ آپ کے خیال میں ڈیجیٹل پریزنٹیشن کیوں بہتر ہے؟",
            "میں آپ کا نکتہ سمجھتی ہوں۔ کیسا رہے گا اگر ہم سلائیڈز بنائیں اور اہم چارٹس پرنٹ کر کے ٹیبل پر لگا دیں؟",
            "یہ دونوں خیالات کا بہترین امتزاج ہے! آئیے کام تقسیم کر کے جلدی مکمل کرتے ہیں۔",
            "شاندار ٹیم ورک! آئیے کام شروع کرتے ہیں۔",
        ],
        'ur_rm': [
            "Calmly baat karne ka shukriya. Aap ko digital presentation kyun better lagti hai?",
            "Aap ka point acha hai. Kaisa rahega agar hum slides banayein aur main charts print bhi kar lein?",
            "Dono ideas combine ho gaye! Aaiye tasks divide karte hain.",
            "Great teamwork! Kaam shuru karte hain.",
        ],
    },

    # 11. Asking Manager for Task Clarification
    'scenario_manager_clarification': {
        'en': [
            "Good morning! Yes, of course. Which section of the client brief do you need clarification on?",
            "For that report, please prioritize the Q3 data summary first. The detailed breakdown can follow next week.",
            "Does that give you enough clarity to proceed with the draft?",
            "Excellent. Feel free to ping me if any other questions come up. Have a productive day!",
        ],
        'ur': [
            "صبح بخیر! جی بالکل۔ آپ کو کلائنٹ بریف کے کس حصے پر وضاحت چاہیے؟",
            "اس رپورٹ کے لیے، براہ کرم پہلے تیسری سہ ماہی کے خلاصے کو ترجیح دیں۔",
            "کیا اب آپ کے پاس کام آگے بڑھانے کے لیے واضح معلومات ہیں؟",
            "بہترین۔ اگر کوئی اور سوال ہو تو بلا جھجھک بتائیں۔",
        ],
        'ur_rm': [
            "Good morning! Haan bilkul. Aap ko client brief ke kis part par clarification chahiye?",
            "Is report ke liye, please pehle Q3 data summary ko prioritize karein.",
            "Kya ab draft start karne ke liye clarity mil gayi?",
            "Excellent. Koi aur question ho to zaroor batayein. Good luck!",
        ],
    },
    'Asking Manager for Task Clarification': {
        'en': [
            "Good morning! Yes, of course. Which section of the client brief do you need clarification on?",
            "For that report, please prioritize the Q3 data summary first. The detailed breakdown can follow next week.",
            "Does that give you enough clarity to proceed with the draft?",
            "Excellent. Feel free to ping me if any other questions come up. Have a productive day!",
        ],
        'ur': [
            "صبح بخیر! جی بالکل۔ آپ کو کلائنٹ بریف کے کس حصے پر وضاحت چاہیے؟",
            "اس رپورٹ کے لیے، براہ کرم پہلے تیسری سہ ماہی کے خلاصے کو ترجیح دیں۔",
            "کیا اب آپ کے پاس کام آگے بڑھانے کے لیے واضح معلومات ہیں؟",
            "بہترین۔ اگر کوئی اور سوال ہو تو بلا جھجھک بتائیں۔",
        ],
        'ur_rm': [
            "Good morning! Haan bilkul. Aap ko client brief ke kis part par clarification chahiye?",
            "Is report ke liye, please pehle Q3 data summary ko prioritize karein.",
            "Kya ab draft start karne ke liye clarity mil gayi?",
            "Excellent. Koi aur question ho to zaroor batayein. Good luck!",
        ],
    },

    # 12. Speaking to a Pharmacist About Medication
    'scenario_adult_pharmacy': {
        'en': [
            "Hello! For these tablets, take one pill twice daily after meals with water.",
            "Yes, taking it after meals protects against stomach upset. Avoid drinking excess caffeine with it.",
            "Is everything clear regarding the 5-day dosage duration?",
            "You are welcome! Take care and get well soon.",
        ],
        'ur': [
            "ہیلو! ان گولیوں کے لیے، کھانے کے بعد دن میں دو بار پانی کے ساتھ ایک گولی لیں۔",
            "جی ہاں، کھانے کے بعد لینے سے معدہ محفوظ رہتا ہے۔ اس کے ساتھ زیادہ چائے یا کافی سے پرہیز کریں۔",
            "کیا 5 دن کی خوراک کے بارے میں سب کچھ واضح ہے؟",
            "خوش آمدید! اپنا خیال رکھیں اور جلد صحت یاب ہوں۔",
        ],
        'ur_rm': [
            "Hello! Yeh tablet din mein 2 baar khane ke baad paani ke sath lein.",
            "Haan, khane ke baad lene se stomach theek rehta hai.",
            "Kya 5 days ki dosage duration clear hai?",
            "You are welcome! Apna khayal rakhein aur jaldi theek hon.",
        ],
    },
    'Speaking to a Pharmacist About Medication': {
        'en': [
            "Hello! For these tablets, take one pill twice daily after meals with water.",
            "Yes, taking it after meals protects against stomach upset. Avoid drinking excess caffeine with it.",
            "Is everything clear regarding the 5-day dosage duration?",
            "You are welcome! Take care and get well soon.",
        ],
        'ur': [
            "ہیلو! ان گولیوں کے لیے، کھانے کے بعد دن میں دو بار پانی کے ساتھ ایک گولی لیں۔",
            "جی ہاں، کھانے کے بعد لینے سے معدہ محفوظ رہتا ہے۔ اس کے ساتھ زیادہ چائے یا کافی سے پرہیز کریں۔",
            "کیا 5 دن کی خوراک کے بارے میں سب کچھ واضح ہے؟",
            "خوش آمدید! اپنا خیال رکھیں اور جلد صحت یاب ہوں۔",
        ],
        'ur_rm': [
            "Hello! Yeh tablet din mein 2 baar khane ke baad paani ke sath lein.",
            "Haan, khane ke baad lene se stomach theek rehta hai.",
            "Kya 5 days ki dosage duration clear hai?",
            "You are welcome! Apna khayal rakhein aur jaldi theek hon.",
        ],
    },

    # 13. Requesting a Shift Swap with a Coworker
    'scenario_adult_colleague_shift': {
        'en': [
            "Hey! Yes, I understand personal appointments come up. Which day would you cover for me in return?",
            "Thursday morning works really well for my schedule. That works out great for both of us.",
            "Let's put in the official shift change request in the staff portal so the manager can sign off.",
            "Have a good appointment on Friday!",
        ],
        'ur': [
            "ہیلو! جی ہاں، میں سمجھتا ہوں کہ ضروری کام آ سکتے ہیں۔ اس کے بدلے آپ کس دن میری ڈیوٹی کریں گے؟",
            "جمعرات کی صبح میرے لیے بالکل مناسب ہے۔ یہ ہم دونوں کے لیے فائدہ مند ہے۔",
            "آئیے اسٹاف پورٹل میں باقاعدہ شفٹ کی تبدیلی کی درخواست جمع کرا دیتے ہیں تاکہ مینیجر منظور کر لے۔",
            "جمعہ کے دن آپ کا کام خیریت سے مکمل ہو!",
        ],
        'ur_rm': [
            "Hey! Haan bilkul, family emergency samajh aati hai. Return mein aap kab shift cover karenge?",
            "Thursday morning mere liye perfect hai. Dono ke liye convenient ho gaya.",
            "Aaiye staff portal par official request submit kar dete hain manager sign-off ke liye.",
            "Best of luck!",
        ],
    },
    'Requesting a Shift Swap with a Coworker': {
        'en': [
            "Hey! Yes, I understand personal appointments come up. Which day would you cover for me in return?",
            "Thursday morning works really well for my schedule. That works out great for both of us.",
            "Let's put in the official shift change request in the staff portal so the manager can sign off.",
            "Have a good appointment on Friday!",
        ],
        'ur': [
            "ہیلو! جی ہاں، میں سمجھتا ہوں کہ ضروری کام آ سکتے ہیں۔ اس کے بدلے آپ کس دن میری ڈیوٹی کریں گے؟",
            "جمعرات کی صبح میرے لیے بالکل مناسب ہے۔ یہ ہم دونوں کے لیے فائدہ مند ہے۔",
            "آئیے اسٹاف پورٹل میں باقاعدہ شفٹ کی تبدیلی کی درخواست جمع کرا دیتے ہیں تاکہ مینیجر منظور کر لے۔",
            "جمعہ کے دن آپ کا کام خیریت سے مکمل ہو!",
        ],
        'ur_rm': [
            "Hey! Haan bilkul, family emergency samajh aati hai. Return mein aap kab shift cover karenge?",
            "Thursday morning mere liye perfect hai. Dono ke liye convenient ho gaya.",
            "Aaiye staff portal par official request submit kar dete hain manager sign-off ke liye.",
            "Best of luck!",
        ],
    },

    # 14. Calling Customer Support About Billing Discrepancy
    'scenario_adult_customer_support': {
        'en': [
            "Thank you for providing your account number. Let me check the recent charges on your account.",
            "I see the Rs. 1,500 streaming add-on was activated automatically during a system update. I apologize for the error.",
            "I have applied an immediate credit of Rs. 1,500 to your account. Your adjusted payable balance is now Rs. 2,000. Your reference ID is CR-49821.",
            "Thank you for contacting customer support. Have a great day!",
        ],
        'ur': [
            "اکاؤنٹ نمبر دینے کا شکریہ۔ مجھے آپ کے اکاؤنٹ کے حالیہ چارجز دیکھنے دیں۔",
            "میں دیکھ سکتی ہوں کہ سسٹم اپ ڈیٹ کے دوران 1500 روپے کا پیکج شامل ہوا تھا۔ میں اس غلطی پر معذرت خواہ ہوں۔",
            "میں نے فوری طور پر 1500 روپے کی رعایت آپ کے بل میں شامل کر دی ہے۔ اب آپ کا بل 2000 روپے ہے۔ آپ کا ریفرنس نمبر CR-49821 ہے۔",
            "کسٹمر سپورٹ سے رابطہ کرنے کا شکریہ۔ آپ کا دن اچھا گزرے!",
        ],
        'ur_rm': [
            "Account number dene ka shukriya. Main charges check karti hoon.",
            "Main dekh sakti hoon ke 1,500 ka package ghalati se add hua tha. Apology for the mistake.",
            "Main ne Rs. 1,500 reverse kar diye hain. Net payable ab Rs. 2,000 hai. Reference number CR-49821 hai.",
            "Thank you for calling FastNet support!",
        ],
    },
    'Calling Customer Support About Billing Discrepancy': {
        'en': [
            "Thank you for providing your account number. Let me check the recent charges on your account.",
            "I see the Rs. 1,500 streaming add-on was activated automatically during a system update. I apologize for the error.",
            "I have applied an immediate credit of Rs. 1,500 to your account. Your adjusted payable balance is now Rs. 2,000. Your reference ID is CR-49821.",
            "Thank you for contacting customer support. Have a great day!",
        ],
        'ur': [
            "اکاؤنٹ نمبر دینے کا شکریہ۔ مجھے آپ کے اکاؤنٹ کے حالیہ چارجز دیکھنے دیں۔",
            "میں دیکھ سکتی ہوں کہ سسٹم اپ ڈیٹ کے دوران 1500 روپے کا پیکج شامل ہوا تھا۔ میں اس غلطی پر معذرت خواہ ہوں۔",
            "میں نے فوری طور پر 1500 روپے کی رعایت آپ کے بل میں شامل کر دی ہے۔ اب آپ کا بل 2000 روپے ہے۔ آپ کا ریفرنس نمبر CR-49821 ہے۔",
            "کسٹمر سپورٹ سے رابطہ کرنے کا شکریہ۔ آپ کا دن اچھا گزرے!",
        ],
        'ur_rm': [
            "Account number dene ka shukriya. Main charges check karti hoon.",
            "Main dekh sakti hoon ke 1,500 ka package ghalati se add hua tha. Apology for the mistake.",
            "Main ne Rs. 1,500 reverse kar diye hain. Net payable ab Rs. 2,000 hai. Reference number CR-49821 hai.",
            "Thank you for calling FastNet support!",
        ],
    },

    # 15. Booking & Rescheduling a Medical Appointment
    'scenario_adult_doctor_appointment': {
        'en': [
            "Hello! Dr. Malik has openings on Tuesday at 10:30 AM or Thursday at 3:00 PM. Which suits you better?",
            "Thursday at 3:00 PM is booked for you. Please bring your previous medical history or test reports.",
            "We have sent a confirmation SMS to your registered number. Please arrive 10 minutes early at Room 204.",
            "Thank you! See you on Thursday.",
        ],
        'ur': [
            "ہیلو! ڈاکٹر ملک کے پاس منگل کو صبح 10:30 بجے یا جمعرات کو سہ پہر 3:00 بجے وقت دستیاب ہے۔ آپ کے لیے کون سا وقت مناسب ہے؟",
            "جمعرات کو سہ پہر 3:00 بجے کا وقت آپ کے لیے طے کر دیا گیا ہے۔ براہ کرم اپنی پرانی رپورٹس ساتھ لائیں۔",
            "ہم نے آپ کے نمبر پر تصدیقی ایس ایم ایس بھیج دیا ہے۔ براہ کرم کمرہ نمبر 204 میں 10 منٹ پہلے پہنچیں۔",
            "شکریہ! جمعرات کو ملاقات ہوگی۔",
        ],
        'ur_rm': [
            "Hello! Dr. Malik ke paas Tuesday 10:30 AM ya Thursday 3:00 PM slot hai. Konsa convenient hai?",
            "Thursday 3:00 PM confirm kar diya hai. Previous medical reports sath layein.",
            "Confirmation SMS bhej diya hai. Room 204 mein 10 mins pehle pahunchein.",
            "Thank you! See you on Thursday.",
        ],
    },
    'Booking & Rescheduling a Medical Appointment': {
        'en': [
            "Hello! Dr. Malik has openings on Tuesday at 10:30 AM or Thursday at 3:00 PM. Which suits you better?",
            "Thursday at 3:00 PM is booked for you. Please bring your previous medical history or test reports.",
            "We have sent a confirmation SMS to your registered number. Please arrive 10 minutes early at Room 204.",
            "Thank you! See you on Thursday.",
        ],
        'ur': [
            "ہیلو! ڈاکٹر ملک کے پاس منگل کو صبح 10:30 بجے یا جمعرات کو سہ پہر 3:00 بجے وقت دستیاب ہے۔ آپ کے لیے کون سا وقت مناسب ہے؟",
            "جمعرات کو سہ پہر 3:00 بجے کا وقت آپ کے لیے طے کر دیا گیا ہے۔ براہ کرم اپنی پرانی رپورٹس ساتھ لائیں۔",
            "ہم نے آپ کے نمبر پر تصدیقی ایس ایم ایس بھیج دیا ہے۔ براہ کرم کمرہ نمبر 204 میں 10 منٹ پہلے پہنچیں۔",
            "شکریہ! جمعرات کو ملاقات ہوگی۔",
        ],
        'ur_rm': [
            "Hello! Dr. Malik ke paas Tuesday 10:30 AM ya Thursday 3:00 PM slot hai. Konsa convenient hai?",
            "Thursday 3:00 PM confirm kar diya hai. Previous medical reports sath layein.",
            "Confirmation SMS bhej diya hai. Room 204 mein 10 mins pehle pahunchein.",
            "Thank you! See you on Thursday.",
        ],
    },
}

def get_scenario_communication_skills(scenario_id: str, difficulty: str = "easy") -> List[str]:
    skill_map = {
        "scenario_group_discussion": ["Active listening", "Constructive idea sharing", "Collaborative planning", "Turn-taking"],
        "scenario_new_person": ["Polite greeting", "Self-introduction", "Hobby exploration", "Engaging follow-up questions"],
        "scenario_teacher_help": ["Polite approach", "Specific task clarification", "Expressing gratitude"],
        "scenario_teacher_confused": ["Polite attention-getting", "Specific difficulty explanation", "Requesting simplification"],
        "scenario_talking_friend": ["Warm greeting", "Reciprocal questions", "Sharing weekend plans"],
        "scenario_shop_buying": ["Polite item request", "Price inquiry", "Transaction completion"],
        "scenario_directions_help": ["Polite attention", "Location inquiry", "Listening to directions"],
        "scenario_child_lost_item": ["Item description", "Last seen location explanation", "Lost-and-found inquiry"],
        "scenario_teen_express_pref": ["Expressing personal preference", "Respecting peer choices", "Reaching group consensus"],
        "scenario_teen_teacher_extension": ["Respectful greeting", "Clear reason for extension", "Realistic deadline proposal"],
        "scenario_teen_peer_dispute": ["Acknowledging perspective", "Calm rationale", "Balanced compromise"],
        "scenario_adult_pharmacy": ["Prescription pickup", "Dosage & meal timing confirmation", "Clarification"],
        "scenario_adult_doctor_appointment": ["Appointment scheduling", "Date and time slot specification", "Booking confirmation"],
        "scenario_manager_clarification": ["Professional greeting", "Specific task question", "Priority confirmation"],
        "scenario_adult_colleague_shift": ["Polite shift swap request", "Return shift offer", "Supervisor coordination"],
        "scenario_adult_customer_support": ["Account number provision", "Billing discrepancy explanation", "Resolution confirmation"],
    }
    return skill_map.get(scenario_id, ["Active listening", "Clarity", "Turn-taking", "Polite communication"])

def detect_selected_option(def_s: Optional[Dict[str, Any]], user_message: str, language: str) -> Optional[Dict[str, Any]]:
    if not def_s or not def_s.get("options"):
        return None
    msg_clean = user_message.strip().lower()
    for opt in def_s["options"]:
        opt_text = opt.get("text", {})
        texts_to_check = []
        if isinstance(opt_text, dict):
            texts_to_check.extend([opt_text.get("en", ""), opt_text.get("ur", ""), opt_text.get("ur_rm", "")])
        else:
            texts_to_check.append(str(opt_text))

        for t in texts_to_check:
            t_clean = t.strip().lower()
            if not t_clean:
                continue
            feedback_dict = opt.get("feedback", {})
            fb_text = feedback_dict.get(language, feedback_dict.get("en", "")) if isinstance(feedback_dict, dict) else str(feedback_dict)

            # 1. Exact or substring match
            if t_clean in msg_clean or msg_clean in t_clean:
                return {
                    "id": opt.get("id"),
                    "type": opt.get("type", "best"),
                    "score": opt.get("score", 100),
                    "feedback": fb_text,
                }
            # 2. Token overlap match (e.g. >= 2 meaningful words in common)
            t_words = set(w for w in t_clean.replace("?", "").replace("!", "").replace(".", "").replace(",", "").split() if len(w) > 2)
            m_words = set(w for w in msg_clean.replace("?", "").replace("!", "").replace(".", "").replace(",", "").split() if len(w) > 2)
            if t_words and m_words and (len(t_words & m_words) >= min(2, len(m_words))):
                return {
                    "id": opt.get("id"),
                    "type": opt.get("type", "best"),
                    "score": opt.get("score", 100),
                    "feedback": fb_text,
                }
    return None

def validate_ai_response(response_text: str, language: str, role_str: str) -> bool:
    if not response_text or len(response_text.strip()) < 3:
        return False
    clean = response_text.lower().strip()
    forbidden = [
        "as an ai", "i am an ai", "i am a language model",
        "great job", "good job", "keep practicing",
        "let's improve your communication skills", "let's improve",
        "that's correct", "that is the correct answer",
        "that's a great response", "excellent communication", "good communication",
        "here is your response:", "objectives achieved:", "scenario objectives:",
        "keep trying your best", "you're doing great"
    ]
    for f in forbidden:
        if f in clean:
            return False
    # If Urdu script is requested, ensure presence of Urdu unicode range
    if language == "ur":
        has_ur = any('\u0600' <= c <= '\u06FF' for c in response_text)
        if not has_ur and len(response_text.strip()) > 8:
            return False
    return True

def generate_contextual_fallback(
    scenario_id: str,
    user_message: str,
    turn_count: int,
    language: str,
    history: List[Dict[str, Any]],
    def_s: Optional[Dict[str, Any]],
    role_str: str,
) -> tuple[str, bool]:
    """Generates an intelligent, in-character, scenario-aware response even when AI API is offline."""
    msg = user_message.lower().strip()
    is_completed = (turn_count >= 10)

    # 1. Child Scenario: Asking a Teacher for Help (scenario_teacher_help)
    if scenario_id in ["scenario_teacher_help", "Asking a teacher for help"]:
        if any(w in msg for w in ["thank", "thanks", "makes sense", "understood", "okay teacher", "shukriya"]):
            if language == "ur":
                return ("بہت شکریہ! کلاس میں اسی طرح محنت اور سوال پوچھتے رہیں۔", is_completed)
            elif language == "ur_rm":
                return ("You're welcome! Class mein isi tarah mehnat aur questions poochte rahein.", is_completed)
            else:
                return ("You are very welcome! Keep up the wonderful effort in class.", is_completed)

        if any(w in msg for w in ["first step", "how to start", "start it", "beginning", "start"]):
            if language == "ur":
                return ("آئیے پہلا جملہ مل کر پڑھتے ہیں اور دی گئی معلومات دیکھتے ہیں۔ پہلی لائن پڑھ کر دیکھیں۔", is_completed)
            elif language == "ur_rm":
                return ("Aaiye pehla sentence mil kar read karte hain aur numbers note karte hain. Pehli line parhein.", is_completed)
            else:
                return ("Let's read the first sentence out loud together and find the numbers given. Try reading the first line.", is_completed)

        if any(w in msg for w in ["question 3", "q3", "question 2", "q2", "problem 3", "problem 2", "math", "fraction"]):
            if language == "ur":
                return ("ٹھیک ہے، آئیے مل کر سوال نمبر 3 دیکھتے ہیں۔ آپ کو پہلے کس حصے میں مدد چاہیے؟", is_completed)
            elif language == "ur_rm":
                return ("Theek hai, aaiye question 3 mil kar dekhte hain. Aap ko pehle kis part mein help chahiye?", is_completed)
            else:
                return ("Okay, let's look at question 3 together. What part would you like help with first?", is_completed)

        if any(w in msg for w in ["don't understand", "dont understand", "confused", "need help", "don't get", "help me", "stuck"]):
            if language == "ur":
                return ("کوئی مسئلہ نہیں! کیا آپ مجھے بتا سکتے ہیں کہ کون سا حصہ یا سوال سمجھ نہیں آ رہا؟", is_completed)
            elif language == "ur_rm":
                return ("Koi masla nahi! Kya aap bata sakte hain ke konsa part ya question confusing lag raha hai?", is_completed)
            else:
                return ("No problem at all! Can you show me which part or question is confusing?", is_completed)

        if language == "ur":
            return ("جی بالکل! آئیے مل کر سوال دیکھتے ہیں۔ آپ کو کس چیز میں مدد چاہیے؟", is_completed)
        elif language == "ur_rm":
            return ("Sure! Aaiye mil kar question dekhte hain. Aap ko kis cheez mein help chahiye?", is_completed)
        else:
            return ("Sure! Let us look at the problem together. What part would you like help with?", is_completed)

    # 2. Teen Scenario: Joining a Group Discussion (scenario_group_discussion)
    elif scenario_id in ["scenario_group_discussion", "Joining a Group Discussion"]:
        if any(w in msg for w in ["made slides before", "slides before", "experience", "done this before", "done before"]):
            if language == "ur":
                return ("بہترین! ہم ریسرچ دستاویز آپ کے ساتھ شیئر کر دیتے ہیں تاکہ آپ اہم سلائیڈز بنانا شروع کر سکیں۔", is_completed)
            elif language == "ur_rm":
                return ("Great! Hum research document share kar dete hain taake aap main slides banana shuru kar sakein.", is_completed)
            else:
                return ("Great! We can share our shared notes document with you so you can start organizing the key research slides.", is_completed)

        if any(w in msg for w in ["slide", "presentation", "present", "deck", "powerpoint"]):
            if language == "ur":
                return ("یہ تو بہت زبردست ہے! کیا آپ سلائیڈز کے ڈیزائن پر کام کرنا چاہیں گے یا اہم نکات ترتیب دینے میں مدد کریں گے؟", is_completed)
            elif language == "ur_rm":
                return ("Yeh to bohot zabardast hai! Kya aap slides design karna chahenge ya main points organize karenge?", is_completed)
            else:
                return ("That would be awesome! Do you want to work on the slide visuals or help organize the main research points?", is_completed)

        if any(w in msg for w in ["not sure what i should do", "not sure what to do", "don't know what i can do", "dont know", "not sure", "no idea"]):
            if language == "ur":
                return ("کوئی پریشانی کی بات نہیں! آپ قدیم تہذیبوں کے بارے میں معلومات تلاش کر سکتے ہیں یا ہمارے نوٹس ترتیب دے سکتے ہیں—آپ کو کون سا کام بہتر لگتا ہے؟", is_completed)
            elif language == "ur_rm":
                return ("Koi masla nahi! Aap ancient civilizations ke facts search kar sakte hain ya notes organize kar sakte hain—konsa behtar lagta hai?", is_completed)
            else:
                return ("No problem at all! You could help us look up facts on ancient civilizations or help organize our notes—which one sounds better to you?", is_completed)

        if any(w in msg for w in ["just listen", "listen first", "observe", "sit and listen", "listen"]):
            if language == "ur":
                return ("جی بالکل، کوئی جلدی نہیں! آپ آرام سے بیٹھیں اور سنیں جب تک ہم موضوعات پر بات کرتے ہیں۔", is_completed)
            elif language == "ur_rm":
                return ("Bilkul, take your time! Aap aaram se baith kar sunein jab tak hum ideas brainstorm karte hain.", is_completed)
            else:
                return ("Of course, take your time! Pull up a chair and listen in while we brainstorm ideas.", is_completed)

        if any(w in msg for w in ["join", "can i join", "table", "group", "sit with you", "hi", "hello"]):
            if language == "ur":
                return ("ارے! جی ہاں، ہم تاریخ کے پروجیکٹ کے موضوعات پر بات کر رہے ہیں۔ قدیم تہذیبوں کے بارے میں آپ کی کیا رائے ہے؟", is_completed)
            elif language == "ur_rm":
                return ("Hey! Haan, hum history project ke topics discuss kar rahe hain. Ancient civilizations ke baare mein aap ka kya khayal hai?", is_completed)
            else:
                return ("Hey! Sure, we are discussing ideas for the history project. What do you think about ancient civilizations?", is_completed)

        if any(w in msg for w in ["egypt", "mesopotamia", "rome", "greece", "civilization", "ancient"]):
            if language == "ur":
                return ("قدیم مصر ایک شاندار موضوع ہے! ہم اسے ثقافت، ایجادات اور روزمرہ زندگی میں تقسیم کر سکتے ہیں۔ آپ کی دلچسپی کس حصے میں ہے؟", is_completed)
            elif language == "ur_rm":
                return ("Ancient Egypt aik shandar topic hai! Hum isay culture, inventions aur daily life mein divide kar sakte hain. Aap ki interest kis part mein hai?", is_completed)
            else:
                return ("Ancient Egypt is a fantastic topic! We can divide the research into culture, inventions, and daily life. Which section interests you most?", is_completed)

    # 3. Adult Scenario: Asking Manager for Task Clarification (scenario_manager_clarification)
    elif scenario_id in ["scenario_manager_clarification", "Asking Manager for Task Clarification"]:
        # Turn 5: Worry / mistake concern
        if any(w in msg for w in ["worried", "make a mistake", "nervous", "afraid of mistake", "fear", "anxious"]):
            if language == "ur":
                return ("یہ قابل فہم بات ہے۔ کام کو حتمی شکل دینے سے پہلے مجھے ابتدائی مسودہ بھیج دیں، میں آپ کے ساتھ مل کر اہم اعداد و شمار کا جائزہ لے لوں گا۔", is_completed)
            elif language == "ur_rm":
                return ("Yeh understandable hai. Finalize karne se pehle draft mujhe bhej dein, main key numbers aap ke sath review kar loonga.", is_completed)
            else:
                return ("That's understandable. Send me the draft before you finalize it, and I'll review the key figures with you.", is_completed)

        # Turn 4: Summary today, data tomorrow compromise
        if any(w in msg for w in ["summary today", "data may take until tomorrow", "data until tomorrow", "data tomorrow", "finish the summary today"]):
            if language == "ur":
                return ("یہ بالکل ٹھیک رہے گا۔ مکمل شدہ سمری مجھے آج بھیج دیں، اور باقی ڈیٹا کا جائزہ ہم کل صبح لے لیں گے۔", is_completed)
            elif language == "ur_rm":
                return ("That works. Completed summary mujhe aaj send kar dein, aur remaining data hum kal morning review kar sakte hain.", is_completed)
            else:
                return ("That works. Send me the completed summary today, and we can review the remaining data tomorrow morning.", is_completed)

        # Turn 3: Need more time for data
        if any(w in msg for w in ["more time", "need more time", "extra time", "data analysis", "data", "timeline", "take longer"]):
            if language == "ur":
                return ("سمجھ گیا۔ ڈیٹا کے لیے آپ کو مزید کتنا وقت درکار ہوگا؟ ہم ابھی سمری کو ترجیح دے سکتے ہیں اور باقی رپورٹ کا شیڈول ضرورت کے مطابق تبدیل کر سکتے ہیں۔", is_completed)
            elif language == "ur_rm":
                return ("Understood. Data ke liye kitna additional time chahiye? Hum abhi summary prioritize kar sakte hain aur baqi report ka schedule adjust kar sakte hain.", is_completed)
            else:
                return ("Understood. How much additional time do you need for the data? We can prioritize the summary now and adjust the rest of the report if necessary.", is_completed)

        # Turn 2: Deadline question
        if any(w in msg for w in ["finish the report today", "finish today", "report today", "finish the report", "today", "deadline"]):
            if language == "ur":
                return ("جی ہاں، اگر ممکن ہو تو مجھے آج دن کے اختتام تک رپورٹ چاہیے ہوگی۔ پہلے کلائنٹ سمری اور نتائج پر توجہ دیں۔ اگر وقت کم لگے تو مجھے مطلع کریں۔", is_completed)
            elif language == "ur_rm":
                return ("Yes, agar possible ho to report aaj end of day tak chahiye. Pehle summary aur client findings par focus karein. Agar timeline tight lagay to batayein.", is_completed)
            else:
                return ("Yes, I'd like the report by the end of today if possible. Focus on the summary and client findings first. Let me know if you think the timeline is too tight.", is_completed)

        # Turn 1: Uncertainty / Clarification request
        if any(w in msg for w in ["not completely sure", "not sure what you need", "what you need me to do", "clarify", "guidance", "not sure what to do", "what to work on"]):
            if language == "ur":
                return ("ضرور۔ مجھے کلائنٹ رپورٹ کو مکمل کرنے اور اہم نتائج کا خلاصہ تیار کرنے میں آپ کی ضرورت ہے۔ اصل ترجیح سمری سیکشن ہے۔ آپ کس حصے پر وضاحت چاہتے ہیں؟", is_completed)
            elif language == "ur_rm":
                return ("Sure. Mujhe client report complete karne aur key findings summarize karne mein aap ki help chahiye. Main priority summary section hai. Kis part par clarification chahiye?", is_completed)
            else:
                return ("Sure. I need you to finish the client report and summarize the key findings. The main priority is the summary section. Which part would you like me to clarify?", is_completed)

        # Conclusion / Thanks
        if any(w in msg for w in ["thank you", "thanks", "understood", "will send by 5", "sounds good", "perfect"]):
            if language == "ur":
                return ("بہترین۔ اگر مزید کوئی سوال ہو تو بلا جھجھک رابطہ کریں۔ آپ کا دن اچھا گزرے!", is_completed)
            elif language == "ur_rm":
                return ("Excellent. Agar koi mazeed question ho to zaroor batayein. Have a productive day!", is_completed)
            else:
                return ("Excellent. Feel free to reach out if anything else comes up. Have a productive day!", is_completed)

    # 4. Adult Scenario: Customer Support Billing Discrepancy (scenario_adult_customer_support)
    elif scenario_id in ["scenario_adult_customer_support", "Calling Customer Support About Billing Discrepancy"]:
        if any(w in msg for w in ["charged twice", "double charge", "1500", "fn-8821", "extra charge", "unrequested", "invoice", "discrepancy", "bill"]):
            if language == "ur":
                return ("ہیلو! میں بالکل اس میں آپ کی مدد کر سکتی ہوں۔ میں اکاؤنٹ FN-8821 چیک کر رہی ہوں، مجھے 1500 روپے کا غیر مطلوبہ چارج نظر آ رہا ہے، اور میں فوری طور پر کریڈٹ ایڈجسٹمنٹ پروسیس کر رہی ہوں۔", is_completed)
            elif language == "ur_rm":
                return ("Hello! Main zaroor help kar sakti hoon. Account FN-8821 check kar rahi hoon, Rs. 1,500 ka extra charge remove kar ke credit adjustment submit kar rahi hoon.", is_completed)
            else:
                return ("Hello! I can certainly help you with that. Let me look up account FN-8821. I see the unrequested Rs. 1,500 add-on charge on this month's invoice, and I will submit an immediate credit adjustment for you.", is_completed)

        if any(w in msg for w in ["reference", "confirmation", "credit", "adjusted", "sr-9402", "ticket"]):
            if language == "ur":
                return ("1500 روپے کی کریڈٹ ایڈجسٹمنٹ لاگو کر دی گئی ہے۔ آپ کا تصدیقی ریفرنس نمبر SR-9402 ہے۔ کیا میں آپ کے اکاؤنٹ پر کسی اور چیز میں مدد کر سکتی ہوں؟", is_completed)
            elif language == "ur_rm":
                return ("Rs. 1,500 ki credit adjustment apply ho chuki hai. Aap ka reference confirmation number SR-9402 hai. Kya account par koi aur assistance chahiye?", is_completed)
            else:
                return ("The credit adjustment of Rs. 1,500 has been applied. Your reference confirmation number is SR-9402. Is there anything else on your account I can assist you with today?", is_completed)

        if any(w in msg for w in ["thank", "thanks", "perfect", "all set"]):
            if language == "ur":
                return ("آپ کا بہت شکریہ! فاسٹ نیٹ سپورٹ پر کال کرنے کا شکریہ، آپ کا دن اچھا گزرے۔", is_completed)
            elif language == "ur_rm":
                return ("You're welcome! FastNet Support contact karne ka shukriya. Have a great day!", is_completed)
            else:
                return ("You're very welcome! Thank you for contacting FastNet Support. Have a great day!", is_completed)

    # 5. Adult Scenario: Requesting a Shift Swap (scenario_adult_colleague_shift)
    elif scenario_id in ["scenario_adult_colleague_shift", "Requesting a Shift Swap with a Coworker"]:
        if any(w in msg for w in ["thursday", "friday", "swap", "exchange", "medical appointment", "appointment", "family", "shift"]):
            if language == "ur":
                return ("ارے! میں سمجھ سکتا ہوں، میڈیکل اپوائنٹمنٹس اہم ہوتی ہیں۔ میں جمعہ کی آپ کی شفٹ لے لوں گا اگر آپ بدلے میں میری جمعرات کی شام کی شفٹ کر سکیں۔ کیا ہم مل کر سپروائزر کو بتا دیں؟", is_completed)
            elif language == "ur_rm":
                return ("Hey! I understand, appointments zaroori hoti hain. Main Friday shift cover kar loonga agar aap Thursday evening shift swap kar sakein. Supervisor ko inform karein?", is_completed)
            else:
                return ("Hey! I understand, medical appointments are important. I can definitely take your Friday shift if you can cover my Thursday evening shift in return. Should we let our supervisor know together?", is_completed)

        if any(w in msg for w in ["supervisor", "sheet", "manager", "inform", "let them know", "confirm"]):
            if language == "ur":
                return ("بالکل درست! میں شفٹ سویپ شیٹ پر ہم دونوں کے نام لکھ کر مینیجر کو مطلع کر دیتا ہوں۔ میرے ساتھ ایڈجسٹ کرنے کا شکریہ۔", is_completed)
            elif language == "ur_rm":
                return ("Sounds like a plan! Main swap request sheet par names note kar ke manager ko bata deta hoon. Thanks for coordinating!", is_completed)
            else:
                return ("Sounds like a plan! I will put our names on the shift swap request sheet and mention it to the shift manager. Thanks for working it out with me.", is_completed)

        if any(w in msg for w in ["thank", "thanks", "appreciate"]):
            if language == "ur":
                return ("کوئی بات نہیں! جمعہ کو آپ کے چیک اپ کے لیے نیک خواہشات۔", is_completed)
            elif language == "ur_rm":
                return ("Anytime! Friday appointment ke liye best of luck.", is_completed)
            else:
                return ("Anytime! Good luck with your appointment on Friday.", is_completed)

    # 6. Adult Scenario: Booking & Rescheduling Medical Appointment (scenario_adult_doctor_appointment)
    elif scenario_id in ["scenario_adult_doctor_appointment", "Booking & Rescheduling a Medical Appointment"]:
        if any(w in msg for w in ["move", "reschedule", "next week", "change"]):
            if language == "ur":
                return ("یقیناً، میں آپ کی اپوائنٹمنٹ اگلے ہفتے پر منتقل کر سکتی ہوں۔ ہمارے پاس منگل کو دوپہر 2 بجے یا جمعرات کو صبح 10:30 بجے کا وقت دستیاب ہے۔ آپ کو کون سا وقت مناسب لگے گا؟", is_completed)
            elif language == "ur_rm":
                return ("Certainly, appointment next week move kar sakte hain. Tuesday 2:00 PM ya Thursday 10:30 AM available hain. Konsa slot behtar hai?", is_completed)
            else:
                return ("Certainly, I can move your appointment to next week. We have Tuesday at 2:00 PM or Thursday at 10:30 AM available. Which one do you prefer?", is_completed)

        if any(w in msg for w in ["dr. malik", "dr malik", "thursday morning", "appointment", "checkup", "book"]):
            if language == "ur":
                return ("دوپہر بخیر! جی ہاں، ڈاکٹر ملک کے پاس اگلے جمعرات صبح 10:30 بجے روم نمبر 4 میں وقت دستیاب ہے۔ کیا یہ وقت آپ کے لیے مناسب ہے؟", is_completed)
            elif language == "ur_rm":
                return ("Good afternoon! Yes, Dr. Malik ke paas next Thursday 10:30 AM Consultation Room 4 mein slot available hai. Kya yeh time theek hai?", is_completed)
            else:
                return ("Good afternoon! Yes, Dr. Malik has an opening next Thursday at 10:30 AM in Consultation Room 4. Would that time work for you?", is_completed)

        if any(w in msg for w in ["confirm", "thursday at 10:30", "that works", "perfect", "thank"]):
            if language == "ur":
                return ("بہترین، میں نے جمعرات صبح 10:30 بجے ڈاکٹر ملک کے ساتھ آپ کا وقت بک کر دیا ہے۔ آپ کو تصدیقی ایس ایم ایس مل جائے گا۔ براہ کرم 10 منٹ پہلے تشریف لائیں۔", is_completed)
            elif language == "ur_rm":
                return ("Perfect, Thursday 10:30 AM Dr. Malik ke paas appointment confirm ho gayi hai. SMS confirmation mil jayegi. Please 10 mins pehle arrive karein.", is_completed)
            else:
                return ("Perfect, I have booked your appointment with Dr. Malik for Thursday at 10:30 AM. You will receive an SMS confirmation. Please arrive 10 minutes early.", is_completed)

    # 7. Adult Scenario: Speaking to a Pharmacist About Medication (scenario_adult_pharmacy)
    elif scenario_id in ["scenario_adult_pharmacy", "Speaking to a Pharmacist About Medication"]:
        if any(w in msg for w in ["before or after", "meals", "timing", "how to take", "dosage", "food", "tablets"]):
            if language == "ur":
                return ("سلام! اس دوا کی ایک گولی دن میں دو بار کھانے کے بعد ایک گلاس پانی کے ساتھ لیں۔ کھانے کے بعد لینے سے معدے میں جلن نہیں ہوتی۔", is_completed)
            elif language == "ur_rm":
                return ("Hello! Is medicine ki 1 tablet din mein 2 baar khane ke baad paani ke sath lein. Food ke baad lene se stomach upset nahi hota.", is_completed)
            else:
                return ("Hello! For this medication, please take one tablet twice daily after meals with a full glass of water. Taking it after food helps prevent any stomach upset.", is_completed)

        if any(w in msg for w in ["side effect", "drowsy", "missed", "miss", "drowsiness"]):
            if language == "ur":
                return ("عام سائیڈ ایفیکٹ ہلکی نیند یا اونگھ ہے، اس لیے دوا لینے کے فورا بعد ڈرائیونگ سے پرہیز کریں۔ اگر خوراک چھوٹ جائے تو یاد آنے پر لے لیں، لیکن کبھی دو گولیاں ایک ساتھ نہ لیں۔", is_completed)
            elif language == "ur_rm":
                return ("Common side effect mild drowsiness hai, is liye driving avoid karein. Agar dose miss ho jaye to yaad aane par lein, double dose na lein.", is_completed)
            else:
                return ("Common side effects are mild drowsiness, so avoid driving right after taking it. If you miss a dose, take it as soon as you remember, but never double up.", is_completed)

        if any(w in msg for w in ["thank", "thanks", "understood", "clear"]):
            if language == "ur":
                return ("آپ کا بہت شکریہ! تجویز کردہ پورا کورس مکمل کریں، اور اگر کوئی اور سوال ہو تو بلا جھجھک رابطہ کریں۔ اپنا خیال رکھیں!", is_completed)
            elif language == "ur_rm":
                return ("You're welcome! Prescribed course poora karein aur koi query ho to call karein. Take care!", is_completed)
            else:
                return ("You're very welcome! Please finish the full prescribed course, and feel free to call us if you have any other questions. Take care!", is_completed)

    # Standard fallback script fallback
    sc_id = scenario_id or ''
    script = (
        FALLBACK_SCRIPTS.get(sc_id, {}).get(language)
        or FALLBACK_SCRIPTS.get(sc_id, {}).get('en')
        or []
    )
    index = min(turn_count - 1, len(script) - 1) if script else 0
    resp_text = script[index] if (script and index < len(script)) else (
        "آپ کا بہت شکریہ! آئیے اس بات چیت کو جاری رکھیں۔" if language == "ur"
        else "Aap ka bohot shukriya! Aaiye conversation jari rakhein." if language == "ur_rm"
        else "Thank you for sharing! Let's continue practicing."
    )
    if turn_count >= 10:
        is_completed = True

    return (resp_text, is_completed)

def start_session(db: Session, user_id: str, scenario_id: str, mode: str = "text") -> Dict[str, Any]:
    user = db.query(User).filter(User.id == user_id).first()
    scenario = db.query(CommunicationScenario).filter(CommunicationScenario.id == scenario_id).first()

    if not user:
        raise ValueError("User not found")

    def_s = next((s for s in DEFAULT_SCENARIOS if s["id"] == scenario_id), None)
    if not scenario and def_s:
        title_val = def_s["title"]["en"] if isinstance(def_s["title"], dict) else def_s["title"]
        desc_val = def_s["description"]["en"] if isinstance(def_s["description"], dict) else def_s["description"]
        role_val = def_s["aiRole"]["en"] if isinstance(def_s["aiRole"], dict) else def_s["aiRole"]
        scenario = CommunicationScenario(
            id=def_s["id"],
            title=title_val,
            description=desc_val,
            aiRole=role_val,
            personas=stringify_json(def_s["personas"]),
            languages=stringify_json(def_s["languages"]),
            difficulty=def_s["difficulty"],
            objectives=stringify_json(def_s["objectives"]),
            context=def_s["context"],
            initialPrompt=stringify_json(def_s["initialPrompt"]),
            isActive=True,
            createdAt=datetime.utcnow(),
        )
        try:
            db.add(scenario)
            db.commit()
            db.refresh(scenario)
        except Exception:
            db.rollback()
            scenario = db.query(CommunicationScenario).filter(CommunicationScenario.id == def_s["id"]).first()

    if not scenario and not def_s:
        raise ValueError("Scenario not found")

    language = user.language or "en"
    init_prompt = def_s["initialPrompt"] if def_s else parse_json(scenario.initialPrompt, {})
    if isinstance(init_prompt, dict):
        initial_msg_text = init_prompt.get(language) or init_prompt.get("en") or "Hello!"
    else:
        initial_msg_text = str(init_prompt) if init_prompt else "Hello!"

    initial_transcript = [
        {"role": "assistant", "content": initial_msg_text, "timestamp": datetime.utcnow().isoformat()}
    ]

    session = ConversationSession(
        userId=user.id,
        scenarioId=scenario.id if scenario else scenario_id,
        mode=mode,
        language=language,
        transcript=stringify_json(initial_transcript),
        turnCount=0,
        completed=False,
        createdAt=datetime.utcnow(),
    )
    user.lastActiveAt = datetime.utcnow()
    db.add(session)
    db.commit()
    db.refresh(session)

    # Format scenario for session return
    from app.routers.conversations import format_scenario
    formatted_sc = format_scenario(def_s or scenario, language=language)

    return {
        "session": {
            "id": session.id,
            "userId": session.userId,
            "scenarioId": session.scenarioId,
            "mode": session.mode,
            "language": session.language,
            "transcript": initial_transcript,
            "turnCount": session.turnCount,
            "completed": session.completed,
            "createdAt": session.createdAt.isoformat() if session.createdAt else None,
            "scenario": formatted_sc,
        },
        "scenario": formatted_sc,
    }

async def send_message(db: Session, session_id: str, user_id: str, user_message: str) -> Dict[str, Any]:
    session = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
    if not session:
        raise ValueError("Session not found")
    if session.completed:
        raise ValueError("Session is already completed")

    scenario = session.scenario
    if not scenario:
        scenario = db.query(CommunicationScenario).filter(CommunicationScenario.id == session.scenarioId).first()

    def_s = next((s for s in DEFAULT_SCENARIOS if s["id"] == session.scenarioId), None)

    history = parse_json(session.transcript, [])
    history.append({
        "role": "user",
        "content": user_message,
        "timestamp": datetime.utcnow().isoformat(),
    })

    next_turn_count = session.turnCount + 1
    response_text = ""
    is_session_completed = False

    user = db.query(User).filter(User.id == user_id).first()
    language = session.language or (user.language if user else "en")
    user_persona = user.persona if user else "teen"
    sensory_info = user.sensoryPrefs if (user and user.sensoryPrefs) else "{}"

    # Max turns cap (10 turns)
    if next_turn_count >= 10:
        is_session_completed = True

    context_str = def_s["context"] if def_s else (scenario.context if scenario else "")
    role_str = def_s["aiRole"].get(language, def_s["aiRole"].get("en", "Coach")) if (def_s and isinstance(def_s.get("aiRole"), dict)) else (scenario.aiRole if scenario else "Coach")
    objectives_val = def_s["objectives"].get(language, def_s["objectives"].get("en", [])) if (def_s and isinstance(def_s.get("objectives"), dict)) else (parse_json(scenario.objectives, []) if scenario else [])
    title_str = def_s["title"].get(language, def_s["title"].get("en", "")) if (def_s and isinstance(def_s.get("title"), dict)) else (scenario.title if scenario else "")
    desc_str = def_s["description"].get(language, def_s["description"].get("en", "")) if (def_s and isinstance(def_s.get("description"), dict)) else (scenario.description if scenario else "")
    skills_practiced = get_scenario_communication_skills(session.scenarioId, def_s.get("difficulty", "easy") if def_s else "easy")

    # Detect selected option
    selected_option = detect_selected_option(def_s, user_message, language)
    selected_option_context = ""
    if selected_option:
        selected_option_context = (
            f"Selected Quick-Option Context: The learner selected an option classified as '{selected_option['type']}' "
            f"(Target note: {selected_option['feedback']}).\n"
        )

    if is_ai_available() and (scenario or def_s):
        lang_name = "English" if language == "en" else "Urdu (اردو script)" if language == "ur" else "Roman Urdu"
        system_prompt = (
            f"You are role-playing as the character defined by the selected communication scenario: {role_str}.\n"
            f"Scenario ID: {session.scenarioId}\n"
            f"Scenario Title: {title_str}\n"
            f"Scenario Description: {desc_str}\n"
            f"Scenario Context: {context_str}\n"
            f"Learner Persona: {user_persona} (Language: {lang_name}, Sensory Prefs: {sensory_info})\n"
            f"Learner Objectives: {objectives_val}\n"
            f"Communication Skills Being Practiced: {', '.join(skills_practiced)}\n"
            f"Current Conversation Turn: {next_turn_count} of 10\n"
            f"{selected_option_context}\n"
            f"CRITICAL ROLE-PLAY & INTERACTION INSTRUCTIONS:\n"
            f"1. STRICT IN-CHARACTER ROLE-PLAY: Stay strictly in character as {role_str} at all times. Never act as a generic AI tutor or assistant. Never say 'As an AI' or break character.\n"
            f"2. NO GENERIC FILLER PRAISE: Never say 'Great job!', 'That's correct!', 'Keep practicing!', or 'Excellent communication!' unless it is something {role_str} would genuinely say in this real-life moment.\n"
            f"3. REACT DIRECTLY TO THE LEARNER: Directly reference and build upon what the learner actually said in their latest message ('{user_message}'). If they mention specific topics (e.g. slides, presentation, history, symptoms, dosage, shift swap, directions), acknowledge them explicitly.\n"
            f"4. MULTI-TURN CONVERSATIONAL MEMORY: Remember all details established in earlier turns of this conversation.\n"
            f"5. NATURAL FOLLOW-UP: Ask ONE natural, relevant follow-up question when appropriate to move the dialogue forward smoothly.\n"
            f"6. ADAPT TO LEARNER NEEDS:\n"
            f"   - If the learner gives a great idea, enthusiastically accept and build upon it in character.\n"
            f"   - If the learner struggles or gives a short/hesitant answer (e.g. 'I don't know', 'not sure'), gently offer a simple choice or supportive suggestion in character without lecturing.\n"
            f"   - If the learner asks to listen or observe ('Can I just listen first?'), warmly welcome and accommodate them in character.\n"
            f"7. PERSONA-APPROPRIATE LANGUAGE:\n"
            f"   - child: Simple vocabulary, short engaging sentences.\n"
            f"   - teen: Natural high-school / peer conversational tone.\n"
            f"   - adult: Respectful, professional, everyday/workplace appropriate. Strictly avoid teacher praise or condescending tone.\n"
            f"8. CONCISE LENGTH: Exactly 1 to 3 conversational sentences maximum. No long essays.\n"
            f"9. LANGUAGE CONSISTENCY: Output strictly in {lang_name} ({language}). Avoid unnecessary language mixing.\n"
            f"10. NO SCORING REVEALS: Never reveal internal scoring, rubrics, or hidden evaluation criteria.\n"
            f"11. REAL-WORLD ADULT WORKPLACE & EVERYDAY REALISM (FOR ADULT PERSONA):\n"
            f"    - Act strictly as a real-life human professional in this scenario (e.g., Manager, Supervisor, Colleague, Support Agent, Clinic Receptionist, Pharmacist).\n"
            f"    - Address the learner's exact practical situation: deadlines, reports, summaries, data constraints, mistake concerns, shift swaps, billing adjustments, or prescription dosages.\n"
            f"    - Offer actionable, realistic next steps without educational filler praise.\n\n"
            f"Return JSON format only:\n"
            f'{{\n  "response": "<your contextual in-character response>",\n  "objectivesAchieved": true|false\n}}'
        )

        chat_history = [
            {"role": "assistant" if h.get("role") == "assistant" else "user", "content": h.get("content", "")}
            for h in history
        ]

        messages = [
            {"role": "system", "content": system_prompt},
            *chat_history,
        ]

        ai_result = await call_ai_chat(messages, temperature=0.6)
        if ai_result and isinstance(ai_result, dict) and ai_result.get("response"):
            candidate = str(ai_result["response"]).strip()
            if validate_ai_response(candidate, language, role_str):
                response_text = candidate
                if ai_result.get("objectivesAchieved") is True:
                    is_session_completed = True
            else:
                # One-time retry with strict correction
                retry_messages = list(messages)
                retry_messages.append({
                    "role": "system",
                    "content": f"Your previous response violated role-play or language guidelines. Please output a strictly in-character, 1-2 sentence response as {role_str} reacting directly to '{user_message}' in {lang_name} without any generic praise."
                })
                retry_result = await call_ai_chat(retry_messages, temperature=0.4)
                if retry_result and isinstance(retry_result, dict) and retry_result.get("response"):
                    retry_candidate = str(retry_result["response"]).strip()
                    if validate_ai_response(retry_candidate, language, role_str):
                        response_text = retry_candidate
                        if retry_result.get("objectivesAchieved") is True:
                            is_session_completed = True

    # Fallback to smart contextual response generator if AI is offline or failed
    if not response_text:
        fallback_resp, fb_completed = generate_contextual_fallback(
            scenario_id=session.scenarioId or (scenario.id if scenario else ""),
            user_message=user_message,
            turn_count=next_turn_count,
            language=language,
            history=history,
            def_s=def_s,
            role_str=role_str,
        )
        response_text = fallback_resp
        if fb_completed:
            is_session_completed = True

    history.append({
        "role": "assistant",
        "content": response_text,
        "timestamp": datetime.utcnow().isoformat(),
    })

    session.transcript = stringify_json(history)
    session.turnCount = next_turn_count
    session.completed = is_session_completed
    if is_session_completed and not session.completedAt:
        session.completedAt = datetime.utcnow()

    if user:
        user.lastActiveAt = datetime.utcnow()

    db.commit()
    db.refresh(session)

    from app.routers.conversations import format_scenario
    formatted_sc = format_scenario(def_s or scenario, language=language)

    return {
        "session": {
            "id": session.id,
            "userId": session.userId,
            "scenarioId": session.scenarioId,
            "mode": session.mode,
            "language": session.language,
            "transcript": history,
            "turnCount": session.turnCount,
            "completed": session.completed,
            "createdAt": session.createdAt.isoformat() if session.createdAt else None,
            "completedAt": session.completedAt.isoformat() if session.completedAt else None,
            "scenario": formatted_sc,
        },
        "response": response_text,
        "completed": is_session_completed,
    }

def end_session(db: Session, session_id: str) -> Dict[str, Any]:
    session = db.query(ConversationSession).filter(ConversationSession.id == session_id).first()
    if not session:
        raise ValueError("Session not found")

    history = parse_json(session.transcript, [])
    session.completed = True
    if not session.completedAt:
        session.completedAt = datetime.utcnow()

    user = db.query(User).filter(User.id == session.userId).first()
    if user:
        user.lastActiveAt = datetime.utcnow()

    db.commit()
    db.refresh(session)

    from app.routers.conversations import format_scenario
    def_s = next((s for s in DEFAULT_SCENARIOS if s["id"] == session.scenarioId), None)
    formatted_sc = format_scenario(def_s or session.scenario, language=session.language)

    return {
        "id": session.id,
        "userId": session.userId,
        "scenarioId": session.scenarioId,
        "mode": session.mode,
        "language": session.language,
        "transcript": history,
        "turnCount": session.turnCount,
        "completed": session.completed,
        "createdAt": session.createdAt.isoformat() if session.createdAt else None,
        "completedAt": session.completedAt.isoformat() if session.completedAt else None,
        "scenario": formatted_sc,
    }
