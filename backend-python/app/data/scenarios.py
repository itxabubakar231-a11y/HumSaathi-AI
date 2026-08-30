import json

DEFAULT_SCENARIOS = [
    # Child Scenarios
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
        "personas": ["child", "teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
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
        "personas": ["child", "teen"],
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
    # Teen-Specific Scenarios
    {
        "id": "scenario_teen_teacher_extension",
        "title": "Requesting an Assignment Extension",
        "description": "Practice approaching your teacher respectfully to request a brief deadline extension.",
        "aiRole": "teacher",
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "objectives": [
            "Greet your teacher politely after class",
            "State the assignment name and reason for requesting extra time",
            "Propose a specific realistic submission date (e.g. tomorrow afternoon)",
            "Thank the teacher regardless of decision"
        ],
        "context": "You are Mr. Harris, a thoughtful high school teacher. A student approaches you to discuss an upcoming assignment deadline. Be fair, listen to their reason, and approve a 24-hour extension if they ask politely.",
        "initialPrompt": {
            "en": "Hello! You wanted to speak with me after class about the history essay?",
            "ur": "ہیلو! آپ کلاس کے بعد ہسٹری مضمون کے حوالے سے مجھ سے بات کرنا چاہتے تھے؟",
            "ur_rm": "Hello! Aap class ke baad history essay ke silsilay mein baat karna chahte the?"
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
        "context": "You are a friendly high-school classmate working on a study group discussion. Act as a welcoming peer.",
        "initialPrompt": {
            "en": "Hey! We are discussing ideas for the project. Would you like to join our table?",
            "ur": "ارے! ہم پروجیکٹ کے خیالات پر بات کر رہے ہیں۔ کیا آپ ہمارے ساتھ شامل ہونا چاہیں گے؟",
            "ur_rm": "Hey! Hum project ke ideas discuss kar rahe hain. Kya aap humare table par join karna chahenge?"
        }
    },
    {
        "id": "scenario_teen_peer_dispute",
        "title": "Resolving a Team Project Disagreement",
        "description": "Practice discussing differing ideas with a classmate calmly to reach a compromise.",
        "aiRole": "classmate",
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "challenging",
        "objectives": [
            "Acknowledge the other person's perspective respectfully",
            "Explain your viewpoint with calm rationale",
            "Propose a balanced compromise that combines both ideas"
        ],
        "context": "You are Maya, a classmate collaborating on a science fair poster. You wanted a digital presentation, while your partner prefers a physical trifold board. Be open to a good compromise.",
        "initialPrompt": {
            "en": "Hey, I really think we should do a slide presentation, but I know you wanted the poster board. What do you think we should do?",
            "ur": "ارے، میرے خیال میں سلائیڈ پریزنٹیشن بہتر ہے لیکن آپ پوسٹر بورڈ بنانا چاہتے تھے۔ آپ کا کیا خیال ہے کہ ہمیں کیا کرنا چاہیے؟",
            "ur_rm": "Hey, mujhe lagta hai slide presentation behtar hai magar aap poster board chahte the. Aap ka kya khayal hai?"
        }
    },
    {
        "id": "scenario_teen_express_pref",
        "title": "Expressing Preferences in a Social Group",
        "description": "Practice sharing your opinion and food/activity preferences politely with friends.",
        "aiRole": "friend",
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": [
            "State your preference clearly without putting down others' choices",
            "Ask what everyone else would like to do",
            "Agree on a shared group plan"
        ],
        "context": "You are Tariq, a fun classmate planning a group lunch after school. You are asking your friend where they would like to eat.",
        "initialPrompt": {
            "en": "Hey! A few of us are grabbing lunch after school. Some want pizza and some want biryani. What are you in the mood for?",
            "ur": "ارے! ہم میں سے کچھ اسکول کے بعد لنچ کر رہے ہیں۔ کچھ پیزا اور کچھ بریانی کھانا چاہتے ہیں۔ آپ کا کیا موڈ ہے؟",
            "ur_rm": "Hey! Hum school ke baad lunch kar rahe hain. Kuch pizza aur kuch biryani chahte hain. Aap ka kya dil chah raha hai?"
        }
    },
    # Adult-Specific Scenarios
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
    },
    {
        "id": "scenario_adult_pharmacy",
        "title": "Speaking to a Pharmacist About Medication",
        "description": "Practice asking a pharmacist about medicine dosages, meal timing, and side effects.",
        "aiRole": "pharmacist",
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": [
            "State the prescription or medication you are picking up",
            "Ask clearly whether to take it before or after meals",
            "Confirm how many times a day to take it and thank the pharmacist"
        ],
        "context": "You are a helpful and knowledgeable pharmacist at a community health clinic. A customer is picking up an allergy/pain prescription. Provide clear, supportive medication instructions.",
        "initialPrompt": {
            "en": "Hello! I have your prescription ready here. Do you have any questions about how to take this medication?",
            "ur": "ہیلو! آپ کی دوائی تیار ہے۔ کیا آپ کو اس دوائی کے استعمال کے بارے میں کوئی سوال پوچھنا ہے؟",
            "ur_rm": "Hello! Aap ki medicine ready hai. Kya aap ko iske use ke baare mein koi sawal poochna hai?"
        }
    },
    {
        "id": "scenario_adult_colleague_shift",
        "title": "Requesting a Shift Swap with a Coworker",
        "description": "Practice asking a coworker politely to exchange work shifts due to a family appointment.",
        "aiRole": "colleague",
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "objectives": [
            "Greet your colleague politely",
            "Explain the specific shift you need covered and propose an alternative shift you can work for them",
            "Express gratitude and confirm you will inform the shift supervisor together"
        ],
        "context": "You are Sameer, a friendly coworker on the customer service team. A colleague approaches you to ask if you can switch your Thursday evening shift with their Friday shift.",
        "initialPrompt": {
            "en": "Hi! How is your day going? You mentioned you wanted to check something about the work schedule?",
            "ur": "ہیلو! آپ کا دن کیسا گزر رہا ہے؟ آپ نے کہا تھا کہ کام کے شیڈول کے بارے میں کچھ بات کرنی ہے؟",
            "ur_rm": "Hi! Aap ka din kaisa guzar raha hai? Aap ne schedule ke mutaliq baat karni thi?"
        }
    },
    {
        "id": "scenario_adult_customer_support",
        "title": "Calling Customer Support About Billing Discrepancy",
        "description": "Practice resolving an unexpected utility/internet charge over the phone calmly and assertively.",
        "aiRole": "support_agent",
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "challenging",
        "objectives": [
            "Provide your account number and state the issue concisely",
            "Explain that the extra charge was unrequested and ask for an invoice adjustment",
            "Note down the representative's confirmation / reference number politely"
        ],
        "context": "You are Sarah, a customer service representative at an internet utility provider. A customer calls regarding a Rs. 1,500 add-on fee on their latest invoice. Be professional and offer to reverse the fee.",
        "initialPrompt": {
            "en": "Thank you for calling FastNet Support. My name is Sarah. How can I assist you with your account today?",
            "ur": "فاسٹ نیٹ سپورٹ پر کال کرنے کا شکریہ۔ میرا نام سارہ ہے۔ میں آج آپ کے اکاؤنٹ کے سلسلے میں کیا مدد کر سکتی ہوں؟",
            "ur_rm": "FastNet Support par call karne ka shukriya. Mera naam Sarah hai. Main aaj aap ki kya madad kar sakti hoon?"
        }
    },
    {
        "id": "scenario_adult_doctor_appointment",
        "title": "Booking & Rescheduling a Medical Appointment",
        "description": "Practice scheduling a routine doctor checkup and communicating preferred time slots.",
        "aiRole": "receptionist",
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "objectives": [
            "State your full name and the doctor or department you wish to visit",
            "Specify your preferred days or morning/evening time preferences",
            "Confirm the date, time, and clinic room before concluding"
        ],
        "context": "You are the medical receptionist at City Health Clinic. Help the patient book an appointment with Dr. Malik for next week.",
        "initialPrompt": {
            "en": "Good afternoon, City Health Clinic. Are you looking to schedule an appointment today?",
            "ur": "سٹی ہیلتھ کلینک میں خوش آمدید۔ کیا آپ آج ڈاکٹر سے ملنے کا وقت طے کرنا چاہتے ہیں؟",
            "ur_rm": "City Health Clinic mein khush aamdeed. Kya aap appointment schedule karwana chahte hain?"
        }
    }
]
