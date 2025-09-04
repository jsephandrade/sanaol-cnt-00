import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, Settings, ShieldAlert, UserCog } from 'lucide-react';

const LogSummaryCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Summary</CardTitle>
        <CardDescription>Activity overview</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 flex flex-col items-center">
                  <LogIn className="h-8 w-8 text-blue-500 mb-1" />
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">Logins</div>
                </div>
                <div className="rounded-lg border p-3 flex flex-col items-center">
                  <UserCog className="h-8 w-8 text-green-500 mb-1" />
                  <div className="text-2xl font-bold">28</div>
                  <div className="text-xs text-muted-foreground">Actions</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 flex flex-col items-center">
                  <ShieldAlert className="h-8 w-8 text-red-500 mb-1" />
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-xs text-muted-foreground">Security</div>
                </div>
                <div className="rounded-lg border p-3 flex flex-col items-center">
                  <Settings className="h-8 w-8 text-gray-500 mb-1" />
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-xs text-muted-foreground">System</div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="week" className="pt-4">
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Weekly log statistics</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="month" className="pt-4">
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Monthly log statistics</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LogSummaryCard;

