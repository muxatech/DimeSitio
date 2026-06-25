-- Clean up demo data before re-seeding with better coverage
delete from restaurant_categories
where restaurant_id in (select id from restaurants where is_demo = true);

delete from restaurants where is_demo = true;
