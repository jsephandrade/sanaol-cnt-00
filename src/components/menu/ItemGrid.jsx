// src/components/menu/ItemGrid.jsx
import React from 'react';
import ItemCard from './ItemCard';

const ItemGrid = ({ items, onEdit, onDelete, showCategory = false }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 md:gap-3 lg:gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={showCategory ? item : { ...item }}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ItemGrid;
