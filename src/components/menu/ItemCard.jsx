// src/components/menu/ItemCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';

const ItemCard = ({ item, onEdit, onDelete }) => {
  const imageSrc = item.image || item.imageUrl || null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 pb-0 space-y-1">
        {/* Image or Placeholder */}
        <div className="mb-2">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.name}
              className="w-full h-24 sm:h-28 md:h-32 lg:h-36 object-cover rounded-sm border"
            />
          ) : (
            <div className="w-full h-24 sm:h-28 md:h-32 lg:h-36 flex items-center justify-center rounded-sm border bg-muted text-muted-foreground">
              <ImageIcon className="w-6 h-6" />
              <span className="ml-2 text-xs">No Image</span>
            </div>
          )}
        </div>
        <CardTitle className="text-sm font-semibold leading-tight truncate">
          {item.name}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {item.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-base">
            ₱{Number(item.price).toFixed(2)}
          </span>
          <Badge
            variant={item.available ? 'outline' : 'destructive'}
            className="text-[10px] px-1.5 py-0.5"
          >
            {item.available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Category: {item.category}
        </p>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => onEdit(item)}
        >
          <Edit className="h-3 w-3 mr-1" /> Edit
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDelete(item.id)}
          aria-label={`Delete ${item.name}`}
          title={`Delete ${item.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
