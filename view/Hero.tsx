/** All color, sun and water geometry is vector-based; no raster background required. */
export default function Hero() {
  return (
    <section className="hero" id="surface" aria-label="Ocean at sunset">
      <div className="hero-art" aria-hidden="true">
        <svg viewBox="0 0 1440 940" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4a88d" />
              <stop offset=".44" stopColor="#f6c2a0" />
              <stop offset=".76" stopColor="#e5b0aa" />
              <stop offset="1" stopColor="#78c7bd" />
            </linearGradient>
            <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#87d6c7" />
              <stop offset=".35" stopColor="#55b0ab" />
              <stop offset="1" stopColor="#368f93" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="sun-glow">
              <stop offset="0" stopColor="#fff5c8" stopOpacity=".80" />
              <stop offset=".4" stopColor="#ffdfb0" stopOpacity=".45" />
              <stop offset="1" stopColor="#ffdfb0" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="reflection" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe6b8" stopOpacity=".8" />
              <stop offset="1" stopColor="#ffe6b8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1440" height="940" fill="url(#sky)" />
          <ellipse cx="730" cy="430" rx="340" ry="320" fill="url(#sun-glow)" className="sun-breathe" />
          <circle cx="730" cy="478" r="94" fill="#fff1cb" opacity=".91" />
          <path d="M0 527 C250 508 448 548 711 528 C994 505 1230 544 1440 519 V940 H0Z" fill="url(#water)" />
          <path d="M0 529 C279 515 452 548 712 531 C973 509 1219 537 1440 521" fill="none" stroke="#f8dcbd" strokeWidth="3" strokeOpacity=".66" />
          <path d="M701 550 L760 550 787 655 638 655Z" fill="url(#reflection)" opacity=".55" />
          <g fill="none" strokeLinecap="round" className="water-strokes">
            <path d="M-100 606 Q131 572 340 604 T765 604 T1239 593 T1600 601" stroke="#dbedcb" strokeWidth="6" opacity=".40" />
            <path d="M-130 652 Q180 616 410 652 T885 647 T1550 645" stroke="#f6f1d3" strokeWidth="4" opacity=".5" />
            <path d="M-120 719 Q182 676 424 713 T920 713 T1560 707" stroke="#c4e6d1" strokeWidth="7" opacity=".44" />
            <path d="M-80 782 Q182 752 438 786 T930 772 T1510 780" stroke="#cff5dd" strokeWidth="4" opacity=".34" />
            <path d="M-120 862 Q183 814 451 852 T952 850 T1550 847" stroke="#edf1d5" strokeWidth="5" opacity=".23" />
            <path d="M270 570 Q416 563 535 575 M865 579 Q1037 568 1140 573" stroke="#fff0d1" strokeWidth="5" opacity=".55" />
            <path d="M555 610 Q662 597 807 612 M152 753 Q315 742 477 752" stroke="#fbe9cb" strokeWidth="5" opacity=".32" />
          </g>
        </svg>
      </div>
      <div className="hero-content">
        <p className="hero-kicker">RUOSHUI DENG <span aria-hidden="true">✳</span> AN INTERACTIVE PORTFOLIO</p>
        <h1>Beneath<br /><em>the Surface</em></h1>
        <p className="hero-description">A little logic, a little language, and a world of curiosity. Follow the fish to discover what lies beneath.</p>
      </div>
      <a href="#about" className="scroll-invitation" aria-label="Scroll to the first chapter">
        <span>SCROLL TO DIVE</span>
        <span className="scroll-invitation__line" aria-hidden="true" />
        <span className="scroll-invitation__arrow" aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
