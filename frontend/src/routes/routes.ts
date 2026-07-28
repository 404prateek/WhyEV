export const ROUTES = {
  HOME: '/',
  RECOMMEND: '/recommend',
  SUBSIDY: '/subsidy',
  DEALERS: '/dealers',
  DASHBOARD: '/dashboard',
  BATTERY_CERT: '/battery-cert',
  CHARGING: '/map',
  MAP: '/map',
  MARKETPLACE: '/marketplace',
  PROFILE: '/profile',
  ADMIN: '/admin',
  DOCUMENT_VERIFICATION: '/subsidy/document-verification',
} as const;

export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
  badge?: string;
  tag?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'EV Matcher', href: ROUTES.RECOMMEND },
  { label: 'Subsidy 2026', href: ROUTES.SUBSIDY, badge: 'USP' },
  { label: 'Dealers', href: ROUTES.DEALERS },
  { label: 'Map', href: ROUTES.MAP },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Subsidy Calculator 2026', href: ROUTES.SUBSIDY },
  { label: 'Empanelled EV Matcher', href: ROUTES.RECOMMEND },
  { label: 'Verified Dealers', href: ROUTES.DEALERS },
  { label: 'Charging Map', href: ROUTES.MAP },
  { label: '30-Day Application Tracker', href: ROUTES.DASHBOARD },
  { label: 'Battery Inspection Cert', href: ROUTES.BATTERY_CERT },
  { label: 'Used Marketplace', href: ROUTES.MARKETPLACE },
];
