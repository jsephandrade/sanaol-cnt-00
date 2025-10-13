import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { TrendingUp, Award } from 'lucide-react';

const PopularItems = ({ items }) => {
  return (
    <Card className="border-0 bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Popular Items
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Most ordered items today
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {/* Rank badge */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-transform group-hover:scale-110 ${
                    index === 0
                      ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                      : index === 1
                      ? 'bg-gray-400/20 text-gray-600 dark:text-gray-400'
                      : index === 2
                      ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index === 0 ? (
                    <Award className="h-4 w-4" />
                  ) : (
                    `${index + 1}`
                  )}
                </div>

                {/* Item name */}
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} {item.count === 1 ? 'order' : 'orders'}
                  </p>
                </div>
              </div>

              {/* Order count badge */}
              <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {item.count}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No popular items yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PopularItems;
