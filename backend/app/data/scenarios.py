import json

GENERAL_CHAT_SCENARIO = {
    "id": "scenario_general_chat",
    "category": "general",
    "title": {
        "en": "HumSaathi AI Assistant & General Chat",
        "ur": "ہم ساتھی اے آئی اسسٹنٹ اور عمومی گفتگو",
        "ur_rm": "HumSaathi AI Assistant & General Chat"
    },
    "description": {
        "en": "Ask anything! Science, coding, general knowledge, school topics, interview prep, translations, or casual conversation.",
        "ur": "کچھ بھی پوچھیں! سائنس، کوڈنگ، عمومی معلومات، تعلیمی سوالات، انٹرویو کی تیاری، ترجمہ یا عام گفتگو۔",
        "ur_rm": "Kuch bhi poochein! Science, coding, general knowledge, school topics, interview prep, translations, ya aam baat cheet."
    },
    "aiRole": {
        "en": "HumSaathi AI Coach",
        "ur": "ہم ساتھی اے آئی کوچ",
        "ur_rm": "HumSaathi AI Coach"
    },
    "personas": ["child", "teen", "adult"],
    "languages": ["en", "ur", "ur_rm"],
    "difficulty": "easy",
    "objectives": {
        "en": [
            "Ask clear and curious questions on any topic",
            "Explore explanations, coding, translations, and ideas",
            "Practice active learning and natural dialogue"
        ],
        "ur": [
            "کسی بھی موضوع پر واضح اور پُرجوش سوالات پوچھیں",
            "وضاحتیں، کوڈنگ، ترجمہ اور نئے خیالات دریافت کریں",
            "سیکھنے اور گفتگو کی مشق کریں"
        ],
        "ur_rm": [
            "Kisi bhi topic par clear aur curious sawalat poochein",
            "Explanations, coding, translation aur ideas explore karein",
            "Learning aur natural dialogue ki practice karein"
        ]
    },
    "context": "You are HumSaathi AI, an intelligent, helpful, and empathetic AI assistant and conversational coach. You answer questions accurately on any topic, tailor complexity to the learner persona, and communicate fluently in English, Urdu script, or Roman Urdu.",
    "initialPrompt": {
        "en": "Hello! I am your HumSaathi AI Assistant. You can ask me anything — like 'What is AI?', 'Explain photosynthesis', 'Write a Python function to reverse a string', translations, or practice scenarios. What would you like to explore today?",
        "ur": "السلام علیکم! میں آپ کا ہم ساتھی اے آئی اسسٹنٹ ہوں۔ مجھ سے کچھ بھی پوچھیں — جیسے سائنس، کوڈنگ، عمومی معلومات، ترجمہ یا عام گفتگو۔ آج آپ کیا جاننا چاہتے ہیں؟",
        "ur_rm": "Assalam-o-Alaikum! Main aap ka HumSaathi AI Assistant hoon. Mujh se kuch bhi poochein — jaise science, coding, general knowledge, translation ya casual practice. Aaj aap kya seekhna chahte hain?"
    },
    "options": [
        {
            "id": "opt_gen_1",
            "type": "best",
            "score": 100,
            "text": {
                "en": "Can you explain how Artificial Intelligence works in simple terms?",
                "ur": "کیا آپ آسان الفاظ میں سمجھا سکتے ہیں کہ مصنوعی ذہانت (AI) کیسے کام کرتی ہے؟",
                "ur_rm": "Kya aap aasan lafzon mein samjha sakte hain ke AI kaise kaam karti hai?"
            },
            "feedback": {
                "en": "Great question! Clear and asks for a simple, accessible explanation.",
                "ur": "بہت اچھا سوال! واضح اور آسان وضاحت کی درخواست۔",
                "ur_rm": "Bohot acha question! Clear aur easy explanation ki request."
            }
        },
        {
            "id": "opt_gen_2",
            "type": "weaker",
            "score": 75,
            "text": {
                "en": "Can you write a Python function to reverse a string?",
                "ur": "کیا آپ اسٹرنگ کو الٹنے (reverse) کے لیے ازگر (Python) کا فنکشن لکھ سکتے ہیں؟",
                "ur_rm": "Kya aap string reverse karne ke liye aik Python function likh sakte hain?"
            },
            "feedback": {
                "en": "Direct and specific programming request.",
                "ur": "واضح اور مخصوص پروگرامنگ کی درخواست۔",
                "ur_rm": "Direct aur specific programming request."
            }
        },
        {
            "id": "opt_gen_3",
            "type": "inappropriate",
            "score": 40,
            "text": {
                "en": "Help me prepare for an upcoming job or school interview.",
                "ur": "نوکری یا تعلیمی انٹرویو کی تیاری میں میری مدد کریں۔",
                "ur_rm": "Interview ki preparation mein meri madad karein."
            },
            "feedback": {
                "en": "Practical real-world preparation goal.",
                "ur": "حقیقی دنیا کے انٹرویو کی تیاری کا بہترین ہدف۔",
                "ur_rm": "Real-world interview preparation ka behtareen goal."
            }
        },
        {
            "id": "opt_gen_4",
            "type": "incorrect",
            "score": 0,
            "text": {
                "en": "Tell me a fun joke or riddle.",
                "ur": "مجھے کوئی لطیفہ یا پہیلی سنائیں۔",
                "ur_rm": "Mujhe koi fun joke ya riddle sunayein."
            },
            "feedback": {
                "en": "Lighthearted casual interaction.",
                "ur": "ہلکی پھلکی گفتگو۔",
                "ur_rm": "Lighthearted casual interaction."
            }
        }
    ]
}

