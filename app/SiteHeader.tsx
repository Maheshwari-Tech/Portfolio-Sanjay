import AccountStatus from "./AccountStatus";
import Link from "next/link";
import Wordmark from "./Wordmark";

export default function SiteHeader() {
  return <header className="site-subheader">
    <Wordmark />
    <nav aria-label="Site navigation"><Link href="/projects">Projects</Link><Link href="/articles">Blogs</Link><Link href="/certificates">Certificates</Link><Link href="/candidates">Candidates</Link><Link href="/recruiters">Recruiters</Link></nav>
    <AccountStatus />
  </header>;
}
