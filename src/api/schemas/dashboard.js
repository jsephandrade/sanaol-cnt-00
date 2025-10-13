import { z } from 'zod';

export const DashboardStatsSchema = z
  .object({
    dailySales: z.number(),
    monthlySales: z.number(),
    customerCount: z.number().int(),
    orderCount: z.number().int(),
    salesByTime: z.array(
      z.object({
        t: z.string(),
        y: z.number(),
        count: z.number().int().optional(),
        label: z.string().nullable().optional(),
      })
    ),
    salesByCategory: z.array(
      z.object({
        label: z.string(),
        value: z.number(),
        category: z.string().optional(),
      })
    ),
    popularItems: z.array(
      z.object({
        name: z.string(),
        count: z.number().int(),
        value: z.number().int().optional(),
      })
    ),
    recentSales: z.array(
      z.object({
        id: z.string(),
        total: z.number(),
        date: z.any(),
        paymentMethod: z.string(),
        customer: z.string().optional(),
      })
    ),
  })
  .passthrough();
