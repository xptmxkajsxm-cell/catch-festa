-- (선택) 평점·후기와 제보 기능용 Supabase 테이블
-- Supabase 대시보드 → SQL Editor 에 붙여 넣고 Run 하세요.

create table if not exists reviews (
  id text primary key,
  eid text not null,
  uid text not null,
  rating int not null check (rating between 1 and 5),
  text text default '' check (char_length(text) <= 300),
  at bigint not null
);
alter table reviews enable row level security;
create policy "누구나 후기 읽기" on reviews for select using (true);
create policy "누구나 후기 쓰기" on reviews for insert with check (true);
create policy "후기 수정" on reviews for update using (true) with check (true);
create policy "후기 삭제" on reviews for delete using (true);

create table if not exists tips (
  id bigint generated always as identity primary key,
  data jsonb not null,
  created_at timestamptz default now()
);
alter table tips enable row level security;
create policy "누구나 제보 보내기" on tips for insert with check (true);
-- 제보 목록은 Supabase 대시보드(Table Editor → tips)에서 확인하세요.
