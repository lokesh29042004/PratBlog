-- Add slug column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN slug VARCHAR(255);

-- Create unique index on slug
CREATE UNIQUE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Update existing blogs with slugs generated from titles
UPDATE blog_posts 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9 -]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL;