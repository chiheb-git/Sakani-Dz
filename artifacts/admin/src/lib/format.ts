import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: fr });
  } catch {
    return '—';
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch {
    return '—';
  }
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/,/g, ' ') + ' DA';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
  }).format(num).replace(/,/g, ' ');
}
