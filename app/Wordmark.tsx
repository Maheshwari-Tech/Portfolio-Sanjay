import Link from "next/link";

export default function Wordmark({
  href = "/",
  label = "Sanjay Gandhi, home",
  initials = "SM",
}: {
  href?: string;
  label?: string;
  initials?: string;
}) {
  return <Link className="wordmark" href={href} aria-label={label}>
    {initials}<span aria-hidden="true">.</span>
  </Link>;
}
