import React, { useState } from 'react';
import ImagePlaceholder from '@/assets/placeholder.svg';

export const usePOSData = () => {
  const [orderHistory] = useState([
    {
      id: 'h001',
      orderNumber: 'W-045',
      items: [
        { id: 'hi1', menuItemId: '1', name: 'Bam-i', price: 30, quantity: 2 },
        { id: 'hi2', menuItemId: '8', name: 'Coke', price: 20, quantity: 1 },
      ],
      total: 80,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      paymentMethod: 'Cash',
    },
    {
      id: 'h002',
      orderNumber: 'W-044',
      items: [
        {
          id: 'hi3',
          menuItemId: '11',
          name: 'Rice + Vegetable + Lumpia',
          price: 45,
          quantity: 1,
        },
      ],
      total: 45,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      paymentMethod: 'Card',
    },
    {
      id: 'h003',
      orderNumber: 'W-043',
      items: [
        {
          id: 'hi4',
          menuItemId: '5',
          name: 'Ginaling',
          price: 60,
          quantity: 1,
        },
        { id: 'hi5', menuItemId: '2', name: 'Bihon', price: 20, quantity: 2 },
      ],
      total: 100,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      paymentMethod: 'Mobile',
    },
  ]);

  const [categories] = useState([
    {
      id: '1',
      name: 'Noodles',
      items: [
        {
          id: '1',
          name: 'Bam-i',
          description: 'A festive noodle dish with canton & bihon.',
          price: 30,
          category: 'Noodles',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '2',
          name: 'Bihon',
          description: 'Stir-fried vermicelli rice noodles.',
          price: 20,
          category: 'Noodles',
          available: true,
          image: ImagePlaceholder,
        },
      ],
    },
    {
      id: '2',
      name: 'Sandwich',
      items: [
        {
          id: '3',
          name: 'Beef loaf',
          description: 'Savory Filipino-style sandwich with beef loaf slices.',
          price: 15,
          category: 'Sandwich',
          available: true,
          image: ImagePlaceholder,
        },
      ],
    },
    {
      id: '3',
      name: 'Main Dish',
      items: [
        {
          id: '4',
          name: 'Longganisa',
          description: 'Filipino sweet pork sausage.',
          price: 15,
          category: 'Main Dish',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '5',
          name: 'Ginaling',
          description: 'Ground meat sautéed with vegetables.',
          price: 60,
          category: 'Main Dish',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '6',
          name: 'Menudo',
          description: 'Pork and liver stew.',
          price: 60,
          category: 'Main Dish',
          available: true,
          image: ImagePlaceholder,
        },
      ],
    },
    {
      id: '4',
      name: 'Viand',
      items: [
        {
          id: '7',
          name: 'Monggos',
          description: 'Hearty mung bean stew.',
          price: 20,
          category: 'Viand',
          available: true,
          image: ImagePlaceholder,
        },
      ],
    },
    {
      id: '5',
      name: 'Drinks',
      items: [
        {
          id: '8',
          name: 'Coke',
          description: 'Refreshing Coca-Cola soft drink.',
          price: 20,
          category: 'Drinks',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '9',
          name: 'Royal',
          description: 'Sweet Filipino orange soda.',
          price: 20,
          category: 'Drinks',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '10',
          name: 'Sprite',
          description: 'Lemon-lime flavored soda.',
          price: 20,
          category: 'Drinks',
          available: true,
          image: ImagePlaceholder,
        },
      ],
    },
    {
      id: '6',
      name: 'Combo Meals',
      items: [
        {
          id: '11',
          name: 'Rice + Vegetable + Lumpia',
          description: 'Complete combo meal with rice, vegetables, and lumpia.',
          price: 45,
          category: 'Combo Meals',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '12',
          name: 'Rice + Humba Egg + Ham',
          description: 'Hearty combo with rice, hamburger, and egg.',
          price: 45,
          category: 'Combo Meals',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '13',
          name: 'Rice + Bihon/Bam-i + Siomai',
          description: 'Traditional combo with rice, noodles, and siomai.',
          price: 45,
          category: 'Combo Meals',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '14',
          name: 'Rice + Chorizo + Boiled Egg',
          description: 'Flavorful combo with rice, chorizo, and boiled egg.',
          price: 45,
          category: 'Combo Meals',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '15',
          name: 'Rice + Hotdog + Ngohiong',
          description: 'Classic combo with rice, hotdog, and nugahong.',
          price: 45,
          category: 'Combo Meals',
          available: true,
          image: ImagePlaceholder,
        },
        {
          id: '16',
          name: 'Rice + Fried Egg + Chorizo',
          description:
            'Simple yet satisfying combo with rice, fried egg, and chorizo.',
          price: 45,
          category: 'Combo Meals',
          available: true,
          image: ImagePlaceholder,
        },
      ],
    },
  ]);

  const [orderQueue, setOrderQueue] = useState([
    {
      id: '1001',
      orderNumber: 'W-001',
      type: 'walk-in',
      items: [
        { id: 'oi1', menuItemId: '1', name: 'Bam-i', price: 30, quantity: 2 },
        {
          id: 'oi2',
          menuItemId: '4',
          name: 'Longganisa',
          price: 15,
          quantity: 1,
        },
      ],
      status: 'pending',
      timeReceived: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: '1002',
      orderNumber: 'O-101',
      type: 'online',
      items: [
        {
          id: 'oi3',
          menuItemId: '5',
          name: 'Ginaling',
          price: 60,
          quantity: 1,
        },
        { id: 'oi4', menuItemId: '8', name: 'Coke', price: 20, quantity: 2 },
      ],
      status: 'preparing',
      timeReceived: new Date(Date.now() - 12 * 60 * 1000),
      customerName: 'Juan Dela Cruz',
    },
    {
      id: '1003',
      orderNumber: 'W-002',
      type: 'walk-in',
      items: [
        { id: 'oi5', menuItemId: '6', name: 'Menudo', price: 60, quantity: 1 },
      ],
      status: 'ready',
      timeReceived: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: '1004',
      orderNumber: 'O-102',
      type: 'online',
      items: [
        { id: 'oi6', menuItemId: '2', name: 'Bihon', price: 20, quantity: 3 },
        { id: 'oi7', menuItemId: '9', name: 'Royal', price: 20, quantity: 3 },
      ],
      status: 'pending',
      timeReceived: new Date(Date.now() - 3 * 60 * 1000),
      customerName: 'Maria Santos',
    },
  ]);

  return {
    orderHistory,
    categories,
    orderQueue,
    setOrderQueue,
  };
};