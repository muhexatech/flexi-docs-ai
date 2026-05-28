
insert into storage.buckets (id, name, public) values ('brand-logos', 'brand-logos', true)
on conflict (id) do nothing;

create policy "Brand logos are publicly readable"
on storage.objects for select
using (bucket_id = 'brand-logos');

create policy "Users upload own brand logo"
on storage.objects for insert to authenticated
with check (bucket_id = 'brand-logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own brand logo"
on storage.objects for update to authenticated
using (bucket_id = 'brand-logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own brand logo"
on storage.objects for delete to authenticated
using (bucket_id = 'brand-logos' and auth.uid()::text = (storage.foldername(name))[1]);
