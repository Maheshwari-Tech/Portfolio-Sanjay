import { InterviewTracker } from "../../page";

export default async function CompanyInterviewTrackerPage({
  params,
}: {
  params: Promise<{companyName: string}>;
}) {
  const {companyName} = await params;
  return <InterviewTracker initialCompanySlug={decodeURIComponent(companyName)}/>;
}
