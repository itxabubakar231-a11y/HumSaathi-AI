import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import {
  AiIcon,
  ArrowRightIcon,
  CheckIcon,
  MessageIcon,
  MicIcon,
  ProgressIcon,
  ShieldIcon,
  SparklesIcon,
} from '../components/ui/Icons';

const easeOut = [0.22, 1, 0.36, 1];

const practiceMoments = [
  {
    label: 'Start gently',
    coach: 'We can take this one step at a time. How would you greet the group?',
    reply: 'Assalam-o-alaikum. May I join your discussion?',
    skill: 'Clear opening',
  },
  {
    label: 'Try your words',
    coach: 'That is a good start. What idea would you like to contribute?',
    reply: 'I can organise the research and help explain our main point.',
    skill: 'Sharing an idea',
  },
  {
    label: 'Build confidence',
    coach: 'You made your role clear. Now ask the group what they need most.',
    reply: 'Which part would be most useful for me to take?',
    skill: 'Collaborative question',
  },
];

const journeySteps = [
  { number: '01', title: 'Choose a real moment', text: 'School, friendships, work, appointments, shopping, or everyday life.' },
  { number: '02', title: 'Practise without pressure', text: 'Type or speak, pause when you need to, and try a different way whenever you want.' },
  { number: '03', title: 'Understand what worked', text: 'Receive focused guidance on clarity, tone, listening, and the next useful step.' },
  { number: '04', title: 'Carry it into real life', text: 'Small, repeatable wins become stronger communication and lasting confidence.' },
];

const portals = [
  { id: 'child', age: 'Ages 4–12', title: 'A playful place to begin', text: 'Simple activities, gentle conversation practice, and calm encouragement for growing minds.', accent: 'sun' },
  { id: 'teen', age: 'Ages 13–19', title: 'A private space to find your voice', text: 'Real school and friendship situations, useful language, and feedback without judgement.', accent: 'sky' },
  { id: 'adult', age: 'Ages 20+', title: 'Practical confidence for everyday life', text: 'Workplace conversations, appointments, community situations, and independent living skills.', accent: 'leaf' },
];

const marqueeItems = ['English', 'اردو', 'Roman Urdu', 'Voice practice', 'Real-life scenarios', 'Sensory controls', 'Private progress'];

function CrescentMark({ size = 52 }) {
  return (
    <svg className="hs2-crescent" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M45.8 11.8A23 23 0 1 0 48 50.2 19.3 19.3 0 1 1 45.8 11.8Z" fill="currentColor" />
      <path d="m44.6 22.2 2.3 4.6 5.1.8-3.7 3.5.9 5-4.6-2.4-4.5 2.4.8-5-3.6-3.5 5-.8 2.3-4.6Z" fill="currentColor" />
    </svg>
  );
}

function StarShape({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 3c4 27 20 43 47 47-27 4-43 20-47 47C46 70 30 54 3 50 30 46 46 30 50 3Z" fill="currentColor" />
    </svg>
  );
}

function usePointerScene(reduceMotion) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 110, damping: 18, mass: 0.7 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), spring);
  const shiftX = useSpring(useTransform(x, [-0.5, 0.5], [-14, 14]), spring);
  const shiftY = useSpring(useTransform(y, [-0.5, 0.5], [-10, 10]), spring);

  const onPointerMove = (event) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const onPointerLeave = () => { x.set(0); y.set(0); };
  return { onPointerMove, onPointerLeave, rotateX, rotateY, shiftX, shiftY };
}

