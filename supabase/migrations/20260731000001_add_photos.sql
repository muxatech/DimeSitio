alter table if exists restaurants add column if not exists photos text[] not null default '{}';

update restaurants
set photos = case when image_url is not null and image_url <> '' then array[image_url] else '{}' end
where image_url is not null and photos = '{}';
