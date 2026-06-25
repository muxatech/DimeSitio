-- =============================================================
-- Seed: 990 restaurantes demo — cobertura de pares garantizada
-- 22 zonas × 3 precios × 15 restaurantes = 990
-- Cada restaurante: 4 cafe-brunch + 8 comer-cenar + 3 tomar-algo
-- Cualquier par de categorías del mismo grupo encuentra ≥5
-- =============================================================

-- ── Asegurar que todas las categorías existen ──────────────────
insert into categories (name) values
  ('Brunch'), ('Cafetería moderna'), ('Cafetería tradicional'),
  ('Specialty coffee'), ('Tetería'), ('Zumería'), ('Pastelería'), ('Café'),
  ('Italiano'), ('Japonés'), ('Tapas'), ('Arroces'), ('Mediterráneo'),
  ('Mexicano'), ('Argentino'), ('Pizza'), ('Sushi'), ('Marisco'),
  ('Fusión'), ('Vegetariano'), ('Internacional'), ('Hamburguesas'),
  ('Cervecería'), ('Cocktails'), ('Vino'), ('Copas')
on conflict (name) do nothing;

-- ── Asignar group_keys ─────────────────────────────────────────
update categories set group_keys = '{"cafe-brunch"}' where name in (
  'Brunch', 'Cafetería moderna', 'Cafetería tradicional',
  'Specialty coffee', 'Tetería', 'Zumería', 'Pastelería', 'Café'
);
update categories set group_keys = '{"comer-cenar"}' where name in (
  'Italiano', 'Japonés', 'Arroces', 'Mediterráneo', 'Mexicano',
  'Argentino', 'Pizza', 'Sushi', 'Marisco', 'Fusión',
  'Vegetariano', 'Internacional', 'Hamburguesas'
);
update categories set group_keys = '{"tomar-algo"}' where name in (
  'Cervecería', 'Cocktails', 'Vino', 'Copas'
);
update categories set group_keys = '{"comer-cenar","tomar-algo"}' where name = 'Tapas';

-- ── Fotos (33, todas verificadas HTTP 200) ──────────────────
do $$
declare
  photo_ids text[] := array[
    '1517248135467-4c7edcad34c4',
    '1555396273-367ea4eb4db5',
    '1521017432531-fbd92d768814',
    '1565299585323-38d6b0865b47',
    '1414235077428-338989a2e8c0',
    '1540189549336-e6e99c3679fe',
    '1498579150354-977475b7ea0b',
    '1565299624946-b28f40a0ae38',
    '1579871494447-9811cf80d66c',
    '1579584425555-c3ce17fd4351',
    '1504674900247-0877df9cc836',
    '1558030006-450675393462',
    '1509365465985-25d11c17e812',
    '1528605248644-14dd04022da1',
    '1568901346375-23c9450c58cd',
    '1600891964092-4316c288032e',
    '1442512595331-e89e73853f31',
    '1567620905732-2d1ec7ab7445',
    '1555939594-58d7cb561ad1',
    '1432139555190-58524dae6a55',
    '1550304943-4f24f54ddde9',
    '1507048331197-7d4ac70811cf',
    '1754842382582-b643e9af5a27',
    '1481070555726-e2fe8357725c',
    '1461023058943-07fcbe16d735',
    '1753871486322-3a006a71e9b7',
    '1739792598744-3512897156e3',
    '1750124798991-6fd8a8e0265f',
    '1742646802912-c790598fb501',
    '1774921677519-e2aeb343e9b9',
    '1715227909815-9370f4f404b0',
    '1677073610542-a16f43ca8165',
    '1770374957076-054154d7bad4'
  ];
  name_prefixes text[] := array[
    'El Rincón', 'La Terraza', 'El Sabor', 'La Casa', 'El Patio',
    'La Esquina', 'El Mirador', 'La Barra', 'El Mercado', 'La Cocina',
    'El Fogón', 'La Brasa', 'El Horno', 'La Parra', 'El Paladar'
  ];
  zones text[] := array[
    'El Centro', 'El Carmen', 'Ruzafa', 'Ensanche', 'Extramurs',
    'Campanar', 'Benimaclet', 'Algiros', 'Ciutat Vella', 'Quatre Carreres',
    'Jesús', 'Marítim', 'Poblats Marítims', 'Camins al Grau',
    'L''Olivereta', 'Patraix', 'La Saïdia', 'Plà del Real',
    'Benicalap', 'Pobles del Nord', 'Pobles de l''Oest', 'Pobles del Sud'
  ];

  -- cafe-brunch: 8 categorías
  cat_cafe text[] := array[
    'Brunch', 'Cafetería moderna', 'Cafetería tradicional',
    'Specialty coffee', 'Tetería', 'Zumería', 'Pastelería', 'Café'
  ];
  -- comer-cenar: 14 categorías
  cat_comer text[] := array[
    'Italiano', 'Japonés', 'Tapas', 'Arroces', 'Mediterráneo',
    'Mexicano', 'Argentino', 'Pizza', 'Sushi', 'Marisco',
    'Fusión', 'Vegetariano', 'Internacional', 'Hamburguesas'
  ];
  -- tomar-algo: 5 categorías
  cat_tomar text[] := array[
    'Tapas', 'Cervecería', 'Cocktails', 'Vino', 'Copas'
  ];

  -- Offsets para cobertura de pares (verificados por simulación)
  cafe_offsets int[] := array[0, 1, 2, 4];
  comer_offsets int[] := array[0, 1, 2, 3, 4, 5, 7, 10];
  tomar_offsets int[] := array[0, 1, 2];

  n_photos constant int := 33;
  n_prefixes constant int := 15;
  n_cafe constant int := 8;
  n_comer constant int := 14;
  n_tomar constant int := 5;
  n_cafe_off constant int := 4;
  n_comer_off constant int := 8;
  n_tomar_off constant int := 3;
  n_per_group constant int := 15;

  gidx int;
  zi int;
  price int;
  ri int;
  oi int;
  rid uuid;
  rname text;
  cat_name text;
  cat_id uuid;
