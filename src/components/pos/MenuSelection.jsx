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
import { Search, AlertCircle, Image as ImageIcon } from 'lucide-react';

const MenuSelection = ({
  categories,
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  onAddToOrder,
  occupyFullWidth = false,
}) => {
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

    return (
      categories
        .find((cat) => cat.id === activeCategory)
        ?.items.map((item) => ({ ...item, categoryName: '' })) || []
    );
  };

  const filteredItems = getFilteredItems();

  const ItemCard = ({ item, showCategoryBadge = false }) => {
    const imageSrc = item.image || item.imageUrl || null;
    const categoryLabel = item.categoryName || item.category || '';
    const isUnavailable = item.available === false;

    const handleActivate = (event) => {
      if (isUnavailable) return;
      if (event?.type === 'keydown') {
        event.preventDefault();
      }
      onAddToOrder(item);
    };

    return (
      <Card
        role="button"
        tabIndex={isUnavailable ? -1 : 0}
        onClick={handleActivate}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            handleActivate(event);
          }
        }}
        className={`group relative h-full overflow-hidden border border-border/50 shadow-sm transition-all duration-300 ${
          isUnavailable
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary/60'
        }`}
        aria-disabled={isUnavailable}
      >
        {imageSrc && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center blur-sm opacity-30 scale-110"
            style={{ backgroundImage: `url(${imageSrc})` }}
            aria-hidden="true"
          />
        )}
        <div
          className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-0"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 z-10"
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col">
          <CardHeader className="p-4 pb-0">
            <div className="relative rounded-lg border border-border/40 bg-background/60 backdrop-blur-sm shadow-inner">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={item.name}
                  className="h-28 w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-lg bg-muted/50 text-muted-foreground">
                  <ImageIcon className="h-7 w-7" aria-hidden="true" />
                  <span className="text-xs font-medium">
                    No Image Available
                  </span>
                </div>
              )}
              <div className="pointer-events-none absolute bottom-2 left-2">
                <Badge
                  variant={isUnavailable ? 'destructive' : 'outline'}
                  className={`backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wide ${
                    isUnavailable
                      ? ''
                      : 'bg-[#CDECC7] text-[#1E5B36] border-transparent'
                  }`}
                >
                  {isUnavailable ? 'Unavailable' : 'Available'}
                </Badge>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <CardTitle className="text-l font-semibold leading-tight text-foreground line-clamp-2">
                {item.name}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground line-clamp-3">
                {item.description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col p-4 pt-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Starting at
                </p>
                <p className="text-lg font-semibold text-primary">
                  ₱{Number(item.price).toFixed(2)}
                </p>
              </div>
              {showCategoryBadge && categoryLabel ? (
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-[10px] font-medium bg-[#E7F2EF] text-[#000000] border-transparent"
                >
                  {categoryLabel}
                </Badge>
              ) : null}
            </div>
          </CardContent>

          <CardFooter className="mt-auto p-4 pt-0">
            <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>
                  {isUnavailable
                    ? 'Currently unavailable'
                    : 'Tap to add to order'}
                </span>
                {!showCategoryBadge && categoryLabel ? (
                  <Badge
                    variant="outline"
                    className="rounded-full px-2 py-[2px] text-[10px] font-medium bg-[#FFF3BF] text-[#5C4300] border-transparent"
                  >
                    {categoryLabel}
                  </Badge>
                ) : null}
              </div>
            </div>
          </CardFooter>
        </div>
      </Card>
    );
  };

  const columnClass = occupyFullWidth ? 'md:col-span-3' : 'md:col-span-2';

  return (
    <div className={`col-span-1 ${columnClass}`}>
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Point of Sale</CardTitle>
              <CardDescription>
                Select menu items to add to order
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2 md:flex-row md:space-x-2 md:space-y-0">
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

        <CardContent className="flex flex-1 flex-col overflow-hidden">
          {categories.length === 0 ? (
            <div className="grid flex-1 place-items-center text-muted-foreground">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                <p>No menu items available. Add items in Menu Management.</p>
              </div>
            </div>
          ) : searchTerm.trim() ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Search results for "{searchTerm}"
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 md:gap-3 lg:gap-4">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <ItemCard
                        key={`${item.categoryName}-${item.id}`}
                        item={item}
                        showCategoryBadge
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center">
                      <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        No menu items found matching "{searchTerm}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Tabs
              defaultValue={categories[0]?.id || ''}
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="flex-1 flex-col"
            >
              <div className="border-b">
                <TabsList className="h-auto w-full justify-start overflow-auto p-0">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="px-4 py-2 transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
                  className="flex-1 overflow-y-auto p-0"
                >
                  <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 md:gap-3 lg:gap-4">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center">
                        <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
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
    </div>
  );
};

export default MenuSelection;