DEFAULT_SCENARIOS = [

    # ==========================================
    # Child Scenarios (6 scenarios, Easy/Med/Chall)
    # ==========================================
    {
        "id": "scenario_teacher_help",
        "category": "peer_school",
        "title": {
            "en": "Asking a teacher for help",
            "ur": "استاد سے مدد طلب کرنا",
            "ur_rm": "Teacher se madad mangna"
        },
        "description": {
            "en": "Practice raising your hand and asking your teacher for help with an assignment.",
            "ur": "ہاتھ اٹھا کر اسائنمنٹ میں استاد سے مدد مانگنے کی مشق کریں۔",
            "ur_rm": "Hand raise kar ke assignment mein teacher se help lene ki practice karein."
        },
        "aiRole": {
            "en": "Teacher",
            "ur": "استاد",
            "ur_rm": "Teacher"
        },
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": {
            "en": [
                "Approach the teacher politely (e.g. excuse me)",
                "State clearly what assignment or task you need help with",
                "Thank the teacher for their explanation"
            ],
            "ur": [
                "شائستگی سے استاد کو متوجہ کریں (مثلاً معاف کیجیے گا)",
                "واضح طور پر بتائیں کہ کس کام میں مدد درکار ہے",
                "وضاحت کے بعد استاد کا شکریہ ادا کریں"
            ],
            "ur_rm": [
                "Politely teacher ko approach karein (e.g. excuse me)",
                "Wazih tor par batayein ke kis task mein help chahiye",
                "Explanation ke baad teacher ka shukriya ada karein"
            ]
        },
        "context": "You are a kind, patient school teacher. A student approaches you to ask for help with their class assignment. Stay in character as a helpful teacher. Keep your responses simple, polite, and encouraging.",
        "initialPrompt": {
            "en": "Hello! I noticed you are working hard. Do you need some help with this assignment?",
            "ur": "ہیلو! میں نے دیکھا کہ آپ محنت کر رہے ہیں۔ کیا آپ کو اس کام میں کچھ مدد کی ضرورت ہے؟",
            "ur_rm": "Hello! Main ne dekha ke aap mehnat kar rahe hain. Kya aap ko is kaam mein kuch madad ki zaroorat hai?"
        },
        "options": [
            {
                "id": "opt_th_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Excuse me, Teacher. Could you please help me understand question number 2?",
                    "ur": "معاف کیجیے گا سر/مس، کیا آپ سوال نمبر 2 سمجھنے میں میری مدد کر سکتے ہیں؟",
                    "ur_rm": "Excuse me Teacher, kya aap question number 2 samajhne mein meri madad kar sakte hain?"
                },
                "feedback": {
                    "en": "Polite greeting and clearly specifies what you need help with.",
                    "ur": "بہت شائستہ انداز اور واضح طور پر اپنی ضرورت بیان کی گئی۔",
                    "ur_rm": "Bohot polite greeting aur clear request."
                }
            },
            {
                "id": "opt_th_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "I need help with this worksheet right now.",
                    "ur": "مجھے اس ورک شیٹ میں ابھی مدد چاہیے۔",
                    "ur_rm": "Mujhe is worksheet mein abhi help chahiye."
                },
                "feedback": {
                    "en": "States the task, but lacks a polite greeting.",
                    "ur": "مدد تو مانگی مگر شائستگی اور آداب میں کمی ہے۔",
                    "ur_rm": "Direct hai magar thora polite hona behtar hota."
                }
            },
            {
                "id": "opt_th_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "This work is boring and I don't want to do it.",
                    "ur": "یہ کام بہت بورنگ ہے اور میں یہ نہیں کرنا چاہتا۔",
                    "ur_rm": "Yeh kaam boring hai aur main nahi karna chahta."
                },
                "feedback": {
                    "en": "Complaining does not explain what part is confusing.",
                    "ur": "شکایت کرنے سے مسئلہ حل نہیں ہوتا۔",
                    "ur_rm": "Shikayat karne se teacher ko samajh nahi aayega ke kahan madad chahiye."
                }
            },
            {
                "id": "opt_th_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "Just do the whole assignment for me.",
                    "ur": "بس یہ سارا کام آپ میرے لیے خود کر دیں۔",
                    "ur_rm": "Bas yeh sara assignment aap mere liye kar dein."
                },
                "feedback": {
                    "en": "Asking others to do your homework misses the learning opportunity.",
                    "ur": "دوسروں سے اپنا کام کروانے سے سیکھنے کا موقع ضائع ہوتا ہے۔",
                    "ur_rm": "Apna homework doosron se karwana theek nahi."
                }
            }
        ]
    },
    {
        "id": "scenario_talking_friend",
        "category": "peer_school",
        "title": {
            "en": "Talking to a friend",
            "ur": "دوست سے بات چیت",
            "ur_rm": "Dost se baat cheet"
        },
        "description": {
            "en": "Practice starting a friendly conversation and sharing plans with a friend.",
            "ur": "دوست کے ساتھ دوستانہ گفتگو شروع کرنے اور منصوبے شیئر کرنے کی مشق کریں۔",
            "ur_rm": "Dost ke sath friendly conversation shuru karne aur plans share karne ki practice karein."
        },
        "aiRole": {
            "en": "Friend",
            "ur": "دوست",
            "ur_rm": "Friend"
        },
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": {
            "en": [
                "Greet your friend warmly",
                "Ask them about their day or how they are doing",
                "Share what you did recently or discuss weekend plans"
            ],
            "ur": [
                "دوست کو گرمجوشی سے سلام کریں",
                "ان کا حال احوال پوچھیں",
                "اپنے تفریحی منصوبے شیئر کریں"
            ],
            "ur_rm": [
                "Dost ko warmly greet karein",
                "Unka haal ahwaal poochein",
                "Weekend plans ya fun activity share karein"
            ]
        },
        "context": "You are a close and friendly friend of the learner. Act as their classmate/friend. Speak in a warm, informal tone. Respond to their greeting, tell them about your day, and ask them if they have any plans for the weekend.",
        "initialPrompt": {
            "en": "Hey! I was hoping I'd see you today! How has your day been so far?",
            "ur": "ہیلو! مجھے امید تھی کہ آج آپ سے ملاقات ہوگی! آپ کا دن اب تک کیسا رہا؟",
            "ur_rm": "Hey! Mujhe umeed thi ke aaj aap se mulaqat hogi! Aap ka din ab tak kaisa raha?"
        },
        "options": [
            {
                "id": "opt_tf_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Hi! My day is going great, thanks! How was your art class?",
                    "ur": "ہیلو! میرا دن بہت اچھا گزر رہا ہے، شکریہ! آپ کی آرٹ کلاس کیسی رہی؟",
                    "ur_rm": "Hi! Mera din bohot acha guzar raha hai, thanks! Aap ki art class kaisi rahi?"
                },
                "feedback": {
                    "en": "Friendly response that asks an engaging question in return.",
                    "ur": "دوستانہ جواب اور بدلے میں دلچسپی سے سوال پوچھا۔",
                    "ur_rm": "Warm greeting aur engaging follow-up question."
                }
            },
            {
                "id": "opt_tf_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Fine. Nothing new happened.",
                    "ur": "ٹھیک ہے۔ کچھ خاص نہیں ہوا۔",
                    "ur_rm": "Fine. Kuch naya nahi hua."
                },
                "feedback": {
                    "en": "Answers the question, but too brief to keep the chat going.",
                    "ur": "جواب تو دیا لیکن گفتگو کو آگے بڑھانے میں کمی ہے۔",
                    "ur_rm": "Bohot short answer hai, conversation aage nahi barhti."
                }
            },
            {
                "id": "opt_tf_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Why are you always asking me questions?",
                    "ur": "تم مجھ سے ہر وقت سوال کیوں پوچھتے رہتے ہو؟",
                    "ur_rm": "Tum har waqt mujh se sawal kyun poochte rehte ho?"
                },
                "feedback": {
                    "en": "Sounds irritated when a friend is just being friendly.",
                    "ur": "دوست سے اس طرح الجھ کر بات کرنا مناسب نہیں۔",
                    "ur_rm": "Dost ke sath rude tone use nahi karni chahiye."
                }
            },
            {
                "id": "opt_tf_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I'm ignoring you today.",
                    "ur": "میں آج تم سے بات نہیں کر رہا۔",
                    "ur_rm": "Main aaj tum se baat nahi kar raha."
                },
                "feedback": {
                    "en": "Dismissive and hurts friendship rapport.",
                    "ur": "یہ دوست کو مایوس کر سکتا ہے۔",
                    "ur_rm": "Yeh dismissive hai aur dosti par bura asar daalta hai."
                }
            }
        ]
    },
    {
        "id": "scenario_teacher_confused",
        "category": "peer_school",
        "title": {
            "en": "Telling a teacher something is not understood",
            "ur": "استاد کو بتانا کہ بات سمجھ نہیں آئی",
            "ur_rm": "Teacher ko batana ke samajh nahi aya"
        },
        "description": {
            "en": "Practice explaining politely to a teacher when you do not understand a topic.",
            "ur": "استاد کو شائستگی سے بتانے کی مشق کریں جب کوئی سبق سمجھ نہ آیا ہو۔",
            "ur_rm": "Teacher ko politely explain karne ki practice karein jab topic samajh na aya ho."
        },
        "aiRole": {
            "en": "Teacher",
            "ur": "استاد",
            "ur_rm": "Teacher"
        },
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "objectives": {
            "en": [
                "Politely get the teacher's attention",
                "Explain specifically that you do not understand the lesson",
                "Ask them to explain it again or in a different way"
            ],
            "ur": [
                "شائستگی سے استاد کی توجہ حاصل کریں",
                "واضح کریں کہ کون سا حصہ سمجھ نہیں آیا",
                "دوبارہ سمجھانے کی درخواست کریں"
            ],
            "ur_rm": [
                "Politely teacher ki attention lein",
                "Explain karein ke lesson ka kaun sa part confusing hai",
                "Aasaan example se dobara samjhane ki request karein"
            ]
        },
        "context": "You are a patient and supportive teacher. A student comes to tell you they do not understand a topic you just explained. Act as the teacher. Ask them what part was confusing, offer a brief simple explanation, and check if it is clearer now.",
        "initialPrompt": {
            "en": "Hi there! We just went over the new lesson. Is everything clear, or would you like me to explain anything again?",
            "ur": "ہیلو! ہم نے ابھی نیا سبق مکمل کیا ہے۔ کیا سب کچھ واضح ہے، یا آپ چاہتے ہیں کہ میں کچھ دوبارہ سمجھاؤں؟",
            "ur_rm": "Hi there! Hum ne abhi naya sabak mukammal kiya hai. Kya sab kuch wazih hai, ya aap chahte hain ke main kuch dobara samjhaon?"
        },
        "options": [
            {
                "id": "opt_tc_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Could you please explain the last fraction example again? I got a bit confused.",
                    "ur": "کیا آپ برائے مہربانی آخری مثال دوبارہ سمجھا سکتے ہیں؟ مجھے تھوڑی الجھن ہوئی تھی۔",
                    "ur_rm": "Kya aap please last fraction example dobara samjha sakte hain? Main confuse ho gaya tha."
                },
                "feedback": {
                    "en": "Excellent, politely points out the exact part needing clarification.",
                    "ur": "بہترین! مخصوص مسئلے کی نشاندہی کر کے شائستہ درخواست کی۔",
                    "ur_rm": "Zabardast! Specific part point out kiya aur politely request ki."
                }
            },
            {
                "id": "opt_tc_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "I don't get it. Teach it again.",
                    "ur": "مجھے سمجھ نہیں آیا۔ دوبارہ پڑھائیں۔",
                    "ur_rm": "Mujhe samajh nahi aya. Dobara parhayein."
                },
                "feedback": {
                    "en": "Communicates lack of understanding, but a bit too blunt.",
                    "ur": "بات واضح کی مگر انداز تھوڑا خشک ہے۔",
                    "ur_rm": "Message clear hai magar thora polite hona chahiye."
                }
            },
            {
                "id": "opt_tc_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "You didn't explain this well at all.",
                    "ur": "آپ نے یہ بالکل بھی ٹھیک نہیں سمجھایا۔",
                    "ur_rm": "Aap ne yeh theek se nahi samjhaya."
                },
                "feedback": {
                    "en": "Blaming the teacher instead of politely asking for clarification.",
                    "ur": "استاد پر تنقید کرنے کے بجائے شائستگی سے پوچھنا چاہیے۔",
                    "ur_rm": "Teacher ko blame karne ke bajaye polite request karein."
                }
            },
            {
                "id": "opt_tc_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "Yeah everything is fine, I don't care anyway.",
                    "ur": "ہاں سب ٹھیک ہے، ویسے بھی مجھے پرواہ نہیں۔",
                    "ur_rm": "Haan sab theek hai, mujhe parwah nahi."
                },
                "feedback": {
                    "en": "Pretending to understand prevents you from learning the topic.",
                    "ur": "جھوٹ بولنے سے آپ سمجھنے کے موقع سے محروم رہ جائیں گے۔",
                    "ur_rm": "Galat batane se aap seekhne se mehroom reh jayenge."
                }
            }
        ]
    },
    {
        "id": "scenario_shop_buying",
        "category": "everyday",
        "title": {
            "en": "Buying something from a shop",
            "ur": "دکان سے خریداری کرنا",
            "ur_rm": "Dukan se khareedari karna"
        },
        "description": {
            "en": "Practice ordering/buying an item and paying the shopkeeper.",
            "ur": "دکاندار سے چیز طلب کرنے، قیمت پوچھنے اور ادائیگی کرنے کی مشق کریں۔",
            "ur_rm": "Shopkeeper se item lene, price poochne aur payment karne ki practice karein."
        },
        "aiRole": {
            "en": "Shopkeeper",
            "ur": "دکاندار",
            "ur_rm": "Shopkeeper"
        },
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "objectives": {
            "en": [
                "Greet the shopkeeper and politely request the item you want",
                "Ask for the price of the item",
                "Complete the transaction and say thank you"
            ],
            "ur": [
                "دکاندار کو سلام کریں اور مطلوبہ چیز مانگیں",
                "چیز کی قیمت معلوم کریں",
                "رقم دے کر شکریہ ادا کریں"
            ],
            "ur_rm": [
                "Shopkeeper ko greet karein aur item request karein",
                "Price poochein",
                "Payment complete kar ke thank you kahein"
            ]
        },
        "context": "You are a polite shopkeeper at a local stationery or snack shop. Act as the shopkeeper. Ask the customer what they need, state the price of the item, receive the money, and wish them a good day.",
        "initialPrompt": {
            "en": "Welcome to the shop! What can I get for you today?",
            "ur": "دکان پر خوش آمدید! میں آج آپ کے لیے کیا پیش کر سکتا ہوں؟",
            "ur_rm": "Dukan par khush aamdeed! Main aaj aap ke liye kya pesh kar sakta hoon?"
        },
        "options": [
            {
                "id": "opt_sb_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Hello! Could I please get a blue notebook? How much does it cost?",
                    "ur": "السلام علیکم! کیا مجھے ایک نیلی نوٹ بک مل سکتی ہے؟ اس کی قیمت کتنی ہے؟",
                    "ur_rm": "Assalam-o-Alaikum! Kya mujhe aik blue notebook mil sakti hai? Iski price kitni hai?"
                },
                "feedback": {
                    "en": "Polite greeting, clearly states item and asks for price.",
                    "ur": "شائستہ سلام، واضح فرمائش اور قیمت کی معلومات طلب کی۔",
                    "ur_rm": "Polite greeting, item request aur price check sab shamil hain."
                }
            },
            {
                "id": "opt_sb_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Give me that blue notebook over there.",
                    "ur": "وہ نیلی والی کاپی مجھے دیں۔",
                    "ur_rm": "Woh blue notebook mujhe dein."
                },
                "feedback": {
                    "en": "Understood, but adding 'please' makes it much friendlier.",
                    "ur": "چیز مل جائے گی لیکن 'برائے مہربانی' کہنا زیادہ اچھا ہے۔",
                    "ur_rm": "Direct demand hai, 'please' add karna behtar hota."
                }
            },
            {
                "id": "opt_sb_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Why do you have such cheap notebooks here?",
                    "ur": "آپ کے پاس اتنی بیکار کاپیاں کیوں ہیں؟",
                    "ur_rm": "Aap ke paas aisi low quality notebooks kyun hain?"
                },
                "feedback": {
                    "en": "Rude to the shopkeeper and creates unnecessary tension.",
                    "ur": "دکاندار کے ساتھ بداخلاقی سے بات نہیں کرنی چاہیے۔",
                    "ur_rm": "Shopkeeper se rude baat karna theek nahi."
                }
            },
            {
                "id": "opt_sb_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I'm taking this notebook without paying.",
                    "ur": "میں یہ نوٹ بک پیسے دیے بغیر لے کر جا رہا ہوں۔",
                    "ur_rm": "Main yeh notebook baghair payment ke le ja raha hoon."
                },
                "feedback": {
                    "en": "Items in a shop must always be paid for.",
                    "ur": "دکان سے چیز ہمیشہ پیسے ادا کر کے لی جاتی ہے۔",
                    "ur_rm": "Payment ke baghair cheez lena galat hai."
                }
            }
        ]
    },
    {
        "id": "scenario_directions_help",
        "category": "everyday",
        "title": {
            "en": "Asking someone for help/directions",
            "ur": "کسی سے راستہ یا مدد پوچھنا",
            "ur_rm": "Kisi se raasta ya madad poochna"
        },
        "description": {
            "en": "Practice getting someone's attention politely to ask for directions.",
            "ur": "کسی راہگیر سے شائستگی سے راستہ پوچھنے کی مشق کریں۔",
            "ur_rm": "Kisi se politely attention le kar directions poochne ki practice karein."
        },
        "aiRole": {
            "en": "Passerby",
            "ur": "راہگیر",
            "ur_rm": "Passerby"
        },
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "challenging",
        "objectives": {
            "en": [
                "Say 'Excuse me' or get attention politely",
                "Ask clearly for directions to a specific place (like the library)",
                "Thank them politely after they give directions"
            ],
            "ur": [
                "معاف کیجیے گا کہہ کر توجہ حاصل کریں",
                "مخصوص جگہ (جیسے لائبریری) کا راستہ پوچھیں",
                "رہنمائی ملنے پر شکریہ ادا کریں"
            ],
            "ur_rm": [
                "'Excuse me' keh kar attention lein",
                "Specific location (e.g. library) ki directions poochein",
                "Directions milne par shukriya ada karein"
            ]
        },
        "context": "You are a friendly passerby walking down the street. A learner approaches you asking for directions. Act as the passerby. Give simple, clear directions and be very polite.",
        "initialPrompt": {
            "en": "Hello! Do you need some help? You look a bit lost.",
            "ur": "ہیلو! کیا آپ کو کچھ مدد کی ضرورت ہے؟ آپ تھوڑے پریشان لگ رہے ہیں۔",
            "ur_rm": "Hello! Kya aap ko kuch madad ki zaroorat hai? Aap thore pareshan lag rahe hain."
        },
        "options": [
            {
                "id": "opt_dh_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Excuse me, yes please! Could you tell me the way to the central library?",
                    "ur": "معاف کیجیے گا، جی ہاں! کیا آپ مجھے سینٹرل لائبریری کا راستہ بتا سکتے ہیں؟",
                    "ur_rm": "Excuse me, jee haan! Kya aap mujhe central library ka raasta bata sakte hain?"
                },
                "feedback": {
                    "en": "Polite greeting, confirms need, and specifies the exact destination.",
                    "ur": "شائستہ آغاز، واضح منزل اور مناسب سوال۔",
                    "ur_rm": "Polite greeting aur exact destination mention kiya."
                }
            },
            {
                "id": "opt_dh_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Where is the big building with books?",
                    "ur": "کتابوں والی بڑی عمارت کہاں ہے؟",
                    "ur_rm": "Kitabon wali building kahan hai?"
                },
                "feedback": {
                    "en": "Passerby will probably understand, but using the name 'library' is clearer.",
                    "ur": "نام لے کر لائبریری کہنا زیادہ واضح ہوتا۔",
                    "ur_rm": "Passerby samajh sakta hai magar 'library' kehna zyada clear hai."
                }
            },
            {
                "id": "opt_dh_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Hey you, take me to the library right now.",
                    "ur": "او بھائی، مجھے ابھی لائبریری لے کر چلو۔",
                    "ur_rm": "O bhai, mujhe abhi library le kar chalo."
                },
                "feedback": {
                    "en": "Demanding someone take you somewhere is unsafe and rude.",
                    "ur": "کسی اجنبی پر حکم چلانا غیر محفوظ اور نامناسب ہے۔",
                    "ur_rm": "Stranger par demand karna unsafe aur rude hai."
                }
            },
            {
                "id": "opt_dh_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "Never mind, I don't talk to anyone.",
                    "ur": "رہنے دیں، میں کسی سے بات نہیں کرتا۔",
                    "ur_rm": "Rehne dein, main kisi se baat nahi karta."
                },
                "feedback": {
                    "en": "Walking away keeps you lost. It is good to ask safe community helpers for directions.",
                    "ur": "مدد نہ مانگنے سے آپ گم رہ سکتے ہیں۔",
                    "ur_rm": "Help na lene se aap mazeed lost ho sakte hain."
                }
            }
        ]
    },
    {
        "id": "scenario_child_lost_item",
        "category": "peer_school",
        "title": {
            "en": "Asking for a Lost Item at School",
            "ur": "اسکول میں گمشدہ چیز کے بارے میں پوچھنا",
            "ur_rm": "School mein ghumshuda cheez ke baare mein poochna"
        },
        "description": {
            "en": "Practice politely asking a teacher or staff member about a missing lunchbox or notebook.",
            "ur": "اسکول میں اپنی گمشدہ کتاب یا لنچ باکس کے بارے میں استاد سے شائستگی سے پوچھنے کی مشق کریں۔",
            "ur_rm": "School mein apni ghumshuda notebook ya lunchbox ke baare mein teacher se poochne ki practice karein."
        },
        "aiRole": {
            "en": "Teacher",
            "ur": "استاد",
            "ur_rm": "Teacher"
        },
        "personas": ["child"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "challenging",
        "objectives": {
            "en": [
                "Politely approach the teacher and describe the lost item",
                "Explain where you last had it",
                "Ask if anyone turned it in or if you can check the lost and found"
            ],
            "ur": [
                "استاد سے شائستگی سے بات کریں اور گمشدہ چیز کی تفصیل بتائیں",
                "وضاحت کریں کہ وہ آخری بار کہاں تھی",
                "دریافت کریں کہ کیا وہ گمشدہ اشیاء کی الماری میں موجود ہے"
            ],
            "ur_rm": [
                "Teacher se politely baat karein aur lost item describe karein",
                "Explain karein ke aakhri baar kahan dekha tha",
                "Poochein kya lost-and-found shelf check kar sakte hain"
            ]
        },
        "context": "You are a school teacher. A young learner approaches you looking worried because they lost an item at school. Help them calmly find it.",
        "initialPrompt": {
            "en": "Hello! You look worried. Did you lose something in the classroom or hallway?",
            "ur": "ہیلو! آپ پریشان لگ رہے ہیں۔ کیا آپ کی کوئی چیز کلاس یا راہداری میں گم ہو گئی ہے؟",
            "ur_rm": "Hello! Aap pareshan lag rahe hain. Kya aap ki koi cheez class ya hallway mein ghum ho gayi hai?"
        },
        "options": [
            {
                "id": "opt_cli_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Yes teacher, I cannot find my blue notebook. I had it during math class. Could we check the lost-and-found?",
                    "ur": "جی استاد، مجھے اپنی نیلی نوٹ بک نہیں مل رہی۔ وہ ریاضی کی کلاس میں میرے پاس تھی۔ کیا ہم گمشدہ اشیاء کی الماری دیکھ سکتے ہیں؟",
                    "ur_rm": "Jee teacher, mujhe apni blue notebook nahi mil rahi. Math class mein mere paas thi. Kya hum lost-and-found check kar sakte hain?"
                },
                "feedback": {
                    "en": "Clear, polite, specifies the item, and gives the location where it was last seen.",
                    "ur": "بہترین! شائستہ انداز، گمشدہ چیز کی واضح تفصیل اور مدد کی مناسب درخواست۔",
                    "ur_rm": "Clear aur polite, item specify kiya aur location batayi."
                }
            },
            {
                "id": "opt_cli_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "My book is missing somewhere here.",
                    "ur": "میری کتاب یہاں کہیں گم ہو گئی ہے۔",
                    "ur_rm": "Meri book yahan kahin ghum ho gayi hai."
                },
                "feedback": {
                    "en": "Explains the problem, but describing color or subject helps the teacher find it faster.",
                    "ur": "مسئلہ بتایا گیا ہے لیکن رنگ یا مضمون بتانے سے زیادہ آسانی ہوتی۔",
                    "ur_rm": "Problem explain ki magar color ya subject mention karne se asani hoti."
                }
            },
            {
                "id": "opt_cli_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Someone stole my notebook and I want you to punish them!",
                    "ur": "کسی نے میری نوٹ بک چوری کر لی ہے اور آپ اسے سزا دیں!",
                    "ur_rm": "Kisi ne meri notebook chura li hai aur aap usay saza dein!"
                },
                "feedback": {
                    "en": "Accusing others without checking lost-and-found first causes unnecessary conflict.",
                    "ur": "بغیر دیکھے دوسروں پر الزام لگانا درست نہیں۔",
                    "ur_rm": "Baghair check kiye doosron par blame lagana ghalat hai."
                }
            },
            {
                "id": "opt_cli_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I don't care about my school things anyway.",
                    "ur": "مجھے ویسے بھی اپنے اسکول کے سامان کی کوئی پرواہ نہیں۔",
                    "ur_rm": "Mujhe waise bhi school ki cheezon ki parwah nahi."
                },
                "feedback": {
                    "en": "Giving up prevents you from getting your important school materials back.",
                    "ur": "لاپرواہی ظاہر کرنے سے تعلیمی نقصان ہو سکتا ہے۔",
                    "ur_rm": "Care na karne se zaroori cheezein wapis nahi milti."
                }
            }
        ]
    },
    {
        "id": "scenario_new_person",
        "category": "peer_school",
        "title": {
            "en": "Meeting someone new",
            "ur": "نئے شخص سے تعارف",
            "ur_rm": "Naye shakhs se taaruf"
        },
        "description": {
            "en": "Practice introducing yourself and asking questions to meet a new person.",
            "ur": "اپنا تعارف کروانے اور نئے دوست سے سوالات پوچھنے کی مشق کریں۔",
            "ur_rm": "Apna introduction karwane aur naye dost se sawal poochne ki practice karein."
        },
        "aiRole": {
            "en": "Classmate",
            "ur": "ہم جماعت",
            "ur_rm": "Classmate"
        },
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "objectives": {
            "en": [
                "Say hello and introduce yourself by name",
                "Ask the other person their name",
                "Ask a friendly question about their hobbies or interests"
            ],
            "ur": [
                "سلام کریں اور اپنا نام بتائیں",
                "دوسرے فرد سے ان کا نام پوچھیں",
                "ان کے مشاغل کے بارے میں دوستانہ سوال کریں"
            ],
            "ur_rm": [
                "Greet karein aur apna naam batayein",
                "Doosre shakhs ka naam poochein",
                "Hobbies ya interests ke mutaliq friendly question poochein"
            ]
        },
        "context": "You are a new classmate or colleague. You are friendly, approachable, and open to making new friends. Act as the peer. Respond to introductions, share your name, and ask about their favorite hobbies.",
        "initialPrompt": {
            "en": "Hi! I don't think we've met before. I just joined this class/group. I'm Alex. What's your name?",
            "ur": "ہیلو! میرے خیال میں ہم پہلے نہیں ملے۔ میں نے ابھی یہ گروپ جوائن کیا ہے۔ میں الیکس ہوں۔ آپ کا نام کیا ہے؟",
            "ur_rm": "Hi! Mere khayal mein hum pehle nahi mile. Main ne abhi yeh group join kiya hai. Main Alex hoon. Aap ka naam kya hai?"
        },
        "options": [
            {
                "id": "opt_np_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Nice to meet you Alex! I'm Sam. Welcome to our class! What games or sports do you like?",
                    "ur": "آپ سے مل کر خوشی ہوئی الیکس! میرا نام سیم ہے۔ ہماری کلاس میں خوش آمدید! آپ کو کون سے کھیل پسند ہیں؟",
                    "ur_rm": "Nice to meet you Alex! Main Sam hoon. Welcome to our class! Aap ko kaun se games pasand hain?"
                },
                "feedback": {
                    "en": "Warm, introduces name, welcomes the peer, and asks a friendly hobby question.",
                    "ur": "بہترین! اپنا نام بتایا، خوش آمدید کہا اور مشاغل کے بارے میں دریافت کیا۔",
                    "ur_rm": "Warm welcome, apna naam bataya aur friendly hobby question poocha."
                }
            },
            {
                "id": "opt_np_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "I am Sam.",
                    "ur": "میرا نام سیم ہے۔",
                    "ur_rm": "Main Sam hoon."
                },
                "feedback": {
                    "en": "Shares your name, but asking a question back helps build friendship.",
                    "ur": "نام تو بتایا مگر بات آگے بڑھانے کے لیے کوئی سوال نہیں پوچھا۔",
                    "ur_rm": "Naam bataya magar follow-up question se baat cheet behtar hoti."
                }
            },
            {
                "id": "opt_np_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Why are you talking to me? Go away.",
                    "ur": "تم مجھ سے کیوں بات کر رہے ہو؟ یہاں سے جاؤ۔",
                    "ur_rm": "Tum mujh se kyun baat kar rahe ho? Chale jao."
                },
                "feedback": {
                    "en": "Harsh and hostile to a new person making a friendly introduction.",
                    "ur": "نئے ساتھی سے اس طرح سخت لہجے میں بات کرنا نامناسب ہے۔",
                    "ur_rm": "Naye classmate ke sath rude behavior nahi karna chahiye."
                }
            },
            {
                "id": "opt_np_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "My name is none of your business.",
                    "ur": "میرا نام جاننا تمہارا کام نہیں۔",
                    "ur_rm": "Mera naam janna tumhara kaam nahi."
                },
                "feedback": {
                    "en": "Rude response shuts down communication immediately.",
                    "ur": "اس جواب سے گفتگو کا راستہ بند ہو جاتا ہے۔",
                    "ur_rm": "Aisa jawab conversation ko stop kar deta hai."
                }
            }
        ]
    },

    # ==========================================
    # Teen Scenarios (EXACTLY 5 scenarios, Easy/Med/Chall)
    # ==========================================
    {
        "id": "scenario_group_discussion",
        "category": "peer_school",
        "title": {
            "en": "Joining a Group Discussion",
            "ur": "گروہی گفتگو میں شامل ہونا",
            "ur_rm": "Group discussion mein shamil hona"
        },
        "description": {
            "en": "Practice joining a classroom study group or project discussion politely.",
            "ur": "کلاس روم اسٹڈی گروپ یا پروجیکٹ گفتگو میں شائستگی سے شامل ہونے کی مشق کریں۔",
            "ur_rm": "Classroom study group ya project discussion mein politely join karne ki practice karein."
        },
        "aiRole": {
            "en": "Classmate",
            "ur": "ہم جماعت",
            "ur_rm": "Classmate"
        },
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": {
            "en": [
                "Ask politely if you can join the group",
                "Listen to the ongoing topic",
                "Share your ideas constructively"
            ],
            "ur": [
                "شائستگی سے گروپ میں شامل ہونے کی اجازت مانگیں",
                "چل رہے موضوع کو غور سے سنیں",
                "اپنے خیالات تعمیری انداز میں پیش کریں"
            ],
            "ur_rm": [
                "Politely group join karne ki request karein",
                "Ongoing topic ko active listen karein",
                "Constructive ideas share karein"
            ]
        },
        "context": "You are a friendly high-school classmate working on a study group discussion. Act as a welcoming peer.",
        "initialPrompt": {
            "en": "Hey! We are discussing ideas for the history project. Would you like to join our table?",
            "ur": "ارے! ہم تاریخ کے پروجیکٹ کے خیالات پر بات کر رہے ہیں۔ کیا آپ ہمارے ساتھ شامل ہونا چاہیں گے؟",
            "ur_rm": "Hey! Hum history project ke ideas discuss kar rahe hain. Kya aap humare table par join karna chahenge?"
        },
        "options": [
            {
                "id": "opt_gd_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Thanks! I'd love to join. Which topic or chapter are you guys focusing on first?",
                    "ur": "شکریہ! مجھے شامل ہو کر خوشی ہوگی۔ آپ سب پہلے کس عنوان یا باب پر توجہ دے رہے ہیں؟",
                    "ur_rm": "Thanks! Main zaroor join karna chahoonga. Aap log pehle kis topic par focus kar rahe hain?"
                },
                "feedback": {
                    "en": "Courteous acceptance and immediately asks about the team's current focus.",
                    "ur": "شائستہ قبولیت اور گروپ کے موجودہ کام میں فوری دلچسپی۔",
                    "ur_rm": "Polite acceptance aur team focus ke baare mein relevant sawal."
                }
            },
            {
                "id": "opt_gd_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Okay, I'll just sit here.",
                    "ur": "ٹھیک ہے، میں بس یہاں بیٹھ جاتا ہوں۔",
                    "ur_rm": "Theek hai, main bas yahan baith jata hoon."
                },
                "feedback": {
                    "en": "Accepts, but does not participate or engage with the discussion.",
                    "ur": "شامل تو ہوئے مگر گفتگو میں فعال حصہ نہیں لیا۔",
                    "ur_rm": "Join kiya magar discussion mein actively engage nahi kiya."
                }
            },
            {
                "id": "opt_gd_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Only if we do my idea. All your ideas are probably boring.",
                    "ur": "صرف تب اگر ہم میرا آئیڈیا کریں۔ آپ سب کے آئیڈیاز یقیناً بورنگ ہوں گے۔",
                    "ur_rm": "Sirf tab agar mera idea use karein. Aap sab ke ideas boring honge."
                },
                "feedback": {
                    "en": "Demanding control damages team collaboration before it even starts.",
                    "ur": "دوسروں کے خیالات کو نیچا دکھانا ٹیم ورک کے لیے نقصان دہ ہے۔",
                    "ur_rm": "Team collaboration mein control demand karna aur rude hona galat hai."
                }
            },
            {
                "id": "opt_gd_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "No, group projects are completely useless.",
                    "ur": "نہیں، گروپ پروجیکٹ بالکل فضول ہوتے ہیں۔",
                    "ur_rm": "Nahi, group projects bilkul useless hote hain."
                },
                "feedback": {
                    "en": "Negative attitude rejects social collaboration opportunities.",
                    "ur": "منفی رویہ اشتراک اور سیکھنے کے مواقع ختم کر دیتا ہے۔",
                    "ur_rm": "Negative attitude collaboration opportunities ko miss karwa deta hai."
                }
            }
        ]
    },
    {
        "id": "scenario_teen_express_pref",
        "category": "peer_school",
        "title": {
            "en": "Expressing Preferences in a Social Group",
            "ur": "دوستوں کے گروپ میں اپنی رائے اور پسند بتانا",
            "ur_rm": "Social group mein apni choice express karna"
        },
        "description": {
            "en": "Practice sharing your opinion and food/activity preferences politely with friends.",
            "ur": "دوستوں کے ساتھ شائستگی سے اپنی رائے اور سرگرمی کی ترجیحات بتانے کی مشق کریں۔",
            "ur_rm": "Friends ke sath politely apni opinion aur activity preferences share karne ki practice karein."
        },
        "aiRole": {
            "en": "Friend",
            "ur": "دوست",
            "ur_rm": "Friend"
        },
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": {
            "en": [
                "State your preference clearly without putting down others' choices",
                "Ask what everyone else would like to do",
                "Agree on a shared group plan"
            ],
            "ur": [
                "دوسروں کی پسند کو رد کیے بغیر اپنی ترجیح واضح کریں",
                "باقی دوستوں کی رائے معلوم کریں",
                "مشترکہ منصوبے پر متفق ہوں"
            ],
            "ur_rm": [
                "Doosron ki choice reject kiye baghair apni preference explain karein",
                "Baqi friends ka opinion poochein",
                "Shared plan par agree karein"
            ]
        },
        "context": "You are Tariq, a fun classmate planning a group lunch after school. You are asking your friend where they would like to eat.",
        "initialPrompt": {
            "en": "Hey! A few of us are grabbing lunch after school. Some want pizza and some want biryani. What are you in the mood for?",
            "ur": "ارے! ہم میں سے کچھ اسکول کے بعد لنچ کر رہے ہیں۔ کچھ پیزا اور کچھ بریانی کھانا چاہتے ہیں۔ آپ کا کیا موڈ ہے؟",
            "ur_rm": "Hey! Hum school ke baad lunch kar rahe hain. Kuch pizza aur kuch biryani chahte hain. Aap ka kya dil chah raha hai?"
        },
        "options": [
            {
                "id": "opt_ep_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "I'm leaning towards biryani, but I'm totally happy with pizza if most people prefer that!",
                    "ur": "میرا دل تو بریانی کا ہے، لیکن اگر زیادہ تر لوگ پیزا چاہیں تو میں خوشی سے راضی ہوں!",
                    "ur_rm": "Mera dil biryani ka hai, magar agar majority pizza chahe to main bilkul ready hoon!"
                },
                "feedback": {
                    "en": "Shares personal preference while remaining flexible and considerate of the group.",
                    "ur": "اپنی پسند بھی بتائی اور گروپ کے فیصلے میں لچک کا مظاہرہ کیا۔",
                    "ur_rm": "Apni choice share ki aur group consensus ke liye flexible rahe."
                }
            },
            {
                "id": "opt_ep_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Whatever you guys decide is fine.",
                    "ur": "جو بھی آپ لوگ فیصلہ کریں ٹھیک ہے۔",
                    "ur_rm": "Jo bhi aap log decide karein theek hai."
                },
                "feedback": {
                    "en": "Cooperative, but does not contribute your own opinion or preference.",
                    "ur": "تعاون تو ہے مگر اپنی کوئی پسند یا رائے ظاہر نہیں کی۔",
                    "ur_rm": "Agreeable hai magar apni preference share nahi ki."
                }
            },
            {
                "id": "opt_ep_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Biryani only. Anyone who wants pizza has terrible taste.",
                    "ur": "صرف بریانی۔ جو پیزا چاہتا ہے اس کا ذوق بہت خراب ہے۔",
                    "ur_rm": "Sirf biryani. Jo pizza chahta hai uska taste kharab hai."
                },
                "feedback": {
                    "en": "Insulting others' food choices creates unnecessary social tension.",
                    "ur": "دوسروں کی پسند کا مذاق اڑانا دوستی میں تلخی پیدا کرتا ہے۔",
                    "ur_rm": "Doosron ki food choice ka mazaq urana rude hai."
                }
            },
            {
                "id": "opt_ep_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I'm not coming because you guys can't even agree on food.",
                    "ur": "میں نہیں آ رہا کیونکہ آپ لوگ کھانے پر بھی متفق نہیں ہو سکتے۔",
                    "ur_rm": "Main nahi aa raha kyunki aap log food par bhi agree nahi kar sakte."
                },
                "feedback": {
                    "en": "Overreacting and pulling out of a normal friendly discussion.",
                    "ur": "چھوٹی سی بات پر دوستوں سے کٹ جانا مناسب نہیں۔",
                    "ur_rm": "Normal discussion par overreact kar ke drop out karna galat hai."
                }
            }
        ]
    },
    {
        "id": "scenario_teen_teacher_extension",
        "category": "peer_school",
        "title": {
            "en": "Requesting an Assignment Extension",
            "ur": "اسائنمنٹ کی تاریخ میں توسیع کی درخواست",
            "ur_rm": "Assignment deadline extension ki request"
        },
        "description": {
            "en": "Practice approaching your teacher respectfully to request a brief deadline extension.",
            "ur": "اساتذہ سے احترام کے ساتھ اسائنمنٹ کی تاریخ میں مختصر توسیع مانگنے کی مشق کریں۔",
            "ur_rm": "Teacher se respectfully assignment deadline extension request karne ki practice karein."
        },
        "aiRole": {
            "en": "Teacher",
            "ur": "استاد",
            "ur_rm": "Teacher"
        },
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "objectives": {
            "en": [
                "Greet your teacher politely after class",
                "State the assignment name and reason for requesting extra time",
                "Propose a specific realistic submission date (e.g. tomorrow afternoon)",
                "Thank the teacher regardless of decision"
            ],
            "ur": [
                "کلاس کے بعد استاد کو شائستگی سے سلام کریں",
                "اسائنمنٹ کا نام اور اضافی وقت کی معقول وجہ بتائیں",
                "جمع کروانے کا مخصوص وقت تجویز کریں (مثلاً کل دوپہر)",
                "فیصلے کے باوجود استاد کا شکریہ ادا کریں"
            ],
            "ur_rm": [
                "Class ke baad teacher ko politely greet karein",
                "Assignment name aur extra time ki genuine reason explain karein",
                "Specific submission deadline propose karein",
                "Decision ke baad teacher ka shukriya ada karein"
            ]
        },
        "context": "You are Mr. Harris, a thoughtful high school teacher. A student approaches you to discuss an upcoming assignment deadline. Be fair, listen to their reason, and approve a 24-hour extension if they ask politely.",
        "initialPrompt": {
            "en": "Hello! You wanted to speak with me after class about the history essay?",
            "ur": "ہیلو! آپ کلاس کے بعد ہسٹری مضمون کے حوالے سے مجھ سے بات کرنا چاہتے تھے؟",
            "ur_rm": "Hello! Aap class ke baad history essay ke silsilay mein baat karna chahte the?"
        },
        "options": [
            {
                "id": "opt_te_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Yes Mr. Harris, thank you for your time. Due to a family emergency yesterday, could I please submit my essay tomorrow by 4 PM?",
                    "ur": "جی سر ہیرس، وقت دینے کا شکریہ۔ کل خاندانی مجبوری کی وجہ سے، کیا میں اپنا مضمون کل شام 4 بجے تک جمع کرا سکتا ہوں؟",
                    "ur_rm": "Jee Mr. Harris, time dene ka shukriya. Family emergency ki wajah se kya main kal 4 PM tak essay submit kar sakta hoon?"
                },
                "feedback": {
                    "en": "Respectful, explains the reason clearly, and proposes a specific, realistic deadline.",
                    "ur": "انتہائی باوقار انداز، معقول وجہ اور جمع کروانے کا واضح وقت تجویز کیا۔",
                    "ur_rm": "Polite greeting, clear reason aur realistic time frame propose kiya."
                }
            },
            {
                "id": "opt_te_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "I couldn't finish the essay. Can I turn it in later this week?",
                    "ur": "میرا مضمون مکمل نہیں ہو سکا۔ کیا میں اس ہفتے بعد میں جمع کروا دوں؟",
                    "ur_rm": "Mera essay complete nahi hua. Kya main is week baad mein de doon?"
                },
                "feedback": {
                    "en": "Asks for extra time, but 'later this week' is too vague and lacks explanation.",
                    "ur": "درخواست تو کی مگر وقت غیر واضح ہے اور وجہ کی وضاحت کم ہے۔",
                    "ur_rm": "Deadline vague hai ('later this week'), specific time batana behtar hota."
                }
            },
            {
                "id": "opt_te_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "You gave us way too much homework so I didn't do it.",
                    "ur": "آپ نے بہت زیادہ ہوم ورک دیا تھا اس لیے میں نے نہیں کیا۔",
                    "ur_rm": "Aap ne bohot zyada homework diya tha is liye maine nahi kiya."
                },
                "feedback": {
                    "en": "Complaining aggressively to your teacher will not earn an extension.",
                    "ur": "استاد پر ہوم ورک کا الزام لگانا غیر مناسب اور غیر اخلاقی ہے۔",
                    "ur_rm": "Teacher par blame daalna disrespectful hai."
                }
            },
            {
                "id": "opt_te_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "Just give me full marks anyway.",
                    "ur": "بس آپ مجھے ویسے ہی پورے نمبر دے دیں۔",
                    "ur_rm": "Bas aap mujhe waise hi full marks de dein."
                },
                "feedback": {
                    "en": "Unrealistic and disrespectful demand.",
                    "ur": "یہ مطالبہ غیر اخلاقی اور ناقابل قبول ہے۔",
                    "ur_rm": "Yeh demand bilkul inappropriate hai."
                }
            }
        ]
    },
    {
        "id": "scenario_teen_peer_dispute",
        "category": "peer_school",
        "title": {
            "en": "Resolving a Team Project Disagreement",
            "ur": "ٹیم پروجیکٹ میں اختلاف رائے حل کرنا",
            "ur_rm": "Team project disagreement resolve karna"
        },
        "description": {
            "en": "Practice discussing differing ideas with a classmate calmly to reach a compromise.",
            "ur": "ہم جماعت کے ساتھ پرسکون انداز میں بات چیت کر کے باہمی سمجھوتے پر پہنچنے کی مشق کریں۔",
            "ur_rm": "Classmate ke sath calmly baat kar ke compromise reach karne ki practice karein."
        },
        "aiRole": {
            "en": "Classmate",
            "ur": "ہم جماعت",
            "ur_rm": "Classmate"
        },
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "challenging",
        "objectives": {
            "en": [
                "Acknowledge the other person's perspective respectfully",
                "Explain your viewpoint with calm rationale",
                "Propose a balanced compromise that combines both ideas"
            ],
            "ur": [
                "دوسرے فرد کے موقف کو احترام سے تسلیم کریں",
                "پرسکون دلائل کے ساتھ اپنا نکتہ نظر واضح کریں",
                "ایک متوازن سمجھوتہ تجویز کریں جو دونوں خیالات کو جوڑے"
            ],
            "ur_rm": [
                "Doosre person ka perspective respectfully acknowledge karein",
                "Calm logic ke sath apna viewpoint explain karein",
                "Dono ideas combine karne ka balanced compromise propose karein"
            ]
        },
        "context": "You are Maya, a classmate collaborating on a science fair poster. You wanted a digital presentation, while your partner prefers a physical trifold board. Be open to a good compromise.",
        "initialPrompt": {
            "en": "Hey, I really think we should do a slide presentation, but I know you wanted the poster board. What do you think we should do?",
            "ur": "ارے، میرے خیال میں سلائیڈ پریزنٹیشن بہتر ہے لیکن آپ پوسٹر بورڈ بنانا چاہتے تھے۔ آپ کا کیا خیال ہے کہ ہمیں کیا کرنا چاہیے؟",
            "ur_rm": "Hey, mujhe lagta hai slide presentation behtar hai magar aap poster board chahte the. Aap ka kya khayal hai?"
        },
        "options": [
            {
                "id": "opt_pd_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "I see your point! How about we create digital slides for the main presentation, and print the key charts for our table display?",
                    "ur": "میں آپ کا نکتہ سمجھتی ہوں! کیسا رہے گا اگر ہم پریزنٹیشن کے لیے ڈیجیٹل سلائیڈز بنائیں اور اہم چارٹس ٹیبل کے لیے پرنٹ کر لیں؟",
                    "ur_rm": "Aap ka point acha hai! Kaisa rahega agar hum slides banayein aur main charts table par print kar ke display karein?"
                },
                "feedback": {
                    "en": "Brilliant compromise that respects both perspectives and combines the strengths of both ideas.",
                    "ur": "شاندار سمجھوتہ جس میں دونوں کی رائے کا احترام اور خیالات کا بہترین امتزاج ہے۔",
                    "ur_rm": "Brilliant compromise, dono ideas ki strengths ko combine kiya."
                }
            },
            {
                "id": "opt_pd_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Fine, we will just do whatever you want then.",
                    "ur": "ٹھیک ہے، پھر جو آپ چاہیں وہی کر لیتے ہیں۔",
                    "ur_rm": "Theek hai, jo aap bolo wahi kar lete hain."
                },
                "feedback": {
                    "en": "Passive surrender avoids conflict but leaves you dissatisfied.",
                    "ur": "مکمل خاموشی اختیار کر کے دل چھوٹا کرنا تعمیری حل نہیں۔",
                    "ur_rm": "Passive surrender conflict avoid karta hai magar compromise nahi banta."
                }
            },
            {
                "id": "opt_pd_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Your idea is completely stupid and I'm not doing it.",
                    "ur": "آپ کا آئیڈیا بالکل بیکار ہے اور میں یہ نہیں کروں گا۔",
                    "ur_rm": "Aap ka idea bilkul bekaar hai aur main nahi karunga."
                },
                "feedback": {
                    "en": "Attacking your project partner escalates conflict and stops progress.",
                    "ur": "پارٹنر پر ذاتی حملہ کرنے سے کام رک جاتا ہے اور تعلقات خراب ہوتے ہیں۔",
                    "ur_rm": "Partner par insult karna conflict ko barhata hai."
                }
            },
            {
                "id": "opt_pd_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I'm telling the teacher to remove you from my group.",
                    "ur": "میں استاد سے کہہ کر آپ کو اپنے گروپ سے نکلوا رہا ہوں۔",
                    "ur_rm": "Main teacher se keh kar aap ko group se nikalwa raha hoon."
                },
                "feedback": {
                    "en": "Rushing to report disagreements without trying to talk first damages trust.",
                    "ur": "بات چیت کی کوشش کے بغیر شکایت کرنا ٹیم ورک کے خلاف ہے۔",
                    "ur_rm": "Baghair discussion ke teacher ko complain karna trust damage karta hai."
                }
            }
        ]
    },

    # ==========================================
    # Adult Scenarios (EXACTLY 5 scenarios, Easy/Med/Chall)
    # ==========================================
    {
        "id": "scenario_adult_pharmacy",
        "category": "everyday",
        "title": {
            "en": "Speaking to a Pharmacist About Medication",
            "ur": "فارماسسٹ سے ادویات کے بارے میں معلومات لینا",
            "ur_rm": "Pharmacist se medicine dosage aur timing poochna"
        },
        "description": {
            "en": "Practice asking a pharmacist about medicine dosages, meal timing, and side effects.",
            "ur": "فارماسسٹ سے دوا کی مقدار، کھانے کے اوقات اور احتیاطی تدابیر پوچھنے کی مشق کریں۔",
            "ur_rm": "Pharmacist se medicine dosage, timing aur meal precautions poochne ki practice karein."
        },
        "aiRole": {
            "en": "Pharmacist",
            "ur": "فارماسسٹ",
            "ur_rm": "Pharmacist"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": {
            "en": [
                "State the prescription or medication you are picking up",
                "Ask clearly whether to take it before or after meals",
                "Confirm how many times a day to take it and thank the pharmacist"
            ],
            "ur": [
                "نسخہ یا دوا کا نام بتائیں",
                "واضح پوچھیں کہ دوا کھانے سے پہلے لینی ہے یا بعد میں",
                "روزانہ کتنی بار لینی ہے معلوم کر کے شکریہ ادا کریں"
            ],
            "ur_rm": [
                "Prescription ya medicine ka naam batayein",
                "Khane se pehle ya baad mein lene ki timing poochein",
                "Daily dosage confirm kar ke thank you kahein"
            ]
        },
        "context": "You are a helpful and knowledgeable pharmacist at a community health clinic. A customer is picking up an allergy/pain prescription. Provide clear, supportive medication instructions.",
        "initialPrompt": {
            "en": "Hello! I have your prescription ready here. Do you have any questions about how to take this medication?",
            "ur": "ہیلو! آپ کی دوائی تیار ہے۔ کیا آپ کو اس دوائی کے استعمال کے بارے میں کوئی سوال پوچھنا ہے؟",
            "ur_rm": "Hello! Aap ki medicine ready hai. Kya aap ko iske use ke baare mein koi sawal poochna hai?"
        },
        "options": [
            {
                "id": "opt_ap_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Hello! Yes, should I take this tablet before or after meals, and how many times a day?",
                    "ur": "سلام! جی ہاں، کیا مجھے یہ گولی کھانے سے پہلے لینی چاہیے یا بعد میں، اور دن میں کتنی بار؟",
                    "ur_rm": "Hello! Jee haan, kya yeh tablet khane se pehle leni hai ya baad mein, aur din mein kitni baar?"
                },
                "feedback": {
                    "en": "Clear and specific questions covering timing and daily dosage.",
                    "ur": "بہترین اور واضح سوالات جو کھانے کے اوقات اور خوراک کا احاطہ کرتے ہیں۔",
                    "ur_rm": "Clear aur comprehensive question regarding timing aur dosage."
                }
            },
            {
                "id": "opt_ap_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Just give me the medicine, I'll figure it out.",
                    "ur": "بس دوا دے دیں، میں خود دیکھ لوں گا۔",
                    "ur_rm": "Bas medicine de dein, main khud dekh loonga."
                },
                "feedback": {
                    "en": "Skipping clarification from the pharmacist risks incorrect medication use.",
                    "ur": "ہدایات نہ لینے سے دوا کے غلط استعمال کا خطرہ رہتا ہے۔",
                    "ur_rm": "Instructions na lene se wrong dosage ka risk rehta hai."
                }
            },
            {
                "id": "opt_ap_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Why does this medicine cost so much? You are overcharging me.",
                    "ur": "یہ دوا اتنی مہنگی کیوں ہے؟ آپ مجھ سے زیادہ پیسے لے رہے ہیں۔",
                    "ur_rm": "Yeh medicine itni expensive kyun hai? Aap overcharge kar rahe hain."
                },
                "feedback": {
                    "en": "Accusing the dispenser pharmacist creates tension instead of asking about generic alternatives.",
                    "ur": "الزام تراشی کے بجائے متبادل دوا کے بارے میں پوچھنا زیادہ مناسب طریقہ ہے۔",
                    "ur_rm": "Accuse karne ke bajaye generic alternative pooch sakte hain."
                }
            },
            {
                "id": "opt_ap_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I'll take 5 pills at once so I get better faster.",
                    "ur": "میں ایک ساتھ 5 گولیاں کھا لوں گا تاکہ جلدی ٹھیک ہو جاؤں۔",
                    "ur_rm": "Main 5 tablets ek sath le loonga taake jaldi theek ho jaon."
                },
                "feedback": {
                    "en": "Dangerous! Never exceed prescribed dosages.",
                    "ur": "انتہائی خطرناک! تجویز کردہ مقدار سے زیادہ دوا ہرگز نہ لیں۔",
                    "ur_rm": "Bohot dangerous! Dosage limits cross nahi karni chahiye."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_doctor_appointment",
        "category": "everyday",
        "title": {
            "en": "Booking & Rescheduling a Medical Appointment",
            "ur": "ڈاکٹر کے ساتھ ملاقات کا وقت طے کرنا",
            "ur_rm": "Doctor appointment schedule ya reschedule karna"
        },
        "description": {
            "en": "Practice scheduling a routine doctor checkup and communicating preferred time slots.",
            "ur": "ڈاکٹر سے معائنے کا وقت طے کرنے اور اپنی پسند کے اوقات بتانے کی مشق کریں۔",
            "ur_rm": "Doctor checkup appointment schedule karne aur preferred time slots communicate karne ki practice karein."
        },
        "aiRole": {
            "en": "Clinic Receptionist",
            "ur": "کلینک ریسیپشنسٹ",
            "ur_rm": "Clinic Receptionist"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "objectives": {
            "en": [
                "State your full name and the doctor or department you wish to visit",
                "Specify your preferred days or morning/evening time preferences",
                "Confirm the date, time, and clinic room before concluding"
            ],
            "ur": [
                "اپنا نام اور مطلوبہ ڈاکٹر یا شعبہ بتائیں",
                "اپنی ترجیحی تاریخ اور صبح یا شام کا وقت بتائیں",
                "رخصت ہونے سے پہلے تاریخ اور وقت کی تصدیق کریں"
            ],
            "ur_rm": [
                "Apna full name aur doctor/department batayein",
                "Preferred day aur morning/evening time specify karein",
                "Date aur time confirm kar ke conclude karein"
            ]
        },
        "context": "You are the medical receptionist at City Health Clinic. Help the patient book an appointment with Dr. Malik for next week.",
        "initialPrompt": {
            "en": "Good afternoon, City Health Clinic. Are you looking to schedule an appointment today?",
            "ur": "سٹی ہیلتھ کلینک میں خوش آمدید۔ کیا آپ آج ڈاکٹر سے ملنے کا وقت طے کرنا چاہتے ہیں؟",
            "ur_rm": "City Health Clinic mein khush aamdeed. Kya aap appointment schedule karwana chahte hain?"
        },
        "options": [
            {
                "id": "opt_da_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Good afternoon. Yes, I'd like to book an appointment with Dr. Malik for next Thursday morning if available.",
                    "ur": "دوپہر بخیر۔ جی ہاں، میں ڈاکٹر ملک کے پاس اگلے جمعرات کی صبح کا وقت بک کروانا چاہتا ہوں۔",
                    "ur_rm": "Good afternoon. Jee haan, main Dr. Malik ke paas next Thursday morning appointment book karwana chahta hoon."
                },
                "feedback": {
                    "en": "Polite, names the specific doctor, and specifies a clear day and time slot.",
                    "ur": "شائستہ انداز، ڈاکٹر کا نام اور ترجیحی دن اور وقت کی واضح نشاندہی۔",
                    "ur_rm": "Polite greeting, doctor name aur specific time slot clearly mentioned."
                }
            },
            {
                "id": "opt_da_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "I need to see a doctor sometime next week.",
                    "ur": "مجھے اگلے ہفتے کسی وقت ڈاکٹر کو دکھانا ہے۔",
                    "ur_rm": "Mujhe next week kisi time doctor ko dikhana hai."
                },
                "feedback": {
                    "en": "Understood, but specifying the doctor and preferred morning/afternoon helps book faster.",
                    "ur": "بات واضح ہے مگر مخصوص ڈاکٹر اور وقت بتانے سے کام جلدی ہوتا ہے۔",
                    "ur_rm": "General statement hai, specific doctor aur slot mention karna behtar hota."
                }
            },
            {
                "id": "opt_da_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "I want to see the doctor right now without any appointment.",
                    "ur": "مجھے بغیر کسی اپوائنٹمنٹ کے ابھی ڈاکٹر سے ملنا ہے۔",
                    "ur_rm": "Mujhe abhi baghair appointment ke doctor se milna hai."
                },
                "feedback": {
                    "en": "Clinics operate on schedules; demanding immediate entry disrupts patient queues.",
                    "ur": "کلینک شیڈول کے مطابق چلتے ہیں، بغیر وقت طے کیے فوری اصرار نامناسب ہے۔",
                    "ur_rm": "Clinics schedule follow karte hain, queue bypass demand karna theek nahi."
                }
            },
            {
                "id": "opt_da_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "Book me for yesterday at 10 AM.",
                    "ur": "میرا وقت کل گزرے ہوئے دن کے لیے طے کر دیں۔",
                    "ur_rm": "Mera time kal guzre hue din ka fix kar dein."
                },
                "feedback": {
                    "en": "Appointments cannot be scheduled for past dates.",
                    "ur": "گزری ہوئی تاریخ پر اپوائنٹمنٹ طے نہیں ہو سکتی۔",
                    "ur_rm": "Past dates par appointment schedule nahi ho sakti."
                }
            }
        ]
    },
    {
        "id": "scenario_manager_clarification",
        "category": "workplace",
        "title": {
            "en": "Asking Manager for Task Clarification",
            "ur": "مینیجر سے کام کی تفصیلات پر رہنمائی لینا",
            "ur_rm": "Manager se task clarification aur priorities poochna"
        },
        "description": {
            "en": "Practice asking a supervisor for clear guidance and priorities on a work task.",
            "ur": "کام کے متعلق سپروائزر سے واضح ہدایات اور ترجیحات معلوم کرنے کی مشق کریں۔",
            "ur_rm": "Work task par supervisor se clear guidance aur priorities confirm karne ki practice karein."
        },
        "aiRole": {
            "en": "Manager",
            "ur": "مینیجر",
            "ur_rm": "Manager"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "objectives": {
            "en": [
                "Greet your manager professionally",
                "State the specific task or question clearly",
                "Confirm next steps before finishing"
            ],
            "ur": [
                "مینیجر کو پیشہ ورانہ انداز میں سلام کریں",
                "مخصوص کام یا سوال واضح طور پر پیش کریں",
                "بات مکمل کرنے سے پہلے اگلے اقدامات کی تصدیق کریں"
            ],
            "ur_rm": [
                "Manager ko professionally greet karein",
                "Specific task ya question clearly state karein",
                "Conclude karne se pehle next steps confirm karein"
            ]
        },
        "context": "You are a busy but supportive department supervisor at work. A team member approaches you to clarify task priorities.",
        "initialPrompt": {
            "en": "Good morning! How can I help you with today's project tasks?",
            "ur": "صبح بخیر! آج کے دفتری کاموں کے سلسلے میں، میں آپ کی کیا مدد کر سکتا ہوں؟",
            "ur_rm": "Good morning! Aaj ke tasks ke silsilay mein main aap ki kya madad kar sakta hoon?"
        },
        "options": [
            {
                "id": "opt_mc_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Good morning! I have drafted the client summary. Could you clarify whether I should prioritize the financial charts or the executive brief first?",
                    "ur": "صبح بخیر! میں نے کلائنٹ سمری کا مسودہ تیار کر لیا ہے۔ کیا آپ واضح کر سکتے ہیں کہ مجھے پہلے مالیاتی چارٹس پر کام کرنا چاہیے یا ایگزیکٹو بریف پر؟",
                    "ur_rm": "Good morning! Main ne client summary draft kar li hai. Kya aap clarify kar sakte hain ke pehle financial charts complete karoon ya executive brief?"
                },
                "feedback": {
                    "en": "Professional, highlights progress made, and asks a direct priority question.",
                    "ur": "پیشہ ورانہ انداز، پیشرفت کی اطلاع اور ترجیح سے متعلق واضح سوال۔",
                    "ur_rm": "Professional approach, progress update aur clear priority question."
                }
            },
            {
                "id": "opt_mc_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "I don't know what to work on next.",
                    "ur": "مجھے نہیں معلوم کہ اب آگے کیا کام کرنا ہے۔",
                    "ur_rm": "Mujhe nahi pata aage kya kaam karna hai."
                },
                "feedback": {
                    "en": "States the issue, but bringing specific options makes you look more prepared.",
                    "ur": "بات واضح کی مگر مخصوص آپشنز ساتھ لانا زیادہ پیشہ ورانہ ہوتا ہے۔",
                    "ur_rm": "Direct issue hai magar prepared options present karna zyada professional hota."
                }
            },
            {
                "id": "opt_mc_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Your project instructions made no sense at all.",
                    "ur": "آپ کی دی ہوئی ہدایات بالکل بے معنی تھیں۔",
                    "ur_rm": "Aap ki instructions bilkul bekaar aur confusing theen."
                },
                "feedback": {
                    "en": "Attacking instructions damages professional standing. Ask clarifying questions instead.",
                    "ur": "تنقید کے بجائے وضاحت طلب کرنا پیشہ ورانہ طریقہ ہے۔",
                    "ur_rm": "Hostile tone use karne ke bajaye respectful clarification mangna chahiye."
                }
            },
            {
                "id": "opt_mc_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I decided to delete the whole project report.",
                    "ur": "میں نے سارا پروجیکٹ رپورٹ ڈیلیٹ کرنے کا فیصلہ کیا ہے۔",
                    "ur_rm": "Main ne poori project report delete kar di."
                },
                "feedback": {
                    "en": "Deleting workplace assets causes serious disruptions.",
                    "ur": "دفتری کام ضائع کرنا سنگین غلطی ہے۔",
                    "ur_rm": "Workplace data delete karna severe error hai."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_colleague_shift",
        "category": "workplace",
        "title": {
            "en": "Requesting a Shift Swap with a Coworker",
            "ur": "ساتھی ملازم سے شفٹ تبدیل کرنے کی درخواست",
            "ur_rm": "Coworker se shift exchange / swap request karna"
        },
        "description": {
            "en": "Practice asking a coworker politely to exchange work shifts due to a family appointment.",
            "ur": "ذاتی کام کے باعث ساتھی ملازم سے شائستگی کے ساتھ ڈیوٹی کی شفٹ تبدیل کرنے کی مشق کریں۔",
            "ur_rm": "Family commitment ke liye coworker se politely shift swap request karne ki practice karein."
        },
        "aiRole": {
            "en": "Colleague",
            "ur": "ساتھی ملازم",
            "ur_rm": "Colleague"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "objectives": {
            "en": [
                "Greet your colleague politely",
                "Explain the specific shift you need covered and propose an alternative shift you can work for them",
                "Express gratitude and confirm you will inform the shift supervisor together"
            ],
            "ur": [
                "ساتھی ملازم کو شائستگی سے سلام کریں",
                "مخصوص شفٹ اور اس کے بدلے اپنی پیشکش واضح کریں",
                "شکریہ ادا کریں اور سپروائزر کو مطلع کرنے کی تصدیق کریں"
            ],
            "ur_rm": [
                "Colleague ko politely greet karein",
                "Specific shift swap aur return shift offer clearly explain karein",
                "Shukriya ada karein aur supervisor ko inform karne ka mention karein"
            ]
        },
        "context": "You are Sameer, a friendly coworker on the customer service team. A colleague approaches you to ask if you can switch your Thursday evening shift with their Friday shift.",
        "initialPrompt": {
            "en": "Hi! How is your day going? You mentioned you wanted to check something about the work schedule?",
            "ur": "ہیلو! آپ کا دن کیسا گزر رہا ہے؟ آپ نے کہا تھا کہ کام کے شیڈول کے بارے میں کچھ بات کرنی ہے؟",
            "ur_rm": "Hi! Aap ka din kaisa guzar raha hai? Aap ne schedule ke mutaliq baat karni thi?"
        },
        "options": [
            {
                "id": "opt_cs_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Hi Sameer! Thanks for checking in. I have a medical appointment this Friday. Would you be open to swapping your Thursday evening shift with my Friday shift?",
                    "ur": "ہیلو سمیر! بات کرنے کا شکریہ۔ اس جمعہ کو میرا میڈیکل چیک اپ ہے۔ کیا آپ جمعرات کی اپنی شفٹ میری جمعہ کی شفٹ سے تبدیل کر سکتے ہیں؟",
                    "ur_rm": "Hi Sameer! Thanks for checking in. Meri Friday ko medical appointment hai. Kya aap Thursday evening shift mere Friday shift ke sath swap kar sakte hain?"
                },
                "feedback": {
                    "en": "Courteous, explains the reason honestly, and offers an exact, fair shift in return.",
                    "ur": "شائستہ انداز، ایمانداری سے وجہ کی وضاحت اور بدلے میں مناسب متبادل پیش کیا۔",
                    "ur_rm": "Polite greeting, honest reason aur fair mutual shift offer."
                }
            },
            {
                "id": "opt_cs_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Can you work for me on Friday? I'm busy.",
                    "ur": "کیا آپ جمعہ کو میری جگہ کام کر سکتے ہیں؟ میں مصروف ہوں۔",
                    "ur_rm": "Kya aap Friday ko mere liye shift kar sakte hain? Main busy hoon."
                },
                "feedback": {
                    "en": "Asks for coverage, but offering a specific shift in return makes it much more appealing.",
                    "ur": "مدد مانگی مگر بدلے میں اپنی کوئی پیشکش نہیں رکھی۔",
                    "ur_rm": "Direct request hai magar return shift offer karna mutual benefit deta hai."
                }
            },
            {
                "id": "opt_cs_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "You have to take my Friday shift because you owe me a favor.",
                    "ur": "آپ کو میری جمعہ کی شفٹ لینی پڑے گی کیونکہ مجھ پر آپ کا احسان بنتا ہے۔",
                    "ur_rm": "Aap ko meri Friday shift leni paregi kyunki aap par mera favour banta hai."
                },
                "feedback": {
                    "en": "Pressuring colleagues harms team trust and workplace camaraderie.",
                    "ur": "ساتھی ملازم پر دباؤ ڈالنا تعلقات کو نقصان پہنچاتا ہے۔",
                    "ur_rm": "Colleague par pressure daalna teamwork spoil karta hai."
                }
            },
            {
                "id": "opt_cs_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I'm just going to skip work without telling anyone.",
                    "ur": "میں بس کسی کو بتائے بغیر چھٹی کر لوں گا۔",
                    "ur_rm": "Main baghair bataye duty par nahi aaonga."
                },
                "feedback": {
                    "en": "Unannounced absences risk formal workplace disciplinary action.",
                    "ur": "بغیر اطلاع غیر حاضری سے ملازمت کو نقصان پہنچ سکتا ہے۔",
                    "ur_rm": "Baghair intimation absence lena disciplinary action cause karta hai."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_customer_support",
        "category": "everyday",
        "title": {
            "en": "Calling Customer Support About Billing Discrepancy",
            "ur": "بلنگ کی غلطی پر کسٹمر سپورٹ سے رابطہ کرنا",
            "ur_rm": "Customer support se billing discrepancy resolve karwana"
        },
        "description": {
            "en": "Practice resolving an unexpected utility/internet charge over the phone calmly and assertively.",
            "ur": "فون پر انٹرنیٹ یا بل کے غیر متوقع چارجز کے حل کے لیے پرسکون اور مدلل گفتگو کی مشق کریں۔",
            "ur_rm": "Phone par internet ya utility bill charges discrepancy ko calmly aur assertively resolve karne ki practice karein."
        },
        "aiRole": {
            "en": "Support Agent",
            "ur": "کسٹمر سپورٹ نمائندہ",
            "ur_rm": "Support Agent"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "challenging",
        "objectives": {
            "en": [
                "Provide your account number and state the issue concisely",
                "Explain that the extra charge was unrequested and ask for an invoice adjustment",
                "Note down the representative's confirmation / reference number politely"
            ],
            "ur": [
                "اکاؤنٹ نمبر فراہم کریں اور مسئلہ مختصر بیان کریں",
                "واضح کریں کہ اضافی فیس بلا اجازت تھی اور بل کی درستگی کی درخواست کریں",
                "نمائندے سے تصدیقی ریفرنس نمبر نوٹ کر کے شکریہ ادا کریں"
            ],
            "ur_rm": [
                "Account number provide karein aur issue concise explain karein",
                "Extra charge ki adjustment request karein",
                "Reference confirmation number note kar ke thank you kahein"
            ]
        },
        "context": "You are Sarah, a customer service representative at an internet utility provider. A customer calls regarding a Rs. 1,500 add-on fee on their latest invoice. Be professional and offer to reverse the fee.",
        "initialPrompt": {
            "en": "Thank you for calling FastNet Support. My name is Sarah. How can I assist you with your account today?",
            "ur": "فاسٹ نیٹ سپورٹ پر کال کرنے کا شکریہ۔ میرا نام سارہ ہے۔ میں آج آپ کے اکاؤنٹ کے سلسلے میں کیا مدد کر سکتی ہوں؟",
            "ur_rm": "FastNet Support par call karne ka shukriya. Mera naam Sarah hai. Main aaj aap ki kya madad kar sakti hoon?"
        },
        "options": [
            {
                "id": "opt_cs_bill_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Hello Sarah, my account number is FN-8821. I noticed an extra Rs. 1,500 add-on charge on my latest invoice that I did not subscribe to. Could you please look into adjusting this charge?",
                    "ur": "ہیلو سارہ، میرا اکاؤنٹ نمبر FN-8821 ہے۔ میں نے اپنے تازہ ترین بل میں 1500 روپے کا اضافی چارج دیکھا ہے جس کی میں نے درخواست نہیں کی تھی۔ کیا آپ اس چارج کو درست کر سکتی ہیں؟",
                    "ur_rm": "Hello Sarah, mera account number FN-8821 hai. Mere latest bill mein Rs. 1,500 ka extra charge add hua hai jo maine subscribe nahi kiya tha. Kya aap ise adjust kar sakti hain?"
                },
                "feedback": {
                    "en": "Calm, provides the account number immediately, and states the exact discrepancy clearly.",
                    "ur": "انتہائی پرسکون اور مدلل انداز، اکاؤنٹ نمبر اور درست مسئلہ فوری واضح کیا۔",
                    "ur_rm": "Calm and assertive, account ID provide kiya aur exact dispute explain kiya."
                }
            },
            {
                "id": "opt_cs_bill_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "My bill is too high this month. Fix it please.",
                    "ur": "اس مہینے میرا بل بہت زیادہ آیا ہے۔ برائے مہربانی اسے ٹھیک کریں۔",
                    "ur_rm": "Mera bill is month zyada aya hai. Fix karein please."
                },
                "feedback": {
                    "en": "States a problem, but providing your account number and the exact charge expedites help.",
                    "ur": "مسئلہ بتایا مگر اکاؤنٹ نمبر اور مخصوص فیس کی تفصیلات غائب ہیں۔",
                    "ur_rm": "Vague hai, account number aur exact amount specify karna fast resolution deta hai."
                }
            },
            {
                "id": "opt_cs_bill_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Your company is full of thieves stealing my money!",
                    "ur": "آپ کی کمپنی چور ہے جو میرے پیسے چرا رہی ہے!",
                    "ur_rm": "Aap ki company fraud hai jo mere paise loot rahi hai!"
                },
                "feedback": {
                    "en": "Verbal hostility makes representatives defensive and slows down support.",
                    "ur": "بدزبانی سے معاملہ حل ہونے کے بجائے الجھ جاتا ہے۔",
                    "ur_rm": "Hostile language resolution ko delay karti hai."
                }
            },
            {
                "id": "opt_cs_bill_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I'm calling the police right now on you.",
                    "ur": "میں ابھی آپ پر پولیس کو کال کر رہا ہوں۔",
                    "ur_rm": "Main abhi aap ke khilaf police call kar raha hoon."
                },
                "feedback": {
                    "en": "Billing disputes are handled through utility customer service, not emergency services.",
                    "ur": "بلنگ کے معاملات کسٹمر سپورٹ کے ذریعے حل ہوتے ہیں، پولیس کی کال نامناسب ہے۔",
                    "ur_rm": "Billing disputes customer support se solve hote hain, emergency lines par nahi."
                }
            }
        ]
    },
