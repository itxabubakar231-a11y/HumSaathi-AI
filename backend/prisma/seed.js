import { PrismaClient } from '@prisma/client';
import { getActivityContent } from '../src/activities/registry.js';

const prisma = new PrismaClient();

const PERSONAS = ['child', 'teen', 'adult'];
const LANGUAGES = ['en', 'ur', 'ur_rm'];
const DIFFICULTIES = ['beginner', 'easy', 'medium'];

const ACTIVITY_DEFS = [
  { type: 'letter', topic: 'letters', titles: { en: 'Letter Learning', ur: 'حروف سیکھیں', ur_rm: 'Harf Seekhein' } },
  { type: 'number', topic: 'numbers', titles: { en: 'Number Learning', ur: 'نمبر سیکھیں', ur_rm: 'Number Seekhein' } },
  { type: 'shape_color_match', topic: 'colors', titles: { en: 'Shape & Color Match', ur: 'شکل اور رنگ', ur_rm: 'Shape aur Rang' } },
  { type: 'shape_color_match', topic: 'shapes', titles: { en: 'Shape Matching', ur: 'شکل ملائیں', ur_rm: 'Shape Milayein' } },
  { type: 'counting', topic: 'counting', titles: { en: 'Object Counting', ur: 'چیزیں گنیں', ur_rm: 'Cheezein Ginein' } },
  { type: 'animal_matching', topic: 'animals', titles: { en: 'Animal Matching', ur: 'جانوروں کا ملاپ', ur_rm: 'Janwaron Ka Milaap' } },
  { type: 'emotion_learning', topic: 'emotions', titles: { en: 'Emotion Learning', ur: 'جذبات و احساسات', ur_rm: 'Jazbaat o Ehsaasaat' } },
  { type: 'routine_sequencing', topic: 'routines', titles: { en: 'Daily Routine Sequence', ur: 'روزمرہ معمولات', ur_rm: 'Rozmarrah Maamulaat' } },
];

