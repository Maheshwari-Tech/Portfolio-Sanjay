import AccountStatus from "./AccountStatus";
import MobileNavigation from "./MobileNavigation";
import Wordmark from "./Wordmark";

export default function SiteHeader() {
  return <><a className="skip-link" href="#main-content">Skip to main content</a><header className="site-header site-header-subpage">
    <Wordmark />
    <MobileNavigation />
    <AccountStatus />
  </header></>;
}
