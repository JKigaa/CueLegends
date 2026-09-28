-- Expand CueLegends fixture statuses.
-- Existing statuses remain valid; postponed and cancelled are added.

ALTER TABLE public.fixtures
  DROP CONSTRAINT IF EXISTS fixtures_status_check;

ALTER TABLE public.fixtures
  ADD CONSTRAINT fixtures_status_check
  CHECK (status IN ('scheduled', 'live', 'completed', 'postponed', 'cancelled'));
