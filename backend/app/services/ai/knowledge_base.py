import re
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from app.services.ai.intent_classifier import IntentCategory


# =============================================================================
# BASELINE PLATFORM DEFINITIONS (Maintained for backward compatibility)
# =============================================================================

HUMSAATHI_PLATFORM_OVERVIEW = {
    "title": "HumSaathi AI Platform Context",
    "summary": (
        "HumSaathi (ہم ساتھی - 'We are companions') is an AI-powered communication and life-skills coaching platform "
        "built in Pakistan for neurodiverse and diverse learners across Child (ages 4-12), Teen (ages 13-17), and Adult (ages 18+) portals. "
        "It supports English, authentic Urdu (اردو رسم الخط), and Roman Urdu with voice recognition (STT), text-to-speech (TTS), "
        "sensory accommodations (calm mode, high contrast, text scaling), baseline assessments, caregiver summaries, and an admin control center."
    ),
}

CHILD_PORTAL_KNOWLEDGE = {
    "title": "Child Learning Portal Capabilities",
    "details": (
        "Child Portal (Ages 4-12): Designed for joyful foundational learning with 8 interactive activity types: "
        "1. Letters & Phonics (A-Z alphabet recognition and letter sounds) "
        "2. Numbers & Arithmetic (Basic numbers 1-20 and early math concepts) "
        "3. Color Identification (Primary and secondary colors in everyday items) "
        "4. Shapes & Geometry (Circles, squares, triangles, rectangles) "
        "5. Counting (Visual object counting with immediate positive reinforcement) "
        "6. Animal Matching (Animal names, habitats, and sounds) "
        "7. Emotion Learning (Identifying happy, sad, excited, calm feelings) "
        "8. Routine Sequencing (Morning routine, packing school bag, bedtime steps). "
        "Tone: Warm, encouraging, simple words, short sentences (1-2 lines), gentle feedback with star rewards."
    ),
}

TEEN_PORTAL_KNOWLEDGE = {
    "title": "Teen Communication & Life-Skills Portal",
    "details": (
        "Teen Portal (Ages 13-17): Focuses on real-world school and social communication: "
        "1. Group Project Discussions (Constructive idea sharing, active listening, turn-taking) "
        "2. Expressing Preferences in Social Groups (Balancing personal choices with peer consensus) "
        "3. Requesting Teacher Assignment Extensions (Polite greeting, clear rationale, proposing realistic deadlines) "
        "4. Resolving Peer Disagreements (Calm de-escalation, acknowledging opposing views, balanced compromise) "
        "5. Social Anxiety & Conversational Warmup (Approaching new classmates, introducing oneself). "
        "Tone: Relatable, educational, peer-respectful, with actionable communication feedback."
    ),
}

ADULT_PORTAL_KNOWLEDGE = {
    "title": "Adult Professional & Community Navigation Portal",
    "details": (
        "Adult Portal (Ages 18+): Equips adult learners for independent workplace and community navigation: "
        "1. Manager Clarification (Seeking brief clarifications on deliverables, task prioritization) "
        "2. Healthcare & Pharmacy Navigation (Confirming medication dosages, meal timing, doctor appointment booking) "
        "3. Shift Swap Negotiations (Polite colleague requests, offering return shifts, supervisor coordination) "
        "4. Customer Support Dispute Resolution (Account reference verification, billing dispute explanations) "
        "5. Job Interview Preparation (STAR method responses, professional introductions, salary discussions). "
        "Tone: Respectful, mature, practical, with actionable real-world communication tips."
    ),
}

EVALUATION_RUBRIC_KNOWLEDGE = {
    "title": "HumSaathi Communication Assessment Rubric",
    "details": (
        "Communication is evaluated on 7 core dimensions: "
        "1. Clarity (Is the message clear and easy to understand?) "
        "2. Confidence (Does the tone express self-assurance?) "
        "3. Relevance (Does it directly address the prompt/situation?) "
        "4. Tone (Is the tone socially and contextually appropriate?) "
        "5. Engagement (Does it invite reciprocal dialogue?) "
        "6. Listening (Did the learner acknowledge what the other speaker said?) "
        "7. Empathy (Does the learner demonstrate perspective-taking?)."
    ),
}

SENSORY_ACCESSIBILITY_KNOWLEDGE = {
    "title": "Sensory & Accessibility Accommodations",
    "details": (
        "HumSaathi includes customizable sensory controls: "
        "Calm Mode (reduced sensory stimulation, muted colors), High Contrast (enhanced readability), "
        "Text Scaling (Small, Medium, Large, Extra Large), Reduced Motion (disables intense animations), "
        "and Sound Controls (audio cues toggle, speech synthesis pitch/speed)."
    ),
}


# =============================================================================
# STRUCTURED ACTIONABLE KNOWLEDGE REGISTRY
# =============================================================================

@dataclass
class KnowledgeEntry:
    id: str
    title: str
    domain: str  # "platform", "child", "teen", "adult", "parent"
    personas: List[str]  # ["child"], ["teen"], ["adult"], ["parent"]
    intents: List[str]
    keywords: List[str]
    content: str
    priority: int = 10
    scenario_ids: List[str] = field(default_factory=list)


KNOWLEDGE_REGISTRY: List[KnowledgeEntry] = [
    # --- PLATFORM & ACCESSIBILITY ---
    KnowledgeEntry(
        id="platform_overview",
        title=HUMSAATHI_PLATFORM_OVERVIEW["title"],
        domain="platform",
        personas=["child", "teen", "adult", "parent"],
        intents=["PROJECT_QUESTION"],
        keywords=[
            "humsaathi", "what is humsaathi", "platform", "about app", "features",
            "ہم ساتھی", "ایپ", "خصوصیات"
        ],
        content=HUMSAATHI_PLATFORM_OVERVIEW["summary"],
        priority=6,
    ),
    KnowledgeEntry(
        id="platform_accessibility",
        title=SENSORY_ACCESSIBILITY_KNOWLEDGE["title"],
        domain="platform",
        personas=["child", "teen", "adult", "parent"],
        intents=["PROJECT_QUESTION"],
        keywords=[
            "sensory", "calm mode", "high contrast", "text scale", "reduced motion", "accessibility",
            "حسی", "پرسکون موڈ", "ہائی کنٹراسٹ"
        ],
        content=SENSORY_ACCESSIBILITY_KNOWLEDGE["details"],
        priority=8,
    ),
    KnowledgeEntry(
        id="communication_rubric",
        title=EVALUATION_RUBRIC_KNOWLEDGE["title"],
        domain="platform",
        personas=["teen", "adult", "parent"],
        intents=["COMMUNICATION_PRACTICE", "SCENARIO_ROLEPLAY", "COMMUNICATION_COACHING"],
        keywords=[
            "rubric", "score", "evaluate", "evaluation", "communication score", "dimensions",
            "نمبر", "اسکور", "جائزہ", "معیار"
        ],
        content=EVALUATION_RUBRIC_KNOWLEDGE["details"],
        priority=7,
    ),

    # --- CHILD DOMAIN ---
    KnowledgeEntry(
        id="child_portal_capabilities",
        title=CHILD_PORTAL_KNOWLEDGE["title"],
        domain="child",
        personas=["child"],
        intents=["CHILD_LEARNING"],
        keywords=[
            "child learning portal", "letters & phonics", "numbers", "colors", "shapes", "counting",
            "animals", "emotions", "routines", "حروف", "گنتی", "رنگ", "اشکال"
        ],
        content=CHILD_PORTAL_KNOWLEDGE["details"],
        priority=8,
    ),
    KnowledgeEntry(
        id="child_asking_for_help",
        title="Child Communication: Asking for Help",
        domain="child",
        personas=["child"],
        intents=["COMMUNICATION_COACHING", "CHILD_LEARNING"],
        keywords=[
            "ask for help", "help please", "teacher help", "stuck", "don't know", "madad", "madad chahiye",
            "help chahiye", "teacher se madad", "مدد", "مدد چاہیے", "پریشان"
        ],
        content=(
            "Micro-Steps for Children to Ask for Help:\n"
            "1. Look towards the teacher or grown-up.\n"
            "2. Say politely: 'Excuse me, can you help me please?'\n"
            "3. Point or explain simply what is hard: 'I am stuck on this picture/question.'\n"
            "4. Listen to the guidance and say 'Thank you!'\n\n"
            "Example Phrases:\n"
            "- English: 'Excuse me, Teacher. Could you please help me with this?'\n"
            "- Roman Urdu: 'Excuse me teacher, kya aap is question mein meri help kar sakte hain?'\n"
            "- Urdu: 'معاف کیجیے گا سر/مس، کیا آپ یہ سمجھنے میں میری مدد کر سکتے ہیں؟'\n\n"
            "Calming Strategy: If feeling nervous, take 2 slow deep breaths with hands on belly before speaking."
        ),
        priority=14,
        scenario_ids=["scenario_teacher_help", "scenario_teacher_confused"],
    ),
    KnowledgeEntry(
        id="child_introducing_and_sharing",
        title="Child Communication: Making Friends & Sharing",
        domain="child",
        personas=["child"],
        intents=["COMMUNICATION_COACHING", "CHILD_LEARNING"],
        keywords=[
            "make friends", "say hello", "introduce yourself", "share toys", "play together",
            "dost banana", "dosti", "khelna", "naam", "دوست بنانا", "دوستی", "کھیلنا", "سلام"
        ],
        content=(
            "Steps for Making Friends & Sharing:\n"
            "1. Smile, look at the other child, and wave gently.\n"
            "2. Greet and say your name: 'Hi, I am ___! What is your name?'\n"
            "3. Ask an easy fun question: 'Do you want to play together?' or 'What is your favorite game?'\n"
            "4. Sharing practice: 'Can I have a turn after you finish?'\n\n"
            "Example Phrases:\n"
            "- English: 'Hello! My name is [Name]. Would you like to build blocks together?'\n"
            "- Roman Urdu: 'Assalam-o-Alaikum! Mera naam [Name] hai. Kya hum mil kar khel sakte hain?'\n"
            "- Urdu: 'السلام علیکم! میرا نام [نام] ہے۔ کیا ہم مل کر کھیل سکتے ہیں؟'"
        ),
        priority=12,
        scenario_ids=["scenario_new_person", "scenario_talking_friend", "scenario_sharing", "scenario_join_group"],
    ),
    KnowledgeEntry(
        id="child_emotions_and_calming",
        title="Child Support: Understanding Feelings & Calming Down",
        domain="child",
        personas=["child"],
        intents=["CHILD_LEARNING", "COMMUNICATION_COACHING"],
        keywords=[
            "angry", "sad", "overwhelmed", "scared", "calm down", "feelings", "emotions", "gussa", "udas",
            "rone ka dil", "thak gaya", "غصہ", "اداس", "پریشان", "پرسکون"
        ],
        content=(
            "Understanding Big Feelings & Calming Steps:\n"
            "1. Name the feeling: 'I feel overwhelmed / I feel upset.'\n"
            "2. Non-clinical calming step: Sit down in a quiet spot, place hand on chest, count 1-2-3-4-5 slowly.\n"
            "3. Ask for a quiet break: 'I need a 2-minute quiet break please.'\n"
            "4. Remember: All feelings are okay, and you are safe."
        ),
        priority=11,
        scenario_ids=["scenario_feelings_overwhelmed"],
    ),

    # --- TEEN DOMAIN ---
    KnowledgeEntry(
        id="teen_portal_capabilities",
        title=TEEN_PORTAL_KNOWLEDGE["title"],
        domain="teen",
        personas=["teen"],
        intents=["TEEN_LEARNING"],
        keywords=[
            "teen communication", "group project", "school discussions", "teen skills",
            "نوجوان", "اسکول", "گروپ"
        ],
        content=TEEN_PORTAL_KNOWLEDGE["details"],
        priority=8,
    ),
    KnowledgeEntry(
        id="teen_conversation_starters",
        title="Teen Communication: Starting Conversations & Meeting Classmates",
        domain="teen",
        personas=["teen"],
        intents=["COMMUNICATION_COACHING", "TEEN_LEARNING"],
        keywords=[
            "classmate", "class fellow", "new classmate", "start conversation", "start a conversation", "conversation",
            "starting a conversation", "introduce yourself", "icebreaker", "break the ice", "ice breaker",
            "how to talk", "make friends", "first day", "yaar", "baat start", "baat shuru", "kya bolun", "naye dost",
            "class fellow se baat", "کلاس فیلو", "بات شروع", "تعارف", "دوست", "بات کیسے کروں"
        ],


        content=(
            "Actionable 5-Step Formula to Start a Conversation with a Classmate:\n"
            "1. Low-Pressure Greeting: Warm smile and natural opener.\n"
            "2. Situational Anchor: Reference the immediate shared context (class, teacher, assignment, weather, lunch).\n"
            "3. Ask an Open Question: Encourage them to share their thought without putting them on the spot.\n"
            "4. Active Listening: Acknowledge their reply before sharing your own thought ('Oh nice, that makes sense!').\n"
            "5. Easy Continuation or Exit: 'I'll see you in the next lecture!'\n\n"
            "Example Phrases:\n"
            "- English: 'Hey, are you taking this math class too? What did you think of that last problem?'\n"
            "- Roman Urdu: 'Hi, main [Name] hoon. Kya aap bhi is class mein ho? Aaj ka lecture kaisa laga?'\n"
            "- Urdu: 'السلام علیکم، میں [نام] ہوں۔ کیا آپ بھی اس کلاس میں ہیں؟ آج کا سبق کیسا لگا؟'"
        ),
        priority=16,
        scenario_ids=["scenario_new_person", "scenario_talking_friend", "scenario_teen_group_project"],
    ),
    KnowledgeEntry(
        id="teen_asking_teacher_help",
        title="Teen Communication: Asking a Teacher for Help & Extensions",
        domain="teen",
        personas=["teen"],
        intents=["COMMUNICATION_COACHING", "TEEN_LEARNING"],
        keywords=[
            "teacher help", "ask teacher", "homework help", "deadline extension", "confused about assignment",
            "teacher se baat", "extension chahiye", "sir se baat", "miss se baat", "استاد سے مدد", "ڈیڈ لائن", "اسائنمنٹ"
        ],
        content=(
            "Framework for Speaking with Teachers:\n"
            "1. Respectful Timing & Greeting: Approach before/after class or during office hours. 'Excuse me Mr./Ms. [Name], do you have a quick minute?'\n"
            "2. Specificity: Never just say 'I don't get it.' Say: 'I am reviewing slide 4, and I got confused between X and Y.'\n"
            "3. Show Prior Effort: 'I tried solving question 2 using the formula from Tuesday, but got stuck on step 3.'\n"
            "4. For Deadlines: Be honest in advance, explain circumstances politely, and propose a concrete alternative deadline.\n\n"
            "Example Phrases:\n"
            "- English: 'Excuse me, Sir. I attempted the practice problem, but I'm unsure about step 2. Could you clarify that part?'\n"
            "- Roman Urdu: 'Excuse me Sir, maine question solve karne ki koshish ki thi magar step 2 par confusion hai. Kya aap samjha sakte hain?'\n"
            "- Urdu: 'معاف کیجیے گا سر، میں نے سوال حل کرنے کی کوشش کی لیکن دوسرے مرحلے پر الجھن ہے۔ کیا آپ رہنمائی فرما سکتے ہیں؟'"
        ),
        priority=15,
        scenario_ids=["scenario_teacher_help", "scenario_teacher_confused", "scenario_teen_teacher_extension"],
    ),
    KnowledgeEntry(
        id="teen_peer_disputes",
        title="Teen Communication: Resolving Peer Disagreements Calmly",
        domain="teen",
        personas=["teen"],
        intents=["COMMUNICATION_COACHING", "TEEN_LEARNING"],
        keywords=[
            "disagreement", "argument", "fight with friend", "peer conflict", "group project argument",
            "dost se laraai", "jhagra", "larai", "dost naraz", "اختلاف", "لڑائی", "دوست سے جھگڑا"
        ],
        content=(
            "De-escalating Peer Conflicts:\n"
            "1. Emotional Pause: If feeling heated, wait 10 minutes before responding. Never escalate in group chats.\n"
            "2. Validate Their View First: 'I hear what you are saying about wanting to finish the slides today.'\n"
            "3. Use 'I' Statements: 'From my side, I felt overwhelmed because I also had an exam.' (Avoid 'You always / You never').\n"
            "4. Propose a Fair Solution: 'Can we divide the last section so neither of us has to do it alone?'"
        ),
        priority=13,
        scenario_ids=["scenario_teen_peer_dispute", "scenario_teen_group_project"],
    ),
    KnowledgeEntry(
        id="teen_social_anxiety_confidence",
        title="Teen Life-Skills: Social Confidence & Managing Hesitation",
        domain="teen",
        personas=["teen"],
        intents=["COMMUNICATION_COACHING", "TEEN_LEARNING"],
        keywords=[
            "social anxiety", "shy", "nervous talking", "hesitation", "embarrassment", "introvert",
            "sharam", "ghabrahat", "darr lagta hai", "baat karne se ghabrahat", "شرم", "گھبراہٹ", "جھجھک"
        ],
        content=(
            "Practical Tools for Social Confidence (Non-clinical):\n"
            "1. The 3-Second Rule: When you spot a friendly classmate, approach within 3 seconds before overthinking kicks in.\n"
            "2. Shift Focus Outward: Instead of monitoring yourself ('How do I look? What if I stutter?'), focus with curiosity on the other person.\n"
            "3. Prepare 2 Reliable Questions: Have two casual questions in mind ('What school did you go to before?' or 'Have you started the project?').\n"
            "4. Reframing: A pause in conversation is completely normal; it doesn't mean anything went wrong."
        ),
        priority=12,
    ),

    # --- ADULT DOMAIN ---
    KnowledgeEntry(
        id="adult_portal_capabilities",
        title=ADULT_PORTAL_KNOWLEDGE["title"],
        domain="adult",
        personas=["adult"],
        intents=["ADULT_LEARNING"],
        keywords=[
            "adult professional", "job interview", "workplace navigation", "manager clarification",
            "بالغ", "ملازمت", "دفتر"
        ],
        content=ADULT_PORTAL_KNOWLEDGE["details"],
        priority=8,
    ),
    KnowledgeEntry(
        id="adult_job_interview_prep",
        title="Adult Professional: Job Interview Mastery & STAR Method",
        domain="adult",
        personas=["adult"],
        intents=["COMMUNICATION_COACHING", "ADULT_LEARNING"],
        keywords=[
            "interview", "job interview", "interview prep", "star method", "job application", "career",
            "naukri", "mulazmat", "job ke liye", "interview practice", "pehlay kya bolun", "انٹرویو", "نوکری", "ملازمت", "انٹرویو کی تیاری", "پہلے کیا کہوں"
        ],
        content=(
            "Job Interview Strategy & Framework:\n"
            "1. Professional Self-Introduction (Elevator Pitch - 60 to 90 seconds):\n"
            "   - Present: What you currently do or recently studied.\n"
            "   - Past: Key experience, technical skills, or past achievements.\n"
            "   - Future: Why you are genuinely enthusiastic about this role and company.\n\n"
            "2. The STAR Framework for Behavioral Questions ('Tell me about a time when...'):\n"
            "   - Situation: Set the scene in 1-2 concise sentences (company, challenge, context).\n"
            "   - Task: What was your specific responsibility or deliverable?\n"
            "   - Action: Detailed steps YOU took, tools used, communication, problem-solving.\n"
            "   - Result: Quantifiable outcome, positive impact, or constructive lesson learned.\n\n"
            "3. Thoughtful Questions for the Interviewer:\n"
            "   - 'What does success look like in this position in the first 90 days?'\n"
            "   - 'How does the team collaborate on daily tasks and projects?'\n\n"
            "Example Opening Phrases:\n"
            "- English: 'Good morning. Thank you for this opportunity. I am excited to discuss how my background in [field] aligns with this role.'\n"
            "- Roman Urdu: 'Assalam-o-Alaikum, aapse mil kar khushi hui. Main ne [field] mein kaam kiya hai aur is position ke liye enthusiastic hoon.'\n"
            "- Urdu: 'السلام علیکم، آپ کا شکریہ۔ مجھے خوشی ہے کہ میں اپنے تجربے اور اس اسامی سے متعلق اپنی مہارتوں پر بات کر سکوں۔'"
        ),
        priority=18,
        scenario_ids=["scenario_adult_manager_clarification"],
    ),
    KnowledgeEntry(
        id="adult_workplace_communication",
        title="Adult Professional: Manager Clarifications & Workplace Assertiveness",
        domain="adult",
        personas=["adult"],
        intents=["COMMUNICATION_COACHING", "ADULT_LEARNING"],
        keywords=[
            "manager clarification", "boss", "supervisor", "workplace communication", "shift swap",
            "work priorities", "office email", "manager se baat", "shift tabdeel", "دفتر", "منیجر", "ملازمت", "شفٹ"
        ],
        content=(
            "Professional Workplace Communication:\n"
            "1. Seeking Task Clarification: 'Hi [Manager], to ensure I deliver this accurately, could you confirm the priority between Task A and Task B?'\n"
            "2. Requesting Shift Swaps: Offer advance notice, give a polite reason, and propose reciprocal coverage ('I can cover your Sunday shift in return').\n"
            "3. Written Confirmation: After important verbal discussions, send a brief 2-bullet email summarizing agreed deliverables and deadlines."
        ),
        priority=15,
        scenario_ids=["scenario_adult_manager_clarification", "scenario_adult_shift_swap"],
    ),
    KnowledgeEntry(
        id="adult_healthcare_pharmacy",
        title="Adult Community: Healthcare & Pharmacy Communication",
        domain="adult",
        personas=["adult"],
        intents=["COMMUNICATION_COACHING", "ADULT_LEARNING"],
        keywords=[
            "pharmacy", "medicine", "doctor", "prescription", "clinic", "dosage",
            "dawa", "doctor se baat", "medical store", "دوائی", "ڈاکٹر", "میڈیکل اسٹور", "کلینک"
        ],
        content=(
            "Healthcare & Pharmacy Interaction:\n"
            "1. With Pharmacists: State your prescription name, ask about exact dosage, timing ('Before or after meals?'), and inquire about side effects.\n"
            "2. With Doctors: Clearly describe symptoms, when they began, and current medications you are taking.\n"
            "3. Asking for Clarification: 'Could you please write down the schedule for this antibiotic?'"
        ),
        priority=14,
        scenario_ids=["scenario_adult_pharmacy_navigation"],
    ),
    KnowledgeEntry(
        id="adult_customer_service_disputes",
        title="Adult Community: Customer Support & Billing Disputes",
        domain="adult",
        personas=["adult"],
        intents=["COMMUNICATION_COACHING", "ADULT_LEARNING"],
        keywords=[
            "customer service", "customer support", "bill dispute", "billing error", "refund",
            "complaint", "bill zyada", "paisa wapis", "کسٹمر سروس", "بل", "شکایت"
        ],
        content=(
            "Resolving Customer Support Disputes:\n"
            "1. Stay Calm & Factual: State your customer reference number immediately.\n"
            "2. Specify the Exact Discrepancy: 'My normal monthly bill is Rs. 3,500, but this month's invoice reflects Rs. 6,800 without prior notice.'\n"
            "3. Request Resolution: 'Could you please check if there was a billing adjustment error?' (Avoid verbal aggression)."
        ),
        priority=13,
        scenario_ids=["scenario_adult_cs_dispute"],
    ),
    KnowledgeEntry(
        id="adult_social_connections",
        title="Adult Community: Making Friends & Social Connections",
        domain="adult",
        personas=["adult"],
        intents=["COMMUNICATION_COACHING", "ADULT_LEARNING", "GENERAL_QUESTION"],
        keywords=[
            "make friends", "making friends as an adult", "meet new people", "adult friendship", "social connection",
            "hobby group", "community group", "workplace socializing", "friends as an adult", "how to make friends",
            "dost banana", "naye dost", "adult friends", "socialize", "networking", "workplace friends",
            "office mein naye person se baat kaise shuru karun", "office mein naye logon se baat kaise karun",
            "work mein naye person se baat", "kaam par naye logon se baat", "naye person se baat kaise karun",
            "office mein naye person", "office mein naye log", "kaam par naye log", "office mein kisi naye person",
            "office mein baat", "work mein baat", "colleague se baat", "co-worker se baat",
            "دوست بنانا", "نئے دوست", "سوشل", "دوستی", "دوست کیسے بنائیں", "کام کی جگہ پر نئے لوگ", "دفتر میں نئے لوگ"
        ],
        content=(
            "Actionable Framework for Making Friends as an Adult:\n"
            "1. Choose Repeated Environments: Join consistent settings where you see the same people regularly (interest clubs, community volunteering, fitness/hobby classes, workplace common areas).\n"
            "2. Low-Pressure Shared-Interest Opener: Comment on the shared activity rather than starting with personal questions.\n"
            "   - 'Have you been coming to this group for long?'\n"
            "   - 'How did you get interested in this hobby?'\n"
            "3. Ask One Open-Ended Question: Encourage them to share an experience and actively listen to their answer without interrupting.\n"
            "4. Build Familiarity Gradually: Greet them by name the next time you meet; consistency builds trust without pressure.\n"
            "5. Low-Stakes Casual Invitation: Once rapport is established, suggest a brief, low-pressure transition:\n"
            "   - 'I am heading to grab coffee across the street, would you like to join?'\n\n"
            "Example Phrases:\n"
            "- English: 'Hi, I noticed you are working on [project/hobby]. How long have you been involved in this?'\n"
            "- Roman Urdu: 'Assalam-o-Alaikum, kya aap is group mein pehle bhi aaye hain? Aap ko is hobby mein interest kaise hua?'\n"
            "- Urdu: 'السلام علیکم، کیا آپ اس گروپ میں کافی عرصے سے آ رہے ہیں؟ آپ کو اس کام میں کیسے دلچسپی ہوئی؟'"
        ),
        priority=18,
    ),

    # --- PARENT DOMAIN ---
    KnowledgeEntry(
        id="parent_home_practice_framework",
        title="Parent Companion: Effective At-Home Communication Practice",
        domain="parent",
        personas=["parent"],
        intents=["PARENT_COACHING"],
        keywords=[
            "parent", "parent coaching", "home practice", "how to practice at home", "help child communicate",
            "support my learner", "walidain", "ghar par practice", "bachay ki madad", "make friends", "friends",
            "friendship", "social connection", "dost", "والدین", "گھر پر مشق", "بچے کی رہنمائی"
        ],

        content=(
            "Parent Companion Framework for At-Home Communication:\n"
            "1. Micro-Sessions (5–10 Minutes Daily): Keep practice short, joyful, and focused on one specific communication skill.\n"
            "2. Embedding in Natural Routines: Practice greeting during breakfast, turn-taking while setting the table, and asking for help during puzzle play.\n"
            "3. Immediate Specific Praise: Instead of generic 'Good job', say: 'I loved how you looked at me and said please when asking for the marker!'\n"
            "4. Visual Supports: Use simple pictures, checklists, and countdown timers to provide comforting predictability.\n"
            "5. Supportive Mandate: HumSaathi is an educational support partner. Never treat communication practice as high-pressure testing."
        ),
        priority=17,
    ),
    KnowledgeEntry(
        id="parent_teaching_help_seeking",
        title="Parent Companion: Helping a Learner Learn to Ask for Help",
        domain="parent",
        personas=["parent"],
        intents=["PARENT_COACHING"],
        keywords=[
            "my child doesn't know how to ask for help", "my kid struggles to ask", "teach child to ask for help",
            "how to help child ask", "hesitant to ask",
            "bacha help nahi maangta", "bacha help nahi mangta", "mera bacha help nahi maangta", "mera bacha help nahi mangta",
            "help nahi maangta", "help nahi mangta", "help mangna", "help maangna", "help maangta",
            "madad nahi maangta", "madad nahi mangta", "madad mangna", "madad maangna", "bacha madad nahi mangta", "bachay ko madad sikhana",
            "mera child help nahi karta", "bacha help nahi poochta", "bacha assistance nahi maangta",
            "بچہ مدد نہیں مانگتا", "مدد مانگنا سکھائیں", "والدین کی رہنمائی"
        ],

        content=(
            "How to Support a Learner Who Struggles to Ask for Help:\n"
            "1. Model Help-Seeking Out Loud: Let your child see you ask for help naturally ('This jar is tight. Could you help me hold the base?').\n"
            "2. Set Up Gentle Practice Moments: Place a favorite toy in a transparent container that is slightly hard to open. Wait patiently without rushing in.\n"
            "3. Use a Prompt Hierarchy:\n"
            "   - Level 1: Full verbal model: 'Say: Help please!'\n"
            "   - Level 2: Gentle partial prompt: 'What can you say? Hel...' \n"
            "   - Level 3: Non-verbal expectant pause and gesture.\n"
            "4. Celebrate the Attempt: The instant they attempt any signal (verbal, gesture, or sign), immediately respond with warm assistance.\n"
            "Educational Note: Never scold frustration; communication develops through patient, repeated positive reinforcement."
        ),
        priority=18,
    ),
    KnowledgeEntry(
        id="parent_sensory_support_and_calming",
        title="Parent Companion: Non-Clinical Sensory Support & Calming Routines",
        domain="parent",
        personas=["parent"],
        intents=["PARENT_COACHING"],
        keywords=[
            "child overwhelmed", "meltdown", "sensory overload", "calm my child", "child stressed",
            "bacha pareshan", "bachay ko calm karna", "بچے کو پرسکون کرنا", "گھبراہٹ"
        ],
        content=(
            "Parent Guidance for Calming & Sensory Support (Non-Clinical):\n"
            "1. Reduce Sensory Input: Dim harsh lighting, lower background television/appliance volume, and reduce verbal questioning.\n"
            "2. Create a Safe Decompression Corner: A cozy space with soft pillows, weighted blanket, or quiet books.\n"
            "3. Offer Binary Concrete Choices: Instead of open-ended questions ('What do you want to do?'), offer two choices: 'Water or cozy blanket?'\n"
            "4. Validate Calm Presence: Sit quietly beside them without demanding immediate verbal conversation until their heart rate and breathing settle.\n"
            "Safety Reminder: Always consult certified pediatricians or speech-language pathologists for clinical assessments."
        ),
        priority=16,
    ),
]


