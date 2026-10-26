'use client';

// Navigation starts closed. The menu opens a drawer on compact screens and the configured
// drawer or rail on wider screens. Destinations and their order come from layout.md.
import { type ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { activeItem } from './destinations.mjs';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { NavigationRail, type NavItem } from '@/components/NavigationRail';
import { PageHeader } from '@/components/PageHeader';
import { Icon } from '@/components/Icon';
import { useDesign } from '@/design/runtime';
import { GlobalFilterProvider } from '@/lib/global-filter';
import { href } from '@/lib/href';
import { SiteFilterChips, SiteFilters, type SiteFiltersConfig } from './SiteFilters';

export type ShellItem = NavItem & { path: string; match: string[] };

export type ShellConfig = {
  brand: string;
  navLabel: string;
  menuLabel: string;
  skipLabel: string;
  nav: ShellItem[];
  more: ShellItem[];
  filters: SiteFiltersConfig;
};

export { activeItem };

export function SiteShell({ config, saveControl, children }: { config: ShellConfig; saveControl?: ReactNode; children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const { layout, global } = useDesign();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const order = layout['Site navigation'] ?? [];
  const nav = [...config.nav].sort((a, b) => (order.indexOf(a.id) + 1 || 99) - (order.indexOf(b.id) + 1 || 99));
  const all = [...nav, ...config.more];
  useEffect(() => { setNavigationOpen(false); }, [pathname]);
  useEffect(() => {
    if (!navigationOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setNavigationOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [navigationOpen]);
  const active = activeItem(all, pathname);
  return (
    <GlobalFilterProvider>
      <PageHeader
        brand={{ text: config.brand, href: href('/') }}
        nav={[]}
        navLabel={config.navLabel}
        menuLabel={config.menuLabel}
        skipLabel={config.skipLabel}
        skipTarget="#main"
        navigationToggle={
          <button type="button" aria-label={config.menuLabel} aria-expanded={navigationOpen} aria-controls="site-navigation" onClick={() => setNavigationOpen((value) => !value)} className="inline-flex min-h-11 min-w-11 items-center justify-center text-on-surface state-hover:bg-surface-container-highest">
            <Icon name={navigationOpen ? 'close' : 'menu'} size={24} />
          </button>
        }
        actions={<>{saveControl}<SiteFilters config={config.filters} /></>}
      />
      <div className="flex">
        <div id="site-navigation" hidden={!navigationOpen} className="fixed top-16 bottom-0 left-0 z-30 max-w-[calc(100vw-3rem)] medium:static medium:max-w-none">
          {navigationOpen ? <>
            <NavigationDrawer label={config.navLabel} items={all} active={active} className={global['Navigation on wide screens'] === 'rail' ? 'flex medium:hidden' : 'flex'} />
            {global['Navigation on wide screens'] === 'rail' ? <NavigationRail label={config.navLabel} items={all} active={active} className="hidden medium:flex" /> : null}
          </> : null}
        </div>
        <div className="min-w-0 flex-1">
          <SiteFilterChips config={config.filters} />
          {children}
        </div>
      </div>
    </GlobalFilterProvider>
  );
}
