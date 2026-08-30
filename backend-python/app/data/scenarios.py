import json

DEFAULT_SCENARIOS = [
    # ==========================================
    # Child Scenarios (6 scenarios, Easy/Med/Chall)
    # ==========================================
    {
        "id": "scenario_teacher_help",
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
    }
]
