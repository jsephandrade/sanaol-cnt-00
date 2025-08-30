import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const AddItemModal = ({ open, onOpenChange, onAddItem }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const categories = [
    'Grains',
    'Meat',
    'Vegetables',
    'Dairy',
    'Condiments',
    'Baking',
    'Fruits',
  ];

  const units = [
    'kg',
    'g',
    'lbs',
    'oz',
    'liters',
    'ml',
    'pieces',
    'boxes',
    'cans',
    'bottles',
    'bags',
    'cups',
  ];

  const onSubmit = (data) => {
    onAddItem(data);
    reset();
    onOpenChange(false);
    toast.success(`${data.name} has been added to inventory`);
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Enter the details for the new inventory item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Item name is required' })}
                placeholder="e.g., Rice"
              />
              {errors.name && (
                <span className="text-sm text-destructive">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                {...register('currentStock', {
                  required: 'Current stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' },
                })}
                placeholder="0"
              />
              {errors.currentStock && (
                <span className="text-sm text-destructive">
                  {errors.currentStock.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="minThreshold">Min Threshold</Label>
              <Input
                id="minThreshold"
                type="number"
                {...register('minThreshold', {
                  required: 'Minimum threshold is required',
                  min: { value: 0, message: 'Threshold cannot be negative' },
                })}
                placeholder="0"
              />
              {errors.minThreshold && (
                <span className="text-sm text-destructive">
                  {errors.minThreshold.message}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select onValueChange={(value) => setValue('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                {...register('supplier', { required: 'Supplier is required' })}
                placeholder="e.g., Global Foods"
              />
              {errors.supplier && (
                <span className="text-sm text-destructive">
                  {errors.supplier.message}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
