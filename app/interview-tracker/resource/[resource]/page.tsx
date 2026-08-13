import Link from "next/link";
import Wordmark from "../../../Wordmark";

const designResources = {
  hld: "High Level Design",
  lld: "Low Level Design",
} as const;

export default async function InterviewResourcePage({params}: {params: Promise<{resource: string}>}) {
  const {resource: resourceKey} = await params;
  const resource = designResources[resourceKey as keyof typeof designResources];

  if (!resource) return <main className="tracker-page"><header className="admin-topbar"><Wordmark/><nav><Link href="/interview-tracker">Preparation home</Link></nav></header><section className="admin-empty"><p className="eyebrow">INTERVIEW PREPARATION</p><h1>Resource not found.</h1></section></main>;

  return <main className="tracker-page"><header className="admin-topbar"><Wordmark/><nav><Link href="/interview-tracker">Preparation home</Link></nav></header><section className="admin-empty"><p className="eyebrow">{resource.toUpperCase()}</p><h1>Notes will be added soon.</h1></section></main>;
}
