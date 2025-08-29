import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle } from 'lucide-react';

const CateringMenuSelection = ({
  categories,
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  onAddToOrder,
  eventName,
  attendees,
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
    }
    return [];
  };

  const searchResults = getFilteredItems();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Menu Selection</CardTitle>
            <CardDescription>
              {eventName} - {attendees} attendees
            </CardDescription>
          </div>
          <Badge variant="outline">Catering</Badge>
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
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-md p-3 hover:bg-accent hover:cursor-pointer transition-colors"
                      onClick={() => onAddToOrder(item)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{item.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold">
                          ₱{item.price.toFixed(2)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {item.categoryName}
                        </Badge>
                      </div>
                    </div>
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
            defaultValue={categories[0]?.id}
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
                  {category.items.length > 0 ? (
                    category.items.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-md p-3 hover:bg-accent hover:cursor-pointer transition-colors"
                        onClick={() => onAddToOrder(item)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{item.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {item.description}
                        </p>
                        <p className="text-sm font-semibold">
                          ₱{item.price.toFixed(2)}
                        </p>
                      </div>
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
    </Card>
  );
};

export default CateringMenuSelection;
