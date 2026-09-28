CREATE OR REPLACE FUNCTION public.prevent_match_on_unavailable_fixture()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  fixture_status text;
BEGIN
  SELECT status
  INTO fixture_status
  FROM public.fixtures
  WHERE id = NEW.fixture_id;

  IF fixture_status IN ('postponed', 'cancelled') THEN
    RAISE EXCEPTION
      'Cannot add a match to a % fixture.',
      fixture_status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_match_on_unavailable_fixture
ON public.matches;

CREATE TRIGGER prevent_match_on_unavailable_fixture
BEFORE INSERT OR UPDATE OF fixture_id
ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.prevent_match_on_unavailable_fixture();