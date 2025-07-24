import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { User } from 'lucide-react';

interface AvatarWithProfileProps {
  contactNumber: string;
  contactName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  enabled?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export const AvatarWithProfile: React.FC<AvatarWithProfileProps> = ({
  contactNumber,
  contactName,
  size = 'md',
  className = '',
  enabled = true,
}) => {
  const { url, loading, error } = useProfilePicture({ 
    contactNumber, 
    enabled: enabled && !!contactNumber 
  });

  // Gerar iniciais do nome com validação
  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return '?';
    }
    
    return name
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = contactName || 'Usuário';
  const initials = getInitials(contactName);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {url && !error ? (
        <AvatarImage 
          src={url} 
          alt={`Foto de perfil de ${displayName}`}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="bg-pharmacy-accent/10 text-pharmacy-accent">
        {loading ? (
          <div className="animate-pulse">
            <User className="h-4 w-4" />
          </div>
        ) : (
          initials || <User className="h-4 w-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};