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

-- 후기 신고 (같은 사람이 같은 후기를 중복 신고하지 못하도록 id = 후기id~신고자id)
create table if not exists reports (
  id text primary key,
  rid text not null,
  eid text,
  uid text not null,
  reason text,
  at bigint not null
);
alter table reports enable row level security;
create policy "신고 수 읽기" on reports for select using (true);
create policy "누구나 신고" on reports for insert with check (true);
-- 신고 3건 이상 쌓인 후기는 앱에서 자동으로 가려져요. Table Editor에서 reviews / reports를 확인해 삭제하세요.
