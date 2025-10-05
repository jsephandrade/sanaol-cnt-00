import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Menu,
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
import { useAuth } from '@/components/AuthContext';

const HIDE_SCROLLBAR_STYLES = `
  .navigation-sidebar-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .navigation-sidebar-scroll::-webkit-scrollbar {
    display: none;
  }
`;

export const NavigationSidebar = () => {
  const location = useLocation();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const isStaff = hasRole('staff');

  const navigationGroups = [
    {
      key: 'account-management',
      label: 'Account Management',
      items: [
        {
          key: 'dashboard',
          name: 'Dashboard',
          href: '/',
          icon: LayoutDashboard,
        },
        {
          key: 'users',
          name: 'User Management',
          href: '/users',
          icon: Users,
          adminOnly: true,
        },
      ],
    },
    {
      key: 'inventory-management',
      label: 'Inventory Management',
      items: [
        {
          key: 'menu',
          name: 'Menu Management',
          href: '/menu',
          icon: Menu,
        },
        {
          key: 'inventory',
          name: 'Inventory',
          href: '/inventory',
          icon: Package,
        },
      ],
    },
    {
      key: 'order-handling',
      label: 'Order Handling',
      items: [
        {
          key: 'pos',
          name: 'Point of Sale',
          href: '/pos',
          icon: ShoppingCart,
        },
        {
          key: 'catering',
          name: 'Catering',
          href: '/catering',
          icon: Utensils,
        },
      ],
    },
    {
      key: 'payments-transactions',
      label: 'Payment and Transactions',
      items: [
        {
          key: 'payments',
          name: 'Payments',
          href: '/payments',
          icon: CreditCard,
        },
      ],
    },
    {
      key: 'staff-scheduling',
      label: 'Staff and Work Scheduling',
      items: [
        {
          key: 'employees',
          name: 'Employee Management',
          href: '/employees',
          icon: CalendarClock,
        },
      ],
    },
    {
      key: 'reports-analytics',
      label: 'Reports and Analytics',
      items: [
        {
          key: 'analytics',
          name: 'Analytics',
          href: '/analytics',
          icon: TrendingUp,
        },
        {
          key: 'logs',
          name: 'Activity Logs',
          href: '/logs',
          icon: FileText,
        },
        {
          key: 'feedback',
          name: 'Customer Feedback',
          href: '/feedback',
          icon: MessageSquare,
        },
      ],
    },
    {
      key: 'notifications',
      label: 'Notifications',
      items: [
        {
          key: 'notifications',
          name: 'Notifications',
          href: '/notifications',
          icon: Bell,
        },
      ],
    },
  ];

  const restrictedForStaff = new Set([
    'menu',
    'catering',
    'inventory',
    'analytics',
    'payments',
    'logs',
    'feedback',
  ]);

  const computeVisibleItems = (items = []) =>
    items
      .map((item) =>
        item.key === 'employees' && isStaff
          ? { ...item, name: 'Employee Attendance' }
          : item
      )
      .filter(
        (item) =>
          (!item.adminOnly || isAdmin) &&
          !(isStaff && restrictedForStaff.has(item.key))
      );

  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: computeVisibleItems(group.items),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <style>{HIDE_SCROLLBAR_STYLES}</style>
      <div className="navigation-sidebar-scroll px-2 py-2 space-y-2 overflow-y-auto">
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.key}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isAttendanceShortcut =
                    isStaff && item.key === 'employees';

                  const isActive = location.pathname === item.href;
                  const attendanceLink = {
                    pathname: item.href,
                    search: '?attendance=1',
                    state: { openAttendance: true },
                  };

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.name}
                      >
                        <Link
                          to={isAttendanceShortcut ? attendanceLink : item.href}
                          className="flex items-center space-x-3"
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </div>
    </>
  );
};

export default NavigationSidebar;
