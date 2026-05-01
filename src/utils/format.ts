/**
 * Format price in Nicaraguan Córdobas
 */
export function formatCordobas(amount: number): string {
  return `C$${amount}`;
}

/**
 * Format departure time for display
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-NI', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) {
    return 'Hoy';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Mañana';
  }

  return date.toLocaleDateString('es-NI', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Format relative date + time for reservation cards
 */
export function formatRelativeDateTime(dateString: string): string {
  const dateLabel = formatDate(dateString);
  const timeLabel = formatTime(dateString);
  return `${dateLabel} ${timeLabel}`;
}

export function getNicaraguaLocalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const localDigits = digits.startsWith('505') && digits.length > 8 ? digits.slice(3) : digits;
  return localDigits.slice(0, 8);
}

export function formatNicaraguaPhoneInput(phone: string): string {
  const localDigits = getNicaraguaLocalPhone(phone);
  if (localDigits.length <= 4) return localDigits;
  return `${localDigits.slice(0, 4)} ${localDigits.slice(4)}`;
}

export function toNicaraguaPhoneStorage(phone: string): string | null {
  const localDigits = getNicaraguaLocalPhone(phone);
  if (localDigits.length !== 8) return null;
  return `+505${localDigits}`;
}

export function formatNicaraguaPhoneDisplay(phone: string): string {
  const localDigits = getNicaraguaLocalPhone(phone);
  if (localDigits.length !== 8) return phone;
  return `+505 ${localDigits.slice(0, 4)} ${localDigits.slice(4)}`;
}

/**
 * Generate WhatsApp deep link
 */
export function getWhatsAppUrl(phone: string, message?: string): string {
  const nicaraguaPhone = toNicaraguaPhoneStorage(phone);
  const cleaned = (nicaraguaPhone ?? phone).replace(/\D/g, '');
  const msg = message ? `&text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${cleaned}?${msg}`;
}

/**
 * Get initials from a full name
 */
export function getInitials(name: string | null): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
