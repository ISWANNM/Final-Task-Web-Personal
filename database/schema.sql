CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
  project_link TEXT,
  user_id BIGINT
);

CREATE TABLE IF NOT EXISTS work_experiences (
  id BIGSERIAL PRIMARY KEY,
  position TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description JSONB NOT NULL DEFAULT '[]'::jsonb,
  tech_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT
);
