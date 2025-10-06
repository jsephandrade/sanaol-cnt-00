import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';

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
  const { user, logout } = useAuth();

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
            {/* Header */}
            <header className="flex justify-between items-center bg-white border-b px-4 py-2 h-16 shadow-sm">
              <div className="flex items-center gap-2">
                {/* ⬇️ Shrink / Expand Sidebar button */}
                <SidebarTrigger />
              </div>

              <div className="flex items-center gap-3">
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

                {/* Logout with confirmation */}
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
                        You’ll be signed out of your account and may need to log
                        in again to continue.
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

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6 hide-scrollbar">
              <PageTransition>{children}</PageTransition>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
};

export default MainLayout;