function HeroWorld({ reduceMotion }) {
  const scene = usePointerScene(reduceMotion);
  const float = (distance, duration, delay = 0) => reduceMotion ? {} : {
    animate: { y: [0, -distance, 0], rotate: [0, distance / 10, 0] },
    transition: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
  };

  return (
    <motion.div
      className="hs2-world"
      onPointerMove={scene.onPointerMove}
      onPointerLeave={scene.onPointerLeave}
      style={reduceMotion ? undefined : { rotateX: scene.rotateX, rotateY: scene.rotateY, transformPerspective: 1200 }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.85, delay: 0.18, ease: easeOut }}
    >
      <motion.div className="hs2-world-halo" animate={reduceMotion ? {} : { rotate: 360 }} transition={{ duration: 36, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="hs2-world-orbit hs2-world-orbit-one" animate={reduceMotion ? {} : { rotate: -360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}><i /></motion.div>
      <motion.div className="hs2-world-orbit hs2-world-orbit-two" animate={reduceMotion ? {} : { rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}><i /></motion.div>

      <motion.div className="hs2-world-arch" style={reduceMotion ? undefined : { x: scene.shiftX, y: scene.shiftY }}>
        <div className="hs2-arch-pattern" />
        <motion.div className="hs2-world-mark" animate={reduceMotion ? {} : { scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}><CrescentMark size={72} /></motion.div>
        <span className="hs2-world-urdu">ہم ساتھ سیکھتے ہیں</span>
        <strong>Your words.<br />Your pace.</strong>
      </motion.div>

      <motion.div className="hs2-float-card hs2-float-card-chat" {...float(12, 4.6)}>
        <span className="hs2-mini-icon"><MessageIcon size={18} /></span>
        <div><small>Practice prompt</small><strong>What would you say?</strong></div>
      </motion.div>
      <motion.div className="hs2-float-card hs2-float-card-skill" {...float(10, 5.2, 0.5)}>
        <span className="hs2-mini-icon is-yellow"><ProgressIcon size={18} /></span>
        <div><small>Confidence</small><strong>Growing steadily</strong><i><b /></i></div>
      </motion.div>
      <motion.div className="hs2-float-card hs2-float-card-voice" {...float(8, 4.1, 0.25)}>
        <MicIcon size={20} /><span><b /><b /><b /><b /><b /></span>
      </motion.div>
      <motion.div className="hs2-letter-card hs2-letter-en" {...float(9, 4.8, 0.15)}>A</motion.div>
      <motion.div className="hs2-letter-card hs2-letter-ur" {...float(11, 5.5, 0.7)}>ا</motion.div>
      <motion.div className="hs2-world-star" {...float(14, 5.8, 0.2)}><StarShape /></motion.div>
    </motion.div>
  );
}

function PracticeDemo({ reduceMotion }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % practiceMoments.length), 4200);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const moment = practiceMoments[active];
  return (
    <div className="hs2-demo-shell">
      <div className="hs2-demo-topbar"><span><i /> Live practice</span><small>Joining a group discussion</small></div>
      <div className="hs2-demo-tabs" role="tablist" aria-label="Practice stages">
        {practiceMoments.map((item, index) => (
          <button key={item.label} type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)}><span>{index + 1}</span>{item.label}</button>
        ))}
      </div>
      <div className="hs2-demo-stage">
        <AnimatePresence mode="wait">
          <motion.div className="hs2-demo-conversation" key={active} initial={reduceMotion ? false : { opacity: 0, y: 16, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={reduceMotion ? undefined : { opacity: 0, y: -10, filter: 'blur(4px)' }} transition={{ duration: 0.42, ease: easeOut }}>
            <div className="hs2-demo-coach"><span><CrescentMark size={27} /></span><p>{moment.coach}</p></div>
            <motion.div className="hs2-demo-reply" initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.4 }}><p>{moment.reply}</p><span>You</span></motion.div>
            <motion.div className="hs2-demo-skill" initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 260, damping: 20 }}><CheckIcon size={16} /> {moment.skill}</motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="hs2-demo-compose"><span>Try your response</span><button type="button" aria-label="Speak response"><MicIcon size={18} /></button></div>
    </div>
  );
}

function Reveal({ children, className = '', delay = 0, ...props }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.7, delay, ease: easeOut }} {...props}>{children}</motion.div>
  );
}

