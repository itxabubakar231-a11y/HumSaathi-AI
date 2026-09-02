import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useUser } from '../context/UserContext';
import { useI18n } from '../context/I18nContext';
import {
  AiIcon, ArrowRightIcon, CheckIcon, MessageIcon, MicIcon,
  ProgressIcon, ShieldIcon, SparklesIcon, UsersIcon,
} from '../components/ui/Icons';

const portalCards = [
  { number: '01', title: 'Child portal', age: 'Ages 4–12', description: 'Playful foundations for language, emotions, routines, numbers, and everyday confidence.', features: ['Seven guided activities', 'Gentle rewards', 'Caregiver visibility'], tone: 'saffron' },
  { number: '02', title: 'Teen portal', age: 'Ages 13–19', description: 'Real conversations for school, friendships, self-expression, and collaborative problem solving.', features: ['Peer scenarios', 'Vocabulary practice', 'Private progress'], tone: 'indigo' },
  { number: '03', title: 'Adult portal', age: 'Ages 20+', description: 'Practical coaching for work, independent living, appointments, and community participation.', features: ['Workplace role-play', 'Functional reading', 'Life skills'], tone: 'emerald' },
];

const trustPoints = [
  { icon: MessageIcon, title: 'Practice without pressure', text: 'Repeat realistic conversations in a calm, private space.' },
  { icon: AiIcon, title: 'Coaching that adapts', text: 'Prompts and feedback respond to age, goals, and preferred language.' },
  { icon: ProgressIcon, title: 'Progress you can see', text: 'Clear milestones turn small daily practice into lasting confidence.' },
  { icon: ShieldIcon, title: 'Designed with care', text: 'Sensory controls, protected views, and accessible interaction patterns.' },
];

