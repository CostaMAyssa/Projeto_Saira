
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 $2 $3-$4');
}

// Função para formatar timestamp com fuso horário brasileiro
export function formatMessageTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  
  // Usar fuso horário brasileiro (America/Sao_Paulo)
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
}

// Função para criar timestamp no fuso horário brasileiro
export function createBrazilianTimestamp(): string {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'America/Sao_Paulo'
  }).replace(' ', 'T') + '.000Z';
}
