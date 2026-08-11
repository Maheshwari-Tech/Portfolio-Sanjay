export type JourneyChapter = {
  id: string;
  index: string;
  eyebrow: string;
  company: string;
  role: string;
  period: string;
  duration: string;
  place: string;
  headline: string;
  summary: string;
  logo?: string;
  logoAlt?: string;
  logoClass?: "compact" | "wide";
  tone: "paper" | "mint" | "night" | "blue" | "red";
  milestones: Array<{
    value: string;
    label: string;
  }>;
  turningPoint: {
    title: string;
    copy: string;
  };
  changes: Array<{
    title: string;
    copy: string;
  }>;
  decisions?: Array<{
    outcome: string;
    title: string;
    copy: string;
  }>;
  lesson: string;
  next: string;
};

export const journeyChapters: JourneyChapter[] = [
  {
    id: "education",
    index: "01",
    eyebrow: "A goal became a passion",
    company: "Education",
    role: "B.Tech in Computer Science · Machine Learning specialization",
    period: "Jul 2016 — May 2020",
    duration: "4 years",
    place: "Lovely Professional University · Jalandhar",
    headline: "I entered college with one goal: earn a 10 LPA offer.",
    summary: "Competitive programming, projects, and a Machine Learning specialization turned preparation into passion. The effort was real, but choosing technical challenges I genuinely enjoyed made the hard work feel natural.",
    tone: "paper",
    milestones: [
      { value: "First", label: "LPU student selected directly for a full-time Amazon role during intern hiring" },
      { value: "32 LPA", label: "Placement featured in LPU advertisements across the country" },
      { value: "ML", label: "Machine Learning specialization within Computer Science" },
    ],
    turningPoint: {
      title: "“Amazon toh normal hai!”",
      copy: "That was my first reaction to the offer. Confidence made an exceptional result feel ordinary: Amazon had visited to hire interns, yet I became the university’s first student selected directly for full-time. LPU later featured the 32 LPA placement in advertisements across the country.",
    },
    changes: [
      {
        title: "A goal became a passion for technology",
        copy: "The 10 LPA target gave me direction. Choosing harder programming challenges, building projects, and studying machine learning gave me reasons to keep going far beyond the original number.",
      },
      {
        title: "Rejection made confidence more useful",
        copy: "The lasting change was a better habit: listen carefully, ask questions, understand what is being asked, and only then begin solving.",
      },
      {
        title: "Mentoring widened the meaning of success",
        copy: "Progress felt more meaningful when it helped someone else move forward. Teaching made sharing what I learned part of how I wanted to grow.",
      },
      {
        title: "Gratitude changed how I saw the success",
        copy: "Preparation mattered, but so did timing, luck, seniors, teammates, teachers, and family. In hindsight, the Amazon offer was extraordinary—and never mine alone.",
      },
    ],
    decisions: [
      {
        outcome: "Declined",
        title: "Campus startup",
        copy: "The offer rose from 8 to 28 LPA. I declined because university rules could close later campus opportunities.",
      },
      {
        outcome: "Selected",
        title: "InterviewBit · Scaler internship",
        copy: "I joined with two Team Amigos friends and helped hire teachers, shape the course, and build the early learning platform.",
      },
      {
        outcome: "Selected",
        title: "Amazon · Direct full-time SDE",
        copy: "Amazon came to LPU for interns. I became the first student selected directly for a full-time role, advertised by the university as 32 LPA.",
      },
      {
        outcome: "Rejected",
        title: "Google · First interview",
        copy: "I started coding before fully understanding the question and was not selected. The experience taught me to listen, clarify the problem, and only then solve it.",
      },
      {
        outcome: "Returned",
        title: "College · Teaching juniors",
        copy: "When my Scaler teammates left for internships, I returned to college and helped juniors and Programming Pathshala students prepare for placements.",
      },
      {
        outcome: "Joined",
        title: "HackerEarth · Problem Curator",
        copy: "With Amazon starting in July, HackerEarth became a six-month final-semester bridge into full-time engineering.",
      },
    ],
    lesson: "Confidence moves you forward. Humility and gratitude keep it honest.",
    next: "HackerEarth turned problem solving into a responsibility for fair hiring.",
  },
  {
    id: "hackerearth",
    index: "02",
    eyebrow: "Designing for fairness",
    company: "HackerEarth",
    role: "Problem Curator Intern",
    period: "Jan 2020 — Jun 2020",
    duration: "6 months",
    place: "Bengaluru",
    headline: "Designing hiring problems taught me to think about fairness.",
    summary: "A difficult question is not automatically a useful one. Clear wording, sensible limits, and complete tests shape every candidate’s chance to succeed.",
    logo: "/images/HackerEarth_logo.png",
    logoAlt: "HackerEarth",
    logoClass: "wide",
    tone: "mint",
    milestones: [
      { value: "6+", label: "Company hiring programs supported" },
      { value: "120+", label: "People at an algorithms workshop" },
      { value: "10+ hrs", label: "Workshop delivered over two days" },
    ],
    turningPoint: {
      title: "I moved from solving questions to deciding what a question should measure.",
      copy: "HackerEarth trusted me to create and test coding problems for large hiring programs, even though everyone knew I would leave for Amazon after six months.",
    },
    changes: [
      {
        title: "Difficulty gained a purpose",
        copy: "Each problem needed a clear skill to measure, one sound answer, and tests that treated every candidate consistently. The work supported hiring programs for Infosys, Google, Facebook, Nokia, PayPal, and Salesforce.",
      },
      {
        title: "Explaining exposed gaps",
        copy: "Teaching a two-day workshop showed me that knowing an answer and helping others understand it are different skills.",
      },
    ],
    lesson: "Expertise becomes useful when it is clear, fair, and easy to explain.",
    next: "Amazon added responsibility for software used in daily financial work.",
  },
  {
    id: "amazon",
    index: "03",
    eyebrow: "Owning real outcomes",
    company: "Amazon",
    role: "Software Development Engineer I",
    period: "Jul 2020 — Aug 2021",
    duration: "1 year 2 months",
    place: "Hyderabad",
    headline: "Amazon showed me what software means when people depend on it every day.",
    summary: "I worked on finance systems handling more than 100,000 invoice requests a day. The goal was simple: protect money, surface problems sooner, and keep every release dependable.",
    logo: "/images/amazon_logo.svg",
    logoAlt: "Amazon",
    logoClass: "wide",
    tone: "night",
    milestones: [
      { value: "$100M+", label: "Unusual invoices identified in one month" },
      { value: "100K+", label: "Invoice requests handled each day" },
      { value: "24h → live", label: "Delay reduced to near real time" },
    ],
    turningPoint: {
      title: "Production made the customer benefit visible.",
      copy: "A small mistake could delay a payment or hide a costly invoice problem. Good work meant understanding the full customer need, releasing carefully, watching results, and responding quickly when something failed.",
    },
    changes: [
      {
        title: "Protect real money",
        copy: "I built three checks for unusual, duplicate, and potentially fraudulent invoices. They identified more than $100M in anomalies within one month.",
      },
      {
        title: "Show problems while action still helps",
        copy: "I helped reduce the wait for anomaly reports from 24 hours to near real time, so finance teams could act sooner.",
      },
      {
        title: "Make every release dependable",
        copy: "I added service interfaces, dashboards, alerts, automated infrastructure, and release checks so the benefit could continue safely after launch.",
      },
    ],
    decisions: [
      {
        outcome: "Selected",
        title: "Google · Second interview",
        copy: "A recruiter returned after my college rejection. I asked for one month, completed more than 450 practice questions, and cleared the process by listening, clarifying, and then solving.",
      },
      {
        outcome: "Moved",
        title: "Leaving Amazon",
        copy: "I was on a strong path toward SDE II, but my manager was moving and a senior engineer encouraged the wider learning opportunity. I chose Search at Google.",
      },
    ],
    lesson: "Customer obsession: solve the real customer problem, make the benefit visible, and keep the system dependable every day.",
    next: "Google widened the work from finance systems to Search across languages and regions.",
  },
  {
    id: "google",
    index: "04",
    eyebrow: "Understanding people at scale",
    company: "Google",
    role: "Software Engineer II · Search India",
    period: "Sep 2021 — Feb 2024",
    duration: "2 years 6 months",
    place: "Bengaluru · Hybrid",
    headline: "Google taught me to connect scale with human intent.",
    summary: "Search work began with a simple question: what is this person trying to do? Language, local context, and careful releases all followed from that.",
    logo: "/images/google_logo.webp",
    logoAlt: "Google",
    logoClass: "wide",
    tone: "blue",
    milestones: [
      { value: "1M+", label: "Estimated daily searches touched" },
      { value: "3", label: "Indian languages launched" },
      { value: "50+", label: "Mentoring sessions outside the role" },
    ],
    turningPoint: {
      title: "The lesson from my first interview became a daily working habit.",
      copy: "At Google, I learned to begin by listening, clarifying the need, and understanding the people affected. That approach guided both product decisions and work across several teams.",
    },
    changes: [
      {
        title: "Intent mattered more than exact words",
        copy: "I built education features and helped Search better understand what people wanted from exam-related questions. The change reached 0.05% of Search traffic—an estimated 1M+ daily queries.",
      },
      {
        title: "Language support became shared work",
        copy: "I helped launch exam results in Hindi, Tamil, and Telugu, then built a common service so several features could reuse the same support.",
      },
      {
        title: "Influence replaced direct control",
        copy: "Progress depended on clear requirements, shared priorities, patient discussion, and careful changes across several teams.",
      },
      {
        title: "Mentoring kept scale personal",
        copy: "Across 50+ Bosscoder sessions, I supported engineers who later joined Atlassian, Adobe, Amazon, PhonePe, and Microsoft.",
      },
    ],
    decisions: [
      {
        outcome: "Life",
        title: "Marriage",
        copy: "I married on 28 November 2023. Career, location, and daily life now belonged in one decision.",
      },
      {
        outcome: "Ambition",
        title: "Wider hands-on ownership",
        copy: "After two and a half years, I wanted responsibility from design and implementation through delivery and team growth.",
      },
      {
        outcome: "Rejected",
        title: "Amazon · SDE II",
        copy: "I gave the interview without any preparation and was not selected.",
      },
      {
        outcome: "Selected",
        title: "Oracle Health",
        copy: "Healthcare impact, remote work, and broader ownership led me to join in April 2024.",
      },
    ],
    lesson: "Preparation starts as an unclear problem. Begin with the time available, decide what matters most, and follow a clear path—just as with any engineering problem.",
    next: "Oracle Health added wider ownership across product delivery and team growth.",
  },
  {
    id: "oracle",
    index: "05",
    eyebrow: "Growing systems and people",
    company: "Oracle",
    role: "Senior Software Engineer · Tech Lead",
    period: "Apr 2024 — Present",
    duration: "Tech Lead since Oct 2025",
    place: "Oracle Health · Remote",
    headline: "Oracle brought product delivery and team growth into one role.",
    summary: "I now lead work across design, delivery, hiring, and team growth for a healthcare reporting product where reliability directly affects people’s work.",
    logo: "/images/oracle_logo.svg",
    logoAlt: "Oracle",
    logoClass: "wide",
    tone: "red",
    milestones: [
      { value: "10+", label: "Engineers across three products" },
      { value: "7+", label: "Services designed and built" },
      { value: "100+", label: "Technical interviews conducted" },
    ],
    turningPoint: {
      title: "I chose broader ownership and work that fit the life we were building.",
      copy: "Oracle Health offered meaningful problems, room to lead, and a flexible working model. The role grew from building software to helping a team deliver it well.",
    },
    changes: [
      {
        title: "Make clinical reports dependable",
        copy: "I guide the reporting product across requests, templates, data, final documents, security, history, and recovery when work fails.",
      },
      {
        title: "Fix the limit behind the failure",
        copy: "For very large reports, the team cut memory use by 40%, improved speed by more than 25%, and reduced repeated data work by 60%.",
      },
      {
        title: "Grow people, not dependency",
        copy: "I built the India team, led four quarterly releases, partnered with 25+ teams, and helped make 25+ hires while keeping the product from depending on one person.",
      },
    ],
    decisions: [
      {
        outcome: "Rejected",
        title: "Meta",
        copy: "I interviewed after joining Oracle and was not selected.",
      },
      {
        outcome: "Two offers",
        title: "Amazon · SDE II",
        copy: "Two separate offline hiring drives produced two offers.",
      },
      {
        outcome: "Offer",
        title: "Uber · SDE II",
        copy: "I was selected through an offline hiring drive.",
      },
      {
        outcome: "Offer",
        title: "Microsoft · L62",
        copy: "I stayed at Oracle because ownership, growth, and impact mattered more than changing logos.",
      },
    ],
    lesson: "Leadership creates clarity, grows judgement, and leaves the team stronger than one individual.",
    next: "The next role should deepen product ownership, people leadership, and long-term impact together.",
  },
];