# =============================================================================
# MULTILINGUAL QUERY NORMALIZATION & RETRIEVAL ENGINE
# =============================================================================

def normalize_multilingual_text(text: str) -> str:
    """
    Safely normalizes text for keyword matching:
    - Lowercases Latin characters
    - Preserves Urdu Unicode letters (\u0600-\u06FF), English alphanumeric, and spaces
    - Strips English and Urdu/Arabic punctuation marks (including ؟, ،, ؛, ۔)
    - Collapses excessive whitespace
    """
    if not text:
        return ""
    clean = text.lower().strip()
    # Strip Arabic / Urdu specific punctuation marks: ؟ (\u061F), ، (\u060C), ؛ (\u061B), ۔ (\u06D4)
    clean = re.sub(r"[\u060C\u061B\u061F\u06D4\u060D]", " ", clean)
    # Replace remaining non-alphanumeric/non-Urdu characters with spaces
    clean = re.sub(r"[^\w\s\u0600-\u06FF]", " ", clean)
    return " ".join(clean.split())


def score_knowledge_entry(
    entry: KnowledgeEntry,
    norm_query: str,
    query_tokens: set[str],
    intent: IntentCategory,
    persona: str,
    scenario_id: Optional[str],
) -> int:
    """
    Calculates a domain-relevance score for a knowledge entry.
    Requires an actual keyword match or active scenario match before granting relevance,
    guaranteeing that out-of-domain queries (cricket, quantum physics, etc.) receive zero score.
    Enforces strict cross-persona isolation (child/teen/adult/parent never leak).
    """
    scenario_match = bool(scenario_id and entry.scenario_ids and scenario_id in entry.scenario_ids)

    # 1. Strict Cross-Persona Isolation (Prevent domain leakage)
    if persona == "child" and entry.domain in ["adult", "teen"]:
        return 0
    if persona == "adult" and entry.domain in ["teen", "child"] and "adult" not in entry.personas:
        return 0
    if persona == "teen" and entry.domain in ["adult", "child"] and "teen" not in entry.personas:
        if not any(k in norm_query for k in ["alphabet", "letter", "counting", "shape", "color", "حروف", "گنتی"]):
            return 0
    if persona == "parent" and entry.domain in ["child", "teen", "adult"] and "parent" not in entry.personas:
        return 0

    # 2. Multilingual Keyword & Phrase Matching
    keyword_score = 0
    for kw in entry.keywords:
        kw_norm = normalize_multilingual_text(kw)
        if not kw_norm:
            continue

        if " " in kw_norm:
            # Multi-word phrase matching
            if kw_norm in norm_query:
                keyword_score += 30
            else:
                kw_words = set(kw_norm.split())
                if len(kw_words) >= 2 and kw_words.issubset(query_tokens):
                    keyword_score += 25
        else:
            # Single-word token matching
            if kw_norm in query_tokens:
                keyword_score += 15
            elif kw_norm in norm_query:
                keyword_score += 10

    # If there is neither a keyword match nor an active scenario match,
    # the entry is not topically relevant to this query.
    if keyword_score == 0 and not scenario_match:
        return 0

    score = entry.priority + keyword_score

    # 3. Persona Alignment Bonus
    if persona in entry.personas:
        score += 25
    elif persona == "parent" and entry.domain == "parent":
        score += 45

    # 4. Intent Alignment Bonus
    if intent.value in entry.intents:
        score += 35
    if intent == IntentCategory.PARENT_COACHING and entry.domain == "parent":
        score += 55
    if intent == IntentCategory.COMMUNICATION_COACHING and "COMMUNICATION_COACHING" in entry.intents:
        score += 40

    # 5. Scenario Alignment Bonus
    if scenario_match:
        score += 50

    return max(0, score)




