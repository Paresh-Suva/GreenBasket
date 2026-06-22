-- GreenBasket: Add real categories for catalog seeding
-- Slugs match standard patterns for the e-commerce navigation search helper.

INSERT IGNORE INTO categories (parent_id, name, slug, description, image_url, active, sort_order, created_at, updated_at, created_by, updated_by, version)
VALUES
(NULL, 'Fresh Vegetables', 'fresh-vegetables', 'Organic, pesticide-free, and freshly harvested farm-fresh vegetables.', NULL, TRUE, 1, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Fresh Fruits', 'fresh-fruits', 'Sweet, juicy, and hand-picked seasonal fruits packed with nutrients.', NULL, TRUE, 2, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Herbs & Seasonings', 'herbs-seasonings', 'Fresh culinary herbs and root seasonings to flavor your gourmet meals.', NULL, TRUE, 3, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Fresh Milk', 'fresh-milk', 'Pure pasteurized, whole, skimmed, and plant-based dairy milk.', NULL, TRUE, 4, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Gourmet Cheese', 'gourmet-cheese', 'Block, shredded, and artisanal cheeses ranging from mild Cheddar to fresh Mozzarella.', NULL, TRUE, 5, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Butter & Cream', 'butter-cream', 'Salted and unsalted butter blocks, heavy whipping cream, and fresh sour cream.', NULL, TRUE, 6, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Yogurt & Curd', 'yogurt-curd', 'Plain greek yogurts, flavored fruit yogurts, and traditional curd.', NULL, TRUE, 7, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Farm Eggs', 'farm-eggs', 'Fresh cage-free, organic brown and white farm eggs.', NULL, TRUE, 8, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Fresh Bread', 'fresh-bread', 'Freshly baked sliced sandwich breads, artisanal sourdough, and baguettes.', NULL, TRUE, 9, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Buns & Rolls', 'buns-rolls', 'Soft burger buns, hotdog rolls, dinner rolls, and slider buns.', NULL, TRUE, 10, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Cakes & Pastries', 'cakes-pastries', 'Fresh muffins, sweet croissants, donuts, and celebratory cakes.', NULL, TRUE, 11, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Fresh Poultry', 'fresh-poultry', 'Fresh lean chicken breasts, chicken drumsticks, wings, and whole turkey.', NULL, TRUE, 12, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Red Meat', 'red-meat', 'Premium cuts of fresh beef, steak ribeye, mutton, and ground meat.', NULL, TRUE, 13, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Fresh Seafood', 'fresh-seafood', 'Fresh salmon fillets, ocean prawns, crabs, and seasonal local fish.', NULL, TRUE, 14, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Cooking Oils', 'cooking-oils', 'Extra virgin olive oils, sunflower oil, coconut oil, and traditional grass-fed ghee.', NULL, TRUE, 15, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Rice & Grains', 'rice-grains', 'Premium long-grain Basmati rice, brown rice, quinoa, and oats.', NULL, TRUE, 16, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Flours & Atta', 'flours-atta', 'Whole wheat flour (atta), all-purpose flour, almond flour, and cornstarch.', NULL, TRUE, 17, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Spices & Powders', 'spices-powders', 'Pure spice powders like turmeric, chili, cumin, coriander, and whole black peppercorns.', NULL, TRUE, 18, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Pulses & Lentils', 'pulses-lentils', 'Dried red lentils, green peas, chickpeas, and black beans.', NULL, TRUE, 19, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Soft Drinks', 'soft-drinks', 'Sparkling water, carbonated sodas, tonic water, and energy drinks.', NULL, TRUE, 20, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Fruit Juices', 'fruit-juices', 'Freshly squeezed orange juices, apple juices, and tropical fruit nectars.', NULL, TRUE, 21, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Tea & Coffee', 'tea-coffee', 'Organic coffee beans, ground espresso, black tea bags, and green herbal tea leaves.', NULL, TRUE, 22, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Chips & Crisps', 'chips-crisps', 'Potato chips, nacho tortilla chips, pretzels, and popped popcorn.', NULL, TRUE, 23, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0),
(NULL, 'Cookies & Biscuits', 'cookies-biscuits', 'Sweet chocolate chip cookies, butter biscuits, and wheat crackers.', NULL, TRUE, 24, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 'system', 'system', 0);
