import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { feedbackData } from '@/utils/mockData';
import { toast } from 'sonner';
import { FeedbackMetrics } from './feedback/FeedbackMetrics';
import { FeedbackList } from './feedback/FeedbackList';
import { FeedbackForm } from './feedback/FeedbackForm';
import { FeedbackReplyModal } from './feedback/FeedbackReplyModal';
const CustomerFeedback = () => {
  const [feedback, setFeedback] = useState(feedbackData);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const handleResolve = (id) => {
    const updatedFeedback = feedback.map((item) =>
      item.id === id ? { ...item, resolved: !item.resolved } : item
    );
    setFeedback(updatedFeedback);
    toast.success(
      `Feedback marked as ${updatedFeedback.find((f) => f.id === id)?.resolved ? 'resolved' : 'unresolved'}`
    );
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
    feedback.length > 0
      ? (
          feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
        ).toFixed(1)
      : '0.0';
  // ... keep existing code (handleResolve, handleSendResponse, averageRating)
  const filteredFeedback =
    activeTab === 'all'
      ? feedback
      : activeTab === 'resolved'
        ? feedback.filter((item) => item.resolved)
        : feedback.filter((item) => !item.resolved);
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-semibold">Customer Feedback</h2>

      <FeedbackMetrics feedback={feedback} />

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
          <FeedbackList
            feedback={filteredFeedback}
            onReply={setSelectedFeedback}
            onResolve={handleResolve}
          />
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
