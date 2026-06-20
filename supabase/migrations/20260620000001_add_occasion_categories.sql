-- Añadir categorías para grupos por ocasión
insert into categories (name) values
  ('Cafetería moderna'),
  ('Cafetería tradicional'),
  ('Specialty coffee'),
  ('Tetería'),
  ('Zumería'),
  ('Pastelería'),
  ('Cervecería'),
  ('Cocktails'),
  ('Vino')
on conflict (name) do nothing;