async function main() {
  await prisma.conversationEvaluation.deleteMany();
  await prisma.conversationSession.deleteMany();
  await prisma.communicationScenario.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.aiRecommendation.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();

  const demoUsers = [
    { name: 'Ayesha (Strong)', persona: 'child', language: 'en' },
    { name: 'Bilal (Practice)', persona: 'child', language: 'ur_rm' },
  ];

  for (const demo of demoUsers) {
    await prisma.user.create({
      data: {
        name: demo.name,
        persona: demo.persona,
        language: demo.language,
        sensoryPrefs: JSON.stringify({
          textSize: 'medium',
          soundEnabled: false,
          animationsEnabled: true,
          reducedMotion: false,
          highContrast: false,
          calmMode: true,
        }),
        setupComplete: false,
        parentPin: '1234',
      },
    });
  }

  for (const def of ACTIVITY_DEFS) {
    for (const language of LANGUAGES) {
      for (const difficulty of DIFFICULTIES) {
        const content = getActivityContent(def.type, difficulty, language);
        await prisma.activity.create({
          data: {
            type: def.type,
            topic: def.topic,
            title: def.titles[language] || def.titles.en,
            difficulty,
            language,
            personas: JSON.stringify(PERSONAS),
            content: JSON.stringify(content),
            isActive: true,
          },
        });
      }
    }
  }

  const count = await prisma.activity.count();
  console.log(`Seeded ${count} activities and ${demoUsers.length} demo user placeholders.`);

  const scenarios = [
    {
      title: 'Asking a teacher for help',
      description: 'Practice raising your hand and asking your teacher for help with an assignment.',
      aiRole: 'teacher',
      personas: JSON.stringify(['child']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'easy',
      objectives: JSON.stringify([
        'Approach the teacher politely (e.g. excuse me)',
        'State clearly what assignment or task you need help with',
        'Thank the teacher for their explanation'
      ]),
      context: 'You are a kind, patient school teacher. A student approaches you to ask for help with their class assignment. Stay in character as a helpful teacher. Keep your responses simple, polite, and encouraging.',
      initialPrompt: JSON.stringify({
        en: 'Hello! I noticed you are working hard. Do you need some help with this assignment?',
        ur: 'ہیلو! میں نے دیکھا کہ آپ محنت کر رہے ہیں۔ کیا آپ کو اس کام میں کچھ مدد کی ضرورت ہے؟',
        ur_rm: 'Hello! Main ne dekha ke aap mehnat kar rahe hain. Kya aap ko is kaam mein kuch madad ki zaroorat hai?'
      })
    },
    {
      title: 'Telling a teacher something is not understood',
      description: 'Practice explaining politely to a teacher when you do not understand a topic.',
      aiRole: 'teacher',
      personas: JSON.stringify(['child']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'easy',
      objectives: JSON.stringify([
        'Politely interrupt or get the teacher\'s attention',
        'Explain specifically that you do not understand the lesson',
        'Ask them to explain it again or in a different way'
      ]),
      context: 'You are a patient and supportive teacher. A student comes to tell you they do not understand a topic you just explained. Act as the teacher. Ask them what part was confusing, offer a brief simple explanation, and check if it is clearer now.',
      initialPrompt: JSON.stringify({
        en: 'Hi there! We just went over the new lesson. Is everything clear, or would you like me to explain anything again?',
        ur: 'ہیلو! ہم نے ابھی نیا سبق مکمل کیا ہے۔ کیا سب کچھ واضح ہے، یا آپ چاہتے ہیں کہ میں کچھ دوبارہ سمجھاؤں؟',
        ur_rm: 'Hi there! Hum ne abhi naya sabak mukammal kiya hai. Kya sab kuch wazih hai, ya aap chahte hain ke main kuch dobara samjhaon?'
      })
    },
    {
      title: 'Meeting someone new',
      description: 'Practice introducing yourself and asking questions to meet a new person.',
      aiRole: 'classmate',
      personas: JSON.stringify(['child']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'beginner',
      objectives: JSON.stringify([
        'Say hello and introduce yourself by name',
        'Ask the other person their name',
        'Ask a friendly question about their hobbies or interests'
      ]),
      context: 'You are a new classmate or colleague. You are friendly, approachable, and open to making new friends. Act as the peer. Respond to introductions, share your name, and ask about their favorite hobbies.',
      initialPrompt: JSON.stringify({
        en: 'Hi! I don\'t think we\'ve met before. I just joined this class/group. I\'m Alex. What\'s your name?',
        ur: 'ہیلو! میرے خیال میں ہم پہلے نہیں ملے۔ میں نے ابھی یہ گروپ جوائن کیا ہے۔ میں الیکس ہوں۔ آپ کا نام کیا ہے؟',
        ur_rm: 'Hi! Mere khayal mein hum pehle nahi mile. Main ne abhi yeh group join kiya hai. Main Alex hoon. Aap ka naam kya hai?'
      })
    },
    {
      title: 'Talking to a friend',
      description: 'Practice starting a friendly conversation and sharing plans with a friend.',
      aiRole: 'friend',
      personas: JSON.stringify(['child']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'easy',
      objectives: JSON.stringify([
        'Greet your friend warmly',
        'Ask them about their day or how they are doing',
        'Share what you did recently or discuss weekend plans'
      ]),
      context: 'You are a close and friendly friend of the learner. Act as their classmate/friend. Speak in a warm, informal tone. Respond to their greeting, tell them about your day, and ask them if they have any plans for the weekend.',
      initialPrompt: JSON.stringify({
        en: 'Hey! I was hoping I\'d see you today! How has your day been so far?',
        ur: 'ہیلو! مجھے امید تھی کہ آج آپ سے ملاقات ہوگی! آپ کا دن اب تک کیسا رہا؟',
        ur_rm: 'Hey! Mujhe umeed thi ke aaj aap se mulaqat hogi! Aap ka din ab tak kaisa raha?'
      })
    },
    {
      title: 'Buying something from a shop',
      description: 'Practice ordering/buying an item and paying the shopkeeper.',
      aiRole: 'shopkeeper',
      personas: JSON.stringify(['child']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'easy',
      objectives: JSON.stringify([
        'Greet the shopkeeper and politely request the item you want',
        'Ask for the price of the item',
        'Complete the transaction and say thank you'
      ]),
      context: 'You are a polite shopkeeper at a local stationery or snack shop. Act as the shopkeeper. Ask the customer what they need, state the price of the item, receive the money, and wish them a good day.',
      initialPrompt: JSON.stringify({
        en: 'Welcome to the shop! What can I get for you today?',
        ur: 'دکان پر خوش آمدید! میں آج آپ کے لیے کیا پیش کر سکتا ہوں؟',
        ur_rm: 'Dukan par khush aamdeed! Main aaj aap ke liye kya pesh kar sakta hoon?'
      })
    },
    {
      title: 'Asking someone for help/directions',
      description: 'Practice getting someone\'s attention politely to ask for directions.',
      aiRole: 'passerby',
      personas: JSON.stringify(['child']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'easy',
      objectives: JSON.stringify([
        'Say "Excuse me" or get attention politely',
        'Ask clearly for directions to a specific place (like the library)',
        'Thank them politely after they give directions'
      ]),
      context: 'You are a friendly passerby walking down the street. A learner approaches you asking for directions. Act as the passerby. Give simple, clear directions and be very polite.',
      initialPrompt: JSON.stringify({
        en: 'Hello! Do you need some help? You look a bit lost.',
        ur: 'ہیلو! کیا آپ کو کچھ مدد کی ضرورت ہے؟ آپ تھوڑے پریشان لگ رہے ہیں۔',
        ur_rm: 'Hello! Kya aap ko kuch madad ki zaroorat hai? Aap thore pareshan lag rahe hain.'
      })
    },
    {
      title: 'Joining a Group Discussion',
      description: 'Practice joining a classroom study group or project discussion politely.',
      aiRole: 'classmate',
      personas: JSON.stringify(['teen']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'easy',
      objectives: JSON.stringify([
        'Ask politely if you can join the group',
        'Listen to the ongoing topic',
        'Share your ideas constructively'
      ]),
      context: 'You are a friendly high-school/college classmate working on a study group discussion. Act as a welcoming peer.',
      initialPrompt: JSON.stringify({
        en: 'Hey! We are discussing ideas for the project. Would you like to join our table?',
        ur: 'ارے! ہم پروجیکٹ کے خیالات پر بات کر رہے ہیں۔ کیا آپ ہمارے ساتھ شامل ہونا چاہیں گے؟',
        ur_rm: 'Hey! Hum project ke ideas discuss kar rahe hain. Kya aap humare table par join karna chahenge?'
      })
    },
    {
      title: 'Asking Manager for Task Clarification',
      description: 'Practice asking a supervisor for clear guidance and priorities on a work task.',
      aiRole: 'manager',
      personas: JSON.stringify(['adult']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'easy',
      objectives: JSON.stringify([
        'Greet your manager professionally',
        'State the specific task or question clearly',
        'Confirm next steps before finishing'
      ]),
      context: 'You are a busy but supportive department supervisor at work. A team member approaches you to clarify task priorities.',
      initialPrompt: JSON.stringify({
        en: 'Good morning! How can I help you with today\'s project tasks?',
        ur: 'صبح بخیر! آج کے دفتری کاموں کے سلسلے میں، میں آپ کی کیا مدد کر سکتا ہوں؟',
        ur_rm: 'Good morning! Aaj ke tasks ke silsilay mein main aap ki kya madad kar sakta hoon?'
      })
    },
    {
      title: 'Making Friends & Joining a Conversation',
      description: 'Practice joining a conversation with classmates, asking questions, and taking turns naturally.',
      aiRole: 'classmate',
      personas: JSON.stringify(['teen']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'easy',
      objectives: JSON.stringify([
        'Join an ongoing conversation politely',
        'Ask appropriate questions to participate',
        'Take turns speaking and respond naturally',
        'Handle the conversation ending gracefully'
      ]),
      context: 'You are a group of friendly classmates chatting during lunch break about a recent school event. A new student approaches and wants to join the conversation. Act as a welcoming classmate. Include them in the topic, ask their opinion, and keep the conversation flowing naturally.',
      initialPrompt: JSON.stringify({
        en: 'Hey! We were just talking about the school fair last weekend. It was so much fun! Did you go?',
        ur: 'ارے! ہم ابھی پچھلے ہفتے کے سکول میلے کے بارے میں بات کر رہے تھے۔ بہت مزہ آیا تھا! کیا آپ گئے تھے؟',
        ur_rm: 'Hey! Hum abhi pichle hafte ke school fair ke baare mein baat kar rahe the. Bohot maza aaya tha! Kya aap gaye the?'
      })
    },
    {
      title: 'School Presentation / Asking for Help',
      description: 'Practice asking a teacher or classmate for help with a school assignment or presentation.',
      aiRole: 'teacher',
      personas: JSON.stringify(['teen']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'medium',
      objectives: JSON.stringify([
        'Explain clearly what you need help with',
        'Ask for clarification when you do not understand',
        'Respond to questions about your work',
        'Express uncertainty politely',
        'End the conversation appropriately'
      ]),
      context: 'You are a supportive high school teacher. A student approaches you because they are struggling with their upcoming class presentation and need guidance on how to organize their content and practice their delivery. Be helpful, ask clarifying questions, and offer practical tips.',
      initialPrompt: JSON.stringify({
        en: 'Hi there! I noticed you stayed behind after class. Is everything okay with the presentation assignment?',
        ur: 'ہیلو! میں نے دیکھا کہ آپ کلاس کے بعد رُکے ہیں۔ کیا پریزنٹیشن اسائنمنٹ میں سب ٹھیک ہے؟',
        ur_rm: 'Hi! Main ne dekha ke aap class ke baad ruke hain. Kya presentation assignment mein sab theek hai?'
      })
    },
    {
      title: 'Workplace Communication',
      description: 'Practice having a professional conversation with a coworker or manager about a work issue.',
      aiRole: 'manager',
      personas: JSON.stringify(['adult']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'medium',
      objectives: JSON.stringify([
        'Start a professional conversation appropriately',
        'Explain a work problem clearly',
        'Ask for clarification on instructions',
        'Respond professionally to feedback',
        'Confirm next steps before ending'
      ]),
      context: 'You are a supportive office manager. An employee comes to discuss a problem they encountered with a client order — some items were shipped incorrectly and the client called to complain. Be professional, listen carefully, ask clarifying questions, and help them figure out the next steps to resolve the issue.',
      initialPrompt: JSON.stringify({
        en: 'Good morning! I got your email about the client issue. Come in, have a seat. Tell me what happened.',
        ur: 'صبح بخیر! مجھے کلائنٹ کے مسئلے کے بارے میں آپ کی ای میل ملی۔ آئیں، بیٹھیں۔ بتائیں کیا ہوا؟',
        ur_rm: 'Good morning! Mujhe client issue ke baare mein aap ki email mili. Aayein, baithein. Batayein kya hua?'
      })
    },
    {
      title: 'Everyday Appointment / Service Conversation',
      description: 'Practice making an appointment or speaking with customer service for everyday needs.',
      aiRole: 'receptionist',
      personas: JSON.stringify(['adult']),
      languages: JSON.stringify(['en', 'ur', 'ur_rm']),
      difficulty: 'easy',
      objectives: JSON.stringify([
        'Greet the service person appropriately',
        'Explain clearly what you need (appointment, information, service)',
        'Ask relevant questions about timing, cost, or details',
        'Understand the response and confirm details',
        'End the conversation politely'
      ]),
      context: 'You are a friendly receptionist at a local health clinic. A patient calls or walks in wanting to book a dental checkup appointment. Be polite, ask about their preferred date and time, check availability, confirm the appointment details, and remind them to bring their ID card.',
      initialPrompt: JSON.stringify({
        en: 'Hello, welcome to City Health Clinic! How can I help you today?',
        ur: 'ہیلو، سٹی ہیلتھ کلینک میں خوش آمدید! آج میں آپ کی کیا مدد کر سکتا ہوں؟',
        ur_rm: 'Hello, City Health Clinic mein khush aamdeed! Aaj main aap ki kya madad kar sakta hoon?'
      })
    }
  ];

  for (const s of scenarios) {
    await prisma.communicationScenario.create({ data: s });
  }

  const scenarioCount = await prisma.communicationScenario.count();
  console.log(`Seeded ${scenarioCount} communication scenarios.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
