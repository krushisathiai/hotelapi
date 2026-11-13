-- DineFlow Demo Seed Data
-- NOTE: This data is for LOCAL DEVELOPMENT AND TESTING ONLY.
-- Password for demo user: Demo@1234 (bcrypt hash below)
-- DO NOT use this data in production.

-- Demo User (password: Demo@1234)
INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Demo Owner', 'demo@dineflow.com', '+91-9876543210', '$2b$12$LJ3m4ys3Lk0TSwHlvPOVauGfEkseNMpCwpbRfMo/jjXz3GVsKCkCi', 'owner');

-- Demo Restaurant
INSERT INTO restaurants (id, name, slug, description, address, city, state, zip_code, phone, email, tax_rate, tax_name) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'The Golden Plate', 'the-golden-plate', 'A premium dining experience with authentic flavors', '123 Food Street, Koramangala', 'Bangalore', 'Karnataka', '560034', '+91-80-12345678', 'info@goldenplate.com', 5.00, 'GST');

-- Link user to restaurant
INSERT INTO restaurant_members (user_id, restaurant_id, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'owner');

-- Menu Categories
INSERT INTO menu_categories (id, restaurant_id, name, description, display_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Appetizers', 'Start your meal with our delicious appetizers', 1),
('c1000000-0000-0000-0000-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Main Course', 'Hearty and flavorful main dishes', 2),
('c1000000-0000-0000-0000-000000000003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Desserts', 'Sweet treats to end your meal', 3),
('c1000000-0000-0000-0000-000000000004', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Beverages', 'Refreshing drinks and mocktails', 4),
('c1000000-0000-0000-0000-000000000005', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Soups & Salads', 'Light and healthy options', 5);

-- Menu Items
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, is_veg, is_available, preparation_time) VALUES
('d1000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000001', 'Paneer Tikka', 'Grilled cottage cheese marinated in spices', 299.00, true, true, 20),
('d1000000-0000-0000-0000-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000001', 'Chicken Wings', 'Crispy fried wings with hot sauce', 349.00, false, true, 15),
('d1000000-0000-0000-0000-000000000003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000001', 'Spring Rolls', 'Crispy vegetable spring rolls with sweet chili dip', 199.00, true, true, 12),
('d1000000-0000-0000-0000-000000000004', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000002', 'Butter Chicken', 'Tender chicken in rich creamy tomato gravy', 449.00, false, true, 25),
('d1000000-0000-0000-0000-000000000005', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000002', 'Paneer Butter Masala', 'Cottage cheese cubes in butter-tomato sauce', 399.00, true, true, 20),
('d1000000-0000-0000-0000-000000000006', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000002', 'Biryani (Chicken)', 'Fragrant basmati rice with tender chicken', 379.00, false, true, 30),
('d1000000-0000-0000-0000-000000000007', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000002', 'Dal Makhani', 'Slow-cooked black lentils in creamy sauce', 299.00, true, true, 25),
('d1000000-0000-0000-0000-000000000008', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000003', 'Gulab Jamun', 'Deep-fried milk dumplings in sugar syrup', 149.00, true, true, 10),
('d1000000-0000-0000-0000-000000000009', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000003', 'Chocolate Lava Cake', 'Warm chocolate cake with molten center', 249.00, true, true, 15),
('d1000000-0000-0000-0000-000000000010', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000004', 'Mango Lassi', 'Creamy mango yogurt drink', 129.00, true, true, 5),
('d1000000-0000-0000-0000-000000000011', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000004', 'Masala Chai', 'Traditional Indian spiced tea', 79.00, true, true, 5),
('d1000000-0000-0000-0000-000000000012', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000005', 'Tomato Soup', 'Classic creamy tomato soup with croutons', 169.00, true, true, 10),
('d1000000-0000-0000-0000-000000000013', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000005', 'Caesar Salad', 'Romaine lettuce with parmesan and caesar dressing', 229.00, true, true, 10),
('d1000000-0000-0000-0000-000000000014', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000002', 'Grilled Salmon', 'Atlantic salmon fillet with lemon herb butter', 699.00, false, true, 25),
('d1000000-0000-0000-0000-000000000015', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1000000-0000-0000-0000-000000000002', 'Mushroom Risotto', 'Creamy arborio rice with wild mushrooms', 449.00, true, true, 25);

-- Restaurant Tables
INSERT INTO restaurant_tables (id, restaurant_id, table_number, seating_capacity, status, location) VALUES
('e1000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T1', 2, 'available', 'indoor'),
('e1000000-0000-0000-0000-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T2', 4, 'occupied', 'indoor'),
('e1000000-0000-0000-0000-000000000003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T3', 4, 'available', 'indoor'),
('e1000000-0000-0000-0000-000000000004', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T4', 6, 'reserved', 'indoor'),
('e1000000-0000-0000-0000-000000000005', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T5', 2, 'available', 'outdoor'),
('e1000000-0000-0000-0000-000000000006', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T6', 4, 'available', 'outdoor'),
('e1000000-0000-0000-0000-000000000007', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T7', 8, 'available', 'indoor'),
('e1000000-0000-0000-0000-000000000008', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T8', 6, 'available', 'patio'),
('e1000000-0000-0000-0000-000000000009', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T9', 4, 'available', 'patio'),
('e1000000-0000-0000-0000-000000000010', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'T10', 10, 'available', 'indoor');

-- Sample Orders (from past week)
INSERT INTO orders (id, restaurant_id, order_number, table_id, order_type, status, subtotal, tax_amount, discount_amount, service_charge, total_amount, customer_name, created_by, created_at, completed_at) VALUES
('f1000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ORD-20261010-0001', 'e1000000-0000-0000-0000-000000000002', 'dine-in', 'completed', 1097.00, 54.85, 0, 0, 1151.85, 'Raj Kumar', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '1 hour'),
('f1000000-0000-0000-0000-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ORD-20261011-0001', 'e1000000-0000-0000-0000-000000000003', 'dine-in', 'completed', 847.00, 42.35, 50.00, 0, 839.35, 'Priya Sharma', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '45 minutes'),
('f1000000-0000-0000-0000-000000000003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ORD-20261012-0001', NULL, 'takeaway', 'completed', 528.00, 26.40, 0, 0, 554.40, 'Amit Patel', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'),
('f1000000-0000-0000-0000-000000000004', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ORD-20261013-0001', 'e1000000-0000-0000-0000-000000000001', 'dine-in', 'completed', 1548.00, 77.40, 100.00, 0, 1525.40, 'Sneha Reddy', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '1 hour 15 minutes'),
('f1000000-0000-0000-0000-000000000005', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ORD-20261014-0001', 'e1000000-0000-0000-0000-000000000005', 'dine-in', 'completed', 927.00, 46.35, 0, 0, 973.35, 'Vikram Singh', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '50 minutes'),
('f1000000-0000-0000-0000-000000000006', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ORD-20261015-0001', 'e1000000-0000-0000-0000-000000000007', 'dine-in', 'completed', 2196.00, 109.80, 0, 0, 2305.80, 'Deepa Nair', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '1 hour 30 minutes'),
('f1000000-0000-0000-0000-000000000007', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ORD-20261016-0001', 'e1000000-0000-0000-0000-000000000002', 'dine-in', 'served', 748.00, 37.40, 0, 0, 785.40, 'Arjun Mehta', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '1 day', NULL),
('f1000000-0000-0000-0000-000000000008', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ORD-20261017-0001', 'e1000000-0000-0000-0000-000000000004', 'dine-in', 'preparing', 1298.00, 64.90, 0, 0, 1362.90, 'Kavitha Iyer', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '2 hours', NULL),
('f1000000-0000-0000-0000-000000000009', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'ORD-20261017-0002', NULL, 'takeaway', 'pending', 578.00, 28.90, 0, 0, 606.90, 'Rahul Das', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '30 minutes', NULL);

-- Order Items
INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity, total_price) VALUES
-- Order 1
('f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'Butter Chicken', 449.00, 1, 449.00),
('f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Paneer Tikka', 299.00, 1, 299.00),
('f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'Chicken Wings', 349.00, 1, 349.00),
-- Order 2
('f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000005', 'Paneer Butter Masala', 399.00, 1, 399.00),
('f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000009', 'Chocolate Lava Cake', 249.00, 1, 249.00),
('f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 'Spring Rolls', 199.00, 1, 199.00),
-- Order 3
('f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000006', 'Biryani (Chicken)', 379.00, 1, 379.00),
('f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000008', 'Gulab Jamun', 149.00, 1, 149.00),
-- Order 4
('f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000014', 'Grilled Salmon', 699.00, 2, 1398.00),
('f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000008', 'Gulab Jamun', 149.00, 1, 149.00),
-- Order 5
('f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000004', 'Butter Chicken', 449.00, 1, 449.00),
('f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000006', 'Biryani (Chicken)', 379.00, 1, 379.00),
('f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000011', 'Masala Chai', 79.00, 1, 79.00),
-- Order 6
('f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000014', 'Grilled Salmon', 699.00, 1, 699.00),
('f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000015', 'Mushroom Risotto', 449.00, 1, 449.00),
('f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000004', 'Butter Chicken', 449.00, 1, 449.00),
('f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000009', 'Chocolate Lava Cake', 249.00, 2, 498.00),
('f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000011', 'Masala Chai', 79.00, 1, 79.00),
-- Order 7
('f1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000005', 'Paneer Butter Masala', 399.00, 1, 399.00),
('f1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000002', 'Chicken Wings', 349.00, 1, 349.00),
-- Order 8
('f1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000014', 'Grilled Salmon', 699.00, 1, 699.00),
('f1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000005', 'Paneer Butter Masala', 399.00, 1, 399.00),
('f1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000003', 'Spring Rolls', 199.00, 1, 199.00),
-- Order 9
('f1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000006', 'Biryani (Chicken)', 379.00, 1, 379.00),
('f1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000003', 'Spring Rolls', 199.00, 1, 199.00);

-- Payments for completed orders
INSERT INTO payments (restaurant_id, order_id, amount, payment_method, payment_status) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f1000000-0000-0000-0000-000000000001', 1151.85, 'card', 'completed'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f1000000-0000-0000-0000-000000000002', 839.35, 'cash', 'completed'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f1000000-0000-0000-0000-000000000003', 554.40, 'upi', 'completed'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f1000000-0000-0000-0000-000000000004', 1525.40, 'card', 'completed'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f1000000-0000-0000-0000-000000000005', 973.35, 'cash', 'completed'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f1000000-0000-0000-0000-000000000006', 2305.80, 'card', 'completed');

-- Staff Members
INSERT INTO staff (restaurant_id, name, email, phone, role, salary, is_active) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Ramesh Kumar', 'ramesh@goldenplate.com', '+91-9876543001', 'chef', 45000.00, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Sita Devi', 'sita@goldenplate.com', '+91-9876543002', 'manager', 35000.00, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Anil Sharma', 'anil@goldenplate.com', '+91-9876543003', 'waiter', 18000.00, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Priya Gupta', 'priya@goldenplate.com', '+91-9876543004', 'cashier', 22000.00, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Mohan Das', 'mohan@goldenplate.com', '+91-9876543005', 'waiter', 18000.00, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Lakshmi Nair', 'lakshmi@goldenplate.com', '+91-9876543006', 'host', 20000.00, true),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Vijay Patil', 'vijay@goldenplate.com', '+91-9876543007', 'chef', 40000.00, true);

-- Activity Logs
INSERT INTO activity_logs (restaurant_id, user_id, action, entity_type, entity_id, description) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'create', 'order', 'f1000000-0000-0000-0000-000000000008', 'Created order ORD-20261017-0001'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'create', 'order', 'f1000000-0000-0000-0000-000000000009', 'Created order ORD-20261017-0002'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'update', 'menu_item', 'd1000000-0000-0000-0000-000000000001', 'Updated Paneer Tikka price'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'create', 'staff', NULL, 'Added new staff member Vijay Patil');