# ==========================================
    # Additional Adult Workplace & Everyday Scenarios
    # ==========================================
    {
        "id": "scenario_adult_job_interview",
        "title": {
            "en": "Job Interview: Answering Questions & Sharing Strengths",
            "ur": "ملازمت کا انٹرویو: سوالات کے جوابات اور صلاحیتوں کا اظہار",
            "ur_rm": "Job Interview: Sawalat ke jawabat aur strengths share karna"
        },
        "description": {
            "en": "Practice answering common job interview questions with calm confidence, highlighting your skills and enthusiasm.",
            "ur": "پرسکون اعتماد کے ساتھ ملازمت کے انٹرویو کے سوالات کے جوابات دینے اور اپنی مہارتیں بیان کرنے کی مشق کریں۔",
            "ur_rm": "Confidence ke sath job interview questions answer karne aur skills highlight karne ki practice karein."
        },
        "aiRole": {
            "en": "Hiring Manager",
            "ur": "بھرتی مینیجر (انٹرویو لینے والا)",
            "ur_rm": "Hiring Manager"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "category": "workplace",
        "objectives": {
            "en": [
                "Greet the interviewer professionally",
                "Answer questions about your background concisely",
                "Highlight one key strength and ask a thoughtful question"
            ],
            "ur": [
                "انٹرویو لینے والے کو پیشہ ورانہ انداز میں سلام کریں",
                "اپنے تجربے سے متعلق سوالات کا جامع جواب دیں",
                "اپنی ایک اہم صلاحیت واضح کریں اور متعلقہ سوال پوچھیں"
            ],
            "ur_rm": [
                "Interviewer ko professionally greet karein",
                "Background aur experience ka concise jawab dein",
                "Apni aik key strength highlight karein"
            ]
        },
        "context": "You are a professional, courteous hiring manager interviewing a candidate for an administrative and support role. Maintain an encouraging yet realistic workplace interview tone.",
        "initialPrompt": {
            "en": "Good morning. Thank you for joining us today! To begin, could you tell me a little bit about yourself and why you are interested in this role?",
            "ur": "صبح بخیر! آج ہمارے ساتھ شامل ہونے کا شکریہ۔ شروع کرنے کے لیے کیا آپ ہمیں اپنے بارے میں اور اس ملازمت میں دلچسپی کی وجہ بتا سکتے ہیں؟",
            "ur_rm": "Good morning! Aaj humein join karne ka shukriya. Shuru karne ke liye kya aap apne bare mein aur is role mein interest ki wajah bata sakte hain?"
        },
        "options": [
            {
                "id": "opt_ji_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Good morning! I have experience in organized teamwork and attention to detail. I'm excited about this role because I enjoy structured problem-solving and helping team members succeed.",
                    "ur": "صبح بخیر! مجھے منظم ٹیم ورک اور باریک بینی سے کام کرنے کا تجربہ ہے۔ میں اس ملازمت کے لیے پُرجوش ہوں کیونکہ مجھے مسائل حل کرنا اور ٹیم کا ہاتھ بٹانا پسند ہے۔",
                    "ur_rm": "Good morning! Mujhe organized teamwork aur detail-oriented tasks ka experience hai. Main is role ke liye excited hoon kyunki mujhe problem-solving pasand hai."
                },
                "feedback": {
                    "en": "Polite, focused, and directly connects your personal strengths to the role.",
                    "ur": "شائستہ، بااعتماد اور ذاتی صلاحیتوں کا ملازمت سے بہترین ربط۔",
                    "ur_rm": "Polite greeting aur strong, relevant strength statement."
                }
            },
            {
                "id": "opt_ji_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "I need a job right now, and this one looked okay on the job board.",
                    "ur": "مجھے اس وقت نوکری کی ضرورت تھی، اور یہ اشتہار اچھا لگا تھا۔",
                    "ur_rm": "Mujhe job ki zaroorat thi is liye apply kiya."
                },
                "feedback": {
                    "en": "Honest, but focuses on personal financial need rather than how your skills fit the company.",
                    "ur": "سچائی ہے مگر ادارے کے مفاد اور اپنی صلاحیتوں کے بجائے صرف اپنی ضرورت پر توجہ ہے۔",
                    "ur_rm": "Thora professional tone aur skills ka zikr hona behtar hota."
                }
            },
            {
                "id": "opt_ji_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "My last boss was impossible to work with, so I had to leave immediately.",
                    "ur": "میرا پچھلا باس بالکل کام کے قابل نہیں تھا، اس لیے مجھے چھوڑنا پڑا۔",
                    "ur_rm": "Mera purana boss bohot bura tha is liye chorna para."
                },
                "feedback": {
                    "en": "Criticizing past employers in an interview creates a negative impression.",
                    "ur": "سابقہ ملازمین یا مالکان پر تنقید انٹرویو میں منفی تاثر قائم کرتی ہے۔",
                    "ur_rm": "Past employers par negative comment interview mein avoid karein."
                }
            },
            {
                "id": "opt_ji_4",
                "type": "incorrect",
                "score": 15,
                "text": {
                    "en": "I don't really have anything to say. You can just read my resume.",
                    "ur": "میرے پاس بتانے کو کچھ نہیں ہے، آپ میری سی وی دیکھ سکتے ہیں۔",
                    "ur_rm": "Mere paas kuch kehne ko nahi hai, CV dekh lein."
                },
                "feedback": {
                    "en": "Interviewers expect verbal engagement and personal communication.",
                    "ur": "انٹرویو لینے والا زبانی گفتگو اور دلچسپی کا خواہشمند ہوتا ہے۔",
                    "ur_rm": "Direct refusal to speak creates poor engagement."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_workplace_meeting",
        "title": {
            "en": "Active Participation in a Workplace Meeting",
            "ur": "دفتری میٹنگ میں فعال اور مثبت شرکت",
            "ur_rm": "Workplace meeting mein active aur positive participation"
        },
        "description": {
            "en": "Practice contributing an update, asking for clarification on agenda points, and confirming next steps in a team meeting.",
            "ur": "ٹیم میٹنگ میں اپنے کام کی پیشرفت شیئر کرنے اور آئندہ اقدامات کی تصدیق کرنے کی مشق کریں۔",
            "ur_rm": "Team meeting mein update share karne aur next steps clarify karne ki practice karein."
        },
        "aiRole": {
            "en": "Meeting Facilitator",
            "ur": "میٹنگ انچارج",
            "ur_rm": "Meeting Facilitator"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "category": "workplace",
        "objectives": {
            "en": [
                "Provide a clear status update on your assigned task",
                "Confirm deadlines and expectations respectfully",
                "Offer assistance or ask for necessary resources"
            ],
            "ur": [
                "سونپے گئے کام کی واضح پیشرفت پیش کریں",
                "وقت کی پابندی اور اہداف کی تصدیق کریں",
                "ضروری وسائل یا رہنمائی طلب کریں"
            ],
            "ur_rm": [
                "Task ki clear status update dein",
                "Deadlines confirm karein",
                "Required support ya resources mention karein"
            ]
        },
        "context": "You are chairing a weekly project team meeting. You invite each team member to report on their progress and surface any blockers.",
        "initialPrompt": {
            "en": "Thanks for being here everyone. Let's do a quick round of updates. How are things progressing with your assigned weekly deliverables?",
            "ur": "تمام احباب کا شکریہ۔ آئیے جلدی سے کام کی پیشرفت کا جائزہ لیں۔ اس ہفتے کے سونپے گئے کاموں کی کیا صورتحال ہے؟",
            "ur_rm": "Thanks everyone for joining. Quick round of updates karte hain. Is week ke assigned tasks ki kya progress hai?"
        },
        "options": [
            {
                "id": "opt_wm_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "I've completed the preliminary documentation and sent it for review. If approved by Thursday, I will finalize the reports on Friday as scheduled.",
                    "ur": "میں نے ابتدائی دستاویزات مکمل کر کے نظرثانی کے لیے بھیج دی ہیں۔ جمعرات تک منظوری ملنے پر جمعہ کو حتمی رپورٹ تیار ہو جائے گی۔",
                    "ur_rm": "Preliminary documentation complete ho chuki hai. Thursday tak approval milne par Friday ko final report ready hogi."
                },
                "feedback": {
                    "en": "Crisp, factual update with a clear timeline and dependencies stated.",
                    "ur": "بہترین، واضح اور وقت کے تعین کے ساتھ پیشرفت کا جامع اظہار۔",
                    "ur_rm": "Clear status update with realistic timeline and dependency."
                }
            },
            {
                "id": "opt_wm_2",
                "type": "weaker",
                "score": 70,
                "text": {
                    "en": "I'm still working on it. It will be done whenever I finish.",
                    "ur": "میں ابھی کام کر رہا ہوں۔ جب مکمل ہوگا تب مل جائے گا۔",
                    "ur_rm": "Main kaam kar raha hoon, jab khatam hoga de doonga."
                },
                "feedback": {
                    "en": "Lacks specific progress markers or expected completion timelines.",
                    "ur": "پیشرفت کی تفصیل اور متوقع وقت کی وضاحت موجود نہیں۔",
                    "ur_rm": "Vague timeline makes it hard for team coordination."
                }
            },
            {
                "id": "opt_wm_3",
                "type": "inappropriate",
                "score": 35,
                "text": {
                    "en": "Why are we having so many meetings? This is wasting my time.",
                    "ur": "اتنی میٹنگز کیوں ہوتی ہیں؟ یہ میرے وقت کا ضیاع ہے۔",
                    "ur_rm": "Itni meetings kyun hoti hain? Time waste ho raha hai."
                },
                "feedback": {
                    "en": "Constructive feedback on meeting frequency is best handled separately with leadership.",
                    "ur": "میٹنگ کے طریقہ کار پر بات الگ سے مینیجر کے ساتھ شائستگی سے کرنی چاہیے۔",
                    "ur_rm": "Disruptive in a group status update."
                }
            },
            {
                "id": "opt_wm_4",
                "type": "incorrect",
                "score": 10,
                "text": {
                    "en": "[Say nothing and remain silent on mute]",
                    "ur": "[خاموش رہیں اور مائیک بند رکھیں]",
                    "ur_rm": "[Khamosh rahein aur jawab na dein]"
                },
                "feedback": {
                    "en": "Active participation requires speaking up when your status is called.",
                    "ur": "میٹنگ میں باری آنے پر جواب دینا پیشہ ورانہ ذمہ داری ہے۔",
                    "ur_rm": "Failing to acknowledge questions halts meeting flow."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_workplace_disagreement",
        "title": {
            "en": "Resolving a Workplace Disagreement Professionally",
            "ur": "دفتر میں اختلاف رائے کا پیشہ ورانہ اور پرسکون حل",
            "ur_rm": "Workplace disagreement ko professionally aur calm tareeqay se resolve karna"
        },
        "description": {
            "en": "Practice de-escalating a disagreement with a colleague over project responsibilities while staying calm and constructive.",
            "ur": "منصوبے کی ذمہ داریوں پر ساتھی کے ساتھ اختلاف کو پرسکون اور مثبت انداز میں حل کرنے کی مشق کریں۔",
            "ur_rm": "Project responsibilities par colleague ke sath dispute ko calmly aur constructively solve karein."
        },
        "aiRole": {
            "en": "Project Colleague",
            "ur": "دفتری ساتھی",
            "ur_rm": "Project Colleague"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "challenging",
        "category": "workplace",
        "objectives": {
            "en": [
                "Acknowledge the colleague's perspective calmly",
                "Express your point of view without assigning blame",
                "Propose a shared compromise or manager alignment"
            ],
            "ur": [
                "ساتھی کے نقطہ نظر کو پرسکون انداز میں تسلیم کریں",
                "بغیر الزام تراشی کے اپنا مؤقف بیان کریں",
                "ایک باہمی قابل قبول حل یا مینیجر سے رہنمائی کی تجویز دیں"
            ],
            "ur_rm": [
                "Colleague ka point of view calmly acknowledge karein",
                "Blame ke baghair apna perspective explain karein",
                "Compromise ya manager alignment propose karein"
            ]
        },
        "context": "You are a coworker who feels that the recent division of work on a shared presentation is unbalanced. You express frustration but are open to discussion.",
        "initialPrompt": {
            "en": "I looked at the slide breakdown for tomorrow's client presentation. You assigned me 15 slides and kept only 5 for yourself. That doesn't seem fair to me at all.",
            "ur": "میں نے کل کی کلائنٹ پریزنٹیشن کے سلائیڈز دیکھے ہیں۔ آپ نے مجھے 15 سلائیڈز دی ہیں اور اپنے پاس صرف 5 رکھی ہیں۔ یہ بالکل منصفانہ نہیں لگتا۔",
            "ur_rm": "Main ne kal ki presentation dekhi hai. Aap ne mujhe 15 slides di hain aur apne paas sirf 5. Yeh fair nahi lagta."
        },
        "options": [
            {
                "id": "opt_wd_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "I understand your concern. The slides I took contain the deep technical diagrams, but let's rebalance them right now so we both have an equal number of slides.",
                    "ur": "میں آپ کی بات سمجھ سکتا ہوں۔ میرے پاس پیچیدہ تکنیکی ڈایاگرامز تھے، مگر آئیے ابھی مل کر تقسیم متوازن کر لیتے ہیں تاکہ دونوں پر یکساں کام ہو۔",
                    "ur_rm": "Main aap ki baat samajhta hoon. Aaiye mil kar slides rebalance kar lete hain taake equal workload rahe."
                },
                "feedback": {
                    "en": "De-escalates tension, validates the coworker's feeling, and offers an immediate practical solution.",
                    "ur": "تناؤ کم کرتا ہے، ساتھی کے احساسات کی قدر کرتا ہے اور فوری حل پیش کرتا ہے۔",
                    "ur_rm": "Calm, empathetic, and action-oriented compromise."
                }
            },
            {
                "id": "opt_wd_2",
                "type": "weaker",
                "score": 65,
                "text": {
                    "en": "Well, you type faster than me, so I thought it made sense.",
                    "ur": "دراصل آپ مجھ سے تیز ٹائپ کرتے ہیں، اس لیے میں نے ایسا سوچا۔",
                    "ur_rm": "Aap typing fast karte hain is liye socha ke theek hoga."
                },
                "feedback": {
                    "en": "Defensive justification that still leaves the coworker feeling overburdened.",
                    "ur": "وضاحت دی گئی مگر ساتھی کے بوجھ اور انصاف کا مسئلہ حل نہیں ہوا۔",
                    "ur_rm": "Defensive reason without offering a workload adjustment."
                }
            },
            {
                "id": "opt_wd_3",
                "type": "inappropriate",
                "score": 30,
                "text": {
                    "en": "If you can't handle a few slides, maybe you shouldn't be on this project.",
                    "ur": "اگر آپ چند سلائیڈز نہیں بنا سکتے تو شاید آپ کو اس منصوبے میں نہیں ہونا چاہیے۔",
                    "ur_rm": "Agar aap slides nahi bana sakte toh project chor dein."
                },
                "feedback": {
                    "en": "Personal attacks damage workplace relationships and lead to formal conflict.",
                    "ur": "ذاتی حملے کام کی جگہ کے ماحول کو خراب اور تنازعے کو شدید بناتے ہیں۔",
                    "ur_rm": "Hostile attack severely harms professional collaboration."
                }
            },
            {
                "id": "opt_wd_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "Fine, do whatever you want. I won't do any slides at all.",
                    "ur": "ٹھیک ہے، جو مرضی کریں، میں کوئی کام نہیں کروں گا۔",
                    "ur_rm": "Theek hai, main koi kaam nahi karoon ga."
                },
                "feedback": {
                    "en": "Passive aggression leaves the deliverable incomplete and risks both employees' performance.",
                    "ur": "کام چھوڑ دینے کی دھمکی نقصان دہ اور غیر پیشہ ورانہ ہے۔",
                    "ur_rm": "Passive aggressive withdrawal risks project failure."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_prof_intro",
        "title": {
            "en": "Professional Introduction & Team Networking",
            "ur": "پیشہ ورانہ تعارف اور ٹیم سے رابطہ کاری",
            "ur_rm": "Professional introduction aur team networking"
        },
        "description": {
            "en": "Practice introducing yourself clearly to a new coworker or partner, explaining your role and opening a friendly dialogue.",
            "ur": "نئے دفتری ساتھی کے سامنے اپنا شائستہ اور جامع تعارف کروانے اور گفتگو شروع کرنے کی مشق کریں۔",
            "ur_rm": "New colleague ko professional aur friendly introduction dene ki practice karein."
        },
        "aiRole": {
            "en": "New Team Colleague",
            "ur": "نیا دفتری ساتھی",
            "ur_rm": "New Team Colleague"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "category": "workplace",
        "objectives": {
            "en": [
                "State your name and role clearly",
                "Mention one area where you collaborate",
                "Ask an open question to learn about their background"
            ],
            "ur": [
                "اپنا نام اور عہدہ واضح طور پر بتائیں",
                "وہ شعبہ بتائیں جہاں آپ مل کر کام کریں گے",
                "ان کا شعبہ جاننے کے لیے ایک شائستہ سوال پوچھیں"
            ],
            "ur_rm": [
                "Name aur role clearly state karein",
                "Collaboration area mention karein",
                "Unke background ke bare mein open question poochein"
            ]
        },
        "context": "You are a new employee joining the floor. A teammate walks up to your desk to introduce themselves.",
        "initialPrompt": {
            "en": "Hi there! I don't think we've officially met yet. Welcome to the team! Which department or project are you working on?",
            "ur": "ہیلو! میرا خیال ہے ہمارا باضابطہ تعارف نہیں ہوا۔ ٹیم میں خوش آمدید! آپ کس شعبے یا پروجیکٹ پر کام کر رہے ہیں؟",
            "ur_rm": "Hi there! Official introduction nahi hua shayad. Welcome to the team! Aap kis department par kaam kar rahe hain?"
        },
        "options": [
            {
                "id": "opt_pi_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Hello! I'm glad to meet you. I've joined the operations and support team. I'll be helping with workflow and reporting. How long have you been with the team?",
                    "ur": "ہیلو! آپ سے مل کر خوشی ہوئی۔ میں آپریشنز اور سپورٹ ٹیم میں شامل ہوا ہوں۔ میں رپورٹس اور کام کے بہاؤ میں مدد کروں گا۔ آپ کتنے عرصے سے یہاں ہیں؟",
                    "ur_rm": "Hello! Nice to meet you. Main operations aur support team mein hoon. Reports aur workflow manage karoon ga. Aap kitne arse se yahan hain?"
                },
                "feedback": {
                    "en": "Warm, professional, states your role clearly, and shows reciprocal interest.",
                    "ur": "گرم جوش، باوقار انداز، عہدے کی وضاحت اور ساتھی سے متعلق شائستہ سوال۔",
                    "ur_rm": "Warm greeting, clear role definition, and engaging question."
                }
            },
            {
                "id": "opt_pi_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Hi. I work here now. Just doing computer work.",
                    "ur": "ہیلو، میں اب یہاں کام کرتا ہوں۔ بس کمپیوٹر کا کام ہے۔",
                    "ur_rm": "Hi. Main yahan kaam karta hoon. Computer work hai."
                },
                "feedback": {
                    "en": "Polite, but brief and gives the colleague very little context about what you actually do.",
                    "ur": "شائستہ ہے مگر بہت مختصر اور غیر واضح ہے۔",
                    "ur_rm": "Too brief, gives little helpful context."
                }
            },
            {
                "id": "opt_pi_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "I'm busy right now, don't interrupt me.",
                    "ur": "میں ابھی مصروف ہوں، مجھے تنگ نہ کریں۔",
                    "ur_rm": "Main busy hoon, abhi baat mat karein."
                },
                "feedback": {
                    "en": "A cold brush-off creates an unapproachable reputation from day one.",
                    "ur": "سرد مہری کا مظاہرہ شروع سے ہی دفتری تعلقات کو بگاڑ سکتا ہے۔",
                    "ur_rm": "Cold response damages initial networking."
                }
            },
            {
                "id": "opt_pi_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "Who wants to know? Are you inspecting me?",
                    "ur": "کون پوچھ رہا ہے؟ کیا آپ میری تفتیش کر رہے ہیں؟",
                    "ur_rm": "Kyun pooch rahe hain? Kya inspection hai?"
                },
                "feedback": {
                    "en": "Overly suspicious response to a standard friendly workplace greeting.",
                    "ur": "عام تعارفی جملے پر شک و شبہ کا اظہار مناسب نہیں۔",
                    "ur_rm": "Suspicious tone causes immediate discomfort."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_bank_inquiry",
        "title": {
            "en": "Bank Service: Account Inquiry & Debit Card Clarification",
            "ur": "بینک سروس: اکاؤنٹ اور ڈیبٹ کارڈ سے متعلق رہنمائی",
            "ur_rm": "Bank service: Account aur debit card guidance"
        },
        "description": {
            "en": "Practice approaching a bank customer representative, asking about a card status, and clarifying fee structures.",
            "ur": "بینک افسر کے پاس جا کر اپنے کارڈ کی حالت جاننے اور چارجز کی وضاحت طلب کرنے کی مشق کریں۔",
            "ur_rm": "Bank representative se card status aur fees verify karne ki practical conversation."
        },
        "aiRole": {
            "en": "Bank Customer Representative",
            "ur": "بینک کسٹمر سروس نمائندہ",
            "ur_rm": "Bank Representative"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "category": "everyday",
        "objectives": {
            "en": [
                "Politely state your purpose for visiting the bank",
                "Provide necessary identification or account reference",
                "Ask clear questions about card activation or fees"
            ],
            "ur": [
                "بینک آنے کا مقصد شائستگی سے بتائیں",
                "ضروری شناختی معلومات یا اکاؤنٹ نمبر پیش کریں",
                "کارڈ ایکٹیویشن اور فیس سے متعلق واضح سوال پوچھیں"
            ],
            "ur_rm": [
                "Bank visit ka purpose politely explain karein",
                "Account number ya ID verify karein",
                "Card activation aur charges par clarification lein"
            ]
        },
        "context": "You are a customer service officer at a retail bank branch. A customer approaches your desk.",
        "initialPrompt": {
            "en": "Good afternoon! Welcome to First National Bank. How can I assist you with your account today?",
            "ur": "سہ پہر بخیر! فرسٹ نیشنل بینک میں خوش آمدید۔ آج میں آپ کے اکاؤنٹ کے سلسلے میں کیا مدد کر سکتا ہوں؟",
            "ur_rm": "Good afternoon! Bank mein khush aamdeed. Main aap ke account ke silsile mein kya madad kar sakta hoon?"
        },
        "options": [
            {
                "id": "opt_bi_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Good afternoon. I received a new debit card in the mail, and I need help activating it. Could you also confirm if there are any monthly maintenance fees?",
                    "ur": "سہ پہر بخیر۔ مجھے ڈاک کے ذریعے نیا ڈیبٹ کارڈ موصول ہوا ہے اور مجھے اسے فعال کرنے میں مدد چاہیے۔ کیا آپ تصدیق کر سکتے ہیں کہ آیا اس پر ماہانہ فیس ہے؟",
                    "ur_rm": "Good afternoon. Mujhe mail mein naya debit card mila hai, activate karwana hai. Kya aap confirm kar sakte hain ke koi monthly fee hai?"
                },
                "feedback": {
                    "en": "Clear, specific, and asks pertinent financial questions upfront.",
                    "ur": "واضح، شائستہ اور ضروری مالیاتی سوالات کا بروقت استفسار۔",
                    "ur_rm": "Clear statement of purpose with relevant follow-up question."
                }
            },
            {
                "id": "opt_bi_2",
                "type": "weaker",
                "score": 70,
                "text": {
                    "en": "My card isn't working. Do something with it.",
                    "ur": "میرا کارڈ کام نہیں کر رہا۔ اس کا کچھ کریں۔",
                    "ur_rm": "Mera card kaam nahi kar raha, theek karein."
                },
                "feedback": {
                    "en": "Direct, but lacks greeting and doesn't explain what card or problem occurred.",
                    "ur": "سلام غائب ہے اور مسئلے کی تفصیل بیان نہیں کی گئی۔",
                    "ur_rm": "Missing greeting and specific context of the card problem."
                }
            },
            {
                "id": "opt_bi_3",
                "type": "inappropriate",
                "score": 35,
                "text": {
                    "en": "Banks always rip people off with hidden fees, admit it!",
                    "ur": "بینک ہمیشہ خفیہ فیسوں سے لوگوں کو لوٹتے ہیں، اعتراف کریں!",
                    "ur_rm": "Bank hamesha hidden fees se loot-te hain!"
                },
                "feedback": {
                    "en": "Hostility toward front-desk staff obstructs productive assistance.",
                    "ur": "غصہ دکھانے سے آپ کا جائز کام بھی تاخیر کا شکار ہو جاتا ہے۔",
                    "ur_rm": "Aggressive tone delays practical help."
                }
            },
            {
                "id": "opt_bi_4",
                "type": "incorrect",
                "score": 15,
                "text": {
                    "en": "Give me someone's money right now.",
                    "ur": "مجھے ابھی کسی کے پیسے نکال کر دیں۔",
                    "ur_rm": "Mujhe abhi kisi ke paise nikaal kar dein."
                },
                "feedback": {
                    "en": "Demanding unauthorized funds triggers bank security protocols.",
                    "ur": "غیر قانونی مالیاتی مطالبہ سیکیورٹی الرٹ کا سبب بنتا ہے۔",
                    "ur_rm": "Unauthorized demand creates security alarm."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_restaurant_order",
        "title": {
            "en": "Restaurant Dining: Ordering Food & Asking Dietary Information",
            "ur": "ریستوران: کھانا آرڈر کرنا اور اجزاء کی وضاحت طلب کرنا",
            "ur_rm": "Restaurant: Khana order karna aur dietary info poochna"
        },
        "description": {
            "en": "Practice placing an order at a casual restaurant, asking about ingredients, and requesting the bill politely.",
            "ur": "ریستوران میں کھانا آرڈر کرنے، اجزاء کی معلومات لینے اور بل طلب کرنے کی مشق کریں۔",
            "ur_rm": "Restaurant mein order place karne aur dietary questions poochne ki practical practice."
        },
        "aiRole": {
            "en": "Restaurant Server",
            "ur": "ریستوران کا ویٹر",
            "ur_rm": "Restaurant Server"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "category": "everyday",
        "objectives": {
            "en": [
                "Review the menu choices and state your order clearly",
                "Ask a dietary question (e.g. allergies, vegetarian options, spice level)",
                "Thank the server and request the check when finished"
            ],
            "ur": [
                "مینو دیکھ کر اپنا آرڈر واضح انداز میں بتائیں",
                "کھانے کے اجزاء (الرجی یا مصالحے) سے متعلق دریافت کریں",
                "ویٹر کا شکریہ ادا کریں اور فارغ ہو کر بل مانگیں"
            ],
            "ur_rm": [
                "Menu se apna order clearly specify karein",
                "Dietary ya spice level question poochein",
                "Server ka shukriya ada karein"
            ]
        },
        "context": "You are a friendly server at a neighborhood cafe and grill. You come to take a customer's order.",
        "initialPrompt": {
            "en": "Hi, welcome! Are you ready to order, or would you like a few more minutes to look over the menu?",
            "ur": "خوش آمدید! کیا آپ آرڈر دینے کے لیے تیار ہیں یا مینو دیکھنے کے لیے مزید وقت درکار ہے؟",
            "ur_rm": "Welcome! Kya aap order ke liye ready hain ya thora time chahiye menu dekhne ke liye?"
        },
        "options": [
            {
                "id": "opt_ro_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "I'm ready, thank you! I would like the grilled chicken sandwich with a side salad. Could you please make sure there are no nuts in the dressing?",
                    "ur": "میں تیار ہوں، شکریہ! مجھے گرلڈ چکن سینڈوچ اور سلاد چاہیے۔ کیا آپ یقینی بنا سکتے ہیں کہ ڈریسنگ میں خشک میوہ جات نہ ہوں؟",
                    "ur_rm": "Ready hoon, thanks! Chicken sandwich aur side salad chahiye. Please ensure karein ke salad dressing mein nuts na hon."
                },
                "feedback": {
                    "en": "Polite, specifies the exact entree and side, and clearly communicates dietary preferences.",
                    "ur": "شائستہ، مکمل آرڈر کی وضاحت اور الرجی کی بروقت نشاندہی۔",
                    "ur_rm": "Polite, specific order with clear dietary instruction."
                }
            },
            {
                "id": "opt_ro_2",
                "type": "weaker",
                "score": 75,
                "text": {
                    "en": "Bring me chicken food. Make it fast.",
                    "ur": "چکن کا کوئی کھانا لائیں۔ جلدی کریں۔",
                    "ur_rm": "Chicken ka khana le aao jaldi."
                },
                "feedback": {
                    "en": "Too vague and demanding. Specifying the exact item helps the kitchen.",
                    "ur": "مبہم اور جلد بازی والا انداز جس سے غلط چیز آ سکتی ہے۔",
                    "ur_rm": "Vague order without item name or courtesy."
                }
            },
            {
                "id": "opt_ro_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "Your menu is way too expensive for regular food.",
                    "ur": "آپ کے مینو کے ریٹ عام کھانے کے حساب سے بہت زیادہ ہیں۔",
                    "ur_rm": "Aap ka menu bohot mehanga hai."
                },
                "feedback": {
                    "en": "Servers do not set menu prices; review prices before seating.",
                    "ur": "ویٹر قیمتیں طے نہیں کرتے، یہ بات آرڈر کے وقت مناسب نہیں۔",
                    "ur_rm": "Complaining to the server about prices creates awkwardness."
                }
            },
            {
                "id": "opt_ro_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I'll eat whatever you have left over in the garbage.",
                    "ur": "بچا کھچا کچھ بھی دے دیں۔",
                    "ur_rm": "Bacha kucha kuch bhi de dein."
                },
                "feedback": {
                    "en": "Disrespectful to yourself and the staff.",
                    "ur": "غیر سنجیدہ اور غیر مناسب جملہ۔",
                    "ur_rm": "Inappropriate and non-constructive dialogue."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_transit_delay",
        "title": {
            "en": "Practical Problem Solving: Cancelled Bus & Workplace Notification",
            "ur": "عملی مسئلہ حل کرنا: بس منسوخی اور مینیجر کو بروقت اطلاع",
            "ur_rm": "Problem solving: Cancelled bus aur manager ko timely notice"
        },
        "description": {
            "en": "Practical real-world challenge: Your scheduled morning bus was cancelled. Practice notifying your supervisor and deciding on an alternative commute.",
            "ur": "حقیقی مسئلہ: صبح کی بس منسوخ ہو گئی۔ مینیجر کو بروقت آگاہ کرنے اور متبادل راستے کا انتخاب کرنے کی مشق کریں۔",
            "ur_rm": "Morning bus cancel ho gayi. Supervisor ko notify karne aur alternative commute plan karne ki practice."
        },
        "aiRole": {
            "en": "Workplace Supervisor",
            "ur": "دفتری نگران (سپروائزر)",
            "ur_rm": "Workplace Supervisor"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "category": "problem_solving",
        "objectives": {
            "en": [
                "Proactively notify your supervisor before your shift begins",
                "Explain the transit cancellation factually",
                "Provide an updated estimated arrival time and commit to making up work"
            ],
            "ur": [
                "شفٹ شروع ہونے سے پہلے سپروائزر کو خود اطلاع دیں",
                "بس کی منسوخی کی حقیقت پسندانہ وجہ بیان کریں",
                "پہنچنے کا متوقع وقت بتائیں اور کام پورا کرنے کی یقین دہانی کرائیں"
            ],
            "ur_rm": [
                "Shift start hone se pehle proactively inform karein",
                "Transit cancellation factually explain karein",
                "Updated ETA dein aur task handover ensure karein"
            ]
        },
        "context": "You are a workplace shift supervisor. An employee calls or messages you 20 minutes before their scheduled morning shift.",
        "initialPrompt": {
            "en": "Good morning. I see you're calling. Is everything okay regarding your 9:00 AM shift?",
            "ur": "صبح بخیر۔ میں نے دیکھا کہ آپ کی کال آ رہی ہے۔ کیا صبح نو بجے کی شفٹ کے حوالے سے سب خیریت ہے؟",
            "ur_rm": "Good morning. Aap ki call ayi hai, kya 9:00 AM shift ke bare mein sab theek hai?"
        },
        "options": [
            {
                "id": "opt_td_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Good morning. The Route 4 bus was just cancelled due to mechanical failure. I'm taking the next train and expect to arrive around 9:25 AM. I will stay 30 minutes late today to complete all tasks.",
                    "ur": "صبح بخیر۔ تکنیکی خرابی کی وجہ سے بس روٹ 4 منسوخ ہو گئی ہے۔ میں اگلی ٹرین لے رہا ہوں اور 9:25 تک پہنچ جاؤں گا۔ میں آج تمام کام مکمل کرنے کے لیے 30 منٹ اضافی رکوں گا۔",
                    "ur_rm": "Good morning. Route 4 bus cancel ho gayi hai. Main train le raha hoon aur 9:25 AM tak pohanch jaoon ga. Main 30 min extra ruk kar kaam poora karoon ga."
                },
                "feedback": {
                    "en": "Professional, responsible, explains the cause, provides an exact ETA, and offers a proactive solution.",
                    "ur": "ذمہ دارانہ انداز، وجہ کی وضاحت، متوقع وقت کی نشاندہی اور کام کی تلافی کی پیشکش۔",
                    "ur_rm": "Proactive notification with realistic ETA and solution."
                }
            },
            {
                "id": "opt_td_2",
                "type": "weaker",
                "score": 65,
                "text": {
                    "en": "The bus broke down. I don't know when I'll show up.",
                    "ur": "بس خراب ہو گئی۔ پتہ نہیں میں کب آؤں گا۔",
                    "ur_rm": "Bus kharab ho gayi, pata nahi kab aaoon ga."
                },
                "feedback": {
                    "en": "Informing is good, but uncertainty leaves the team unable to plan shift coverage.",
                    "ur": "اطلاع تو دی گئی مگر غیریقینی وقت کی وجہ سے ٹیم کام کا انتظام نہیں کر سکتی۔",
                    "ur_rm": "Lacks an estimated arrival time or action plan."
                }
            },
            {
                "id": "opt_td_3",
                "type": "inappropriate",
                "score": 30,
                "text": {
                    "en": "Public transit is garbage in this city, so don't expect me today.",
                    "ur": "اس شہر کی پبلک ٹرانسپورٹ بیکار ہے، اس لیے آج میرا انتظار نہ کریں۔",
                    "ur_rm": "Public transport kharab hai, main aaj nahi aa raha."
                },
                "feedback": {
                    "en": "Unilaterally taking the day off over a delay harms reliability and employment standing.",
                    "ur": "چھوٹی تاخیر پر بغیر کوشش کے چھٹی کر لینا غیر ذمہ دارانہ ہے۔",
                    "ur_rm": "Giving up without seeking backup transit harms professional standing."
                }
            },
            {
                "id": "opt_td_4",
                "type": "incorrect",
                "score": 10,
                "text": {
                    "en": "[Don't notify anyone and just show up 2 hours late without explanation]",
                    "ur": "[کسی کو کچھ نہ بتائیں اور 2 گھنٹے دیر سے بغیر وضاحت پہنچیں]",
                    "ur_rm": "[Koi notice na dein aur 2 hours late pohanchein]"
                },
                "feedback": {
                    "en": "Unexcused no-shows violate basic workplace policy.",
                    "ur": "بغیر بتائے غیر حاضر ہونا یا تاخیر کرنا ملازمت کی پالیسی کے خلاف ہے۔",
                    "ur_rm": "No-call no-show leads to disciplinary action."
                }
            }
        ]
    },
    {
        "id": "scenario_adult_confusing_email",
        "title": {
            "en": "Practical Problem Solving: Clarifying an Unclear Workplace Email",
            "ur": "عملی مسئلہ حل کرنا: مبہم ای میل کی باادب وضاحت طلب کرنا",
            "ur_rm": "Problem solving: Unclear email ki polite clarification lena"
        },
        "description": {
            "en": "You received an email from your project lead with ambiguous instructions. Practice asking for specific clarification politely without sounding critical.",
            "ur": "پروجیکٹ لیڈ سے موصول ہونے والی غیر واضح ای میل پر شائستہ اور درست وضاحت طلب کرنے کی مشق کریں۔",
            "ur_rm": "Ambiguous instructions wali email par polite clarification lene ki practice."
        },
        "aiRole": {
            "en": "Project Lead",
            "ur": "پروجیکٹ انچارج",
            "ur_rm": "Project Lead"
        },
        "personas": ["adult"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "medium",
        "category": "problem_solving",
        "objectives": {
            "en": [
                "Reference the specific email or subject line",
                "Identify precisely which detail is ambiguous",
                "Propose your understanding and ask for quick confirmation"
            ],
            "ur": [
                "متعلقہ ای میل یا عنوان کا حوالہ دیں",
                "واضح کریں کہ کس نکتے میں رہنمائی درکار ہے",
                "اپنی سمجھ بیان کر کے حتمی توثیق مانگیں"
            ],
            "ur_rm": [
                "Subject line ya email quote karein",
                "Ambiguous point highlight karein",
                "Apni understanding share kar ke confirm karein"
            ]
        },
        "context": "You are a busy project supervisor. You sent a brief email asking for 'the numbers by end of day'. A team member approaches you to clarify.",
        "initialPrompt": {
            "en": "Hi. Did you get my note about submitting the numbers by 5 PM? Do you have any questions before you wrap that up?",
            "ur": "ہیلو۔ کیا آپ کو شام 5 بجے تک نمبرز جمع کرانے کی ای میل مل گئی تھی؟ کام ختم کرنے سے پہلے کوئی سوال ہے؟",
            "ur_rm": "Hi. Kya aap ko 5 PM tak numbers submit karne ki email mil gayi thi? Koi question hai?"
        },
        "options": [
            {
                "id": "opt_ce_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Yes, thank you! I wanted to confirm whether you need the monthly sales totals or the detailed regional breakdown for the report?",
                    "ur": "جی شکریہ! میں تصدیق کرنا چاہتا تھا کہ آیا آپ کو ماہانہ فروخت کا مجموعہ درکار ہے یا علاقے وار تفصیلی رپورٹ؟",
                    "ur_rm": "Yes thanks! Main confirm karna chahta tha ke monthly total sales chahiye ya detailed regional breakdown?"
                },
                "feedback": {
                    "en": "Courteous, specific, and gives two distinct options so the lead can reply in seconds.",
                    "ur": "باادب، مخصوص اور واضح دو راستے پیش کیے گئے جن کا جواب ایک لمحے میں دیا جا سکتا ہے۔",
                    "ur_rm": "Polite and structured clarification with concrete options."
                }
            },
            {
                "id": "opt_ce_2",
                "type": "weaker",
                "score": 65,
                "text": {
                    "en": "Your email didn't make any sense, so I haven't started.",
                    "ur": "آپ کی ای میل سمجھ نہیں آئی تھی اس لیے میں نے شروع نہیں کیا۔",
                    "ur_rm": "Aap ki email samajh nahi ayi is liye start nahi kiya."
                },
                "feedback": {
                    "en": "Blunt phrasing puts the supervisor on the defensive and confesses to an avoidable delay.",
                    "ur": "سخت لہجہ ہے جس سے وقت کا ضیاع ظاہر ہوتا ہے۔",
                    "ur_rm": "Blunt tone sounds accusatory and highlights delayed action."
                }
            },
            {
                "id": "opt_ce_3",
                "type": "inappropriate",
                "score": 35,
                "text": {
                    "en": "You always write confusing instructions. Learn to communicate better.",
                    "ur": "آپ ہمیشہ الجھی ہوئی ہدایات لکھتے ہیں، ای میل لکھنا سیکھیں۔",
                    "ur_rm": "Aap hamesha confusing likhte hain, sahi likhna seekhein."
                },
                "feedback": {
                    "en": "Directly insulting a supervisor is a serious workplace infraction.",
                    "ur": "نگران کی توہین کرنا دفتری نظم و ضبط کی سنگین خلاف ورزی ہے۔",
                    "ur_rm": "Insulting your lead damages your career."
                }
            },
            {
                "id": "opt_ce_4",
                "type": "incorrect",
                "score": 20,
                "text": {
                    "en": "I'll just guess what you meant and send random numbers.",
                    "ur": "میں تکہ لگا کر کوئی بھی نمبرز بھیج دوں گا۔",
                    "ur_rm": "Main guess kar ke kuch bhi bhej doonga."
                },
                "feedback": {
                    "en": "Guessing critical work data risks business errors.",
                    "ur": "اہم دفتری اعداد و شمار میں تکہ لگانا سنگین نقصان کا باعث بنتا ہے۔",
                    "ur_rm": "Submitting unverified data risks costly errors."
                }
            }
        ]
    },

    # ==========================================
    # Additional Teen Scenarios
    # ==========================================
    {
        "id": "scenario_teen_need_help",
        "title": {
            "en": "Expressing Confusion & Saying 'I Need Help'",
            "ur": "الجھن کا اظہار اور 'مجھے مدد درکار ہے' شائستگی سے کہنا",
            "ur_rm": "Confusion express karna aur 'Mujhe help chahiye' politely kehna"
        },
        "description": {
            "en": "Practice overcoming hesitation when you don't understand a concept, asking for help politely from a teacher or classmate.",
            "ur": "کسی سبق میں الجھن ہونے پر ہچکچاہٹ پر قابو پانے اور استاد یا ہم جماعت سے شائستگی سے مدد مانگنے کی مشق کریں۔",
            "ur_rm": "Concept samajh na aane par teacher ya classmate se politely help maangne ki practice."
        },
        "aiRole": {
            "en": "Study Partner / Classmate",
            "ur": "ہم جماعت / پڑھائی کا ساتھی",
            "ur_rm": "Study Partner"
        },
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "category": "peer_school",
        "objectives": {
            "en": [
                "Acknowledge what part you find confusing without embarrassment",
                "Ask a specific clarifying question",
                "Thank the peer for taking time to explain"
            ],
            "ur": [
                "بغیر جھجھک کے بتائیں کہ کون سا حصہ سمجھ نہیں آیا",
                "ایک مخصوص وضاحتی سوال پوچھیں",
                "سمجھانے پر ساتھی کا شکریہ ادا کریں"
            ],
            "ur_rm": [
                "Confusion wala part bina hesitation explain karein",
                "Specific question poochein",
                "Peer ka shukriya ada karein"
            ]
        },
        "context": "You are a friendly high school study partner working together on a biology assignment in the library.",
        "initialPrompt": {
            "en": "Hey! We're halfway through question 4 on cellular respiration. How are your notes looking so far?",
            "ur": "ہیلو! ہم سوال نمبر 4 کے آدھے حصے پر پہنچ چکے ہیں۔ آپ کے نوٹس کیسے بن رہے ہیں؟",
            "ur_rm": "Hey! Hum question 4 par hain. Aap ke notes kaise ja rahe hain ab tak?"
        },
        "options": [
            {
                "id": "opt_tnh_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "To be honest, I'm a bit confused about the second step. Could we pause and walk through that part together?",
                    "ur": "سچ کہوں تو مجھے دوسرے مرحلے پر کچھ الجھن ہو رہی ہے۔ کیا ہم تھوڑی دیر رک کر اس حصے کو مل کر دہرا سکتے ہیں؟",
                    "ur_rm": "Honestly mujhe second step mein thori confusion hai. Kya hum pause kar ke woh part saath dekh sakte hain?"
                },
                "feedback": {
                    "en": "Honest, calm, identifies where help is needed, and suggests a collaborative way forward.",
                    "ur": "سچائی، پرسکون انداز اور مل کر حل نکالنے کی بہترین تجویز۔",
                    "ur_rm": "Great honest communication that invites friendly collaboration."
                }
            },
            {
                "id": "opt_tnh_2",
                "type": "weaker",
                "score": 70,
                "text": {
                    "en": "Yeah, sure, whatever. I'm fine.",
                    "ur": "ہاں ہاں ٹھیک ہے، سب ٹھیک ہے۔",
                    "ur_rm": "Haan theek hai sab, koi issue nahi."
                },
                "feedback": {
                    "en": "Hiding confusion leads to falling behind on the assignment.",
                    "ur": "الجھن چھپانے سے کام ادھورا رہ جانے کا خدشہ رہتا ہے۔",
                    "ur_rm": "Pretending you understand prevents you from getting helpful guidance."
                }
            },
            {
                "id": "opt_tnh_3",
                "type": "inappropriate",
                "score": 40,
                "text": {
                    "en": "This subject is totally stupid and so is this assignment.",
                    "ur": "یہ مضمون بالکل بیکار ہے اور یہ کام بھی۔",
                    "ur_rm": "Yeh subject bilkul bekar hai."
                },
                "feedback": {
                    "en": "Venting frustration doesn't help you understand the material.",
                    "ur": "غصہ نکالنے سے پڑھائی میں مدد نہیں ملتی۔",
                    "ur_rm": "Venting frustration discourages your study partner."
                }
            },
            {
                "id": "opt_tnh_4",
                "type": "incorrect",
                "score": 15,
                "text": {
                    "en": "Just do all my questions for me while I sleep.",
                    "ur": "بس میرے سارے سوالات خود کر دیں اور میں سو جاتا ہوں۔",
                    "ur_rm": "Aap mere liye saara kaam kar dein."
                },
                "feedback": {
                    "en": "Asking others to do your homework is unfair to them and stops your own learning.",
                    "ur": "اپنا کام دوسروں سے کروانا غیر منصفانہ ہے۔",
                    "ur_rm": "Unfair demand that halts your personal growth."
                }
            }
        ]
    },
    {
        "id": "scenario_teen_intro_club",
        "title": {
            "en": "Introducing Yourself at a School Club or Activity",
            "ur": "اسکول کلب یا سرگرمی میں اپنا دوستانہ تعارف کروانا",
            "ur_rm": "School club ya activity mein friendly introduction dena"
        },
        "description": {
            "en": "Practice introducing yourself when joining an after-school club (like robotics, art, or debate), expressing your interest and making a friend.",
            "ur": "کسی اسکول کلب (جیسے روبوٹکس، آرٹ یا مباحثہ) میں پہلی بار جاتے ہوئے پرسکون تعارف کروانے کی مشق کریں۔",
            "ur_rm": "After-school club join karte waqt apna friendly introduction dene ki practice."
        },
        "aiRole": {
            "en": "School Club Leader",
            "ur": "اسکول کلب کا صدر / لیڈر",
            "ur_rm": "Club Leader"
        },
        "personas": ["teen"],
        "languages": ["en", "ur", "ur_rm"],
        "difficulty": "easy",
        "category": "peer_school",
        "objectives": {
            "en": [
                "Introduce your name and grade politely",
                "Mention what sparked your interest in the club",
                "Ask how newcomers can participate today"
            ],
            "ur": [
                "شائستگی سے اپنا نام اور کلاس بتائیں",
                "بتائیں کہ آپ کو اس کلب میں کیا چیز پسند آئی",
                "پوچھیں کہ نئے ارکان آج کیسے شامل ہو سکتے ہیں"
            ],
            "ur_rm": [
                "Name aur grade politely state karein",
                "Club mein interest share karein",
                "Newcomers ke participate karne ka tarika poochein"
            ]
        },
        "context": "You are the student president of the school technology and creative arts club. A new student attends their very first meeting.",
        "initialPrompt": {
            "en": "Hi! Welcome to our after-school club meeting. We always love seeing new faces. What's your name, and what made you want to check us out today?",
            "ur": "ہیلو! ہمارے اسکول کلب کے اجلاس میں خوش آمدید۔ ہمیں نئے ساتھیوں کو دیکھ کر بہت خوشی ہوتی ہے۔ آپ کا نام کیا ہے اور آج آپ کیا سیکھنا چاہتے ہیں؟",
            "ur_rm": "Hi! Club meeting mein welcome! Aap ka name kya hai aur aaj kya cheez dekhne ka irada hai?"
        },
        "options": [
            {
                "id": "opt_tic_1",
                "type": "best",
                "score": 100,
                "text": {
                    "en": "Hi! My name is Ali, and I'm in 10th grade. I've always wanted to learn more about creative coding and robotics. What are you working on today?",
                    "ur": "ہیلو! میرا نام علی ہے اور میں دسویں جماعت میں ہوں۔ میں ہمیشہ سے کوڈنگ اور روبوٹکس کے بارے میں مزید جاننا چاہتا تھا۔ آج آپ کس چیز پر کام کر رہے ہیں؟",
                    "ur_rm": "Hi! Mera name Ali hai aur main 10th grade mein hoon. Coding aur robotics explore karna chahta hoon. Aaj kis project par kaam hai?"
                },
                "feedback": {
                    "en": "Friendly, respectful, introduces name and grade, and asks an engaging follow-up question.",
                    "ur": "دوستانہ، شائستہ، نام اور جماعت کا تعارف اور مثبت سوال۔",
                    "ur_rm": "Warm, engaging, and sets a great first impression."
                }
            },
            {
                "id": "opt_tic_2",
                "type": "weaker",
                "score": 70,
                "text": {
                    "en": "I'm just standing here. My friend told me to come.",
                    "ur": "میں بس یہاں کھڑا ہوں۔ میرے دوست نے آنے کو کہا تھا۔",
                    "ur_rm": "Main bas aise hi aya hoon, friend ne bola tha."
                },
                "feedback": {
                    "en": "A bit passive, but honest. Sharing what you might like about the club makes connecting easier.",
                    "ur": "تھوڑا غیر فعال ہے مگر سچ۔ اپنی کسی دلچسپی کا ذکر کرنا دوستی میں مددگار ہوتا ہے۔",
                    "ur_rm": "A bit distant, mentioning your interest makes joining easier."
                }
            },
            {
                "id": "opt_tic_3",
                "type": "inappropriate",
                "score": 35,
                "text": {
                    "en": "This looks super nerdy. I bet you guys have no fun.",
                    "ur": "یہ بہت عجیب اور خشک لگتا ہے۔ آپ لوگ کوئی مزہ نہیں کرتے ہوں گے۔",
                    "ur_rm": "Yeh bohot boring lag raha hai."
                },
                "feedback": {
                    "en": "Teasing or mocking club activities alienates other students.",
                    "ur": "کلب کی سرگرمیوں کا مذاق اڑانا ساتھیوں کو بیزار کرتا ہے۔",
                    "ur_rm": "Mocking the group makes other students feel uncomfortable."
                }
            },
            {
                "id": "opt_tic_4",
                "type": "incorrect",
                "score": 10,
                "text": {
                    "en": "[Turn around and walk away without responding]",
                    "ur": "[بغیر جواب دیے مڑ کر چلے جائیں]",
                    "ur_rm": "[Bina jawab diye chale jayein]"
                },
                "feedback": {
                    "en": "Walking away when someone greets you politely shuts down potential friendships.",
                    "ur": "کسی کے سلام کا جواب دیے بغیر مڑ جانا تعلق قائم کرنے میں رکاوٹ ہے۔",
                    "ur_rm": "Walking away avoids a chance to make new friends."
                }
            }
        ]
    }
]

ALL_SCENARIOS = [GENERAL_CHAT_SCENARIO] + DEFAULT_SCENARIOS
