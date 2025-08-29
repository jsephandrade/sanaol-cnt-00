// src/components/menu/CategoryTabs.jsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ItemGrid from './ItemGrid';

const CategoryTabs = ({ items, categories, onEdit, onDelete }) => {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Items</TabsTrigger>
        {categories.map((category) => (
          <TabsTrigger key={category} value={category}>
            {category}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all" className="mt-6">
        <ItemGrid items={items} onEdit={onEdit} onDelete={onDelete} showCategory />
      </TabsContent>

      {categories.map((category) => (
        <TabsContent key={category} value={category} className="mt-6">
          <ItemGrid
            items={items.filter((i) => i.category === category)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CategoryTabs;
