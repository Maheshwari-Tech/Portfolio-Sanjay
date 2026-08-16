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
  headlineAccent?: string;
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
  featureLabel?: string;
  changeLabel?: string;
  collegeStory?: Array<{
    key: string;
    title: string;
    copy: string;
  }>;
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
    headline: "A 10 LPA ambition started the journey.",
    headlineAccent: "Curiosity, effortless hard work, and a constant search for harder challenges kept moving the goalpost forward.",
    summary: "Competitive programming, projects, and a Machine Learning specialization turned preparation into passion. The effort was real, but choosing technical challenges I genuinely enjoyed made the hard work feel natural.",
    tone: "paper",
    milestones: [
      { value: "First", label: "LPU student selected directly for a full-time Amazon role during intern hiring" },
      { value: "3 of 3", label: "Team Amigos members who received Amazon offers" },
      { value: "32 LPA", label: "Placement featured in LPU advertisements across the country" },
    ],
    turningPoint: {
      title: "Confidence got me there. Perspective changed what the achievement meant.",
      copy: "Amazon came to LPU to hire students for nine-month internships. I entered the interview confident in my preparation and became the first student selected directly for a full-time role. Both of my Team Amigos friends received offers too. LPU celebrated the 32 LPA result across the country, making me, my family, and my loved ones proud.",
    },
    collegeStory: [
      {
        key: "Starting point",
        title: "A simple ambition: 10 LPA",
        copy: "I entered college with one clear ambition: earn a 10 LPA offer after graduation. It gave me a starting point, even though I had no idea how far the goal would eventually move.",
      },
      {
        key: "Exploration",
        title: "Curiosity made hard work feel effortless",
        copy: "I explored different domains of computer science and kept choosing problems that felt more challenging than the last. The effort was real, but curiosity and passion made the hard work feel natural.",
      },
      {
        key: "Direction",
        title: "Competitive Programming and Machine Learning",
        copy: "Guided by seniors, I found my strongest interests in Competitive Programming and Machine Learning. As my understanding grew, the original 10 LPA target stopped feeling like the destination; every year moved the goalpost forward.",
      },
      {
        key: "Recognition",
        title: "Becoming one of the university’s best-known coders",
        copy: "My competitive-programming profiles, university leaderboards, and consistent performance in company assessments made me a recognised coder across campus. By the end of my second year, internship and full-time opportunities had already started arriving.",
      },
      {
        key: "Conviction",
        title: "Choosing to wait for Amazon",
        copy: "A campus startup increased its offer from 8 LPA to 28 LPA, matching Amazon’s previous-year package. I declined it because accepting would have closed later campus opportunities. I trusted my preparation and honestly chose the uncertainty of waiting for Amazon.",
      },
      {
        key: "Team Amigos",
        title: "Building with my ACM ICPC teammates at InterviewBit",
        copy: "Through an off-campus interview, I joined InterviewBit with my two Team Amigos partners from ACM ICPC. At the early-stage Scaler Academy, we helped hire teachers, shape the curriculum, and build the learning platform.",
      },
      {
        key: "Breakthrough",
        title: "Amazon came for interns; I received a direct full-time offer",
        copy: "Amazon visited LPU to hire students for nine-month internships. I entered the interview confident in my preparation and became the first student selected directly for a full-time role during that process. Both of my Team Amigos friends received offers too. LPU celebrated the 32 LPA achievement across the country, making me, my family, and my loved ones proud.",
      },
      {
        key: "Giving back",
        title: "Returning to college to help juniors prepare",
        copy: "After my teammates left for their internships, I left InterviewBit and returned to college. I began teaching juniors, helping them prepare for placements, and working with Programming Pathshala. Creating opportunities for others started to matter as much as receiving one myself.",
      },
      {
        key: "Humility",
        title: "Google rejected me in the first round",
        copy: "I rushed into writing code before fully understanding an easy-to-medium problem and was rejected in the opening round. The experience humbled me and taught me to listen, clarify, understand, and only then solve.",
      },
      {
        key: "Gratitude",
        title: "HackerEarth trusted my honesty",
        copy: "During my final semester, HackerEarth hired me through an off-campus internship even though I was transparent that I would leave for Amazon after six months. I remain grateful that they trusted me with the opportunity, knowing exactly how long I could stay.",
      },
    ],
    changes: [
      {
        title: "A 10 LPA ambition kept growing",
        copy: "I explored different areas of computer science, always looking for the next challenge. Guided by seniors, I ultimately chose competitive programming and Machine Learning. Curiosity made the hard work feel effortless, and every year moved the goalpost forward.",
      },
      {
        title: "Consistency built confidence and choices",
        copy: "By the end of my second year, I was one of the university’s best-known coders, regularly near the top of company assessments, and receiving internship and full-time opportunities. A startup raised its offer from 8 LPA to 28 LPA, but I declined and chose to wait for Amazon.",
      },
      {
        title: "Team Amigos chose InterviewBit",
        copy: "Through an off-campus interview, I joined InterviewBit with my two ACM ICPC teammates. At the early-stage Scaler Academy, we helped hire teachers, shape the curriculum, and build the learning platform.",
      },
      {
        title: "Achievement became a reason to give back",
        copy: "After my teammates left for their internships, I left InterviewBit and returned to college to teach juniors, help them prepare for placements, and work with Programming Pathshala.",
      },
      {
        title: "Google humbled me",
        copy: "I was rejected in the first round after starting to code before fully understanding the problem. It turned confidence into a better habit: listen, clarify, and only then solve.",
      },
      {
        title: "HackerEarth gave me trust I still value",
        copy: "During my final semester, HackerEarth hired me through an off-campus internship despite knowing I would leave for Amazon in six months. I remain grateful for the honesty and trust behind that opportunity.",
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
      title: "I moved from solving problems to designing fair hiring assessments.",
      copy: "At HackerEarth, difficulty alone was never the goal. Every problem had to challenge candidates while remaining clear, consistent, and focused on the skill it was intended to measure.",
    },
    featureLabel: "Problem setting",
    changeLabel: "Learnings",
    changes: [
      {
        title: "Fairness in hiring",
        copy: "Each problem needed clear wording, sound constraints, a correct solution, and thorough tests. The assessment had to measure skill consistently and give every candidate a fair opportunity to demonstrate what they knew.",
      },
      {
        title: "Problem setting strengthened critical thinking",
        copy: "Creating problems pushed me to explore edge cases, design challenging variations, anticipate different approaches, and test solutions from a candidate’s perspective. Explaining these ideas further strengthened my knowledge.",
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
    featureLabel: "Production responsibility",
    changeLabel: "Impact highlights",
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
    featureLabel: "Search at scale",
    changeLabel: "Product learnings",
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
    featureLabel: "Leadership shift",
    changeLabel: "Leadership highlights",
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
      {
        outcome: "Rejected",
        title: "xFlow",
        copy: "I interviewed with the startup but was not selected because the cofounders and I had differing opinions.",
      },
      {
        outcome: "Rejected · First round",
        title: "Uber · Senior Software Engineer (L5A)",
        copy: "Hard luck · bad day.",
      },
    ],
    lesson: "Leadership creates clarity, grows judgement, and leaves the team stronger than one individual.",
    next: "The next role should deepen product ownership, people leadership, and long-term impact together.",
  },
];
