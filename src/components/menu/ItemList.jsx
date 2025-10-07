// src/components/menu/ItemList.jsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';

const ItemList = ({ items, onEdit, onDelete = false }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No items to display
      </div>
    );
  }

  return (
    <div className="divide-y rounded-md border overflow-hidden bg-card">
      {items.map((item) => {
        const imageSrc = item.image || item.imageUrl || null;
        return (
          <div key={item.id} className="flex items-center gap-3 p-3">
            <div className="shrink-0">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={item.name}
                  className="w-14 h-14 rounded-sm object-cover border"
                />
              ) : (
                <div className="w-14 h-14 rounded-sm border bg-muted text-muted-foreground flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{item.name}</p>
                <Badge
                  variant={item.available ? 'outline' : 'destructive'}
                  className={`text-[10px] px-1.5 py-0.5 ${
                    item.available
                      ? 'bg-[#CDECC7] text-[#1E5B36] border-transparent'
                      : ''
                  }`}
                >
                  {item.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold whitespace-nowrap">
                ₱{Number(item.price).toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(item)}
                  aria-label={`Edit ${item.name}`}
                  title={`Edit ${item.name}`}
                >
                  <Edit className="h-4 w-4" />
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItemList;