function BrandMark({ compact = false }) {
  return (
    <span className={`hs-brand-mark ${compact ? 'is-compact' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path d="M33.7 9.8A15.8 15.8 0 1 0 34.9 36 13.5 13.5 0 1 1 33.7 9.8Z" fill="currentColor" />
        <path d="m32.7 17.2 1.8 3.7 4.1.6-3 2.8.7 4.1-3.6-1.9-3.7 1.9.7-4.1-2.9-2.8 4.1-.6 1.8-3.7Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function usePointerTilt(reduceMotion, intensity = 6) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 190, damping: 24, mass: 0.7 };
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [intensity, -intensity]), spring);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-intensity, intensity]), spring);

  const onPointerMove = (event) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };
  const onPointerLeave = () => { pointerX.set(0); pointerY.set(0); };

  return {
    onPointerMove,
    onPointerLeave,
    style: reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 1200, transformStyle: 'preserve-3d' },
  };
}

function TiltPanel({ children, className, reduceMotion, intensity, ...motionProps }) {
  const tilt = usePointerTilt(reduceMotion, intensity);
  return <motion.div className={className} {...motionProps} {...tilt} style={{ ...motionProps.style, ...tilt.style }}>{children}</motion.div>;
}

function TiltArticle({ children, className, reduceMotion, intensity, ...motionProps }) {
  const tilt = usePointerTilt(reduceMotion, intensity);
  return <motion.article className={className} {...motionProps} {...tilt} style={{ ...motionProps.style, ...tilt.style }}>{children}</motion.article>;
}

export default function LandingPage() {
  const { user } = useUser();
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const isRtl = language === 'ur';
  const reveal = reduceMotion ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 } };
  const enterApp = () => navigate(user?.id ? '/dashboard' : '/signup');

  return (
    <div className="hs-landing" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="hs-landing-nav">
        <Link className="hs-logo" to="/" aria-label="HumSaathi home">
          <img className="hs-logo-image" src="/humsaathi-logo-v1.png" alt="HumSaathi" />
        </Link>
        <nav aria-label="Landing page navigation">
          <a href="#approach">Approach</a><a href="#portals">Portals</a><a href="#care">Accessibility</a>
        </nav>
        <div className="hs-nav-actions">
          {!user?.id && <Link className="hs-text-link" to="/login">Sign in</Link>}
          <motion.button className="hs-button hs-button-small" type="button" onClick={enterApp} whileHover={reduceMotion ? {} : { y: -2, scale: 1.02 }} whileTap={reduceMotion ? {} : { scale: 0.97 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }}>
            {user?.id ? 'Open dashboard' : 'Get started'} <ArrowRightIcon size={16} />
          </motion.button>
        </div>
      </header>

      <main>
        <section className="hs-hero">
          <div className="hs-pattern hs-pattern-one" aria-hidden="true" /><div className="hs-pattern hs-pattern-two" aria-hidden="true" />
          <motion.div className="hs-hero-copy" initial={reduceMotion ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            <span className="hs-kicker"><span /> Made in Pakistan, built for every voice</span>
            <h1>Find your words.<span>Build your confidence.</span></h1>
            <p className="hs-hero-lede">HumSaathi is a multilingual AI practice companion for real conversations, everyday skills, and steady personal growth.</p>
            <div className="hs-hero-actions">
              <motion.button className="hs-button hs-button-primary" type="button" onClick={enterApp} whileHover={reduceMotion ? {} : { y: -3, rotateX: -3, scale: 1.02 }} whileTap={reduceMotion ? {} : { y: 1, scale: 0.97 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }}>{user?.id ? 'Continue learning' : 'Start your journey'} <ArrowRightIcon size={18} /></motion.button>
              <motion.button className="hs-button hs-button-quiet" type="button" onClick={() => document.querySelector('#approach')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })} whileHover={reduceMotion ? {} : { y: -2 }} whileTap={reduceMotion ? {} : { scale: 0.98 }}>See how it works</motion.button>
            </div>
            <div className="hs-language-line" aria-label="Supported languages"><span>English</span><i /><span className="hs-urdu">اردو</span><i /><span>Roman Urdu</span></div>
          </motion.div>

          <TiltPanel className="hs-hero-visual" reduceMotion={reduceMotion} intensity={4.5} initial={reduceMotion ? false : { opacity: 0, scale: 0.96, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
            <div className="hs-visual-frame">
              <div className="hs-frame-top"><span className="hs-live"><i /> Practice room</span><span>School project</span></div>
              <div className="hs-conversation">
                <div className="hs-coach-orbit" aria-hidden="true">
                  <motion.span animate={reduceMotion ? {} : { rotate: 360 }} transition={{ repeat: Infinity, duration: 18, ease: 'linear' }} /><BrandMark />
                </div>
                <div className="hs-message hs-message-coach"><small>HumSaathi coach</small><p>Let’s practise sharing your idea with the group. What would you like to say first?</p></div>
                <motion.div className="hs-message hs-message-user" style={reduceMotion ? undefined : { z: 22 }} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.45 }}>
                  <small>You</small><p>I have an idea for our presentation. Can I explain it?</p>
                </motion.div>
                <div className="hs-prompt-row"><span><CheckIcon size={15} /> Clear opening</span><span><SparklesIcon size={15} /> Confident tone</span></div>
              </div>
              <div className="hs-composer"><span>Type or speak your response</span><motion.button type="button" aria-label="Use voice" whileHover={reduceMotion ? {} : { scale: 1.1, z: 16 }} whileTap={reduceMotion ? {} : { scale: 0.9 }}><MicIcon size={18} /></motion.button></div>
            </div>
            <motion.div className="hs-floating-note hs-floating-note-top" style={reduceMotion ? undefined : { z: 72 }} animate={reduceMotion ? {} : { y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}><strong>3 languages</strong><span>One familiar space</span></motion.div>
            <motion.div className="hs-floating-note hs-floating-note-bottom" style={reduceMotion ? undefined : { z: 62 }} animate={reduceMotion ? {} : { y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut', delay: 0.4 }}><strong>Private practice</strong><span>Take your time</span></motion.div>
          </TiltPanel>
        </section>

        <section className="hs-proof-strip" aria-label="Platform highlights"><span>Voice and text practice</span><span>Age-aware coaching</span><span>Sensory preferences</span><span>Caregiver insights</span></section>

        <section className="hs-section hs-approach" id="approach">
          <motion.div className="hs-section-heading" {...reveal} transition={{ duration: 0.55 }}><span className="hs-section-index">01 — Our approach</span><h2>Practice that feels human, not clinical.</h2><p>We combine thoughtful technology with a warm, culturally familiar experience—so learning feels safe, useful, and yours.</p></motion.div>
          <div className="hs-trust-grid">
            {trustPoints.map((item, index) => { const Icon = item.icon; return (
              <TiltArticle className="hs-trust-card" reduceMotion={reduceMotion} intensity={4} key={item.title} {...reveal} transition={{ duration: 0.5, delay: index * 0.06 }} whileHover={reduceMotion ? {} : { y: -8, scale: 1.012 }}><span className="hs-icon-box"><Icon size={22} /></span><h3>{item.title}</h3><p>{item.text}</p></TiltArticle>
            ); })}
          </div>
        </section>

        <section className="hs-section hs-portals" id="portals">
          <motion.div className="hs-section-heading hs-section-heading-light" {...reveal} transition={{ duration: 0.55 }}><span className="hs-section-index">02 — Personalised portals</span><h2>Different stages. One trusted saathi.</h2><p>Each portal changes the pace, language, activities, and feedback while keeping navigation familiar.</p></motion.div>
          <div className="hs-portal-grid">
            {portalCards.map((portal, index) => (
              <TiltArticle className={`hs-portal-card is-${portal.tone}`} reduceMotion={reduceMotion} intensity={5} key={portal.title} {...reveal} transition={{ duration: 0.55, delay: index * 0.08 }} whileHover={reduceMotion ? {} : { y: -10, scale: 1.015 }}>
                <div className="hs-portal-card-head"><span>{portal.number}</span><small>{portal.age}</small></div><h3>{portal.title}</h3><p>{portal.description}</p><ul>{portal.features.map((feature) => <li key={feature}><CheckIcon size={15} /> {feature}</li>)}</ul>
              </TiltArticle>
            ))}
          </div>
        </section>

        <section className="hs-section hs-care" id="care">
          <TiltPanel className="hs-care-panel" reduceMotion={reduceMotion} intensity={2.5} {...reveal} transition={{ duration: 0.6 }}>
            <div className="hs-care-copy"><span className="hs-section-index">03 — Designed with care</span><h2>Comfort is part of the experience.</h2><p>Adjust motion, contrast, sound, text size, and language at any time. HumSaathi meets learners where they are.</p><div className="hs-care-list"><span><CheckIcon size={16} /> Reduced-motion support</span><span><CheckIcon size={16} /> Keyboard-friendly navigation</span><span><CheckIcon size={16} /> Urdu right-to-left layouts</span><span><CheckIcon size={16} /> Mobile-first interactions</span></div></div>
            <div className="hs-care-art" aria-hidden="true"><div className="hs-arch hs-arch-back" /><div className="hs-arch hs-arch-front"><UsersIcon size={34} /><span>Har qadam par, saath.</span></div></div>
          </TiltPanel>
        </section>

        <section className="hs-final-cta"><div className="hs-final-pattern" aria-hidden="true" /><motion.div {...reveal} transition={{ duration: 0.55 }}><BrandMark /><span className="hs-urdu hs-final-urdu">آئیں، مل کر آگے بڑھیں</span><h2>Your next conversation can feel easier.</h2><p>Start small, practise safely, and carry new confidence into the real world.</p><motion.button className="hs-button hs-button-ivory" type="button" onClick={enterApp} whileHover={reduceMotion ? {} : { y: -4, scale: 1.025, rotateX: -4 }} whileTap={reduceMotion ? {} : { y: 1, scale: .97 }}>{user?.id ? 'Return to dashboard' : 'Create your free profile'} <ArrowRightIcon size={18} /></motion.button></motion.div></section>
      </main>

      <footer className="hs-footer"><Link className="hs-logo" to="/"><img className="hs-logo-image" src="/humsaathi-logo-v1.png" alt="HumSaathi" /></Link><p>{t('app.disclaimer') || 'HumSaathi supports practice and learning; it does not replace professional care.'}</p><span>Built with care in Pakistan</span></footer>
    </div>
  );
}
