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
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';

// ⬇️ Add these imports
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
  console.log('MainLayout rendering, isMobile:', isMobile);
  const { user, logout } = useAuth();

  const displayName = user?.name || 'Admin';
  const displayEmail = user?.email || 'admin@canteen.com';
  const avatarInitial = (displayName?.[0] || 'A').toUpperCase();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full bg-background">
        {/* Sidebar */}
        <Sidebar variant="sidebar">
          <SidebarHeader>
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center space-x-2">
                <img
                  src="/favicon.ico"
                  alt="TechnoMart Logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold">TechnoMart</span>
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
                <div>
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-sm text-sidebar-foreground/70">{displayEmail}</p>
                </div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <SidebarInset className="flex flex-col">
          {/* Header */}
          <header className="flex justify-between items-center bg-white border-b px-4 py-2 h-16 shadow-sm">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2" />
              <h1 className="text-xl font-semibold">
                {title || 'Canteen Management System'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/notifications">
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/help">Help</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/settings">Settings</Link>
              </Button>

              {/* ⬇️ Logout with confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" title="Logout">
                    <LogOut className="mr-1" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to logout?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You’ll be signed out of your account and may need to log in again to continue.
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
          <main className="flex-1 overflow-y-auto p-6">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
