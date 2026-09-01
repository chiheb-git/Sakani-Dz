import { Badge } from '@/components/ui/badge';
import { VendorStatus, SubscriptionStatus, PropertyStatus, ReportStatus, PasswordResetRequestStatus } from '@workspace/api-client-react';

interface StatusBadgeProps {
  status: VendorStatus | SubscriptionStatus | PropertyStatus | ReportStatus | PasswordResetRequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  
  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${config.className}`}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}

function getStatusConfig(status: string) {
  const configs: Record<string, { label: string; className: string }> = {
    // Vendor statuses
    pending: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-300' },
    active: { label: 'Actif', className: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    renewal_required: { label: 'Renouvellement requis', className: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
    blocked: { label: 'Bloqué', className: 'bg-red-50 text-red-700 border-red-300' },
    rejected: { label: 'Rejeté', className: 'bg-gray-100 text-gray-600 border-gray-300' },
    
    // Subscription statuses
    expired: { label: 'Expiré', className: 'bg-red-50 text-red-700 border-red-300' },
    cancelled: { label: 'Annulé', className: 'bg-gray-100 text-gray-600 border-gray-300' },
    
    // Property statuses
    available: { label: 'Disponible', className: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    rented: { label: 'Loué', className: 'bg-blue-50 text-blue-700 border-blue-300' },
    
    // Report statuses
    resolved: { label: 'Résolu', className: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    dismissed: { label: 'Rejeté', className: 'bg-gray-100 text-gray-600 border-gray-300' },
    
    // Password reset statuses
    approved: { label: 'Approuvé', className: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  };

  return configs[status] || { label: status, className: 'bg-gray-100 text-gray-600 border-gray-300' };
}
