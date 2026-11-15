// схема таблиц postgresql и начальные данные seed для локальной разработки
export const POSTGRES_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  inn VARCHAR(32),
  contact_person VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  sla_hours INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('Client', 'Operator', 'Agent', 'Admin')),
  role_label VARCHAR(64) NOT NULL,
  initials VARCHAR(8) NOT NULL,
  company VARCHAR(255) NOT NULL DEFAULT 'WorkFlow Support',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  title TEXT,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255),
  created_by_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  assignee_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  assignee_name VARCHAR(255) NOT NULL DEFAULT 'Не назначен',
  status VARCHAR(32) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'in-progress', 'waiting', 'escalated', 'resolved', 'closed')),
  priority VARCHAR(32) NOT NULL DEFAULT 'normal' CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  category_name VARCHAR(255) NOT NULL DEFAULT 'Доступ и учётные записи',
  created_at_label VARCHAR(128) NOT NULL,
  due_at_label VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  resolution_summary TEXT,
  waiting_reason TEXT,
  closing_reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_comments (
  id VARCHAR(64) PRIMARY KEY,
  request_id VARCHAR(64) NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  author_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NOT NULL,
  time_label VARCHAR(32) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_timeline (
  id VARCHAR(64) PRIMARY KEY,
  request_id VARCHAR(64) NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  time_label VARCHAR(32) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_attachments (
  id VARCHAR(64) PRIMARY KEY,
  request_id VARCHAR(64) NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size_label VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_customer_name ON requests(customer_name);
CREATE INDEX IF NOT EXISTS idx_requests_assignee_name ON requests(assignee_name);
`

export interface PostgresConnectionConfig {
  connectionString: string
  ssl: boolean
}

export function getPostgresConfig(): PostgresConnectionConfig {
  const envObj = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env || {}
  const connectionString =
    envObj.DATABASE_URL ||
    envObj.NUXT_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/workflow'
  return {
    connectionString,
    ssl: envObj.PGSSLMODE === 'require'
  }
}
