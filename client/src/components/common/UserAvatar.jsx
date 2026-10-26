import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initials } from '@/lib/format';

export default function UserAvatar({ user, className }) {
  return (
    <Avatar className={className}>
      {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
      <AvatarFallback>{initials(user?.name) || '?'}</AvatarFallback>
    </Avatar>
  );
}
