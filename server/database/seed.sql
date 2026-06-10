-- Connect in psql:
-- \c lidya_lifestyle

-- ==========================================
-- ADMIN USER
-- ==========================================
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@lidya.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4pR5iS6eKkqjXr7e',
  'admin'
);

-- ==========================================
-- CATEGORIES
-- ==========================================
INSERT INTO categories (name, slug, sort_order) VALUES
('Shop All',         'shop-all',         1),
('Pillows',          'pillows',          2),
('Throws & Blankets','throws-blankets',  3),
('Table Linens',     'table-linens',     4),
('Bath',             'bath',              5),
('Wall Hangings',    'wall-hangings',    6),
('Fabric by the Yard','fabric-yard',     7);

-- ==========================================
-- SUBCATEGORIES (Pillows = id 2)
-- ==========================================
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
('All Pillows',    'all-pillows',    2, 1),
('Lumbar Pillows', 'lumbar-pillows', 2, 2),
('Square Pillows', 'square-pillows', 2, 3),
('Pillow Sets',    'pillow-sets',    2, 4);

-- ==========================================
-- PRODUCTS
-- ==========================================
INSERT INTO products
(name, slug, short_description, description, price, category_id, stock_qty, sku, is_featured)
VALUES
(
  'Afar Throw — Dusk',
  'afar-throw-dusk',
  'Handwoven Ethiopian cotton throw in deep indigo and burnt orange.',
  'The Afar Throw draws inspiration from the nomadic Afar people of Ethiopia. Handwoven by artisan weavers in Addis Ababa using traditional cotton weaving techniques passed down through generations. Each throw takes approximately two days to complete. The deep indigo and burnt orange palette is achieved using natural dyes derived from local plants and minerals.',
  285.00, 3, 12, 'AFAR-DUSK-001', TRUE
),
(
  'Omo Valley Lumbar Pillow',
  'omo-valley-lumbar-pillow',
  'Bold geometric patterns inspired by Omo Valley cultures.',
  'A striking lumbar pillow featuring bold geometric patterns drawn from the body paint and adornment traditions of the Omo Valley peoples in southern Ethiopia. Each pillow is individually handwoven on a traditional loom and finished with a natural linen backing and hidden zipper closure.',
  95.00, 5, 25, 'OMO-LUMBAR-001', TRUE
),
(
  'African Coast Table Runner',
  'african-coast-table-runner',
  'Inspired by the vibrant colors of Kenya and Tanzania''s coastline.',
  'Bring the warmth of the East African coastline to your table. This handwoven table runner features rich turquoise, coral, and sand tones reminiscent of the Swahili coast. Made from sustainably sourced cotton and dyed with a combination of natural and low-impact synthetic dyes for colorfastness.',
  65.00, 4, 18, 'COAST-RUNNER-001', FALSE
),
(
  'Heritage Bath Towel — Cobalt',
  'heritage-bath-towel-cobalt',
  'Plush handwoven cotton bath towel in rich cobalt blue.',
  'Our Heritage bath towel combines traditional Ethiopian weaving patterns with modern usability. The tight weave provides excellent absorbency while the decorative bands at each end add a touch of artisanal elegance. Pre-washed for softness and pre-shrunk. Machine washable.',
  75.00, 5, 30, 'HER-BATH-COBALT', FALSE
),
(
  'Met Collection Wall Hanging — Large',
  'met-collection-wall-hanging-large',
  'Limited edition — a collaboration with the Metropolitan Museum of Art.',
  'This limited-edition wall hanging is the result of our collaboration with the Metropolitan Museum of Art''s Department of African Art. Drawing on archival textile fragments from the museum''s collection, the design reinterprets ancient Ethiopian ceremonial cloth for the contemporary home.',
  650.00, 6, 3, 'MET-WALL-LG', TRUE
);