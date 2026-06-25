-- Asignar group_keys a Café y Copas (categorías antiguas sin grupo)
update categories set group_keys = '{"cafe-brunch"}' where name = 'Café' and group_keys = '{}';
update categories set group_keys = '{"tomar-algo"}' where name = 'Copas' and group_keys = '{}';
