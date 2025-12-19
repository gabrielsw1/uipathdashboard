import { format, subDays, startOfDay, endOfDay, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: string | Date | undefined, formatStr: string = 'dd/MM/yyyy HH:mm'): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    
    return format(dateObj, formatStr, { locale: ptBR });
  } catch {
    return '-';
  }
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds === 0) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function getDateRangePresets() {
  const today = new Date();
  
  return {
    today: {
      start: startOfDay(today).toISOString(),
      end: endOfDay(today).toISOString(),
    },
    last7Days: {
      start: startOfDay(subDays(today, 7)).toISOString(),
      end: endOfDay(today).toISOString(),
    },
    last30Days: {
      start: startOfDay(subDays(today, 30)).toISOString(),
      end: endOfDay(today).toISOString(),
    },
    last90Days: {
      start: startOfDay(subDays(today, 90)).toISOString(),
      end: endOfDay(today).toISOString(),
    },
  };
}

export function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'agora';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `há ${days} dia${days > 1 ? 's' : ''}`;
    }
  } catch {
    return '-';
  }
}