begin
  gidx := 0;
  for zi in 0..21 loop
    for price in 1..3 loop
      for ri in 0..(n_per_group - 1) loop
        rid := gen_random_uuid();

        rname := name_prefixes[ri + 1] || ' de ' || zones[zi + 1]
          || case price
            when 1 then ''
            when 2 then ' II'
            when 3 then ' III'
          end;

        insert into restaurants (id, name, description, phone, address, city, price_level, image_url, zone, active, is_demo)
        values (
          rid,
          rname,
          case price
            when 1 then 'Cocina casera y ambiente acogedor. Relación calidad-precio inmejorable.'
            when 2 then 'Cocina de calidad con producto fresco. El equilibrio perfecto entre sabor y precio.'
            when 3 then 'Alta cocina en un entorno exclusivo. Una experiencia gastronómica única.'
          end,
          '+34 900 ' || lpad(((gidx % 900) + 100)::text, 3, '0') || ' ' || lpad((gidx % 10000)::text, 4, '0'),
          'C/ de la Demostració, ' || (gidx + 1) || ', Valencia',
          'Valencia',
          price,
          'https://images.unsplash.com/photo-' || photo_ids[gidx % n_photos + 1],
          zones[zi + 1],
          true,
          true
        );

        -- ── Categorías cafe-brunch (4) ──────────────────────
        for oi in 0..(n_cafe_off - 1) loop
          cat_name := cat_cafe[(ri + cafe_offsets[oi + 1]) % n_cafe + 1];
          select id into cat_id from categories where name = cat_name;
          if cat_id is not null then
            insert into restaurant_categories (restaurant_id, category_id) values (rid, cat_id)
            on conflict (restaurant_id, category_id) do nothing;
          end if;
        end loop;

        -- ── Categorías comer-cenar (8) ──────────────────────
        for oi in 0..(n_comer_off - 1) loop
          cat_name := cat_comer[(ri + comer_offsets[oi + 1]) % n_comer + 1];
          select id into cat_id from categories where name = cat_name;
          if cat_id is not null then
            insert into restaurant_categories (restaurant_id, category_id) values (rid, cat_id)
            on conflict (restaurant_id, category_id) do nothing;
          end if;
        end loop;

        -- ── Categorías tomar-algo (3) ───────────────────────
        for oi in 0..(n_tomar_off - 1) loop
          cat_name := cat_tomar[(ri + tomar_offsets[oi + 1]) % n_tomar + 1];
          select id into cat_id from categories where name = cat_name;
          if cat_id is not null then
            insert into restaurant_categories (restaurant_id, category_id) values (rid, cat_id)
            on conflict (restaurant_id, category_id) do nothing;
          end if;
        end loop;

        gidx := gidx + 1;
      end loop;
    end loop;
  end loop;
end $$;
