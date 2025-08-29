// src/components/menu/ItemGrid.jsx
import React from 'react';
import ItemCard from './ItemCard';

const ItemGrid = ({ items, onEdit, onDelete, showCategory = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
