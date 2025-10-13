import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Menu as MenuIcon,
  TrendingUp,
  Users,
  CalendarClock,
  MessageSquare,
  ShoppingCart,
  Utensils,
  Bell,
  Package,
  CreditCard,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthContext';
import logo from '@/assets/technomart-logo.png';

export const NavigationSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasRole, can } = useAuth();

  const displayName = user?.name || 'Admin';
  const normalizedRole = (user?.role || 'staff').toLowerCase();
  const displayRole =
    normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
  const avatarInitial = (displayName?.[0] || 'A').toUpperCase();
  const isAdmin =
    typeof hasRole === 'function'
      ? hasRole('admin')
      : normalizedRole === 'admin';

  // Read collapsed state; default to expanded if hook not present
  let isCollapsed = false;
  try {
    const sidebar = useSidebar?.();
    isCollapsed = sidebar?.state === 'collapsed';
  } catch {
    isCollapsed = false;
  }

  // Trim down icon-mode footprint to give the content area more room.
  const COLLAPSED_WIDTH_CSS = `
    /* Scope to the sidebar when it is in icon (collapsed) mode */
    .group[data-collapsible="icon"] {
      --sidebar-width-icon: 56px;
    }
  `;

  // removed decorative styles that were not applied anywhere in the markup

  const navigationGroups = [
    {
      label: 'Core',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Point of Sale', href: '/pos', icon: ShoppingCart },
      ],
    },
    {
      label: 'Operations',
      items: [
        {
          name: 'Menu Management',
          href: '/menu',
          icon: MenuIcon,
          roles: ['manager', 'admin'],
        },
        {
          name: 'Catering',
          href: '/catering',
          icon: Utensils,
          roles: ['manager', 'admin'],
        },
        { name: 'Inventory', href: '/inventory', icon: Package },
      ],
    },
    {
      label: 'Management',
      items: [
        {
          name: 'Analytics',
          href: '/analytics',
          icon: TrendingUp,
          roles: ['manager', 'admin'],
          permission: 'reports.sales.view',
        },
        {
          name: 'Employee Management',
          href: '/employees',
          icon: CalendarClock,
        },
        { name: 'Payments', href: '/payments', icon: CreditCard },
        { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
      ],
    },
    {
      label: 'Support',
      items: [
        {
          name: 'Activity Logs',
          href: '/logs',
          icon: FileText,
          roles: ['manager', 'admin'],
        },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        {
          name: 'Customer Feedback',
          href: '/feedback',
          icon: MessageSquare,
          roles: ['manager', 'admin'],
        },
      ],
    },
  ];

  const roleMatches = (role) => {
    if (!role) return false;
    if (typeof hasRole === 'function') {
      return hasRole(role);
    }
    return normalizedRole === role.toLowerCase();
  };

  const canSeeNavItem = (item) => {
    const roleAllowed =
      !item.roles || item.roles.some((role) => roleMatches(role)) || isAdmin;
    const permissionAllowed =
      !item.permission || (typeof can === 'function' && can(item.permission));
    return roleAllowed && permissionAllowed;
  };

  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(canSeeNavItem),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Collapsed width */}
      <style>{COLLAPSED_WIDTH_CSS}</style>

      {/* Header with TechnoMart Logo — centered & larger in shrink mode */}
      <SidebarHeader>
        <div className="flex items-center justify-center p-4 pt-6 group-data-[collapsible=icon]:pt-4 group-data-[collapsible=icon]:p-1">
          <Link to="/" className="flex flex-col items-center">
            {/* Expanded */}
            <div className="flex items-center space-x-2 group-data-[collapsible=icon]:hidden">
              <img
                src={logo}
                alt="TechnoMart Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold">TechnoMart</span>
            </div>

            {/* Collapsed */}
            <img
              src={logo}
              alt="TechnoMart"
              className="hidden group-data-[collapsible=icon]:block object-contain
                   group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5
                   group-data-[collapsible=icon]:scale-115"
            />
          </Link>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent
        data-collapsed={isCollapsed ? 'true' : 'false'}
        className={cn('hide-scrollbar')}
      >
        <div
          className={cn('flex flex-col py-1 px-3', isCollapsed && 'px-2 pt-10')}
        >
          {visibleGroups.map((group, groupIndex) => (
            <SidebarGroup key={group.label} className="animate-fade-in">
              <SidebarGroupLabel
                className={cn(
                  'mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-group-label',
                  isCollapsed && 'sr-only'
                )}
              >
                {group.label}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu
                  className={cn(
                    'space-y-1',
                    isCollapsed && 'space-y-1.5',
                    'group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:px-0'
                  )}
                >
                  {group.items.map((item, itemIndex) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    const animationDelay = `${groupIndex * 100 + itemIndex * 50}ms`;

                    return (
                      <SidebarMenuItem
                        key={item.name}
                        className="animate-slide-in"
                        style={{ animationDelay }}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.name}
                          className={cn(
                            'group relative overflow-hidden rounded-lg transition-all duration-300',
                            'hover:bg-sidebar-item-hover hover:shadow-md',
                            // Center the whole cell in collapsed mode and give a touch more vertical padding
                            isCollapsed && 'px-0',
                            isActive && [
                              'bg-sidebar-item-active-bg',
                              'before:absolute before:left-0 before:top-0 before:h-full before:w-1',
                              'before:bg-sidebar-item-active before:transition-all before:duration-300',
                              'hover:bg-sidebar-item-active-bg',
                            ]
                          )}
                        >
                          <Link
                            to={item.href}
                            onClick={(event) => {
                              if (item.href === '/employees') {
                                event.preventDefault();
                                navigate(item.href, {
                                  state: {
                                    openAttendancePopup: true,
                                    attendanceNavTimestamp: Date.now(),
                                  },
                                });
                              }
                            }}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 w-full',
                              'group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center',
                              'group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-5 w-5 transition-all duration-300 shrink-0',
                                // Slightly larger icon in collapsed mode
                                'group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4',
                                isActive
                                  ? 'text-sidebar-item-active scale-110'
                                  : 'text-white group-hover:text-white group-hover:scale-110'
                              )}
                              aria-hidden="true"
                            />

                            {/* Hide label in collapsed mode (keep DOM for smooth expand) */}
                            <span
                              className={cn(
                                'text-sm font-medium transition-all duration-200',
                                isActive
                                  ? 'text-sidebar-item-active font-semibold'
                                  : 'text-white group-hover:text-white',
                                'group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:-left-[9999px]'
                              )}
                            >
                              {item.name}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>

              {!isCollapsed && groupIndex < visibleGroups.length - 1 && (
                <div className="my-3 h-px bg-sidebar-divider" />
              )}
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter>
        {/* Expanded footer with name/role */}
        <div className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="font-semibold text-sidebar-accent-foreground">
                {avatarInitial}
              </span>
            </div>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-sidebar-foreground/70 capitalize">
                {displayRole}
              </p>
            </div>
          </div>
        </div>

        {/* Collapsed footer: centered & perfectly round avatar */}
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center border-t border-sidebar-border py-4">
          <div
            className="flex items-center justify-center rounded-full bg-sidebar-accent
               w-7 h-7 aspect-square overflow-hidden shrink-0"
          >
            <span className="text-sm font-semibold text-sidebar-accent-foreground leading-none">
              {avatarInitial}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
};
