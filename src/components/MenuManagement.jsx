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
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Menu Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your restaurant menu items and categories</p>
        </div>

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
