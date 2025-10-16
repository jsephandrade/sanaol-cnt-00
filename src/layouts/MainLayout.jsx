import React, { useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  LogOut,
  Settings,
  HelpCircle,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ⬇️ Logout dialog imports
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

const LAYOUT_SCROLLBAR_STYLES = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

const MainLayout = ({ children }) => {
  const isMobile = useIsMobile();
  const { logout, user } = useAuth();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Real-time notification count from API
  const { unreadCount } = useNotifications();

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    const email = user.email;
    return email.charAt(0).toUpperCase();
  };

  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'Dashboard',
      '/pos': 'Point of Sale',
      '/menu': 'Menu Management',
      '/orders': 'Orders',
      '/inventory': 'Inventory',
      '/catering': 'Catering',
      '/employees': 'Employees',
      '/schedule': 'Schedule',
      '/analytics': 'Analytics',
      '/customers': 'Customers',
      '/notifications': 'Notifications',
      '/settings': 'Settings',
      '/help': 'Help & Support',
    };
    return titles[path] || 'Dashboard';
  };

  return (
    <>
      <style>{LAYOUT_SCROLLBAR_STYLES}</style>
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex h-screen w-full bg-background">
          {/* Sidebar */}
          <Sidebar variant="sidebar" collapsible="icon">
            <NavigationSidebar />
          </Sidebar>

          {/* Main content */}
          <SidebarInset className="flex flex-col">
            {/* Modern Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 h-16">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <SidebarTrigger className="h-9 w-9" />
                <Separator orientation="vertical" className="h-6" />
                <h1 className="text-lg font-semibold tracking-tight">
                  {getPageTitle()}
                </h1>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2">
                {/* Quick Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    asChild
                  >
                    <Link to="/help">
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Help</span>
                    </Link>
                  </Button>

                  {/* Notifications with Badge */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative"
                    asChild
                  >
                    <Link to="/notifications">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-in zoom-in-50 duration-200"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                      <span className="sr-only">
                        Notifications{' '}
                        {unreadCount > 0 ? `(${unreadCount} unread)` : ''}
                      </span>
                    </Link>
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6 mx-2" />

                {/* User Menu Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-9 gap-2 px-2 hover:bg-accent"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user?.avatarUrl} alt={user?.email} />
                        <AvatarFallback className="text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block text-sm font-medium">
                        {user?.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/help" className="cursor-pointer">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help & Support</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => setShowLogoutDialog(true)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6 hide-scrollbar bg-muted/30">
              <PageTransition>{children}</PageTransition>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You'll be signed out of your account and may need to log in again
              to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MainLayout;
