// src/pages/MenuManagement.jsx
import React from 'react';
import useMenuManager from '@/hooks/useMenuManager';
import AddItemDialog from '@/components/menu/AddItemDialog';
import EditItemDialog from '@/components/menu/EditItemDialog';
import CategoryTabs from '@/components/menu/CategoryTabs';

const MenuManagement = () => {
  const {
    items,
    categories,
    newItem,
    setNewItem,
    dialogOpen,
    setDialogOpen,
    editingItem,
    setEditingItem,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
  } = useMenuManager();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Menu Management</h2>

        <AddItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          newItem={newItem}
          setNewItem={setNewItem}
          onAdd={handleAddItem}
        />
      </div>

      <CategoryTabs
        items={items}
        categories={categories}
        onEdit={setEditingItem}
        onDelete={handleDeleteItem}
      />

      <EditItemDialog
        item={editingItem}
        setItem={setEditingItem}
        onSave={handleEditItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
};

export default MenuManagement;
