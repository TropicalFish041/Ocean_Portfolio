import type { Chapter } from '../entity/Chapter';
import type { ChapterReadGateway } from '../use_case/showChapter';

/** Static content adapter. Edit this one file to update the portfolio. */
export const portfolioChapters: readonly Chapter[] = [
  {
    id: 'about',
    image: '/fish/butterflyfish.png',
    fishName: 'Butterflyfish',
    imageDescription: 'A painted school of bright yellow butterflyfish swimming together',
    title: 'About Me',
    eyebrow: '01 / THE CORAL GARDEN',
    subtitle: 'A curious mind, in many currents.',
    intro: 'Computer science meets the humanities. A little logic, a little language, and a lot of curiosity.',
    items: [
      { title: 'Hello, I’m Ruoshui.', text: 'I’m studying Computer Science and Classics (Greek and Latin) at the University of Toronto. I enjoy working across technical and humanistic ways of thinking.' },
      { title: 'University of Toronto', text: 'B.Sc. · Computer Science Specialist; Classics Major · Expected June 2029. Cumulative GPA: 4.0/4.0.' },
      { title: 'Recognition', text: 'International Merit Admission Award, Faculty of Arts & Science. Recipient in 2025–26; renewed for 2026–27.' },
    ],
  },
  {
    id: 'projects',
    image: '/fish/lionfish.png',
    fishName: 'Lionfish',
    imageDescription: 'A large purple, blue and pink impasto lionfish with elegant spines',
    title: 'Selected Projects',
    eyebrow: '02 / A WORLD OF PATTERNS',
    subtitle: 'Ideas with a life of their own.',
    intro: 'From networks in nature to worlds in virtual reality: building things that connect.',
    items: [
      { title: 'Bird Species Interaction Network', text: 'Core Algorithm Developer · March 2026. Built a weighted-graph algorithm in Python using 6,000 iNaturalist observations, Haversine distance, and Jaccard-based likelihoods to model seasonal bird co-occurrence.' },
      { title: 'Team Cobalt · VR Game', text: 'Lead Developer / Technical Lead · June 2026. Led implementation, integration, and debugging of a Unity build exhibited at VRTO 2026. Built gameplay, hit detection, dialogue, scene progression, and controller UI.' },
      { title: 'Pattern Recognition Research', text: 'Research Assistant · June–July 2024. Implemented face recognition with PCA and SVM, including image preprocessing and feature extraction using OpenCV, scikit-learn, and NumPy.' },
    ],
  },
  {
    id: 'skills',
    image: '/fish/peppermint-angelfish.png',
    fishName: 'Peppermint Angelfish',
    imageDescription: 'An orange-red painted angelfish with delicate pale stripes and blue fins',
    title: 'Technical Toolkit',
    eyebrow: '03 / HIDDEN IN THE REEF',
    subtitle: 'Small details. Endless possibilities.',
    intro: 'The languages, tools, and foundations I use to turn questions into working systems.',
    items: [
      { title: 'Programming', text: 'Python · Java · C#' },
      { title: 'Tools & libraries', text: 'Git · Unity · pandas · NetworkX · Matplotlib · NumPy · scikit-learn · OpenCV' },
      { title: 'Foundations', text: 'Software design and OOP; data structures and algorithms; theory of computation and proofs; probability; linear algebra; multivariable calculus.' },
      { title: 'Languages', text: 'Mandarin (native) · English (fluent)' },
    ],
  },
  {
    id: 'experience',
    image: '/fish/opah.png',
    fishName: 'Opah',
    imageDescription: 'A round blue and lilac opah fish with brilliant red fins',
    title: 'Experience',
    eyebrow: '04 / THE OPEN OCEAN',
    subtitle: 'Learning by moving into the unknown.',
    intro: 'Testing, building, explaining. Growing through practical work and shared understanding.',
    items: [
      { title: 'Zhiyuan Robotics', text: 'Intern · Shanghai · May–July 2026. Supported robotics testing and validation by preparing test sets, reviewing outputs, and documenting discrepancies for engineering follow-up.' },
      { title: 'Kintore College', text: 'Peer Academic Support · Toronto · September 2026–present. Support peers and younger students in programming and mathematics through proof explanations, problem decomposition, code tracing, and debugging.' },
    ],
  },
  {
    id: 'contact',
    image: '/fish/shark-and-pilotfish.png',
    fishName: 'Shark and pilot fish',
    imageDescription: 'A blue painted shark swimming among a school of small striped pilot fish',
    title: 'Let’s Connect',
    eyebrow: '05 / INTO THE BLUE',
    subtitle: 'There is always more to explore.',
    intro: 'Have a question, an interesting problem, or an idea worth exploring? Let’s start a conversation.',
    items: [
      { title: 'Say hello', text: 'ruoshui.deng@mail.utoronto.ca' },
      { title: 'Based in Toronto', text: 'Computer science, classics, and the possibilities in between.' },
    ],
  },
];

export class StaticChapterRepository implements ChapterReadGateway {
  private readonly chapters: readonly Chapter[];

  constructor(chapters: readonly Chapter[] = portfolioChapters) {
    this.chapters = chapters;
  }

  findById(id: string): Chapter | null {
    return this.chapters.find((chapter) => chapter.id === id) ?? null;
  }
}
