-- 0003_story_architect.sql
-- Story Architect: 故事骨架與角色深化引擎
-- 只新增欄位/新增表，不改既有欄位定義

-- 2.1 projects 增加骨架資料欄位（整劇共用）
ALTER TABLE projects ADD COLUMN selected_topic TEXT;
ALTER TABLE projects ADD COLUMN series_outline TEXT;
ALTER TABLE projects ADD COLUMN characters TEXT;
ALTER TABLE projects ADD COLUMN architect_stage TEXT DEFAULT 'topic'
  CHECK(architect_stage IN ('topic','outline','characters','episodes','done'));

-- 2.2 episodes 增加分集故事卡欄位
ALTER TABLE episodes ADD COLUMN story_card TEXT;
ALTER TABLE episodes ADD COLUMN human_edited INTEGER DEFAULT 0;

-- 2.3 記錄每次 AI 生成/人手動作，供品質稽核與「共創」證明
CREATE TABLE IF NOT EXISTS architect_actions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  episode_id TEXT,
  stage TEXT NOT NULL CHECK(stage IN ('topic','outline','characters','episodes')),
  action TEXT NOT NULL CHECK(action IN ('generate','regenerate','accept','edit')),
  actor TEXT NOT NULL CHECK(actor IN ('ai','human')),
  credits_consumed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE INDEX IF NOT EXISTS idx_architect_actions_project ON architect_actions(project_id);
