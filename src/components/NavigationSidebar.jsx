import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
export const NavigationSidebar = () => {
  const location = useLocation();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Menu Management',
      href: '/menu',
      icon: Menu,
    },
    {
      name: 'Point of Sale',
      href: '/pos',
      icon: ShoppingCart,
    },
    {
      name: 'Catering',
      href: '/catering',
      icon: Utensils,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Package,
    },
    {
      name: 'Sales Analytics',
      href: '/sales',
      icon: TrendingUp,
    },
    {
      name: 'Employee Management',
      href: '/employees',
      icon: CalendarClock,
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: CreditCard,
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      adminOnly: true,
    },
    {
      name: 'Activity Logs',
      href: '/logs',
      icon: FileText,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
    },
    {
      name: 'Customer Feedback',
      href: '/feedback',
      icon: MessageSquare,
    },
  ];
  // Hide admin-only items for non-admin users
  const visibleItems = navigationItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="px-2 py-2">
      <SidebarMenu>
        {visibleItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === item.href}
              tooltip={item.name}
            >
              <Link to={item.href} className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
};
