-- CoFilmery D1 Initial Schema
-- Migration: 0001_initial_schema

-- Users table (all roles)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('elder','creator','sponsor','admin')),
  age INTEGER,
  tier TEXT,
  password_hash TEXT,
  google_id TEXT,
  credits INTEGER DEFAULT 0,
  practice_credits INTEGER DEFAULT 1000,
  esg_score INTEGER DEFAULT 0,
  training_hours REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','pending','suspended')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects / Series
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('drama','legacy')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','reviewing','published','revision','approved')),
  creator_id TEXT NOT NULL,
  description TEXT,
  tags TEXT, -- JSON array
  episode_count INTEGER DEFAULT 0,
  completed_episodes INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  total_views INTEGER DEFAULT 0,
  esg_score REAL DEFAULT 0,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Episodes
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  script_content TEXT,
  video_url TEXT,
  subtitle_url TEXT,
  views INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Review submissions
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  episode_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  reviewer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','revision','redo','flagged')),
  score_safety REAL,
  score_language REAL,
  score_culture REAL,
  score_ethics REAL,
  score_commercial REAL,
  overall_score REAL,
  comment TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (episode_id) REFERENCES episodes(id)
);

-- Credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('debit','credit')),
  amount INTEGER NOT NULL,
  description TEXT,
  category TEXT CHECK(category IN ('ai_generation','voice','video','subscription','revenue_share','purchase','refund')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Watch history (elder viewers)
CREATE TABLE IF NOT EXISTS watch_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  episode_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  watch_duration_seconds INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, project_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ESG sponsor projects
CREATE TABLE IF NOT EXISTS esg_projects (
  id TEXT PRIMARY KEY,
  sponsor_id TEXT NOT NULL,
  project_id TEXT,
  type TEXT CHECK(type IN ('group_sponsor','executive_legacy','sponsored_legacy')),
  budget_hkd INTEGER,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sponsor_id) REFERENCES users(id)
);

-- AI generation jobs
CREATE TABLE IF NOT EXISTS gen_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  episode_id TEXT,
  job_type TEXT CHECK(job_type IN ('script','storyboard','visual','voice','subtitle','compile')),
  status TEXT DEFAULT 'queued' CHECK(status IN ('queued','processing','completed','failed','refunded')),
  credits_consumed INTEGER DEFAULT 0,
  provider TEXT,
  result_url TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- KV-style config store (replaces KV namespace for hosted deploy compatibility)
CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_creator ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_episodes_project ON episodes(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_credit_txn_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_user ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_gen_jobs_user ON gen_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
