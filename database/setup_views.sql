-- Function to increment novel views atomically
create or replace function increment_page_view(novel_id uuid)
returns void as $$
begin
  update novels
  set views = views + 1
  where id = novel_id;
end;
$$ language plpgsql;
