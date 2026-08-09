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
  learnings: string[];
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
      "The goal set direction. Curiosity did the rest: I tried widely, stayed with the hardest work I enjoyed, and let growing skill keep moving the goalpost.",
    tone: "paper",
    pivot: {
      label: "The process",
      text: "Set the direction, then focus on the work. Curiosity made sustained effort feel natural; each attempt showed where to go deeper.",
    },
    contextTitle: "What confidence could not teach me on its own",
    work: [
      {
        title: "I chose challenging work and let interest decide where to go deeper.",
        copy: "I tried contests, hackathons, projects, aptitude tests, teaching, and mentoring. Competitive programming was the most fun; Machine Learning became my specialisation. Curiosity made the hard work feel almost effortless.",
      },
      {
        title: "Skill moved the goalpost before any offer did.",
        copy: "By second year, seniors reviewing my contest results told me 10 LPA was already within reach. I was among the top students in company coding tests. Their guidance raised my ambition. At early-stage InterviewBit—now Scaler—I helped hire teachers, develop the course, and build the learning platform with Team Amigos.",
      },
    ],
    started: {
      title: "The goal was a compass, not a scoreboard.",
      copy: "The 10 LPA ambition pointed me forward. Then I focused on exploring computer science, choosing hard work, and staying with problems I enjoyed. Progress followed the process.",
    },
    other: [
      {
        title: "In hindsight, it was extraordinary—and never mine alone.",
        copy: "The Amazon offer felt natural then; in hindsight, it was extraordinary. Preparation created readiness, while timing, luck, seniors, teammates, teachers, and family helped it meet opportunity. Confidence and gratitude belong together.",
      },
    ],
    learnings: ["Competitive Programming", "Machine Learning", "Teaching", "Mentoring"],
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
          copy: "The offer rose from 8 to 28 LPA. I declined because university rules could close later campus opportunities.",
        },
        {
          outcome: "Selected",
          title: "InterviewBit · Scaler internship",
          copy: "I earned the off-campus internship and joined with two Team Amigos friends.",
        },
        {
          outcome: "Selected",
          title: "Amazon · Direct full-time SDE",
          copy: "Amazon came for interns; I became the first student selected directly for full-time, advertised as 32 LPA. My reaction: ‘Amazon toh normal hai!’",
        },
        {
          outcome: "Rejected",
          title: "Google · First round",
          copy: "I coded before understanding the problem. The rejection taught me to listen, clarify, then solve.",
        },
        {
          outcome: "Joined",
          title: "HackerEarth · Problem Curator",
          copy: "With Amazon starting in July, HackerEarth and I chose each other for a six-month final-semester internship.",
        },
      ],
      text: "When my Scaler teammates left for internships, I returned to college and helped juniors prepare for placements. HackerEarth became the bridge to full-time engineering.",
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
      "HackerEarth moved me from solving hard problems to designing fair, useful assessments for candidates and companies.",
    logo: "/images/HackerEarth_logo.png",
    logoAlt: "HackerEarth",
    logoClass: "wide",
    tone: "mint",
    pivot: {
      label: "From skill to judgement",
      text: "Difficulty alone is a poor hiring signal. A useful assessment balances depth, clarity, time, test coverage, and fairness.",
    },
    contextTitle: "The first leadership lesson was designing for people I would never meet",
    work: [
      {
        title: "Turned algorithms into reliable hiring signals.",
        copy: "I created and tested coding problems for Infosys, Google, Facebook, Nokia, PayPal, and Salesforce—defining what each measured, removing ambiguity, proving the solution, and testing every candidate consistently.",
      },
      {
        title: "Learned that expertise scales only when it can be explained.",
        copy: "I represented HackerEarth in a two-day, 10+ hour advanced algorithms workshop at MNIT Jaipur for 120+ attendees. Teaching exposed gaps that solving alone could hide.",
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
      copy: "I already held Amazon’s July 2020 offer, but chose HackerEarth because problem setting stretched what I loved into fair evaluation. They hired me knowing I could stay only six months, yet trusted me with company assessments and the MNIT workshop. I remain grateful for that investment.",
    },
    other: [
      {
        title: "Fairness became an engineering requirement.",
        copy: "Clear wording, realistic limits, complete tests, and a sound expected solution were the product. My decisions affected candidates I would never meet.",
      },
    ],
    learnings: ["Problem Setting", "Competitive Programming", "Teaching", "Public Speaking"],
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
      text: "HackerEarth taught me to judge skill fairly. Amazon added responsibility for systems used every day.",
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
      "The placement number opened the door. Inside, success meant reliable, fast finance systems and sound decisions under real business risk.",
    logo: "/images/amazon_logo.svg",
    logoAlt: "Amazon",
    logoClass: "wide",
    tone: "night",
    pivot: {
      label: "Owning real outcomes",
      text: "Correct code is the beginning. A dependable system must be safe to release, easy to operate, and resilient under real demand.",
    },
    contextTitle: "Production scale changed both my engineering and my ambition",
    work: [
      {
        title: "Connected technical choices to financial risk.",
        copy: "I built systems for unusual, duplicate, and potentially fraudulent invoices across 100K+ daily requests. Three rules identified $100M+ in anomalies within one month.",
      },
      {
        title: "Made results faster and the system safer to run.",
        copy: "I moved findings from a 24-hour delay to near real time, then built the interfaces, monitoring, infrastructure, and release setup needed to run safely.",
      },
      {
        title: "Began leading before leadership was part of the title.",
        copy: "I learned connected services quickly, drove discussions, worked across teams, and supported colleagues. Understanding the whole system and creating clarity became my first leadership pattern.",
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
      copy: "I joined Finance Automation in July 2020. Contest ranks no longer mattered; reliability, judgement, product understanding, communication, and calm production decisions did.",
    },
    other: [
      {
        title: "The system—not the individual component—became the unit of thinking.",
        copy: "A good component could still create a poor system. I began considering dependencies, monitoring, releases, failures, team communication, and the business decision together.",
      },
    ],
    learnings: ["Machine Learning", "Anomaly Detection", "Microservices", "API Design", "CI/CD", "Monitoring"],
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
          copy: "A recruiter returned. I asked for one month, completed 450+ practice questions, and cleared the process.",
        },
      ],
      text: "I was on a strong path toward SDE II. Brand mattered, but so did my manager moving, a senior engineer’s advice, and the chance to learn Search at global scale. I chose the wider learning curve.",
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
      "Search India taught me to understand intent, serve people across languages, and change a global product without losing local context.",
    logo: "/images/google_logo.webp",
    logoAlt: "Google",
    logoClass: "wide",
    tone: "blue",
    pivot: {
      label: "Product judgement at scale",
      text: "At Search scale, a small percentage still means millions of people. Product intent, language, design, and release discipline must move together.",
    },
    contextTitle: "User empathy, mentorship, and life outside work shaped the next decision",
    work: [
      {
        title: "Helped Search understand what users meant, not only what they typed.",
        copy: "I built Exam Quiz and education experiences, then improved how Search interpreted education queries. The change affected 0.05% of traffic—an estimated 1M+ daily queries.",
      },
      {
        title: "Built language support once so several products could use it.",
        copy: "I launched exam-result experiences in Hindi, Tamil, and Telugu and designed a shared language service, helping several features serve Indian-language users without repeating the work.",
      },
      {
        title: "Learned to deliver through influence, not authority.",
        copy: "The work crossed product and infrastructure teams. Clear requirements, shared priorities, careful releases, and patient agreement mattered as much as writing the change.",
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
      copy: "I joined Search India in September 2021 with a deliberate method: listen, clarify, understand, then solve. It shaped both product work and cross-team decisions.",
    },
    other: [
      {
        title: "Mentorship kept scale personal.",
        copy: "I held 50+ Bosscoder mentoring sessions. Engineers I supported later joined Atlassian, Adobe, Amazon, PhonePe, and Microsoft. Leadership still happens one person at a time.",
      },
    ],
    learnings: ["Product Engineering", "API Design", "Localization", "Cross-functional Collaboration", "System Design"],
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
          copy: "I married on 28 November 2023. Career, location, and daily life now belonged in one decision.",
        },
        {
          outcome: "Ambition",
          title: "Bigger, more hands-on challenges",
          copy: "After 2.5 years, I wanted wider hands-on ownership—from design and implementation to delivery and team growth.",
        },
        {
          outcome: "Rejected",
          title: "Amazon · SDE II",
          copy: "I prepared too little and was rejected. It was one result, not a verdict.",
        },
        {
          outcome: "Selected",
          title: "Oracle Health",
          copy: "Healthcare impact, remote work, and broader ownership led me to join on 4 April 2024.",
        },
      ],
      text: "The move combined harder problems, wider responsibility, hands-on learning, and a working model that fit our life.",
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
      "Oracle brought architecture, delivery, hiring, and team leadership into one responsibility for a healthcare platform.",
    logo: "/images/oracle_logo.svg",
    logoAlt: "Oracle",
    logoClass: "wide",
    tone: "red",
    pivot: {
      label: "Leadership at system level",
      text: "Good design clarifies responsibility across services and failures. Good leadership gives people clarity without making the product depend on one person.",
    },
    contextTitle: "A healthcare platform made architecture, delivery, and people one responsibility",
    work: [
      {
        title: "Own platform direction across products.",
        copy: "I lead design, delivery, and production readiness for clinical reporting across 3+ products. I designed and helped build 7+ services covering requests, templates, data, reports, PDF assembly, security, audit history, and recovery.",
      },
      {
        title: "Turn plans into safe, predictable releases.",
        copy: "Across four quarterly releases, I turned roadmaps into clear work for 5–8 engineers, guided design, removed blockers, resolved defects, and led safe production releases.",
      },
      {
        title: "Fix the underlying limit, not only the immediate failure.",
        copy: "When 1,000-page reports missed a 30-second target, I led improvements that cut memory 40%, raised speed 25%+, and reduced data-extraction time 60%.",
      },
      {
        title: "Build organisational capacity, not personal dependency.",
        copy: "I built the India Clinical Reporting team, now 10+ engineers across 3+ products, while partnering with 25+ teams, mentoring engineers, and strengthening hiring.",
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
      copy: "I joined Oracle Health on 4 April 2024 for end-to-end ownership, meaningful reliability work, room to lead, and remote work after marriage. I became Tech Lead in October 2025.",
    },
    other: [
      {
        title: "Reliability is part of the user promise.",
        copy: "Clinical reports are sensitive and time-bound. Security, audit history, recovery, monitoring, performance, and safe releases are part of the promise to clinicians and patients.",
      },
      {
        title: "Continuous learning keeps judgement current.",
        copy: "Oracle certifications in generative AI, cloud development, and AI foundations—plus 30+ technical credentials—help me question old assumptions without chasing every new tool.",
      },
    ],
    learnings: ["Technical Leadership", "System Architecture", "Performance Tuning", "Hiring", "Mentoring", "Cross-team Delivery"],
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
          copy: "I interviewed after joining Oracle and was not selected.",
        },
        {
          outcome: "Two offers",
          title: "Amazon · SDE II",
          copy: "Two separate offline hiring drives produced two SDE II offers.",
        },
        {
          outcome: "Offer",
          title: "Uber · SDE II",
          copy: "Selected through an offline hiring drive.",
        },
        {
          outcome: "Offer",
          title: "Microsoft · L62",
          copy: "Selected for an L62 role.",
        },
      ],
      text: "I stayed because ownership, impact, growth, and a next-level nomination mattered more than changing logos. Recent leadership and organisation changes shifted that balance. I am reassessing with the same criteria: meaningful responsibility, good people, sustained impact, and room to grow.",
    },
    tags: ["Technical leadership", "Architecture", "Hiring", "Healthcare"],
  },
];
