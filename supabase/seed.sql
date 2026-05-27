-- =============================================================
-- Seed data: categorías + restaurantes Valencia
-- =============================================================

-- -----------------------------------------------------------
-- Categorías
-- -----------------------------------------------------------
insert into categories (name, icon) values
  ('Italiano', '🍝'),
  ('Japonés', '🍣'),
  ('Tapas', '🍤'),
  ('Arroces', '🥘'),
  ('Mediterráneo', '🥗'),
  ('Mexicano', '🌮'),
  ('Argentino', '🥩'),
  ('Pizza', '🍕'),
  ('Sushi', '🍣'),
  ('Brunch', '🥐'),
  ('Marisco', '🦐'),
  ('Fusión', '🍽️'),
  ('Vegetariano', '🥦'),
  ('Internacional', '🌍'),
  ('Hamburguesas', '🍔')
on conflict (name) do nothing;

-- -----------------------------------------------------------
-- Restaurantes Valencia
-- -----------------------------------------------------------
insert into restaurants (name, description, phone, address, city, lat, lng, price_level, image_url, menu_url, zone, active) values
  (
    'La Riua',
    'Arroces tradicionales valencianos con vistas a la Albufera. Especialidad en paella valenciana y arroz a banda.',
    '+34963212345',
    'C/ de la Riuà, 47',
    'Valencia', 39.4645, -0.3605, 2,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    'https://lariua.com/menu',
    'El Carmen', true
  ),
  (
    'Canalla Bistro',
    'Cocina fusión divertida y desenfadada del chef Ricard Camarena. Platos para compartir con un toque moderno.',
    '+34963345678',
    'C/ de la Reina, 34',
    'Valencia', 39.4700, -0.3750, 2,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    'https://canallabistro.com/menu',
    'Russafa', true
  ),
  (
    'Casa Montaña',
    'Taberna histórica desde 1836. Tapas clásicas, vinos y ambiente tradicional en el barrio del Cabanyal.',
    '+34963200876',
    'C/ de Josep Benlliure, 69',
    'Valencia', 39.4660, -0.3260, 2,
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814',
    'https://casamontana.com',
    'Cabanyal', true
  ),
  (
    'La Pepica',
    'Restaurante mítico en la playa de la Malvarrosa. Paellas y arroces desde 1898. Favorito de Ernest Hemingway.',
    '+34963283100',
    'Passeig Marítim de la Malva-rosa, 235',
    'Valencia', 39.4770, -0.3160, 3,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
    'https://lapepica.com',
    'Malvarrosa', true
  ),
  (
    'El Poblet',
    'Alta cocina del chef Quique Dacosta. Menú degustación de vanguardia con producto local.',
    '+34963264578',
    'C/ de la Reina, 8',
    'Valencia', 39.4705, -0.3760, 3,
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
    'https://elpoblet.com',
    'El Centro', true
  ),
  (
    'Mercado de Tapinería',
    'Mercado gastronómico con puestos de tapas, vinos y productos locales en pleno centro histórico.',
    '+34963987654',
    'Plaça de Tapineria',
    'Valencia', 39.4770, -0.3735, 1,
    'https://images.unsplash.com/photo-1555661054-639727511f0b',
    'https://mercadotapineria.es',
    'El Centro', true
  ),
  (
    'Le Favole',
    'Auténtica cocina italiana con ingredientes importados. Pastas caseras y tiramisú artesanal.',
    '+34963654321',
    'C/ de la Pau, 12',
    'Valencia', 39.4710, -0.3720, 2,
    'https://images.unsplash.com/photo-1498579150354-977475b7ea0b',
    'https://lefavole.com',
    'El Carmen', true
  ),
  (
    'San Tommaso',
    'Pizza napolitana artesanal con masa madre y horno de leña. Las mejores pizzas de Valencia.',
    '+34963111222',
    'C/ de Cadirers, 5',
    'Valencia', 39.4740, -0.3740, 1,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    'https://santommaso.es',
    'El Centro', true
  ),
  (
    'Yakitoro',
    'Izakaya japonés con brochetas robata, sake y ambiente vibrante. Fusión japonesa moderna.',
    '+34963444555',
    'C/ de les Danses, 6',
    'Valencia', 39.4690, -0.3710, 2,
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
    'https://yakitoro.es',
    'Russafa', true
  ),
  (
    'Sibuya Urban Sushi Bar',
    'Sushi creativo y cocina nikkei en un ambiente sofisticado. Rolls únicos y tatakis espectaculares.',
    '+34963555666',
    'C/ de Colón, 23',
    'Valencia', 39.4695, -0.3705, 2,
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
    'https://sibuya.es',
    'Eixample', true
  ),
  (
    'La Sastrería',
    'Tapas modernas y cócteles en un espacio con alma. Platos de temporada con producto de mercado.',
    '+34963777888',
    'C/ del Comte d''Almodóvar, 9',
    'Valencia', 39.4760, -0.3710, 2,
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://lasastreria.com',
    'El Carmen', true
  ),
  (
    'Fierro',
    'Cocina mediterránea de producto con parrilla de carbón. Carnes, pescados y verduras locales.',
    '+34963888999',
    'C/ de la Reina, 56',
    'Valencia', 39.4715, -0.3765, 2,
    'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a',
    'https://fierrovalencia.com',
    'Russafa', true
  ),
  (
    'Dulce de Leche',
    'Carnes argentinas a la parrilla, empanadas y vinos Malbec. El mejor asado de Valencia.',
    '+34963999000',
    'Av. del Port, 89',
    'Valencia', 39.4610, -0.3450, 2,
    'https://images.unsplash.com/photo-1558030006-450675393462',
    'https://dulcedeleche.es',
    'Camins al Grau', true
  ),
  (
    'La Más Bonita',
    'Brunch, café de especialidad y tartas caseras. El lugar perfecto para empezar el día.',
    '+34963123456',
    'C/ de la Blanqueria, 12',
    'Valencia', 39.4775, -0.3740, 1,
    'https://images.unsplash.com/photo-1509365465985-25d11c17e812',
    'https://lamasbonita.com',
    'El Carmen', true
  ),
  (
    'La Tasquita de Enfrente',
    'Cocina valenciana moderna con toques creativos. Menú del día excelente relación calidad-precio.',
    '+34963456789',
    'C/ de les Roses, 12',
    'Valencia', 39.4700, -0.3730, 1,
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
    'https://tasquitaenfrente.com',
    'Russafa', true
  ),
  (
    'Bar Almazén',
    'Bar de tapas con solera en pleno Carmen. Montaditos, conservas de calidad y vermut artesanal.',
    '+34963765432',
    'C/ de la Corona, 17',
    'Valencia', 39.4780, -0.3745, 1,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    'https://baralmazén.com',
    'El Carmen', true
  ),
  (
    'Cervecería La Sureña',
    'Cerveza artesana y hamburguesas gourmet con ingredientes locales. Terraza animada.',
    '+34963222333',
    'Pl. del Cedre, 3',
    'Valencia', 39.4745, -0.3610, 1,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    'https://lasurena.com',
    'Benimaclet', true
  ),
  (
    'Table 33',
    'Cocina internacional de autor. Menú degustación sorpresa con maridaje de vinos.',
    '+34963333444',
    'C/ de la Marina, 33',
    'Valencia', 39.4600, -0.3230, 3,
    'https://images.unsplash.com/photo-1600891964092-4316c288032e',
    'https://table33.com',
    'Cabanyal', true
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------
-- Relaciones restaurante ↔ categoría
-- -----------------------------------------------------------
with cat as (select id, name from categories)
insert into restaurant_categories (restaurant_id, category_id)
select r.id, c.id
from (values
  ('La Riua',             'Arroces'),
  ('La Riua',             'Mediterráneo'),
  ('Canalla Bistro',      'Fusión'),
  ('Canalla Bistro',      'Tapas'),
  ('Casa Montaña',        'Tapas'),
  ('Casa Montaña',        'Mediterráneo'),
  ('La Pepica',           'Arroces'),
  ('La Pepica',           'Marisco'),
  ('El Poblet',           'Mediterráneo'),
  ('El Poblet',           'Fusión'),
  ('Mercado de Tapinería','Tapas'),
  ('Mercado de Tapinería','Mediterráneo'),
  ('Le Favole',           'Italiano'),
  ('San Tommaso',         'Pizza'),
  ('San Tommaso',         'Italiano'),
  ('Yakitoro',            'Japonés'),
  ('Yakitoro',            'Fusión'),
  ('Sibuya Urban Sushi Bar','Sushi'),
  ('Sibuya Urban Sushi Bar','Japonés'),
  ('La Sastrería',        'Tapas'),
  ('La Sastrería',        'Fusión'),
  ('Fierro',              'Mediterráneo'),
  ('Fierro',              'Arroces'),
  ('Dulce de Leche',      'Argentino'),
  ('La Más Bonita',       'Brunch'),
  ('La Más Bonita',       'Vegetariano'),
  ('La Tasquita de Enfrente','Tapas'),
  ('La Tasquita de Enfrente','Mediterráneo'),
  ('Bar Almazén',         'Tapas'),
  ('Cervecería La Sureña','Hamburguesas'),
  ('Table 33',            'Internacional'),
  ('Table 33',            'Fusión')
) as data(rest_name, cat_name)
join restaurants r on r.name = data.rest_name
join cat c on c.name = data.cat_name
on conflict do nothing;
