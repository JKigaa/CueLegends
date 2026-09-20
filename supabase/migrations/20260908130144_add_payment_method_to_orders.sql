-- Add nullable payment_method column to orders table
-- Stores the customer's selected payment method: 'mpesa', 'card', or 'cod' (Pay on Delivery)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text;