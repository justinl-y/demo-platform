import { useEffect, useState } from 'react';
import styles from './App.module.css';

const PHRASES = [
  'Internet available …',
  'Database online …',
  'API started …',
  'App rendered …',
  'Let the magic begin !',
];

const TYPE_MS = 70;
const DELETE_MS = 35;
const HOLD_MS = 1800;

const pad = (n: number) => String(n).padStart(2, '0');

const formatNow = () => {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  // Compute-once values — lazy initializers run only on mount.
  const [year] = useState(() => new Date().getFullYear());
  const build = __BUILD_ID__;
  const [clock, setClock] = useState(formatNow);
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? PHRASES[0] : ''));

  // Clock — tick every second.
  useEffect(() => {
    const id = setInterval(() => setClock(formatNow()), 1000);

    return () => clearInterval(id);
  }, []);

  // Typed-text loop — skipped entirely when reduced motion is requested.
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const loop = () => {
      const current = PHRASES[phraseIdx];
      setTyped(current.slice(0, charIdx));

      if (!deleting && charIdx < current.length) {
        charIdx++;
        timer = setTimeout(loop, TYPE_MS);
      }
      else if (!deleting && charIdx === current.length) {
        deleting = true;
        timer = setTimeout(loop, HOLD_MS);
      }
      else if (deleting && charIdx > 0) {
        charIdx--;
        timer = setTimeout(loop, DELETE_MS);
      }
      else {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        timer = setTimeout(loop, 250);
      }
    };

    loop();

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className={styles.aurora} aria-hidden='true'>
        <span className={`${styles.blob} ${styles.blobA}`} />
        <span className={`${styles.blob} ${styles.blobB}`} />
        <span className={`${styles.blob} ${styles.blobC}`} />
      </div>

      <main className={styles.stage}>
        <div className={styles.card}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            Staging environment
          </span>

          <h1 className={styles.domain} aria-label='demo-stage.discovered-check.ca'>
            <span>demo-stage</span>
            <span className={styles.domainSep}>.</span>
            <span>discovered-check</span>
            <span className={styles.domainSep}>.</span>
            <span>ca</span>
          </h1>

          <p className={styles.tagline}>
            <span className={styles.cursor}>▍</span>
            <span>{typed}</span>
          </p>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <span className={styles.metaValue}>
                <span className={styles.pulse} />
                Online
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Local time</span>
              <span className={styles.metaValue}>{clock}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Build</span>
              <span className={styles.metaValue}>{build}</span>
            </div>
          </div>
        </div>

        <footer className={styles.foot}>
          <span>{`© ${year} discovered-check.ca`}</span>
        </footer>
      </main>
    </>
  );
}
