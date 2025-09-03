// Calculate stock level percentage
export const getStockPercentage = (current, threshold) => {
  return Math.min(100, Math.round((current / (threshold * 2)) * 100));
};

// Determine badge color based on stock level
export const getStockBadgeVariant = (current, threshold) => {
  if (current <= threshold * 0.5) return 'destructive';
  if (current <= threshold) return 'warning';
  return 'success';
};

// Get text for stock status
export const getStockStatusText = (current, threshold) => {
  if (current <= threshold * 0.5) return 'Critical';
  if (current <= threshold) return 'Low';
  if (current >= threshold * 2) return 'Overstocked';
  return 'Good';
};

// Filter inventory items
export const filterInventoryItems = (items, searchTerm, selectedCategory) => {
  return items.filter((item) => {
    // Filter by search term
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by category
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
};

// Get low stock items
export const getLowStockItems = (items) => {
  return items.filter((item) => item.currentStock < item.minThreshold);
};