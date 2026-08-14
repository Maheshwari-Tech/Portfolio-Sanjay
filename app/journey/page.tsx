import type { Metadata } from "next";
import achievementGroupsFallback from "../../data/source/achievements.json";
import educationFallback from "../../data/source/education.json";
import experienceFallback from "../../data/source/experience.json";
import reviewsFallback from "../../data/source/reviews.json";
import { isRecommendation, type Recommendation } from "../RecommendationCarousel";
import { achievementLabels, type Achievement, type RecognitionGroup } from "../RecognitionCarousel";
import SiteFooter from "../SiteFooter";
import SiteHeader from "../SiteHeader";
import { backendFirst } from "../serverContent";
import JourneyTimeline, { type JourneySectionDetail } from "./JourneyTimeline";

export const metadata: Metadata = {
  title: "Journey",
  description:
    "Sanjay Gandhi’s journey from competitive programming at LPU through HackerEarth, Amazon, Google, and technical leadership at Oracle Health.",
  alternates: { canonical: "/journey" },
  openGraph: {
    title: "Journey — Sanjay Gandhi",
    description:
      "Ten years of changing goals, hard interviews, production systems, mentorship, and technical leadership.",
    url: "/journey",
    type: "profile",
  },
};

export const revalidate = 120;

type ExperienceDetail = {
  company: string;
  role: string;
  period: string;
  duration: string;
  technologies: string[];
  keySkills: string[];
  details: string[];
};

type EducationDetail = {
  degree: string;
  institution: string;
  period: string;
  cgpa: string;
};

function recommendationSection(recommendation: Recommendation) {
  const context = `${recommendation.name} ${recommendation.context}`.toLowerCase();

  if (context.includes("oracle") || recommendation.name === "Sanjay Gidwani") return "oracle";
  if (context.includes("amazon")) return "amazon";
  if (context.includes("hackerearth")) return "hackerearth";
  if (context.includes("university") || context.includes("college") || context.includes("b.tech")) return "education";
  return undefined;
}

export default async function JourneyPage() {
  const [reviews, achievementData, experienceData, educationData] = await Promise.all([
    backendFirst("reviews", reviewsFallback),
    backendFirst("achievements", achievementGroupsFallback),
    backendFirst("experience", experienceFallback),
    backendFirst("education", educationFallback),
  ]);
  const recommendations = (reviews as unknown[]).filter(isRecommendation);
  const recommendationsBySection = recommendations.reduce<Record<string, Recommendation[]>>((sections, recommendation) => {
    const section = recommendationSection(recommendation);
    if (!section) return sections;
    (sections[section] ??= []).push(recommendation);
    return sections;
  }, {});
  const achievementGroups = achievementData as Record<string, Achievement[]>;
  const achievementText = (achievement: Achievement) => typeof achievement === "string" ? achievement : achievement.text;
  const educationAchievements: RecognitionGroup[] = [
    {
      category: "competitive_programming",
      label: achievementLabels.competitive_programming,
      items: achievementGroups.competitive_programming ?? [],
    },
    {
      category: "academic_excellence",
      label: achievementLabels.academic_excellence,
      items: achievementGroups.academic_excellence ?? [],
    },
    {
      category: "certifications",
      label: "College certification",
      items: (achievementGroups.certifications ?? []).filter((achievement) => achievementText(achievement).includes("CodeChef Certified")),
    },
  ].filter((group) => group.items.length > 0);

  const workSectionDetails = (experienceData as ExperienceDetail[]).reduce<Record<string, JourneySectionDetail>>((sections, experience) => {
    const sectionId = experience.company.toLowerCase().replace(/[^a-z0-9]+/g, "");
    sections[sectionId] = {
      label: `Explore ${experience.company} work details`,
      title: experience.role,
      facts: [
        { label: "Period and location", value: experience.period },
        { label: "Duration", value: experience.duration },
      ],
      details: experience.details,
      technologies: experience.technologies,
      skills: experience.keySkills,
    };
    return sections;
  }, {});
  const education = educationData as EducationDetail;
  const sectionDetails: Record<string, JourneySectionDetail> = {
    ...workSectionDetails,
    education: {
      label: "Explore education details",
      title: education.degree,
      facts: [
        { label: "University", value: education.institution },
        { label: "Period", value: education.period },
        { label: "CGPA", value: education.cgpa },
      ],
      technologies: ["Machine Learning", "Data Structures", "Algorithms", "Competitive Programming"],
      skills: ["Problem solving", "Teaching", "Mentoring"],
    },
  };

  return <>
    <SiteHeader />
    <JourneyTimeline achievementsBySection={{ education: educationAchievements }} recommendationsBySection={recommendationsBySection} sectionDetails={sectionDetails} />
    <SiteFooter />
  </>;
}
