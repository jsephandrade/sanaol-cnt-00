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
  const imageSrc = item.imageUrl || null;

  return (
    <Card>
      <CardHeader>
        {/* Image or Placeholder */}
        <div className="mb-4">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.name}
              className="w-full h-40 object-cover rounded-md border"
            />
          ) : (
            <div className="w-full h-40 flex items-center justify-center rounded-md border bg-muted text-muted-foreground">
              <ImageIcon className="w-10 h-10" />
              <span className="ml-2">No Image</span>
            </div>
          )}
        </div>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-lg">
            ₱{Number(item.price).toFixed(2)}
          </span>
          <Badge variant={item.available ? 'outline' : 'destructive'}>
            {item.available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Category: {item.category}</p>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
