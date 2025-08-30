// MainLayout.jsx
import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, MoreVertical } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const MainLayout = ({ children, title }) => {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  const displayName = user?.name || 'Admin';
  const displayEmail = user?.email || 'admin@canteen.com';
  const avatarInitial = (displayName?.[0] || 'A').toUpperCase();

  return (
    <SidebarProvider defaultOpen={!isMobile} collapsedWidth={56}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar */}
        <Sidebar variant="sidebar" className="w-64 lg:w-80">
          <SidebarHeader>
            <div className="flex items-center justify-center p-4 md:p-6">
              <div className="flex items-center space-x-2">
                <img
                  src="/favicon.ico"
                  alt="TechnoMart Logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-lg md:text-xl font-bold">TechnoMart</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <NavigationSidebar />
          </SidebarContent>

          <SidebarFooter>
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <span className="font-semibold text-sidebar-accent-foreground">
                    {avatarInitial}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold text-sm">{displayName}</p>
                  <p className="text-xs text-sidebar-foreground/70">{displayEmail}</p>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <SidebarInset className="flex flex-col flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 sm:px-6 py-3 sm:py-2 min-h-[3.5rem] shadow-sm">
            <div className="flex items-center w-full sm:w-auto">
              <SidebarTrigger className="mr-2" />
              <h1 className="text-lg sm:text-xl font-semibold truncate">
                {title || 'Canteen Management System'}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
              <Button variant="outline" size="sm" asChild className="sm:flex hidden">
                <Link to="/notifications">
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="sm:flex hidden">
                <Link to="/help">Help</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="sm:flex hidden">
                <Link to="/settings">Settings</Link>
              </Button>

              {/* Mobile menu for additional options */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/notifications" className="flex items-center">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/help">Help</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">Settings</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Logout with confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" title="Logout">
                    <LogOut className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to logout?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll be signed out of your account and may need to log in again to continue.
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
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;