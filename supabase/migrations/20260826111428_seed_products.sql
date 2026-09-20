/*
# Seed Products and Product Sizes

Inserts 12 realistic shoe products across categories (Sneakers, Formal,
Running, Heels, Boots, Sandals, Kids) with Kenyan-shilling prices and
per-size stock. Uses Pexels image URLs (guaranteed to load).

## Products added
1.  Urban Stride Sneakers — Sneakers
2.  Classic White Sneakers — Sneakers
3.  Nike Air Style — Sneakers
4.  Black Leather Oxfords — Formal
5.  Executive Leather Shoes — Formal
6.  Brown Brogue Leather Shoes — Formal
7.  Pro Runner Athletic Shoes — Running
8.  Track Star Running Shoes — Running
9.  Elegant Stiletto Heels — Heels
10. Black Strappy Heels — Heels
11. Red Carpet Heels — Heels
12. High-Top Canvas Sneakers — Sneakers

Each product gets sizes 38-43 (or subset) with varying stock levels,
including some sold-out sizes for testing.
*/

INSERT INTO public.products (name, brand, category, description, price, images, stock, is_available, is_featured, is_popular)
VALUES
(
  'Urban Stride Sneakers',
  'Urbanite',
  'Sneakers',
  'Comfortable everyday sneakers with a breathable mesh upper and durable rubber sole. Perfect for walking around town or casual outings.',
  3499,
  ARRAY['https://images.pexels.com/photos/1456733/pexels-photo-1456733.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  50,
  true, true, true
),
(
  'Classic White Sneakers',
  'CleanStep',
  'Sneakers',
  'Minimalist white sneakers that go with everything. Premium synthetic upper with cushioned insole for all-day comfort.',
  2999,
  ARRAY['https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  40,
  true, true, false
),
(
  'Air Style Sneakers',
  'SportFlex',
  'Sneakers',
  'Bold and colourful sneakers with air-cushion technology. Lightweight design for maximum comfort and style.',
  4299,
  ARRAY['https://images.pexels.com/photos/8979071/pexels-photo-8979071.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  25,
  true, false, true
),
(
  'Black Leather Oxfords',
  'ExecuFit',
  'Formal',
  'Classic black leather Oxford shoes for the office or special occasions. Genuine leather upper with a polished finish.',
  5499,
  ARRAY['https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  30,
  true, true, false
),
(
  'Executive Leather Shoes',
  'ExecuFit',
  'Formal',
  'Sleek formal shoes with a comfortable fit. Ideal for business meetings, interviews, and corporate events.',
  4999,
  ARRAY['https://images.pexels.com/photos/37465528/pexels-photo-37465528.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  20,
  true, false, false
),
(
  'Brown Brogue Leather Shoes',
  'CraftWalk',
  'Formal',
  'Handsome brown leather brogues with intricate detailing. A versatile pair that works for both smart and smart-casual looks.',
  6299,
  ARRAY['https://images.pexels.com/photos/12031206/pexels-photo-12031206.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  15,
  true, false, true
),
(
  'Pro Runner Athletic Shoes',
  'SpeedKenya',
  'Running',
  'High-performance running shoes with responsive cushioning and a breathable knit upper. Built for the Kenyan runner.',
  3999,
  ARRAY['https://images.pexels.com/photos/260044/pexels-photo-260044.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  35,
  true, true, true
),
(
  'Track Star Running Shoes',
  'SpeedKenya',
  'Running',
  'Lightweight racing shoes with a grippy outsole. Perfect for track sessions and road runs.',
  3599,
  ARRAY['https://images.pexels.com/photos/12659352/pexels-photo-12659352.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  28,
  true, false, false
),
(
  'Elegant Stiletto Heels',
  'GlamourHeel',
  'Heels',
  'Elegant beige stiletto heels with a textured leather design. Perfect for special occasions and evening events.',
  4599,
  ARRAY['https://images.pexels.com/photos/134064/pexels-photo-134064.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  18,
  true, true, true
),
(
  'Black Strappy Heels',
  'GlamourHeel',
  'Heels',
  'Stylish black high-heel sandals with a mesh design. Comfortable and elegant for any occasion.',
  3899,
  ARRAY['https://images.pexels.com/photos/10827097/pexels-photo-10827097.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  22,
  true, false, false
),
(
  'Red Carpet Heels',
  'GlamourHeel',
  'Heels',
  'Bold red high heels that make a statement. Perfect for weddings, parties, and red-carpet moments.',
  5199,
  ARRAY['https://images.pexels.com/photos/16217395/pexels-photo-16217395.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  12,
  true, false, true
),
(
  'High-Top Canvas Sneakers',
  'Urbanite',
  'Sneakers',
  'Retro high-top canvas sneakers with a durable build. A timeless style that never goes out of fashion.',
  2799,
  ARRAY['https://images.pexels.com/photos/7857501/pexels-photo-7857501.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  33,
  true, false, false
)
ON CONFLICT DO NOTHING;

-- Insert product sizes for all products
-- Sizes vary by category: Sneakers/Running 39-44, Formal 40-44, Heels 36-41
DO $$
DECLARE
  p record;
  size_arr text[];
  i int;
BEGIN
  FOR p IN SELECT id, category FROM public.products LOOP
    IF p.category = 'Heels' THEN
      size_arr := ARRAY['36','37','38','39','40','41'];
    ELSIF p.category = 'Formal' THEN
      size_arr := ARRAY['40','41','42','43','44'];
    ELSE
      size_arr := ARRAY['39','40','41','42','43','44'];
    END IF;

    FOR i IN 1..array_length(size_arr, 1) LOOP
      -- Vary stock: some sizes have 0 (sold out), others have varying stock
      INSERT INTO public.product_sizes (product_id, size, stock)
      VALUES (
        p.id,
        size_arr[i],
        CASE
          WHEN i = 1 THEN 0  -- first size sold out for testing
          WHEN i = 2 THEN 8
          WHEN i = 3 THEN 12
          WHEN i = 4 THEN 15
          WHEN i = 5 THEN 10
          ELSE 6
        END
      )
      ON CONFLICT (product_id, size) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
