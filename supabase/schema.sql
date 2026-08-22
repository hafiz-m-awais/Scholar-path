-- PhD OS — Complete Database Migration
-- Run this entire file in your Supabase SQL Editor

-- ─────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────
-- M2: APPLICATIONS
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS applications (
  id                     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_name        TEXT         NOT NULL,
  program_name           TEXT         NOT NULL,
  department             TEXT,
  country                TEXT,
  city                   TEXT,
  degree_type            TEXT         DEFAULT 'PhD'
                                      CHECK (degree_type IN ('PhD', 'MSc', 'Other')),
  intake                 TEXT,
  application_deadline   DATE,
  scholarship_deadline   DATE,
  application_portal_url TEXT,
  university_url         TEXT,
  application_fee        NUMERIC(10,2),
  fee_currency           TEXT         DEFAULT 'USD',
  funding_type           TEXT         DEFAULT 'unknown'
                                      CHECK (funding_type IN (
                                        'fully_funded','partially_funded',
                                        'self_funded','unknown'
                                      )),
  funding_notes          TEXT,
  priority               TEXT         DEFAULT 'medium'
                                      CHECK (priority IN ('low','medium','high')),
  status                 TEXT         DEFAULT 'researching'
                                      CHECK (status IN (
                                        'researching','preparing','submitted',
                                        'interview','accepted','rejected','withdrawn'
                                      )),
  phd_description        TEXT,
  notes                  TEXT,
  created_at             TIMESTAMPTZ  DEFAULT NOW(),
  updated_at             TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- M3: SUPERVISORS
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS supervisors (
  id                 UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               TEXT         NOT NULL,
  university_name    TEXT,
  department         TEXT,
  research_interests TEXT[],
  email              TEXT,
  website_url        TEXT,
  google_scholar_url TEXT,
  lab_url            TEXT,
  contact_status     TEXT         DEFAULT 'not_contacted'
                                  CHECK (contact_status IN (
                                    'not_contacted','email_sent','awaiting_response',
                                    'replied','interested','meeting_scheduled','no_response'
                                  )),
  last_contacted_at  DATE,
  notes              TEXT,
  created_at         TIMESTAMPTZ  DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supervisor_applications (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  supervisor_id    UUID         NOT NULL REFERENCES supervisors(id) ON DELETE CASCADE,
  application_id   UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  notes            TEXT,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(supervisor_id, application_id)
);

CREATE TABLE IF NOT EXISTS supervisor_communications (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supervisor_id    UUID         NOT NULL REFERENCES supervisors(id) ON DELETE CASCADE,
  application_id   UUID         REFERENCES applications(id) ON DELETE SET NULL,
  type             TEXT         NOT NULL
                                CHECK (type IN (
                                  'email_sent','reply_received','follow_up_sent',
                                  'meeting','call','note'
                                )),
  date             DATE         NOT NULL DEFAULT CURRENT_DATE,
  subject          TEXT,
  summary          TEXT,
  follow_up_date   DATE,
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- M4: DOCUMENTS
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS documents (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT         NOT NULL,
  type            TEXT         NOT NULL
                               CHECK (type IN (
                                 'cv','sop','research_statement','cover_letter',
                                 'transcript','degree_certificate','passport',
                                 'recommendation_letter','english_test',
                                 'research_proposal','email_template','other'
                               )),
  version_label   TEXT         DEFAULT 'v1',
  file_path       TEXT         NOT NULL,
  file_name       TEXT         NOT NULL,
  file_size       BIGINT,
  mime_type       TEXT,
  notes           TEXT,
  tags            TEXT[],
  is_active       BOOLEAN      DEFAULT FALSE,
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_documents (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_id     UUID         REFERENCES documents(id) ON DELETE SET NULL,
  document_type   TEXT         NOT NULL,
  is_required     BOOLEAN      DEFAULT TRUE,
  is_not_needed   BOOLEAN      DEFAULT FALSE,
  status          TEXT         DEFAULT 'missing'
                               CHECK (status IN ('missing','attached','submitted','not_needed')),
  submitted_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- M5: TASKS & DEADLINES
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id   UUID         REFERENCES applications(id) ON DELETE SET NULL,
  title            TEXT         NOT NULL,
  description      TEXT,
  priority         TEXT         DEFAULT 'medium'
                                CHECK (priority IN ('low','medium','high')),
  status           TEXT         DEFAULT 'pending'
                                CHECK (status IN ('pending','in_progress','completed')),
  due_date         DATE,
  completed_at     TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deadlines (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id   UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type             TEXT         NOT NULL
                                CHECK (type IN (
                                  'application','scholarship','recommendation',
                                  'document','interview','follow_up','other'
                                )),
  label            TEXT         NOT NULL,
  date             DATE         NOT NULL,
  reminder_days    INTEGER[]    DEFAULT '{14,7,3,1}',
  notes            TEXT,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- M6: EMAIL
-- Note: Using plain text columns for tokens (encrypt in production via RPC)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_accounts (
  id                       UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address            TEXT         NOT NULL,
  provider                 TEXT         DEFAULT 'gmail'
                                        CHECK (provider IN ('gmail','outlook')),
  access_token_plain       TEXT,
  refresh_token_plain      TEXT,
  access_token_encrypted   BYTEA,
  refresh_token_encrypted  BYTEA,
  token_expires_at         TIMESTAMPTZ,
  scopes                   TEXT[],
  is_connected             BOOLEAN      DEFAULT FALSE,
  connected_at             TIMESTAMPTZ,
  last_used_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS sent_emails (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id    UUID         REFERENCES applications(id) ON DELETE SET NULL,
  supervisor_id     UUID         REFERENCES supervisors(id) ON DELETE SET NULL,
  direction         TEXT         NOT NULL DEFAULT 'sent'
                                 CHECK (direction IN ('sent','received')),
  to_email          TEXT         NOT NULL,
  to_name           TEXT,
  subject           TEXT         NOT NULL,
  body_text         TEXT,
  body_html         TEXT,
  attachments       JSONB        DEFAULT '[]',
  sent_at           TIMESTAMPTZ  DEFAULT NOW(),
  gmail_message_id  TEXT,
  follow_up_date    DATE,
  follow_up_done    BOOLEAN      DEFAULT FALSE,
  template_used     TEXT,
  created_at        TIMESTAMPTZ  DEFAULT NOW()
);

-- Migration for pre-existing databases where sent_emails was created before
-- the `direction` column was introduced (safe to re-run).
ALTER TABLE sent_emails ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'sent';
ALTER TABLE sent_emails DROP CONSTRAINT IF EXISTS sent_emails_direction_check;
ALTER TABLE sent_emails ADD CONSTRAINT sent_emails_direction_check CHECK (direction IN ('sent','received'));

CREATE TABLE IF NOT EXISTS email_templates (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT         NOT NULL,
  type             TEXT         CHECK (type IN (
                                  'inquiry','follow_up','thank_you',
                                  'status_request','other'
                                )),
  subject_template TEXT         NOT NULL,
  body_template    TEXT         NOT NULL,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- M7: SUBMISSIONS
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS submission_logs (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id   UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  supervisor_id    UUID         REFERENCES supervisors(id) ON DELETE SET NULL,
  sent_to_label    TEXT         NOT NULL,
  method           TEXT         NOT NULL
                                CHECK (method IN (
                                  'email','portal','post','hand_delivered','other'
                                )),
  sent_at          DATE         NOT NULL DEFAULT CURRENT_DATE,
  confirmed        BOOLEAN      DEFAULT FALSE,
  notes            TEXT,
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_documents (
  id                      UUID   PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_log_id       UUID   NOT NULL REFERENCES submission_logs(id) ON DELETE CASCADE,
  document_id             UUID   REFERENCES documents(id) ON DELETE SET NULL,
  document_name_snapshot  TEXT   NOT NULL,
  document_version_label  TEXT
);

-- ─────────────────────────────────────────────────────────
-- M8: PORTAL
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS application_links (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id   UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label            TEXT         NOT NULL,
  url              TEXT         NOT NULL,
  notes            TEXT,
  pinned           BOOLEAN      DEFAULT FALSE,
  sort_order       INTEGER      DEFAULT 0,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_credentials (
  id                         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id             UUID         NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id                    UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portal_url                 TEXT,
  username                   TEXT,
  password_encrypted         BYTEA,
  application_reference_id   TEXT,
  pin_encrypted              BYTEA,
  security_question          TEXT,
  security_answer_encrypted  BYTEA,
  notes                      TEXT,
  status                     TEXT         DEFAULT 'not_created'
                                          CHECK (status IN (
                                            'not_created','active','submitted','expired'
                                          )),
  last_used_at               TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ  DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- M10: SETTINGS
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_settings (
  id                     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name           TEXT,
  deadline_reminder_days INTEGER[]    DEFAULT '{14,7,3,1}',
  follow_up_reminders    BOOLEAN      DEFAULT TRUE,
  missing_doc_reminders  BOOLEAN      DEFAULT TRUE,
  theme                  TEXT         DEFAULT 'system'
                                      CHECK (theme IN ('light','dark','system')),
  created_at             TIMESTAMPTZ  DEFAULT NOW(),
  updated_at             TIMESTAMPTZ  DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────

ALTER TABLE applications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors               ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisor_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_emails               ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_links         ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_credentials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings             ENABLE ROW LEVEL SECURITY;

-- User-owned policies
DROP POLICY IF EXISTS "user_owns_applications"      ON applications;
CREATE POLICY "user_owns_applications"      ON applications      FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_supervisors"       ON supervisors;
CREATE POLICY "user_owns_supervisors"       ON supervisors       FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_sup_comms"         ON supervisor_communications;
CREATE POLICY "user_owns_sup_comms"         ON supervisor_communications FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_documents"         ON documents;
CREATE POLICY "user_owns_documents"         ON documents         FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_tasks"             ON tasks;
CREATE POLICY "user_owns_tasks"             ON tasks             FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_deadlines"         ON deadlines;
CREATE POLICY "user_owns_deadlines"         ON deadlines         FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_email_accounts"    ON email_accounts;
CREATE POLICY "user_owns_email_accounts"    ON email_accounts    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_sent_emails"       ON sent_emails;
CREATE POLICY "user_owns_sent_emails"       ON sent_emails       FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_email_templates"   ON email_templates;
CREATE POLICY "user_owns_email_templates"   ON email_templates   FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_submission_logs"   ON submission_logs;
CREATE POLICY "user_owns_submission_logs"   ON submission_logs   FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_app_links"         ON application_links;
CREATE POLICY "user_owns_app_links"         ON application_links FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_portal_creds"      ON portal_credentials;
CREATE POLICY "user_owns_portal_creds"      ON portal_credentials FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_owns_settings"          ON user_settings;
CREATE POLICY "user_owns_settings"          ON user_settings     FOR ALL USING (auth.uid() = user_id);

-- Junction table policies via parent
DROP POLICY IF EXISTS "user_owns_supervisor_applications" ON supervisor_applications;
CREATE POLICY "user_owns_supervisor_applications" ON supervisor_applications
  FOR ALL USING (
    supervisor_id IN (SELECT id FROM supervisors WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "user_owns_application_documents" ON application_documents;
CREATE POLICY "user_owns_application_documents" ON application_documents
  FOR ALL USING (
    application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "user_owns_submission_documents" ON submission_documents;
CREATE POLICY "user_owns_submission_documents" ON submission_documents
  FOR ALL USING (
    submission_log_id IN (SELECT id FROM submission_logs WHERE user_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_applications_user_id    ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status     ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_deadline   ON applications(application_deadline);
CREATE INDEX IF NOT EXISTS idx_supervisors_user_id     ON supervisors(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id       ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type          ON documents(type);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id           ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date          ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_date          ON deadlines(date);
CREATE INDEX IF NOT EXISTS idx_sent_emails_follow_up   ON sent_emails(follow_up_date) WHERE follow_up_done = FALSE;
CREATE INDEX IF NOT EXISTS idx_submission_logs_app     ON submission_logs(application_id);

-- ─────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'applications','supervisors','documents','application_documents',
    'tasks','deadlines','email_templates','application_links',
    'portal_credentials','user_settings'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %s;
       CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t, t, t
    );
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────────────────
-- DEFAULT EMAIL TEMPLATES (run once)
-- ─────────────────────────────────────────────────────────
-- Insert templates for the first user (run after creating your account)
-- UPDATE the user_id below with your actual Supabase Auth user UUID.

-- INSERT INTO email_templates (user_id, name, type, subject_template, body_template)
-- VALUES
--   ('<your-user-id>', 'Initial Supervisor Inquiry', 'inquiry',
--    'PhD Application Inquiry – {{program}} at {{university}}',
--    E'Dear Professor {{professor_name}},\n\nI am writing to express my interest in pursuing a PhD under your supervision at {{university}}...\n\nBest regards'),
--   ('<your-user-id>', 'Follow-up Email (7-day)', 'follow_up',
--    'Follow-up: PhD Application Inquiry',
--    E'Dear Professor {{professor_name}},\n\nI hope this message finds you well. I wanted to follow up on my previous email...\n\nBest regards'),
--   ('<your-user-id>', 'Thank You Email', 'thank_you',
--    'Thank You – {{university}} Discussion',
--    E'Dear Professor {{professor_name}},\n\nThank you for taking the time to speak with me...\n\nBest regards');

-- ─────────────────────────────────────────────────────────
-- Supabase Storage: Create private bucket
-- Run in Supabase Dashboard > Storage > New Bucket
--   Name: documents
--   Public: NO (private)
-- ─────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────
-- MIGRATIONS: Feature Upgrades (safe to re-run)
-- ─────────────────────────────────────────────────────────

-- Email Tracking: unique pixel ID + read receipt timestamp
ALTER TABLE sent_emails ADD COLUMN IF NOT EXISTS tracking_id   UUID        DEFAULT uuid_generate_v4() UNIQUE;
ALTER TABLE sent_emails ADD COLUMN IF NOT EXISTS read_at       TIMESTAMPTZ;

-- Schedule Send: when to send + current status
ALTER TABLE sent_emails ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
ALTER TABLE sent_emails ADD COLUMN IF NOT EXISTS status        TEXT        NOT NULL DEFAULT 'sent';
ALTER TABLE sent_emails DROP CONSTRAINT IF EXISTS sent_emails_status_check;
ALTER TABLE sent_emails ADD  CONSTRAINT sent_emails_status_check
  CHECK (status IN ('sent','scheduled','failed'));

-- Document Versioning: link new versions to their parent document
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES documents(id) ON DELETE SET NULL;

-- Index to quickly find scheduled emails due to be sent
CREATE INDEX IF NOT EXISTS idx_sent_emails_scheduled ON sent_emails(scheduled_for)
  WHERE status = 'scheduled';
