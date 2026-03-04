type BadgeVariant =
  | 'active'
  | 'pending'
  | 'inactive'
  | 'premium'
  | 'basic'
  | 'revision'
  | 'verified'
  | 'rejected';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const variantMap: Record<BadgeVariant, { classes: string; defaultLabel: string }> = {
  active:   { classes: 'text-green-600 bg-green-50',    defaultLabel: 'Activo' },
  pending:  { classes: 'text-orange-500 bg-orange-50',  defaultLabel: 'Pendiente' },
  inactive: { classes: 'text-gray-500 bg-gray-100',     defaultLabel: 'Inactivo' },
  premium:  { classes: 'text-green-700 bg-green-100',   defaultLabel: 'Premium' },
  basic:    { classes: 'text-gray-500 bg-gray-100',     defaultLabel: 'Basic' },
  revision: { classes: 'text-amber-600 bg-amber-50 border border-amber-400', defaultLabel: 'En Revisión' },
  verified: { classes: 'text-green-600 bg-green-50',    defaultLabel: 'Verificado' },
  rejected: { classes: 'text-red-600 bg-red-50',        defaultLabel: 'Rechazado' },
};

export function Badge({ variant, label }: BadgeProps) {
  const { classes, defaultLabel } = variantMap[variant];
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {label ?? defaultLabel}
    </span>
  );
}