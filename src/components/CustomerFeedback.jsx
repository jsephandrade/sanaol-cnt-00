import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFeedback } from '@/hooks/useFeedback';
import ErrorState from '@/components/shared/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { FeedbackMetrics } from './feedback/FeedbackMetrics';
import { FeedbackList } from './feedback/FeedbackList';
import { FeedbackForm } from './feedback/FeedbackForm';
import { FeedbackReplyModal } from './feedback/FeedbackReplyModal';
const CustomerFeedback = () => {
  const { feedback, loading, error, markResolved, refetch } = useFeedback();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const handleResolve = async (id) => {
    try {
      const updated = await markResolved(id);
      toast.success(`Feedback marked as ${updated.resolved ? 'resolved' : 'unresolved'}`);
    } catch {}
  };
  const handleSendResponse = () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }
    toast.success('Response sent successfully');
    setResponseText('');
    setSelectedFeedback(null);
  };
  const averageRating =
    feedback && feedback.length > 0
      ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1)
      : '0.0';
  // ... keep existing code (handleResolve, handleSendResponse, averageRating)
  const filteredFeedback =
    activeTab === 'all'
      ? feedback
      : activeTab === 'resolved'
        ? feedback.filter((item) => item.resolved)
        : feedback.filter((item) => !item.resolved);
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-60" />
        <Card>
          <CardHeader>
            <CardTitle>Customer Comments</CardTitle>
            <CardDescription>Review and manage customer feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-semibold">Customer Feedback</h2>

      <FeedbackMetrics feedback={feedback || []} />

      <Card>
        <CardHeader>
          <CardTitle>Customer Comments</CardTitle>
          <CardDescription>Review and manage customer feedback</CardDescription>
          <Tabs
            defaultValue="all"
            className="mt-4"
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredFeedback.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No feedback to display</div>
          ) : (
            <FeedbackList
              feedback={filteredFeedback}
              onReply={setSelectedFeedback}
              onResolve={handleResolve}
            />
          )}
        </CardContent>
      </Card>

      <FeedbackForm />

      <FeedbackReplyModal
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        feedback={selectedFeedback}
        responseText={responseText}
        onResponseChange={setResponseText}
        onSendResponse={handleSendResponse}
      />
    </div>
  );
};
export default CustomerFeedback;
