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
    <Card className="group relative h-full overflow-hidden border border-border/50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      {/* 🖼️ Blurry background image */}
      {imageSrc && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center blur-sm opacity-30 scale-110"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      )}

      {/* Subtle dark overlay for contrast */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-0" />

      {/* Decorative top gradient line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 z-10" />

      <div className="relative z-10">
        <CardHeader className="p-4 pb-0 space-y-3">
          <div className="relative rounded-lg border border-border/40 bg-background/60 backdrop-blur-sm shadow-inner">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={item.name}
                className="h-28 w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-lg bg-muted/50 text-muted-foreground">
                <ImageIcon className="h-7 w-7" />
                <span className="text-xs font-medium">No Image Available</span>
              </div>
            )}
            <div className="pointer-events-none absolute bottom-2 left-2">
              <Badge
                variant={item.available ? 'outline' : 'destructive'}
                className={`backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wide ${
                  item.available
                    ? 'bg-[#CDECC7] text-[#1E5B36] border-transparent'
                    : ''
                }`}
              >
                {item.available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-l font-semibold leading-tight text-foreground line-clamp-2">
              {item.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-3">
              {item.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Starting at
              </p>
              <p className="text-lg font-semibold text-primary">
                ₱{Number(item.price).toFixed(2)}
              </p>
            </div>
            {item.category && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-[11px] font-medium bg-[#FFF3BF] text-[#5C4300] border-transparent"
              >
                {item.category}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-end gap-2 border-t border-border/40 bg-background/60 backdrop-blur-sm">
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
      </div>
    </Card>
  );
};

export default ItemCard;
