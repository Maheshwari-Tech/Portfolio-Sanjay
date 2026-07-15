import Link from "next/link";
import AccountStatus from "./AccountStatus";

export default function SiteHeader() {
  return <header className="site-subheader">
    <Link className="wordmark" href="/" aria-label="Sanjay Gandhi, home">SM<span>.</span></Link>
    <nav aria-label="Site navigation"><Link href="/projects">Projects</Link><Link href="/articles">Blogs</Link><Link href="/certificates">Certificates</Link><Link href="/candidates">Candidates</Link><Link href="/recruiters">Recruiters</Link></nav>
    <AccountStatus />
  </header>;
}
