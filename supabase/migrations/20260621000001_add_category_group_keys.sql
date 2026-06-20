-- Añadir columna group_keys para asignar categorías a grupos por ocasión
alter table categories add column group_keys text[] not null default '{}';

-- Seed de group_keys para categorías existentes
update categories set group_keys = '{"cafe-brunch"}' where name in (
  'Brunch', 'Cafetería moderna', 'Cafetería tradicional',
  'Specialty coffee', 'Tetería', 'Zumería', 'Pastelería'
);

update categories set group_keys = '{"comer-cenar"}' where name in (
  'Italiano', 'Japonés', 'Arroces', 'Mediterráneo', 'Mexicano',
  'Argentino', 'Pizza', 'Sushi', 'Marisco', 'Fusión',
  'Vegetariano', 'Internacional', 'Hamburguesas'
);

update categories set group_keys = '{"tomar-algo"}' where name in (
  'Cervecería', 'Cocktails', 'Vino'
);

-- Tapas está en dos grupos
update categories set group_keys = '{"comer-cenar","tomar-algo"}' where name = 'Tapas';
