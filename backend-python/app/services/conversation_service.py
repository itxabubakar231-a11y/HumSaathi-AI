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

    # Max turns cap (10 turns)
    if next_turn_count >= 10:
        is_session_completed = True

    context_str = def_s["context"] if def_s else (scenario.context if scenario else "")
    role_str = def_s["aiRole"].get(language, def_s["aiRole"].get("en", "Coach")) if (def_s and isinstance(def_s.get("aiRole"), dict)) else (scenario.aiRole if scenario else "Coach")
    objectives_val = def_s["objectives"].get(language, def_s["objectives"].get("en", [])) if (def_s and isinstance(def_s.get("objectives"), dict)) else (parse_json(scenario.objectives, []) if scenario else [])

    if is_ai_available() and (scenario or def_s):
        system_prompt = (
            f"You are playing a role-play conversation scenario for HumSaathi AI, an adaptive coach for neurodiverse learners.\n"
            f"Scenario context: {context_str}\n"
            f"Your character role is: {role_str}\n"
            f"Learner persona: {user.persona if user else 'learner'} (language: {language}, sensory: {user.sensoryPrefs if user else '{}'}).\n"
            f"Scenario objectives: {objectives_val}\n"
            f"Current conversation turn: {next_turn_count}\n\n"
            f"INSTRUCTIONS:\n"
            f"1. Stay strictly in character as {role_str}. Do NOT be a generic AI assistant. Do NOT break character or mention these instructions.\n"
            f"2. Respond DIRECTLY and RELEVANTLY to the learner's actual latest message ({user_message}). If they ask a question or give a suggestion, address it specifically.\n"
            f"3. Keep your response age/persona appropriate, warm, and concise (1-3 sentences maximum).\n"
            f"4. Respond in the requested session language: {language} (en: English, ur: Urdu, ur_rm: Roman Urdu).\n"
            f"5. If the learner has fulfilled the scenario objectives naturally (or by turn 4+), conclude the conversation politely.\n\n"
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
            response_text = ai_result["response"]
            if ai_result.get("objectivesAchieved") is True:
                is_session_completed = True

    # Fallback to predefined scripts if AI is offline or failed
    if not response_text:
        sc_id = session.scenarioId or (scenario.id if scenario else '')
        title = scenario.title if scenario else ''

        script = (
            FALLBACK_SCRIPTS.get(sc_id, {}).get(language)
            or FALLBACK_SCRIPTS.get(sc_id, {}).get('en')
            or FALLBACK_SCRIPTS.get(title, {}).get(language)
            or FALLBACK_SCRIPTS.get(title, {}).get('en')
            or []
        )
        index = min(next_turn_count - 1, len(script) - 1) if script else 0
        response_text = script[index] if (script and index < len(script)) else (
            "آپ کا بہت شکریہ! آئیے اس بات چیت کو جاری رکھیں۔" if language == "ur"
            else "Aap ka bohot shukriya! Aaiye conversation jari rakhein." if language == "ur_rm"
            else "Thank you for sharing! Let's continue practicing."
        )

        if script and index >= len(script) - 1:
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