export default function LandingPage() {
  const { user } = useUser();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const processRef = useRef(null);
  const isRtl = language === 'ur';
  const enterApp = () => navigate(user?.id ? '/dashboard' : '/signup');
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 24, restDelta: 0.001 });
  const { scrollYProgress: processProgress } = useScroll({ target: processRef, offset: ['start 75%', 'end 40%'] });
  const lineScale = useSpring(processProgress, { stiffness: 90, damping: 22 });

  const heroContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } } };
  const heroItem = reduceMotion ? {} : { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: easeOut } } };

  return (
    <div className="hs2-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div className="hs2-scroll-progress" style={{ scaleX: smoothProgress }} />

      <header className="hs2-nav-wrap">
        <div className="hs2-nav">
          <Link className="hs2-logo" to="/" aria-label="HumSaathi home"><img src="/humsaathi-logo-v1.png" alt="HumSaathi" /></Link>
          <nav aria-label="Home page navigation"><a href="#how">How it works</a><a href="#for-everyone">For everyone</a><a href="#safety">Designed with care</a></nav>
          <div className="hs2-nav-actions">
            {!user?.id && <Link className="hs2-login" to="/login">Sign in</Link>}
            <motion.button type="button" className="hs2-button hs2-button-nav" onClick={enterApp} whileHover={reduceMotion ? {} : { y: -2 }} whileTap={reduceMotion ? {} : { scale: 0.97 }}>{user?.id ? 'Open dashboard' : 'Start practising'} <ArrowRightIcon size={16} /></motion.button>
          </div>
        </div>
      </header>

      <main>
        <section className="hs2-hero">
          <motion.div className="hs2-hero-blob hs2-hero-blob-one" aria-hidden="true" animate={reduceMotion ? {} : { x: [0, 25, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="hs2-hero-blob hs2-hero-blob-two" aria-hidden="true" animate={reduceMotion ? {} : { x: [0, -18, 0], y: [0, 24, 0], rotate: [0, 12, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          <div className="hs2-hero-grid">
            <motion.div className="hs2-hero-copy" variants={heroContainer} initial={reduceMotion ? false : 'hidden'} animate="visible">
              <motion.div className="hs2-eyebrow" variants={heroItem}><span>Pakistan’s communication companion</span><i /></motion.div>
              <motion.h1 variants={heroItem}>Real-life practice.<br /><span>Confidence that stays.</span></motion.h1>
              <motion.p className="hs2-hero-text" variants={heroItem}>A calm AI companion that helps children, teens, and adults find the right words for everyday conversations—in English, Urdu, and Roman Urdu.</motion.p>
              <motion.div className="hs2-hero-actions" variants={heroItem}>
                <motion.button className="hs2-button hs2-button-main" type="button" onClick={enterApp} whileHover={reduceMotion ? {} : { y: -4, boxShadow: '0 18px 35px rgba(5, 82, 55, .23)' }} whileTap={reduceMotion ? {} : { scale: 0.97 }}>{user?.id ? 'Continue your journey' : 'Start free'} <ArrowRightIcon size={18} /></motion.button>
                <button className="hs2-watch" type="button" onClick={() => document.querySelector('#how')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })}><span><SparklesIcon size={16} /></span> See how it works</button>
              </motion.div>
              <motion.div className="hs2-hero-proof" variants={heroItem}><div className="hs2-proof-faces" aria-hidden="true"><span>C</span><span>T</span><span>A</span></div><p><strong>One familiar space</strong><small>Personalised for every stage of life</small></p></motion.div>
            </motion.div>
            <HeroWorld reduceMotion={reduceMotion} />
          </div>
          <div className="hs2-wave" aria-hidden="true"><svg viewBox="0 0 1440 110" preserveAspectRatio="none"><path d="M0 58C219 121 427 9 687 56c266 49 435 33 753-28v82H0Z" /></svg></div>
        </section>

        <section className="hs2-marquee" aria-label="HumSaathi capabilities"><motion.div animate={reduceMotion ? {} : { x: ['0%', '-50%'] }} transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}>{[...marqueeItems, ...marqueeItems].map((item, index) => <span key={`${item}-${index}`}>{item}<i /></span>)}</motion.div></section>

        <section className="hs2-intro">
          <Reveal className="hs2-intro-heading"><span className="hs2-label">Made for real life</span><h2>More than answers.<br />A place to <em>practise.</em></h2></Reveal>
          <Reveal className="hs2-intro-copy" delay={0.1}><p>Knowing what to say can be hard. HumSaathi turns everyday moments into guided, repeatable practice—so learners can pause, try again, and grow without pressure.</p><div><span><ShieldIcon size={18} /> Private by design</span><span><AiIcon size={18} /> Age-aware guidance</span></div></Reveal>
        </section>

        <section className="hs2-how" id="how" ref={processRef}>
          <div className="hs2-how-inner">
            <div className="hs2-how-copy">
              <Reveal><span className="hs2-label is-light">How HumSaathi works</span><h2>From unsure<br />to ready.</h2><p>One useful step at a time, with support that never rushes the learner.</p></Reveal>
              <div className="hs2-steps">
                <motion.div className="hs2-step-line" style={{ scaleY: lineScale }} />
                {journeySteps.map((step, index) => <motion.article key={step.number} initial={reduceMotion ? false : { opacity: 0.35, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.65 }} transition={{ duration: 0.5, delay: index * 0.04 }}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></motion.article>)}
              </div>
            </div>
            <Reveal className="hs2-demo-wrap" delay={0.12}><PracticeDemo reduceMotion={reduceMotion} /></Reveal>
          </div>
        </section>

        <section className="hs2-bento">
          <Reveal className="hs2-section-title"><span className="hs2-label">Built around the learner</span><h2>Support that feels thoughtful,<br />not overwhelming.</h2></Reveal>
          <div className="hs2-bento-grid">
            <Reveal className="hs2-bento-card hs2-bento-language"><div className="hs2-card-icon"><MessageIcon size={21} /></div><span className="hs2-card-kicker">Three languages</span><h3>Speak the way that feels natural.</h3><p>Move between English, Urdu script, and Roman Urdu while keeping the same familiar experience.</p><div className="hs2-language-stack" aria-hidden="true"><motion.span whileHover={reduceMotion ? {} : { x: 8 }}>English</motion.span><motion.span whileHover={reduceMotion ? {} : { x: 8 }} className="hs2-urdu-text">اردو</motion.span><motion.span whileHover={reduceMotion ? {} : { x: 8 }}>Roman Urdu</motion.span></div></Reveal>
            <Reveal className="hs2-bento-card hs2-bento-calm" delay={0.08}><div className="hs2-card-icon"><SparklesIcon size={21} /></div><span className="hs2-card-kicker">Sensory aware</span><h3>A calmer screen when the world feels loud.</h3><p>Control motion, contrast, sound, and text size at any time.</p><div className="hs2-calm-visual" aria-hidden="true"><motion.i animate={reduceMotion ? {} : { scale: [1, 1.13, 1], opacity: [.45, .8, .45] }} transition={{ duration: 4, repeat: Infinity }} /><span><CrescentMark size={46} /></span></div></Reveal>
            <Reveal className="hs2-bento-card hs2-bento-progress" delay={0.14}><div className="hs2-card-icon"><ProgressIcon size={21} /></div><span className="hs2-card-kicker">Visible progress</span><h3>See every small win add up.</h3><p>Track practice, strengths, and useful next steps without turning growth into pressure.</p><div className="hs2-bars" aria-hidden="true">{[42, 63, 54, 78, 88].map((height, index) => <motion.i key={height} initial={{ height: 8 }} whileInView={{ height }} viewport={{ once: true }} transition={{ delay: .2 + index * .09, type: 'spring', stiffness: 120 }} />)}</div></Reveal>
          </div>
        </section>

        <section className="hs2-portals" id="for-everyone">
          <Reveal className="hs2-section-title hs2-section-title-row"><div><span className="hs2-label">One saathi, every stage</span><h2>It grows with you.</h2></div><p>Each portal changes its pace, vocabulary, activities, and feedback—not just its colours.</p></Reveal>
          <div className="hs2-portal-list">
            {portals.map((portal, index) => <motion.article className={`hs2-portal is-${portal.accent}`} key={portal.id} initial={reduceMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * .08, duration: .6, ease: easeOut }} whileHover={reduceMotion ? {} : { y: -8 }}><div className="hs2-portal-top"><span>{`0${index + 1}`}</span><small>{portal.age}</small></div><div className="hs2-portal-figure" aria-hidden="true"><span /><i /><b /></div><h3>{portal.title}</h3><p>{portal.text}</p><button type="button" onClick={enterApp} aria-label={`Explore ${portal.id} portal`}>Explore portal <ArrowRightIcon size={17} /></button></motion.article>)}
          </div>
        </section>

        <section className="hs2-safety" id="safety">
          <div className="hs2-safety-art" aria-hidden="true"><motion.div className="hs2-safety-ring ring-one" animate={reduceMotion ? {} : { rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}><span /></motion.div><motion.div className="hs2-safety-ring ring-two" animate={reduceMotion ? {} : { rotate: -360 }} transition={{ duration: 19, repeat: Infinity, ease: 'linear' }}><span /></motion.div><div className="hs2-safety-center"><ShieldIcon size={38} /><strong>Safe space</strong><small>Practice without judgement</small></div></div>
          <Reveal className="hs2-safety-copy"><span className="hs2-label">Designed with care</span><h2>Comfort is not an extra feature.</h2><p>HumSaathi is built to give learners more control, more privacy, and more room to communicate in their own way.</p><ul><li><CheckIcon size={16} /> No public profiles or learner-to-learner chat</li><li><CheckIcon size={16} /> Reduced-motion and calm-mode support</li><li><CheckIcon size={16} /> Caregiver insights without public comparison</li><li><CheckIcon size={16} /> Clear language and keyboard-friendly navigation</li></ul></Reveal>
        </section>

        <section className="hs2-cta">
          <motion.div className="hs2-cta-star star-one" animate={reduceMotion ? {} : { rotate: 360, scale: [1, 1.12, 1] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}><StarShape /></motion.div><motion.div className="hs2-cta-star star-two" animate={reduceMotion ? {} : { rotate: -360, y: [0, -12, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}><StarShape /></motion.div>
          <Reveal className="hs2-cta-inner"><CrescentMark size={56} /><span className="hs2-cta-urdu">ہر قدم پر، ہم ساتھی</span><h2>The next conversation<br />can feel easier.</h2><p>Begin with one small practice. Take the confidence with you.</p><motion.button type="button" className="hs2-button hs2-button-cream" onClick={enterApp} whileHover={reduceMotion ? {} : { y: -4, scale: 1.02 }} whileTap={reduceMotion ? {} : { scale: .97 }}>{user?.id ? 'Return to dashboard' : 'Create your free profile'} <ArrowRightIcon size={18} /></motion.button></Reveal>
        </section>
      </main>

      <footer className="hs2-footer"><Link className="hs2-logo" to="/"><img src="/humsaathi-logo-v1.png" alt="HumSaathi" /></Link><p>{t('app.disclaimer') || 'HumSaathi supports practice and learning; it does not replace professional care.'}</p><span>Built with care in Pakistan</span></footer>
    </div>
  );
}
