'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Projects', href: '/projects', icon: '📁' },
    { label: 'Work Items', href: '/work-items', icon: '📝' },
    { label: 'Reports', href: '/reports', icon: '📈' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside 
      className="w-64 bg-white border-r border-gray-200 min-h-screen p-4"
      aria-label="Main navigation sidebar"
    >
      <nav className="space-y-2" aria-label="Sidebar navigation">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-2 rounded-lg transition',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                isActive 
                  ? 'bg-primary-50 text-primary-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
