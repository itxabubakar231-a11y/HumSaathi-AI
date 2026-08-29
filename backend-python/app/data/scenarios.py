import json

DEFAULT_SCENARIOS = [
    {
        "id": "scenario_teacher_help",
        "title": "Asking a teacher for help",
        "description": "Practice raising your hand and asking your teacher for help with an assignment.",
        "aiRole": "teacher",
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": [
            "Approach the teacher politely (e.g. excuse me)",
            "State clearly what assignment or task you need help with",
            "Thank the teacher for their explanation"
        ],
        "context": "You are a kind, patient school teacher. A student approaches you to ask for help with their class assignment. Stay in character as a helpful teacher. Keep your responses simple, polite, and encouraging.",
        "initialPrompt": {
            "en": "Hello! I noticed you are working hard. Do you need some help with this assignment?",
            "ur": "ہیلو! میں نے دیکھا کہ آپ محنت کر رہے ہیں۔ کیا آپ کو اس کام میں کچھ مدد کی ضرورت ہے؟",
            "ur_rm": "Hello! Main ne dekha ke aap mehnat kar rahe hain. Kya aap ko is kaam mein kuch madad ki zaroorat hai?"
        }
    },
    {
        "id": "scenario_teacher_confused",
        "title": "Telling a teacher something is not understood",
        "description": "Practice explaining politely to a teacher when you do not understand a topic.",
        "aiRole": "teacher",
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": [
            "Politely interrupt or get the teacher's attention",
            "Explain specifically that you do not understand the lesson",
            "Ask them to explain it again or in a different way"
        ],
        "context": "You are a patient and supportive teacher. A student comes to tell you they do not understand a topic you just explained. Act as the teacher. Ask them what part was confusing, offer a brief simple explanation, and check if it is clearer now.",
        "initialPrompt": {
            "en": "Hi there! We just went over the new lesson. Is everything clear, or would you like me to explain anything again?",
            "ur": "ہیلو! ہم نے ابھی نیا سبق مکمل کیا ہے۔ کیا سب کچھ واضح ہے، یا آپ چاہتے ہیں کہ میں کچھ دوبارہ سمجھاؤں؟",
            "ur_rm": "Hi there! Hum ne abhi naya sabak mukammal kiya hai. Kya sab kuch wazih hai, ya aap chahte hain ke main kuch dobara samjhaon?"
        }
    },
    {
        "id": "scenario_new_person",
        "title": "Meeting someone new",
        "description": "Practice introducing yourself and asking questions to meet a new person.",
        "aiRole": "classmate",
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "beginner",
        "objectives": [
            "Say hello and introduce yourself by name",
            "Ask the other person their name",
            "Ask a friendly question about their hobbies or interests"
        ],
        "context": "You are a new classmate or colleague. You are friendly, approachable, and open to making new friends. Act as the peer. Respond to introductions, share your name, and ask about their favorite hobbies.",
        "initialPrompt": {
            "en": "Hi! I don't think we've met before. I just joined this class/group. I'm Alex. What's your name?",
            "ur": "ہیلو! میرے خیال میں ہم پہلے نہیں ملے۔ میں نے ابھی یہ گروپ جوائن کیا ہے۔ میں الیکس ہوں۔ آپ کا نام کیا ہے؟",
            "ur_rm": "Hi! Mere khayal mein hum pehle nahi mile. Main ne abhi yeh group join kiya hai. Main Alex hoon. Aap ka naam kya hai?"
        }
    },
    {
        "id": "scenario_talking_friend",
        "title": "Talking to a friend",
        "description": "Practice starting a friendly conversation and sharing plans with a friend.",
        "aiRole": "friend",
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": [
            "Greet your friend warmly",
            "Ask them about their day or how they are doing",
            "Share what you did recently or discuss weekend plans"
        ],
        "context": "You are a close and friendly friend of the learner. Act as their classmate/friend. Speak in a warm, informal tone. Respond to their greeting, tell them about your day, and ask them if they have any plans for the weekend.",
        "initialPrompt": {
            "en": "Hey! I was hoping I'd see you today! How has your day been so far?",
            "ur": "ہیلو! مجھے امید تھی کہ آج آپ سے ملاقات ہوگی! آپ کا دن اب تک کیسا رہا؟",
            "ur_rm": "Hey! Mujhe umeed thi ke aaj aap se mulaqat hogi! Aap ka din ab tak kaisa raha?"
        }
    },
    {
        "id": "scenario_shop_buying",
        "title": "Buying something from a shop",
        "description": "Practice ordering/buying an item and paying the shopkeeper.",
        "aiRole": "shopkeeper",
        "personas": ["child", "teen", "adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": [
            "Greet the shopkeeper and politely request the item you want",
            "Ask for the price of the item",
            "Complete the transaction and say thank you"
        ],
        "context": "You are a polite shopkeeper at a local stationery or snack shop. Act as the shopkeeper. Ask the customer what they need, state the price of the item, receive the money, and wish them a good day.",
        "initialPrompt": {
            "en": "Welcome to the shop! What can I get for you today?",
            "ur": "دکان پر خوش آمدید! میں آج آپ کے لیے کیا پیش کر سکتا ہوں؟",
            "ur_rm": "Dukan par khush aamdeed! Main aaj aap ke liye kya pesh kar sakta hoon?"
        }
    },
    {
        "id": "scenario_directions_help",
        "title": "Asking someone for help/directions",
        "description": "Practice getting someone's attention politely to ask for directions.",
        "aiRole": "passerby",
        "personas": ["child", "teen", "adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": [
            "Say 'Excuse me' or get attention politely",
            "Ask clearly for directions to a specific place (like the library)",
            "Thank them politely after they give directions"
        ],
        "context": "You are a friendly passerby walking down the street. A learner approaches you asking for directions. Act as the passerby. Give simple, clear directions and be very polite.",
        "initialPrompt": {
            "en": "Hello! Do you need some help? You look a bit lost.",
            "ur": "ہیلو! کیا آپ کو کچھ مدد کی ضرورت ہے؟ آپ تھوڑے پریشان لگ رہے ہیں۔",
            "ur_rm": "Hello! Kya aap ko kuch madad ki zaroorat hai? Aap thore pareshan lag rahe hain."
        }
    },
    {
        "id": "scenario_group_discussion",
        "title": "Joining a Group Discussion",
        "description": "Practice joining a classroom study group or project discussion politely.",
        "aiRole": "classmate",
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": [
            "Ask politely if you can join the group",
            "Listen to the ongoing topic",
            "Share your ideas constructively"
        ],
        "context": "You are a friendly high-school/college classmate working on a study group discussion. Act as a welcoming peer.",
        "initialPrompt": {
            "en": "Hey! We are discussing ideas for the project. Would you like to join our table?",
            "ur": "ارے! ہم پروجیکٹ کے خیالات پر بات کر رہے ہیں۔ کیا آپ ہمارے ساتھ شامل ہونا چاہیں گے؟",
            "ur_rm": "Hey! Hum project ke ideas discuss kar rahe hain. Kya aap humare table par join karna chahenge?"
        }
    },
    {
        "id": "scenario_manager_clarification",
        "title": "Asking Manager for Task Clarification",
        "description": "Practice asking a supervisor for clear guidance and priorities on a work task.",
        "aiRole": "manager",
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": [
            "Greet your manager professionally",
            "State the specific task or question clearly",
            "Confirm next steps before finishing"
        ],
        "context": "You are a busy but supportive department supervisor at work. A team member approaches you to clarify task priorities.",
        "initialPrompt": {
            "en": "Good morning! How can I help you with today's project tasks?",
            "ur": "صبح بخیر! آج کے دفتری کاموں کے سلسلے میں، میں آپ کی کیا مدد کر سکتا ہوں؟",
            "ur_rm": "Good morning! Aaj ke tasks ke silsilay mein main aap ki kya madad kar sakta hoon?"
        }
    }
]