def retrieve_relevant_knowledge(
    intent: IntentCategory,
    persona: str = "teen",
    user_message: str = "",
    scenario_id: Optional[str] = None,
    top_k: int = 3,
) -> str:
    """
    Selectively retrieves relevant application context based on intent, persona, scenario,
    and multilingual keyword matching across English, Roman Urdu, and Urdu Unicode.
    Guarantees zero out-of-domain knowledge pollution.
    """
    norm_query = normalize_multilingual_text(user_message)
    query_tokens = set(norm_query.split())

    # Score each knowledge entry in the registry
    scored_entries = []
    for entry in KNOWLEDGE_REGISTRY:
        s = score_knowledge_entry(
            entry=entry,
            norm_query=norm_query,
            query_tokens=query_tokens,
            intent=intent,
            persona=persona,
            scenario_id=scenario_id,
        )
        scored_entries.append((s, entry))

    # Sort descending by score
    scored_entries.sort(key=lambda x: x[0], reverse=True)

    # Filter by minimum relevance threshold (score >= 25)
    selected_blocks: List[str] = []
    seen_ids = set()

    for score, entry in scored_entries:
        if score < 25:
            continue
        if entry.id in seen_ids:
            continue

        seen_ids.add(entry.id)
        selected_blocks.append(f"### {entry.title}\n{entry.content}")
        if len(selected_blocks) >= top_k:
            break

    # If no specialized entries passed threshold:
    if not selected_blocks:
        # Only provide a baseline if the user specifically asked a persona-learning or platform question
        if intent == IntentCategory.CHILD_LEARNING:
            return f"### {CHILD_PORTAL_KNOWLEDGE['title']}\n{CHILD_PORTAL_KNOWLEDGE['details']}"
        elif intent == IntentCategory.ADULT_LEARNING:
            return f"### {ADULT_PORTAL_KNOWLEDGE['title']}\n{ADULT_PORTAL_KNOWLEDGE['details']}"
        elif intent == IntentCategory.TEEN_LEARNING:
            return f"### {TEEN_PORTAL_KNOWLEDGE['title']}\n{TEEN_PORTAL_KNOWLEDGE['details']}"
        elif intent == IntentCategory.PROJECT_QUESTION:
            return f"### {HUMSAATHI_PLATFORM_OVERVIEW['title']}\n{HUMSAATHI_PLATFORM_OVERVIEW['summary']}"
        # For out-of-domain, general questions, technical questions, or unmatched queries: return empty context
        return ""

    return "\n\n".join(selected_blocks)

