import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle } from 'lucide-react';

const MenuSelection = ({
  categories,
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  onAddToOrder,
}) => {
  // Search across all categories when there's a search term
  const getFilteredItems = () => {
    if (searchTerm.trim()) {
      const allItems = [];
      categories.forEach((category) => {
        category.items
          .filter(
            (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .forEach((item) => {
            allItems.push({ ...item, categoryName: category.name });
          });
      });
      return allItems;
    } else {
      // Return items from active category without category name when not searching
      return (
        categories
          .find((cat) => cat.id === activeCategory)
          ?.items.map((item) => ({ ...item, categoryName: '' })) || []
      );
    }
  };

  const filteredItems = getFilteredItems();

  // Small reusable card (with image)
  const ItemCard = ({ item, showCategoryBadge = false }) => (
    <div
      className="border rounded-md hover:bg-accent hover:cursor-pointer transition-colors overflow-hidden"
      onClick={() => onAddToOrder(item)}
    >
      {/* Image (item.image is an imported path from src/assets) */}
      {item.image ? (
        <div className="w-full aspect-[4/3] bg-muted">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-muted" />
      )}

      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium line-clamp-1">{item.name}</h4>
          {showCategoryBadge && (
            <Badge variant="outline" className="text-xs shrink-0 ml-2">
              {item.categoryName}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {item.description}
        </p>
        <p className="text-sm font-semibold">₱{item.price.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <div className="md:col-span-2">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Point of Sale</CardTitle>
              <CardDescription>
                Select menu items to add to order
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search menu items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {searchTerm.trim() ? (
            // Search results view
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Search results for "{searchTerm}"
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <ItemCard
                        key={`${item.categoryName}-${item.id}`}
                        item={item}
                        showCategoryBadge
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        No menu items found matching "{searchTerm}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Category tabs view
            <Tabs
              defaultValue={categories[0].id}
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="flex-1 flex flex-col"
            >
              <div className="border-b">
                <TabsList className="w-full justify-start overflow-auto p-0 h-auto">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {categories.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="flex-1 overflow-y-auto p-0 mt-0"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">
                          No items in this category
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>

        <CardFooter className="border-t pt-3">
          <div className="flex justify-between w-full text-xs text-muted-foreground">
            <span>Cashier: Admin User</span>
            <span>
              {new Date().toLocaleDateString()}{' '}
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MenuSelection;
