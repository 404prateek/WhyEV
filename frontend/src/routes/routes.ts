export const ROUTES = {
  HOME: '/',
  RECOMMEND: '/recommend',
  SUBSIDY: '/recommend', // Redirect standalone subsidy links to Find Your EV embedded savings
  DEALERS: '/dealers',
  DASHBOARD: '/dashboard',
  BATTERY_CERT: '/battery-cert',
  CHARGING: '/map',
  MAP: '/map',
  LIVE_FEED: '/live-feed',
  MARKETPLACE: '/marketplace',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const;

export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
  badge?: string;
  tag?: string;
  category?: 'discovery' | 'intelligence' | 'ownership';
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Find Your EV', href: ROUTES.RECOMMEND },
  { label: 'Charging Map', href: ROUTES.MAP },
  { label: 'Discover', href: ROUTES.LIVE_FEED },
  { label: 'Battery Health', href: ROUTES.BATTERY_CERT },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Find Your EV', href: ROUTES.RECOMMEND },
  { label: 'Charging Map', href: ROUTES.MAP },
  { label: 'Discover', href: ROUTES.LIVE_FEED },
  { label: 'Battery Health & Inspection', href: ROUTES.BATTERY_CERT },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Used EV Marketplace', href: ROUTES.MARKETPLACE },
];
