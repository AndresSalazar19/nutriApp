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
  active:   { classes: 'text-nutri-dark bg-nutri-light',    defaultLabel: 'Activo' },
  pending:  { classes: 'text-gray-600 bg-transparent border border-gray-400',  defaultLabel: 'Pendiente' },
  inactive: { classes: 'text-gray-500 bg-gray-100',     defaultLabel: 'Inactivo' },
  premium:  { classes: 'text-white bg-nutri-medium',   defaultLabel: 'Premium' },
  basic:    { classes: 'text-gray-500 bg-gray-100',     defaultLabel: 'Basic' },
  revision: { classes: 'text-amber-600 bg-amber-50 border border-amber-400', defaultLabel: 'En Revisión' },
  verified: { classes: 'text-nutri-dark bg-nutri-light',    defaultLabel: 'Verificado' },
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