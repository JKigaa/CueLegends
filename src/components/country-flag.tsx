import type { ComponentProps } from 'react';
import * as Flags from 'country-flag-icons/react/3x2';

type CountryFlagProps = ComponentProps<typeof Flags.KE> & {
  isoCode: string | null | undefined;
};

export function CountryFlag({ isoCode, ...props }: CountryFlagProps) {
  if (!isoCode) return null;

  const code = isoCode.toUpperCase() as keyof typeof Flags;
  const Flag = Flags[code];

  if (!Flag) return null;

  return <Flag {...props} />;
}
