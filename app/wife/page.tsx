import type { Metadata } from "next";
import WifeCelebration from "./WifeCelebration";

export const metadata: Metadata = {
  title: "For Shalini, with love",
  description: "A private-by-discovery celebration of love, memories, and birthdays.",
  robots: { index: false, follow: false },
};

export default function WifePage() {
  return <WifeCelebration />;
}
