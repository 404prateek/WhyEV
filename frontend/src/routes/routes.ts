export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  RECOMMEND: '/recommend',
  SUBSIDY: '/subsidy',
  DEALERS: '/dealers',
  DASHBOARD: '/dashboard',
  BATTERY_CERT: '/battery-cert',
  BATTERY_HEALTH: '/battery-health',
  CHARGING: '/map',
  MAP: '/map',
  DISCOVER: '/discover',
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
  { label: 'Shop', href: ROUTES.RECOMMEND },
  { label: 'Map', href: ROUTES.MAP },
  { label: 'Discover', href: ROUTES.LIVE_FEED },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Dealer Connect', href: ROUTES.DEALERS },
];

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Shop', href: ROUTES.RECOMMEND },
  { label: 'Map', href: ROUTES.MAP },
  { label: 'Discover', href: ROUTES.LIVE_FEED },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Dealer Connect', href: ROUTES.DEALERS },
];
