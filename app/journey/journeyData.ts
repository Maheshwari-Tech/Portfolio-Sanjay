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
  pivot: {
    label: string;
    text: string;
  };
  contextTitle: string;
  work: Array<{
    title: string;
    copy: string;
  }>;
  portfolioRecord?: {
    details: string[];
    technologies: string[];
    capabilities: string[];
  };
  started: {
    title: string;
    copy: string;
  };
  other: Array<{
    title: string;
    copy: string;
  }>;
  learnings: Array<{
    title: string;
    copy: string;
  }>;
  milestones: Array<{
    value: string;
    label: string;
  }>;
  achievements: Array<{
    category: string;
    items: string[];
  }>;
  feedback: Array<{
    full: string;
    name: string;
    context: string;
  }>;
  transition: {
    label: string;
    title: string;
    text: string;
    events?: Array<{
      outcome: string;
      title: string;
      copy: string;
    }>;
  };
  tags: string[];
};

export const journeyChapters: JourneyChapter[] = [
  {
    id: "education",
    index: "01",
    eyebrow: "The foundation",
    company: "Education",
    role: "B.Tech, Computer Science Engineering — Machine Learning",
    period: "Jul 2016 — May 2020",
    duration: "Four-year degree",
    place: "Lovely Professional University · Jalandhar",
    headline: "I began college with a four-year goal: earn a 10 LPA offer.",
    summary:
      "The goal gave me direction, but I did not spend four years staring at it. I followed the work that felt difficult and exciting, tried widely, and let growing skill move the boundary of what I believed was possible.",
    tone: "paper",
    pivot: {
      label: "The process",
      text: "Set the direction, then give your attention to the work. Curiosity made the hours feel lighter; challenge kept the work meaningful; and every sincere attempt revealed what deserved deeper commitment.",
    },
    contextTitle: "What confidence could not teach me on its own",
    work: [
      {
        title: "I chose challenging work and let interest decide where to go deeper.",
        copy: "I tried coding contests, hackathons, projects, aptitude tests, teaching, and mentoring before deciding what deserved deeper commitment. Competitive programming was the challenge I enjoyed most, while Machine Learning became my academic specialisation. The effort was real, but curiosity made difficult work feel natural rather than forced.",
      },
      {
        title: "Skill moved the goalpost before any offer did.",
        copy: "By second year, seniors who had seen my contest profiles and leaderboard results told me that 10 LPA was already within reach. I was regularly among the top students in company coding tests. Their guidance helped me see what my own experience had not yet shown me. At the early-stage InterviewBit, now Scaler, I then helped hire teachers, develop the course, and build the learning platform with my Team Amigos friends.",
      },
    ],
    started: {
      title: "The goal was a compass, not a scoreboard.",
      copy: "The 10 LPA ambition mattered because it pointed me forward. After setting it, I gave my attention to the process: exploring computer science, choosing work that challenged me, and staying with the problems I genuinely enjoyed. Progress followed as a consequence rather than an obsession.",
    },
    other: [
      {
        title: "In hindsight, it was extraordinary—and never mine alone.",
        copy: "At the time, the Amazon offer felt like a natural result of preparation. Looking back, I can see its true scale. Years of work had created readiness; timing, good fortune, senior guidance, committed teammates, supportive teachers, and people who believed in me helped that readiness meet the right opportunity. That reflection does not reduce the achievement. It lets confidence and gratitude exist together.",
      },
    ],
    learnings: [
      {
        title: "Direction matters; daily attention belongs to the work.",
        copy: "The four-year goal was useful because it set a direction. Progress came from focusing on skills, not repeatedly measuring the distance to the target.",
      },
      {
        title: "Curiosity makes sustained effort possible.",
        copy: "Trying several paths revealed where challenge and enjoyment met. That made difficult practice consistent rather than forced.",
      },
      {
        title: "Confidence works best with gratitude and patience.",
        copy: "Preparation builds confidence; guidance, timing, and good fortune shape opportunity. Listening carefully keeps confidence from becoming haste.",
      },
    ],
    milestones: [
      { value: "10 LPA", label: "The ambition I began college with" },
      { value: "First", label: "Student offered a direct full-time Amazon role when Amazon came to hire interns" },
      { value: "32 LPA", label: "The Amazon placement advertised by the university" },
    ],
    achievements: [
      {
        category: "Competitive programming",
        items: [
          "Achieved World Rank 1 in CodeChef’s October Challenge 2018, Division 2.",
          "Qualified for ACM-ICPC Asia Regionals with Team Amigos and placed 85th in the 2018 Gwalior-Pune regional.",
          "Placed 2nd among 175 teams in LPU’s University Coding Contest.",
          "Finished 5th at NIT Durgapur’s national ALOHOMORA contest.",
          "Placed 21st in a national coding contest at LNMIIT Jaipur.",
          "Solved more than 1,000 competitive-programming problems.",
        ],
      },
      {
        category: "Academic excellence",
        items: [
          "Graduated with a 9.06 / 10 CGPA.",
          "Scored in the 99.98 percentile in eLitmus Quantitative Aptitude.",
          "Ranked 86th among 60,946 candidates in the Rajasthan Pre-Engineering Test and 15,550th among 1.26 lakh candidates in JEE Advanced.",
        ],
      },
      {
        category: "Hackathons & building",
        items: [
          "Participated in three university hackathons across machine learning and web development.",
          "Built Jobs@LPU in second year to connect students seeking gig work with people hiring student talent.",
        ],
      },
      {
        category: "Giving back",
        items: [
          "Helped juniors and Programming Pathshala students prepare for placements after returning from Scaler.",
        ],
      },
    ],
    feedback: [
      {
        full:
          "Thank you Informatica for choosing me as an intern and giving me an opportunity to showcase my skills. This would not have been possible without Sanjay Gandhi, Raj Karan Singh, and my friend circle.\n\nThank you Mr. Raj Karan Singh Sir for your incredible teaching style. You have always been there to listen to our queries and direct us. Your lectures filled with learning assisted me in understanding algorithms better, and Lovely Professional University and Sami Anand provided a spectacular platform to connect us with the corporate world.\n\nThank you very much Sanju bhaiya (Sanjay Gandhi) for showing me the right direction and assisting me in every possible way. This journey could not have been possible without Sanju bhaiya. He has always been a down-to-earth person in my life. Moreover, my friend circle—especially #chicken_grp—was where I found like-minded, innovative people who always supported me and believed in me.\n\nIn the pursuit of chasing my dream, I found my Sanju Bhaiya. I think we all need to find our Sanju Bhaiya—someone who can see our potential and guide us. So, find your Sanju Bhaiya. 😊",
        name: "Krishna Barnwal",
        context: "A junior’s full placement reflection shared on LinkedIn · lightly edited for clarity",
      },
      {
        full:
          "Sanjay is a results-oriented person. He has excellent programming skills and a great attitude towards learning. I found him a hard-working and self-motivated student. I met him when he started competitive programming and saw him climbing up the stairs throughout till now. Having been associated with Sanjay and guiding him throughout, I have no reservations in strongly recommending him.",
        name: "Nikhil Jain",
        context: "Mentor from Sanjay’s college years",
      },
      {
        full:
          "I have studied and stayed with him during our B.Tech days. He is a very quick learner. He is very good at competitive programming. I love his enthusiasm for it.",
        name: "Siddhant Saurabh",
        context: "College peer at Lovely Professional University",
      },
    ],
    transition: {
      label: "The next chapter",
      title: "Skill opened several doors; judgement decided which ones to take.",
      events: [
        {
          outcome: "Declined",
          title: "Campus startup",
          copy: "The role began at 8 LPA and rose as high as 28 LPA. I declined because accepting it could close later campus opportunities under university rules.",
        },
        {
          outcome: "Selected",
          title: "InterviewBit · Scaler internship",
          copy: "I earned the internship off campus and joined the early-stage company with two Team Amigos friends.",
        },
        {
          outcome: "Selected",
          title: "Amazon · Direct full-time SDE",
          copy: "Amazon came to hire interns, but I became the first student selected directly for a full-time role, advertised by the university as 32 LPA. My reaction was, ‘Amazon toh normal hai!’",
        },
        {
          outcome: "Rejected",
          title: "Google · First round",
          copy: "I rushed into code before fully understanding an easy-to-medium problem. The rejection taught me to listen, clarify, and only then solve.",
        },
        {
          outcome: "Joined",
          title: "HackerEarth · Problem Curator",
          copy: "With Amazon’s full-time role scheduled for July, I chose HackerEarth for my final semester—and they chose me knowing the commitment would be six months.",
        },
      ],
      text: "I left Scaler when my teammates moved to their internships, returned to college, and continued helping juniors and Programming Pathshala students prepare for placements. HackerEarth became the bridge between competitive programming and full-time product engineering.",
    },
    tags: ["Competitive programming", "ACM-ICPC", "Mentoring", "Machine learning"],
  },
  {
    id: "hackerearth",
    index: "02",
    eyebrow: "From solving to setting",
    company: "HackerEarth",
    role: "Problem Curator Intern",
    period: "Jan 2020 — Jun 2020",
    duration: "6 months",
    place: "Bengaluru",
    headline: "I learned that a technical problem is also a product decision.",
    summary:
      "College had taught me to solve difficult problems. HackerEarth taught me to decide which problems were worth asking—and to make that decision fair for candidates and useful for companies.",
    logo: "/images/HackerEarth_logo.png",
    logoAlt: "HackerEarth",
    logoClass: "wide",
    tone: "mint",
    pivot: {
      label: "From skill to judgement",
      text: "A hard question can still be a poor hiring signal. The real work is balancing depth, clarity, time, test coverage, and fairness so the assessment measures the capability the company actually needs.",
    },
    contextTitle: "The first leadership lesson was designing for people I would never meet",
    work: [
      {
        title: "Turned algorithms into reliable hiring signals.",
        copy: "I created and tested coding problems for companies including Infosys, Google, Facebook, Nokia, PayPal, and Salesforce. The responsibility was larger than producing a clever question. I had to define what it measured, remove ambiguity, choose reasonable limits, prove the solution, and build tests that treated every candidate consistently.",
      },
      {
        title: "Learned that expertise scales only when it can be explained.",
        copy: "On HackerEarth’s behalf, I delivered a two-day, ten-hour-plus workshop on advanced data structures and algorithms at MNIT Jaipur for more than 120 attendees. Teaching exposed every gap that solving alone could hide. It taught me to structure ideas, adapt to an audience, and treat understanding—not presentation—as the outcome.",
      },
    ],
    portfolioRecord: {
      details: [
        "Created and tested algorithmic problems for hiring contests at companies including Infosys, Google, Facebook, Nokia, PayPal, and Salesforce.",
        "Presented a two-day, 10+ hour advanced data structures and algorithms workshop at MNIT Jaipur to more than 120 attendees.",
      ],
      technologies: ["C++", "Python", "Java", "JavaScript", "Data Structures", "Algorithms"],
      capabilities: ["Problem Setting", "Competitive Programming", "Teaching", "Public Speaking"],
    },
    started: {
      title: "We chose each other, even with a clear six-month horizon.",
      copy: "By January 2020, I already held Amazon’s full-time offer, scheduled to begin in July. For the six months in between, I chose HackerEarth because problem setting was close to what I loved and would stretch me from solving questions to evaluating people fairly. HackerEarth chose me knowing from the beginning that I could stay for only six months. I remain grateful for that trust: they invested in me, gave me meaningful company assessments, and let me represent them at MNIT Jaipur instead of limiting the responsibility because the time was short.",
    },
    other: [
      {
        title: "Fairness became an engineering requirement.",
        copy: "Clarity, realistic constraints, complete tests, and a defensible expected solution were not editorial polish; they were the product. This was my first experience of making a technical decision for people I could not speak to directly and still being accountable for its consequences.",
      },
    ],
    learnings: [
      {
        title: "Fairness must be designed, not assumed.",
        copy: "Clear wording, reasonable limits, and complete tests determine whether an assessment measures skill or creates noise.",
      },
      {
        title: "Teaching reveals the depth of understanding.",
        copy: "Explaining a difficult idea to a large audience exposes gaps that solving the problem alone can hide.",
      },
      {
        title: "Technical decisions affect people before they affect systems.",
        copy: "A hiring problem can shape someone’s opportunity. That makes care, consistency, and accountability part of the engineering work.",
      },
    ],
    milestones: [
      { value: "6+", label: "Company hiring programs supported" },
      { value: "120+", label: "Workshop attendees" },
      { value: "10+ hrs", label: "Advanced DSA workshop" },
    ],
    achievements: [
      {
        category: "Hiring challenges",
        items: [
          "Set and tested problems used in company online assessments.",
          "Contributed problems for HackWithInfy and other large hiring contests.",
        ],
      },
      {
        category: "Teaching & communication",
        items: [
          "Represented HackerEarth in an advanced algorithms workshop at MNIT Jaipur.",
        ],
      },
    ],
    feedback: [
      {
        full:
          "I have worked with Sanjay for over six months and I have never come across such a polite person. He is an exceptional programmer and knows the concepts of programming from basic to advanced.",
        name: "Yash Thakur",
        context: "Senior colleague at HackerEarth",
      },
      {
        full:
          "I have worked with Sanjay for six months and it was a pleasure working with him. Sanjay is a result-oriented and responsible person and has very good programming skills.",
        name: "Subhajeet Mishra",
        context: "Senior colleague at HackerEarth",
      },
    ],
    transition: {
      label: "The next chapter",
      title: "The next question was what happens after the interview.",
      events: [
        {
          outcome: "Joined",
          title: "Amazon · Software Development Engineer I",
          copy: "The direct campus offer became my first full-time engineering role in July 2020.",
        },
      ],
      text: "HackerEarth taught me to create a trustworthy signal before someone joined a company. Amazon offered the next layer of responsibility: building systems people and businesses would depend on every day.",
    },
    tags: ["Problem setting", "Algorithms", "Teaching", "Public speaking"],
  },
  {
    id: "amazon",
    index: "03",
    eyebrow: "The first big system",
    company: "Amazon",
    role: "Software Development Engineer I",
    period: "Jul 2020 — Aug 2021",
    duration: "1 year 2 months",
    place: "Hyderabad",
    headline: "At Amazon, correctness became only the starting point.",
    summary:
      "The 32 LPA offer had been the visible milestone. The deeper achievement was learning to own finance systems at scale—where reliability, speed, observability, and business risk mattered together.",
    logo: "/images/amazon_logo.svg",
    logoAlt: "Amazon",
    logoClass: "wide",
    tone: "night",
    pivot: {
      label: "Owning real outcomes",
      text: "Correct code is only the beginning. A dependable system must be safe to release, easy to understand, resilient when something fails, and trustworthy under real demand.",
    },
    contextTitle: "Production scale changed both my engineering and my ambition",
    work: [
      {
        title: "Connected technical choices to financial risk.",
        copy: "I built systems to identify unusual, duplicate, or potentially fraudulent invoices across more than one lakh daily requests. Three detection rules identified more than 100 million US dollars in anomalies within one month. The work made impact concrete: a technical decision could influence a real financial decision.",
      },
      {
        title: "Made results faster and the system safer to run.",
        copy: "I helped move anomaly findings from a 24-hour delay to near real time, then built the service interfaces, monitoring, infrastructure, and release setup needed to run the system safely. Accurate detection was not enough; the result had to arrive quickly and teams had to trust the service around it.",
      },
      {
        title: "Began leading before leadership was part of the title.",
        copy: "I learned several connected services quickly, developed strong product knowledge, drove discussions, contributed across teams, and supported colleagues when work crossed service boundaries. That pattern—understand the whole system, create clarity, and help others move—became the earliest version of the leadership style I would later formalise.",
      },
    ],
    portfolioRecord: {
      details: [
        "Built statistical and machine-learning systems in Amazon Finance Automation to detect invoice fraud, duplicates, and anomalies at scale.",
        "Supported a finance ingestion surface receiving more than one lakh invoice create or update requests every day across retail, non-retail, and corporate workflows.",
        "Implemented three anomaly-detection rules using Isolation Forest, identifying more than 100 million US dollars in anomalies within one month.",
        "Reduced anomaly-reporting latency from 24 hours to near real time by connecting detection directly to the main reporting flow.",
        "Built APIs and monitoring dashboards and used AWS CDK for infrastructure and continuous delivery pipelines.",
        "Developed microservices using Java, Kotlin, TypeScript, Python, machine learning, Elasticsearch, DynamoDB, Coral, Smithy, and AWS.",
      ],
      technologies: ["Java", "Kotlin", "TypeScript", "Python", "AWS CDK", "Elasticsearch", "DynamoDB", "Redshift", "Coral", "Smithy"],
      capabilities: ["Machine Learning", "Anomaly Detection", "Microservices", "API Design", "CI/CD", "Monitoring"],
    },
    started: {
      title: "Full-time work reset the scoreboard.",
      copy: "I joined Amazon Finance Automation in July 2020. Contest ranks and placement numbers had shaped the journey there, but they had little value inside the role. The new measures were reliability, judgement, product understanding, communication, and how calmly I could respond when a system behaved differently in production.",
    },
    other: [
      {
        title: "The system—not the individual component—became the unit of thinking.",
        copy: "A local optimisation could create a downstream failure, and a technically elegant service could still be difficult to release or operate. I began looking beyond my assigned component: at dependencies, monitoring, deployment, failure paths, team communication, and the business decision the system existed to support.",
      },
    ],
    learnings: [
      {
        title: "Correctness is only the first requirement.",
        copy: "A valuable system must also be timely, reliable, measurable, and safe for another team to operate.",
      },
      {
        title: "The business outcome should guide the technical choice.",
        copy: "Models, interfaces, and services matter because of the decision they improve—not because of their technical novelty.",
      },
      {
        title: "Leadership can begin before the title.",
        copy: "Learning the wider system, creating clarity, and helping colleagues move forward are leadership behaviours at any level.",
      },
    ],
    milestones: [
      { value: "$100M+", label: "Anomalies identified in one month" },
      { value: "100K+", label: "Daily invoice create / update requests" },
      { value: "24h → near-live", label: "Anomaly reporting latency" },
    ],
    achievements: [
      {
        category: "System ownership",
        items: [
          "Built the path from anomaly detection through reporting, monitoring, infrastructure, and safe releases.",
          "Learned several connected services quickly and contributed beyond a single component.",
        ],
      },
      {
        category: "Leadership signal",
        items: [
          "Drove discussions, supported teammates, and worked across team boundaries before leadership became part of the title.",
        ],
      },
    ],
    feedback: [
      {
        full:
          "I had the opportunity to work closely with Sanjay during the early stage of our career, and even though we worked together for just about a year, his impact was clearly visible. He quickly developed strong product knowledge and was able to get a deep understanding of multiple services in a short time—something that usually takes much longer. It was impressive to see him already making an impact at the next level, driving discussions, and contributing meaningfully across teams.\n\nWhat stands out most about Sanjay is his leadership quality and the way he connects with people. He is transparent, approachable, and always willing to help others—whether it is providing technical guidance or simply supporting teammates when needed. He is someone who not only gets the job done but also uplifts those around him. A great colleague to work with, and someone who is continuously learning from everyone while being open to sharing his own knowledge. I learned a lot from him in a short span of time, and it was a real pleasure working together.",
        name: "Sahil Jobanputra",
        context: "Teammate at Amazon",
      },
    ],
    transition: {
      label: "The next chapter",
      title: "I chose a wider learning curve over the safer promotion path.",
      events: [
        {
          outcome: "Selected",
          title: "Google · Software Engineer II",
          copy: "A recruiter returned after my earlier rejection. I asked for one month, completed more than 450 practice questions, and cleared the process.",
        },
      ],
      text: "I was performing well and could have progressed to SDE II quickly. Brand mattered honestly, but it was not the only consideration: my manager was moving teams, a senior engineer encouraged the move, and Search offered a chance to learn how products serve people at enormous scale. I left a strong Amazon path to broaden what I could learn.",
    },
    tags: ["Machine learning", "Anomaly detection", "AWS", "Microservices"],
  },
  {
    id: "google",
    index: "04",
    eyebrow: "A second attempt",
    company: "Google",
    role: "Software Engineer II · Search India",
    period: "Sep 2021 — Feb 2024",
    duration: "2 years 6 months",
    place: "Bengaluru · Hybrid",
    headline: "Google widened the question from systems to people and intent.",
    summary:
      "Amazon taught me to make systems dependable. Search India added another layer: understand what a person means, make the experience useful across languages, and change a global product without losing local context.",
    logo: "/images/google_logo.webp",
    logoAlt: "Google",
    logoClass: "wide",
    tone: "blue",
    pivot: {
      label: "Product judgement at scale",
      text: "At Search scale, a small percentage is still a large human audience. Architecture, product intent, language, and rollout discipline have to move together because an apparently narrow change can reach more than a million daily queries.",
    },
    contextTitle: "User empathy, mentorship, and life outside work shaped the next decision",
    work: [
      {
        title: "Helped Search understand what users meant, not only what they typed.",
        copy: "I built Exam Quiz and structured education experiences for Search India, then helped change how the product interpreted education searches. The work affected 0.05% of Search traffic—an estimated scale of more than one million daily queries. It taught me to judge a technical change by the user need it served.",
      },
      {
        title: "Built language support once so several products could use it.",
        copy: "I launched exam-result experiences in Hindi, Tamil, and Telugu and designed a shared language service for other features. The aim was not translation for its own sake; it was a useful experience for Indian-language users, including people in smaller cities, without every team solving the same problem again.",
      },
      {
        title: "Learned to deliver through influence, not authority.",
        copy: "The work crossed product and infrastructure teams. Progress depended on clear requirements, shared priorities, careful release planning, and patient resolution of disagreements and failures. In a large organisation, the ability to create alignment was as important as writing the change itself.",
      },
    ],
    portfolioRecord: {
      details: [
        "Developed education-domain features in the Search India team for exam result pages and structured educational content.",
        "Built the Exam Quiz feature to improve engagement through interactive learning modules.",
        "Migrated the architecture from entity-driven matching to intent-driven understanding, affecting 0.05% of Search traffic.",
        "That measured reach maps to an estimated scale of more than one million daily queries when applied to Google’s public baseline of billions of searches per day.",
        "Launched localized exam-result experiences in Hindi, Tamil, and Telugu.",
        "Designed and integrated a scalable Language API for Indian languages, with particular value for users in smaller cities.",
        "Collaborated across teams to resolve issues, align requirements, and prioritize improvements.",
        "Worked in a large shared codebase using C++, Java, Python, gRPC, Protocol Buffers, graph-based knowledge systems, and internal technologies.",
      ],
      technologies: ["C++", "Java", "Python", "gRPC", "Protocol Buffers", "Graph Database (Knowledge Graph)", "Monorepo"],
      capabilities: ["Product Engineering", "API Design", "Localization", "Cross-functional Collaboration", "System Design"],
    },
    started: {
      title: "The role began with a more disciplined way of solving problems.",
      copy: "I joined Search India in September 2021 with a method shaped by deliberate preparation: listen, clarify, understand, and then solve. That discipline carried into product work, cross-team decisions, and the way I approached ambiguous problems.",
    },
    other: [
      {
        title: "Mentorship kept scale personal.",
        copy: "I held more than 50 mentoring sessions through Bosscoder Academy. Engineers I supported later joined Atlassian, Adobe, Amazon, PhonePe, and Microsoft. The sessions reinforced a lesson that large products can obscure: leadership is still experienced one person, one blocker, and one decision at a time.",
      },
    ],
    learnings: [
      {
        title: "Start with the user’s need, not the proposed solution.",
        copy: "Understanding what a person means leads to better decisions than optimising only for the words or structure already available.",
      },
      {
        title: "Influence is a delivery skill.",
        copy: "Large changes succeed through shared priorities, clear reasoning, and patient agreement across teams—not authority alone.",
      },
      {
        title: "Leadership remains personal at any scale.",
        copy: "Products may reach millions, but people experience leadership through individual support, clear feedback, and trust.",
      },
    ],
    milestones: [
      { value: "1M+", label: "Estimated daily queries touched" },
      { value: "3", label: "Indian languages launched" },
      { value: "50+", label: "Mentoring sessions alongside the role" },
    ],
    achievements: [
      {
        category: "Product contribution",
        items: [
          "Built Exam Quiz and structured education-domain Search experiences.",
          "Improved how Search understood education-related user needs.",
          "Built shared language support for Indian-language experiences.",
        ],
      },
      {
        category: "Influence & mentorship",
        items: [
          "Aligned product and infrastructure teams around requirements, priorities, and releases.",
          "Supported engineers who later joined Atlassian, Adobe, Amazon, PhonePe, and Microsoft.",
        ],
      },
    ],
    feedback: [],
    transition: {
      label: "The next chapter",
      title: "Marriage changed the frame; ambition still asked for a bigger challenge.",
      events: [
        {
          outcome: "Life",
          title: "Marriage",
          copy: "I married on 28 November 2023. Growth, location, and daily life now had to be evaluated together rather than as separate decisions.",
        },
        {
          outcome: "Ambition",
          title: "Bigger, more hands-on challenges",
          copy: "After two and a half years at Google, I wanted responsibility for more of the outcome—from design and implementation through delivery and team growth.",
        },
        {
          outcome: "Rejected",
          title: "Amazon · SDE II",
          copy: "I interviewed without giving preparation enough time and was not selected. I treated it as one result, not a verdict.",
        },
        {
          outcome: "Selected",
          title: "Oracle Health",
          copy: "Oracle offered meaningful healthcare work, remote flexibility, and broader hands-on ownership. I joined on 4 April 2024.",
        },
      ],
      text: "The move was not away from ambition. It was a more complete form of ambition: harder problems, wider responsibility, continued hands-on learning, and a working model that fit the life we were building.",
    },
    tags: ["Search", "Localization", "API design", "Mentorship"],
  },
  {
    id: "oracle",
    index: "05",
    eyebrow: "Impact over logos",
    company: "Oracle",
    role: "Senior Member of Technical Staff · Tech Lead",
    period: "Apr 2024 — Present",
    duration: "Promoted to Tech Lead in Oct 2025",
    place: "Oracle Health · Remote",
    headline: "Oracle is where engineering breadth became leadership scope.",
    summary:
      "The work joined everything the earlier chapters had taught me: problem depth, fairness, reliable systems, user impact, cross-team alignment, and mentorship—now applied to product direction, delivery, hiring, and team leadership.",
    logo: "/images/oracle_logo.svg",
    logoAlt: "Oracle",
    logoClass: "wide",
    tone: "red",
    pivot: {
      label: "Leadership at system level",
      text: "Good design makes responsibility clear—between services, teams, failure recovery, and future decisions. Good leadership gives people enough clarity to move quickly without making the product fragile.",
    },
    contextTitle: "A healthcare platform made architecture, delivery, and people one responsibility",
    work: [
      {
        title: "Own platform direction across products.",
        copy: "I lead the design, technical direction, delivery, and production readiness of Oracle Health’s next clinical reporting platform across more than three products. I designed and helped build more than seven services spanning requests, templates, data extraction, report generation, and final PDF assembly, with clear ownership for security, audit history, failure recovery, and operation.",
      },
      {
        title: "Turn plans into safe, predictable releases.",
        copy: "Across four quarterly releases, I translated roadmaps into decisions and work for five to eight engineers, removed ambiguity and blockers, guided design, resolved defects, and led compliance, monitoring, release, and production readiness. A design creates value only when the team can deliver and support it safely.",
      },
      {
        title: "Fix the underlying limit, not only the immediate failure.",
        copy: "When very large reports missed a strict response-time target, I led improvements across memory use, processing, and repeated data work. The objective was not a one-off rescue; it was a stronger design, better measurement, and a system that could keep meeting the requirement as demand grew.",
      },
      {
        title: "Build organisational capacity, not personal dependency.",
        copy: "I built the India Clinical Reporting team from the ground up, lead work across several products, partner broadly, reduce onboarding time, mentor engineers, and help maintain a high hiring standard. The goal is a team that can make strong decisions without waiting for one person.",
      },
    ],
    portfolioRecord: {
      details: [
        "Serve as Technical Lead for Oracle Health’s Clinical Reporting and Output Management team, owning architecture, technical direction, delivery, and production readiness for MRO / Clinical Reporting Gen2 across more than three products.",
        "Architected and implemented more than seven Java Micronaut services, redesigning medical-record output into a modular platform spanning APIs, templates, data extraction, report generation, and final PDF assembly.",
        "Introduced background processing, separate paths for fast and slow work, bulk generation, safe retries, failed-work recovery, duplicate protection, scaling, access controls, audit history, metrics, dashboards, and alerts.",
        "Led four quarterly releases from roadmap and architecture through work planning for five to eight engineers, execution support, architecture decisions, defect resolution, compliance, monitoring, release execution, and operational readiness.",
        "Resolved a critical production issue in which roughly 1,000-page reports exceeded a 30-second target; reduced heap use by 40%, improved speed by more than 25%, and drove request-level caching that cut data-extraction time by 60%.",
        "Partnered with more than 25 teams to turn custom clinical-reporting needs into reusable platform capabilities and reduced Gen2 onboarding from roughly two weeks to under one week.",
        "Led three engineers to deliver a legacy report-ingress service and six interfaces in one quarter plus one month instead of two planned quarters, enabling a platform migration with better performance, stability, scale, and lower third-party cost.",
        "Resolved technical and scope ambiguity across initiatives and contributed to early design and planning for regional disaster recovery and electronic health-record modernization.",
        "Built the India Clinical Reporting team from the ground up and expanded the leadership scope to more than ten engineers across more than three products, while strengthening hiring through 100+ interviews and 25+ hires.",
      ],
      technologies: ["Java", "Micronaut", "React", "Kafka", "Redis", "SQL", "Elasticsearch", "Large Semantic Object Storage", "Oracle Cloud Infrastructure", "Microservices"],
      capabilities: ["Technical Leadership", "System Architecture", "Performance Tuning", "Hiring", "Mentoring", "Cross-team Delivery"],
    },
    started: {
      title: "I chose wider ownership, meaningful stakes, and a life-compatible operating model.",
      copy: "I joined Oracle Health on 4 April 2024 with clear criteria: end-to-end ownership, a domain where reliability mattered, room to lead, and a remote setup that fit life after marriage. I was promoted to Tech Lead in October 2025.",
    },
    other: [
      {
        title: "Reliability is part of the user promise.",
        copy: "Clinical reports can be long, sensitive, and required under strict time limits. Security, audit history, failure recovery, monitoring, performance, and calm release preparation are therefore not background work. They are part of what the product promises clinicians and patients.",
      },
      {
        title: "Continuous learning keeps judgement current.",
        copy: "I earned Oracle Cloud certifications in generative AI, cloud development, and AI foundations, alongside the advanced CodeChef data structures and algorithms certification. More than 30 technical certifications support a broader habit: keep learning enough to question old assumptions without chasing every new tool.",
      },
    ],
    learnings: [
      {
        title: "Design, delivery, and people are one responsibility.",
        copy: "A strong technical direction matters only when the team can deliver it safely and support it confidently.",
      },
      {
        title: "Solve the underlying limit, not only the visible incident.",
        copy: "Production problems are opportunities to improve measurement, design, and future capacity—not merely restore the current state.",
      },
      {
        title: "Build a team that does not depend on one person.",
        copy: "Clear ownership, strong hiring, mentoring, and shared judgement create more durable impact than individual heroics.",
      },
    ],
    milestones: [
      { value: "10+", label: "Engineers across 3+ products" },
      { value: "7+", label: "Microservices architected and built" },
      { value: "100+", label: "Interviews as hiring leader" },
    ],
    achievements: [
      {
        category: "Product outcomes",
        items: [
          "Reduced memory use by 40% and improved speed by more than 25% for reports of about 1,000 pages.",
          "Cut data-extraction time 60% by avoiding repeated work within the same request.",
          "Reduced new-product onboarding from roughly two weeks to under one week.",
          "Delivered a planned two-quarter migration in one quarter plus one month.",
        ],
      },
      {
        category: "Leadership scale",
        items: [
          "Led four quarterly releases and partnered with more than 25 teams.",
          "Built and led the India Clinical Reporting team, growing the scope to more than ten engineers across more than three products and 25+ partner teams.",
          "Promoted to Tech Lead and nominated for the next level based on scope and impact.",
        ],
      },
      {
        category: "Hiring & mentorship",
        items: [
          "Became an Oracle Certified Bar Raiser, conducted more than 100 interviews, and contributed to more than 25 hires.",
          "Mentored and judged more than ten AI-focused teams at OraHacks; one mentored team won with CodeAtlas.",
        ],
      },
      {
        category: "Certifications",
        items: [
          "Oracle Cloud Infrastructure 2025 Generative AI Professional.",
          "Oracle Cloud Infrastructure 2025 Certified Developer Professional.",
          "Oracle Cloud Infrastructure 2024 Certified AI Foundations Associate.",
          "CodeChef Certified Data Structures and Algorithms Programme—Advanced.",
          "Completed more than 30 technical certifications across computer science, cloud, and software engineering.",
        ],
      },
    ],
    feedback: [
      {
        full:
          "I had the privilege of working under Sanjay’s guidance, and I can confidently say he is not only an exceptional Tech Lead, but also one of the most impactful mentors I have ever worked with. His technical depth and architectural vision are top-tier, but what truly sets him apart is his genuine commitment to elevating the engineers around him.\n\nSanjay’s mentorship was instrumental in my growth as an engineer. He leads with patience and clarity, taking the time to break down complex technical concepts and explain the ‘why’ behind critical architecture decisions. He creates a high-trust environment that empowers you to step outside your comfort zone and take full ownership of complex challenges, all while providing the exact guidance and support needed to succeed. His proactive approach to clearing blockers and sharp product sense consistently guided our team to hit critical milestones.\n\nSanjay seamlessly balances high-level technical execution with dedicated, hands-on mentorship. Any engineering team would be incredibly fortunate to have Sanjay leading their technical initiatives and developing their talent.",
        name: "Atishay Jain",
        context: "Engineer reporting to Sanjay at Oracle",
      },
      {
        full:
          "I’ve known Sanjay through Oracle Health, and as his senior from college we’ve had many conversations about our careers and growth. His technical leadership skills have always stood out to me. He has a strong ability to drive complex initiatives end to end, collaborating with cross-functional teams, communicating clearly with stakeholders, mentoring engineers, and working with global partners to deliver outcomes. His mix of technical depth and execution clarity enables him to lead projects at scale with confidence. I’m confident he will thrive in any high-performing engineering environment.",
        name: "Sanjay Gidwani",
        context: "Oracle Health colleague and senior from college",
      },
      {
        full:
          "I had the pleasure of working with Sanjay on a project that he led, and it was a really great experience. Thanks to his leadership and clear direction, we were able to deliver the project in just one quarter and a month, compared to the original estimate of two quarters—an impressive achievement for the entire team.\n\nWhat stood out the most was how he always looked at the bigger picture, tackled critical challenges head-on, and worked closely with everyone to get things moving. He brought structure and clarity to the project by defining stories, aligning priorities, and keeping the team focused on outcomes. He also went above and beyond to help junior engineers, ensuring they were unblocked and could contribute effectively. His hands-on involvement in end-to-end testing and release made a big difference in getting the project delivered smoothly.\n\nEven with relatively fewer years of experience, Sanjay shows the kind of leadership, ownership, and problem-solving mindset you would expect from someone at the next level. He is a great teammate to work with—collaborative, reliable, and always positive. Any team would be lucky to have him!",
        name: "Nilesh Yadav",
        context: "Teammate on a project led by Sanjay at Oracle",
      },
      {
        full:
          "I’ve had the pleasure of working closely with Sanjay in Oracle Health, and his contributions have been nothing short of exceptional. Despite having comparatively fewer years of experience, Sanjay consistently demonstrates the skills, maturity, and technical depth of a much more seasoned engineer. He possesses a deep understanding of both legacy and next-generation systems, allowing him to bridge complex architectural gaps and deliver robust, scalable solutions. His approach to system design consistently exceeds expectations for his role and level, offering clarity, scalability, and long-term value to the product. His code is clean, efficient, and maintainable, and his code reviews are detailed and constructive, improving the overall quality of the team’s output.\n\nBeyond his technical strengths, Sanjay stands out as a collaborative and dependable teammate. He is proactive in supporting others, unblocking challenges, and sharing knowledge generously. Even without a formal leadership title, he naturally steps up to lead discussions, guide decisions, and ensure alignment across the team. Sanjay is a rare blend of technical excellence, leadership, and humility. As he continues to take on greater ownership and engage more with cross-functional stakeholders, I have no doubt he will continue to make an even bigger impact. He is an exceptional engineer and a true asset to any team.",
        name: "Akarsh Naveen Chandra",
        context: "Oracle Health teammate",
      },
    ],
    transition: {
      label: "The next chapter",
      title: "Several interview outcomes tested whether it was time to leave.",
      events: [
        {
          outcome: "Rejected",
          title: "Meta",
          copy: "I interviewed with Meta after joining Oracle but was not selected.",
        },
        {
          outcome: "Two offers",
          title: "Amazon · SDE II",
          copy: "I interviewed with two separate Amazon teams during offline hiring drives and received an SDE II offer from both.",
        },
        {
          outcome: "Offer",
          title: "Uber · SDE II",
          copy: "I was selected for an Uber SDE II role through an offline hiring drive.",
        },
        {
          outcome: "Offer",
          title: "Microsoft · L62",
          copy: "I interviewed with Microsoft and was selected for an L62 role.",
        },
      ],
      text: "I chose to stay at Oracle through those outcomes. The role, ownership, visible impact, room to grow, and nomination for the next level mattered more than changing companies for its own sake. More recent leadership and organisation changes have altered that balance, so I am reassessing the next chapter honestly. The decision remains the same kind of decision: meaningful responsibility, good people, sustained impact, and room to keep growing.",
    },
    tags: ["Technical leadership", "Architecture", "Hiring", "Healthcare"],
  },
];
