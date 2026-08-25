-- Nothing previously verified that output_value was actually the correct conversion of
-- input_value — a client could insert any fabricated pair. This closes that gap at the
-- database layer, independent of what the frontend computes.

-- drop-then-add: safe to run this migration again against an already-set-up database.
alter table public.conversions
  drop constraint if exists conversions_math_checks_out;

alter table public.conversions
  add constraint conversions_math_checks_out check (
    abs(
      output_value - (
        case
          when input_unit = 'km' then input_value / 1.609344
          else input_value * 1.609344
        end
      )
    ) < 0.001
  );
