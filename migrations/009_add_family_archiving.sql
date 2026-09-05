-- Add soft-archiving to families, replacing hard deletion.
-- Archived families are hidden from the public directory but keep all
-- their adults, children, and photos, so archiving is reversible.

ALTER TABLE families
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_families_status ON families(status);

COMMENT ON COLUMN families.status IS 'active = shown in directory; archived = hidden but retained';
COMMENT ON COLUMN families.archived_at IS 'When the family was archived; null while active';
