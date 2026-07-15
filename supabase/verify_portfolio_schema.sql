-- Run after the normalization migration. Expected counts after the current seed:
-- 1 user, 3 submissions, 1 like, 1 comment, 4 blogs, and 19 projects.

select 'portfolio_users' as table_name, count(*) as rows from public.portfolio_users
union all select 'user_access', count(*) from public.user_access
union all select 'submissions', count(*) from public.submissions
union all select 'content_likes', count(*) from public.content_likes
union all select 'content_comments', count(*) from public.content_comments
union all select 'blogs', count(*) from public.blogs
union all select 'projects', count(*) from public.projects
order by table_name;

select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('store_metadata','portfolio_users','user_access','submissions','content_likes','content_comments','blogs','projects','otp_challenges')
order by relname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('store_metadata','portfolio_users','user_access','submissions','content_likes','content_comments','blogs','projects','otp_challenges')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;
