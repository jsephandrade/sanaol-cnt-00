import React from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export const FeedbackMetrics = ({ feedback }) => {
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

  return (
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
                <span className="font-medium mr-2">{sentimentCounts.positive}</span>
                <span className="text-muted-foreground text-sm">
                  ({Math.round((sentimentCounts.positive / feedback.length) * 100)}%)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                <span>Neutral</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">{sentimentCounts.neutral}</span>
                <span className="text-muted-foreground text-sm">
                  ({Math.round((sentimentCounts.neutral / feedback.length) * 100)}%)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                <span>Negative</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">{sentimentCounts.negative}</span>
                <span className="text-muted-foreground text-sm">
                  ({Math.round((sentimentCounts.negative / feedback.length) * 100)}%)
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
  );
};