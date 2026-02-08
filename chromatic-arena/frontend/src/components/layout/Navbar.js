import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Palette, LogOut, User, Moon, Sun, Menu, X,
  Home, Brush, Image, Trophy, ShoppingBag
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '../../AuthContext';
import { useTheme } from '../../ThemeContext';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/atelier', icon: Brush, label: 'Atelier' },
    { to: '/gallery', icon: Image, label: 'Gallery' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/shop', icon: ShoppingBag, label: 'Shop' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#1A1A2E]/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#FF8E53] flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <Palette className="w-6 h-6 text-white" />
            </motion.div>
            <span className="font-bold text-xl hidden sm:block">
              <span className="text-primary">Chromatic</span>
              <span className="text-secondary">Arena</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.to} to={link.to}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* User coins */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full">
                <span className="text-xl">🪙</span>
                <span className="font-bold text-accent">{user.coins || 0}</span>
              </div>
            )}

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            {/* User menu - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user?.avatar} alt={user?.username} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-[#FF8E53] text-white text-xs">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block">{user?.username}</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-border bg-white dark:bg-[#1A1A2E]"
        >
          <div className="px-4 py-4 space-y-2">
            {/* User info */}
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-[#FF8E53] text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{user?.username}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  🪙 {user?.coins || 0} coins
                </p>
              </div>
            </div>

            {/* Nav links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}

            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <User className="w-5 h-5" />
                Profile
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};