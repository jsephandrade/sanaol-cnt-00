import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const PopularItems = ({ items }) => {
  return (
    <Card>
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Popular Items</CardTitle>
        <CardDescription className="text-xs">
          Most ordered items in the past week
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-sm">{index + 1}.</span>
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-muted-foreground text-sm">
                {item.count} orders
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularItems;