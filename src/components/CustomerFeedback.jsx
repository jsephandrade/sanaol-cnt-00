import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { feedbackData } from '@/utils/mockData';
import { Check, MessageCircle, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Textarea as TextareaUi } from '@/components/ui/textarea';
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
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ));
  };
  const sentimentCounts = feedback.reduce(
    (acc, item) => {
      if (item.rating >= 4) {
        acc.positive += 1;
      } else if (item.rating === 3) {
        acc.neutral += 1;
      } else {
        acc.negative += 1;
      }
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );
  const filteredFeedback =
    activeTab === 'all'
      ? feedback
      : activeTab === 'resolved'
        ? feedback.filter((item) => item.resolved)
        : feedback.filter((item) => !item.resolved);
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-semibold">Customer Feedback</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overall Rating</CardTitle>
            <CardDescription>Average customer satisfaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold mr-2">{averageRating}</span>
              <div className="flex">
                {renderStars(Math.round(parseFloat(averageRating)))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {feedback.length} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>Feedback sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                  <span>Positive</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {sentimentCounts.positive}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    (
                    {Math.round(
                      (sentimentCounts.positive / feedback.length) * 100
                    )}
                    %)
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <span>Neutral</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {sentimentCounts.neutral}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    (
                    {Math.round(
                      (sentimentCounts.neutral / feedback.length) * 100
                    )}
                    %)
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                  <span>Negative</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {sentimentCounts.negative}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    (
                    {Math.round(
                      (sentimentCounts.negative / feedback.length) * 100
                    )}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resolution Status</CardTitle>
            <CardDescription>Feedback resolution tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Resolved</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {feedback.filter((f) => f.resolved).length}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    (
                    {Math.round(
                      (feedback.filter((f) => f.resolved).length /
                        feedback.length) *
                        100
                    )}
                    %)
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>Pending</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {feedback.filter((f) => !f.resolved).length}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    (
                    {Math.round(
                      (feedback.filter((f) => !f.resolved).length /
                        feedback.length) *
                        100
                    )}
                    %)
                  </span>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${Math.round((feedback.filter((f) => f.resolved).length / feedback.length) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No feedback found
              </p>
            ) : (
              filteredFeedback.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center mb-1">
                        <h4 className="font-medium text-base">
                          {item.customerName}
                        </h4>
                        {item.resolved && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-green-50 text-green-700 border-green-200"
                          >
                            <Check className="h-3 w-3 mr-1" /> Resolved
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="flex mr-2">
                          {renderStars(item.rating)}
                        </div>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFeedback(item)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" /> Reply
                      </Button>
                      <Button
                        variant={item.resolved ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleResolve(item.id)}
                      >
                        {item.resolved ? 'Unresolve' : 'Resolve'}
                      </Button>
                    </div>
                  </div>

                  <p className="mt-2 text-sm">{item.comment}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collect New Feedback</CardTitle>
          <CardDescription>
            Add a form to collect customer feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input id="name" placeholder="Enter customer name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" placeholder="Enter email address" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="focus:outline-none">
                  <Star className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              placeholder="Please share your experience with us"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Submit Feedback</Button>
        </CardFooter>
      </Card>

      {/* Reply Dialog */}
      {selectedFeedback && (
        <Dialog
          open={!!selectedFeedback}
          onOpenChange={(open) => !open && setSelectedFeedback(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Reply to {selectedFeedback.customerName}
              </DialogTitle>
              <DialogDescription>
                Respond to customer feedback
              </DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg p-4 bg-muted/50 mb-4">
              <div className="flex items-center mb-2">
                <span className="font-medium">
                  {selectedFeedback.customerName}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  {new Date(selectedFeedback.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex mb-2">
                {renderStars(selectedFeedback.rating)}
              </div>
              <p className="text-sm">{selectedFeedback.comment}</p>
            </div>
            <div>
              <Label htmlFor="response">Your Response</Label>
              <TextareaUi
                id="response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response..."
                className="mt-2"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedFeedback(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleSendResponse}>Send Response</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
export default CustomerFeedback;
