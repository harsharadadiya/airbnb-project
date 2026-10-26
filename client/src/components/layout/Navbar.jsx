import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarCheck, LayoutDashboard, LogIn, LogOut, Menu, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/common/UserAvatar';
import Logo from './Logo';

export default function Navbar() {
  const { user, isHost, logout, becomeHost } = useAuth();
  const navigate = useNavigate();

  async function handleBecomeHost() {
    try {
      await becomeHost();
      toast.success('Hosting turned on. Let’s create your first listing!');
      navigate('/host/listings/new');
    } catch (error) {
      toast.error(error.message);
    }
  }

  function handleLogout() {
    logout();
    toast.success('You are logged out');
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-[1100] border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="flex items-center gap-2">
          {user && isHost && (
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link to="/host">Host dashboard</Link>
            </Button>
          )}
          {user && !isHost && (
            <Button variant="ghost" className="hidden md:inline-flex" onClick={handleBecomeHost}>
              Become a host
            </Button>
          )}
          {!user && (
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link to="/register?role=host">Become a host</Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex cursor-pointer items-center gap-2.5 rounded-full border py-1 pr-1 pl-3 shadow-xs transition hover:shadow-md"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
                <UserAvatar user={user} className="size-8" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {user ? (
                <>
                  <DropdownMenuLabel>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate('/trips')}>
                    <CalendarCheck /> My trips
                  </DropdownMenuItem>
                  {isHost ? (
                    <>
                      <DropdownMenuItem onSelect={() => navigate('/host')}>
                        <LayoutDashboard /> Host dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate('/host/listings/new')}>
                        <Plus /> Create a listing
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onSelect={handleBecomeHost}>
                      <Plus /> Become a host
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut /> Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => navigate('/login')}>
                    <LogIn /> Log in
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate('/register')}>
                    <UserPlus /> Sign up
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
