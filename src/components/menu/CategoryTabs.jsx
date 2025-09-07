// src/components/menu/CategoryTabs.jsx
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List } from 'lucide-react';
import ItemGrid from './ItemGrid';
import ItemList from './ItemList';

const CategoryTabs = ({ items, categories, onEdit, onDelete }) => {
  const [view, setView] = useState('grid');

  const renderItems = (list) =>
    view === 'grid' ? (
      <ItemGrid items={list} onEdit={onEdit} onDelete={onDelete} />
    ) : (
      <ItemList items={list} onEdit={onEdit} onDelete={onDelete} />
    );

  return (
    <Tabs defaultValue="all" className="w-full">
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v)}
          variant="outline"
          size="sm"
          aria-label="View mode"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <TabsContent value="all" className="mt-6">
        {view === 'grid' ? (
          <ItemGrid
            items={items}
            onEdit={onEdit}
            onDelete={onDelete}
            showCategory
          />
        ) : (
          <ItemList
            items={items}
            onEdit={onEdit}
            onDelete={onDelete}
            showCategory
          />
        )}
      </TabsContent>

      {categories.map((category) => (
        <TabsContent key={category} value={category} className="mt-6">
          {renderItems(items.filter((i) => i.category === category))}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CategoryTabs;
