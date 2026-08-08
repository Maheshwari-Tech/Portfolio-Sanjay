import type { Metadata } from "next";
import SiteFooter from "../SiteFooter";
import SiteHeader from "../SiteHeader";
import JourneyTimeline from "./JourneyTimeline";

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

export default function JourneyPage() {
  return <>
    <SiteHeader />
    <JourneyTimeline />
    <SiteFooter />
  </>;
}
