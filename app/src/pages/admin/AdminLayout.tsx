import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Gift,
  Shield,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Wallet,
  FileText,
  AlertCircle,
  ChevronDown,
  UserCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/services/api';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Live Wall', href: '/admin/live-wall', icon: Eye },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Transactions', href: '/admin/transactions', icon: CreditCard },
  { name: 'Gift Cards', href: '/admin/giftcards', icon: Gift },
  { name: 'Admin Wallet', href: '/admin/wallet', icon: Wallet },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
  { name: 'Appeals', href: '/admin/appeals', icon: AlertCircle },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [pendingCounts, setPendingCounts] = useState({
    transactions: 0,
    giftCards: 0,
    appeals: 0,
  });

  useEffect(() => {
    // Check admin authentication
    const token = localStorage.getItem('gcp_admin_token');
    const adminData = localStorage.getItem('gcp_admin_user');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (adminData) {
      setAdminUser(JSON.parse(adminData));
    }

    // Fetch pending counts
    fetchPendingCounts();
    const interval = setInterval(fetchPendingCounts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchPendingCounts = async () => {
    try {
      const [txRes, gcRes, appealRes] = await Promise.all([
        api.get('/admin/transactions?status=PENDING&limit=1'),
        api.get('/admin/giftcards?status=PENDING&limit=1'),
        api.get('/admin/appeals?status=PENDING&limit=1'),
      ]);

      setPendingCounts({
        transactions: txRes.data.data.pagination?.total || 0,
        giftCards: gcRes.data.data.pagination?.total || 0,
        appeals: appealRes.data.data.pagination?.total || 0,
      });
    } catch (err) {
      console.error('Failed to fetch pending counts:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gcp_admin_token');
    localStorage.removeItem('gcp_admin_user');
    navigate('/admin/login');
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const getNavItemCount = (href: string) => {
    if (href === '/admin/transactions') return pendingCounts.transactions;
    if (href === '/admin/giftcards') return pendingCounts.giftCards;
    if (href === '/admin/appeals') return pendingCounts.appeals;
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white">Admin</span>
              <span className="text-xs text-slate-400 block">Control Center</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const count = getNavItemCount(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </div>
                {count > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {count > 99 ? '99+' : count}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {adminUser?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-slate-400 truncate">{adminUser?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="h-16 bg-slate-800/50 backdrop-blur border-b border-slate-700 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {navigation.find((n) => isActive(n.href))?.name || 'Admin Panel'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  {(pendingCounts.transactions + pendingCounts.giftCards + pendingCounts.appeals) > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {pendingCounts.transactions > 0 && (
                  <DropdownMenuItem className="text-slate-300 cursor-pointer" onClick={() => navigate('/admin/transactions')}>
                    <CreditCard className="w-4 h-4 mr-2 text-amber-500" />
                    {pendingCounts.transactions} pending transactions
                  </DropdownMenuItem>
                )}
                {pendingCounts.giftCards > 0 && (
                  <DropdownMenuItem className="text-slate-300 cursor-pointer" onClick={() => navigate('/admin/giftcards')}>
                    <Gift className="w-4 h-4 mr-2 text-amber-500" />
                    {pendingCounts.giftCards} pending gift cards
                  </DropdownMenuItem>
                )}
                {pendingCounts.appeals > 0 && (
                  <DropdownMenuItem className="text-slate-300 cursor-pointer" onClick={() => navigate('/admin/appeals')}>
                    <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                    {pendingCounts.appeals} pending appeals
                  </DropdownMenuItem>
                )}
                {(pendingCounts.transactions + pendingCounts.giftCards + pendingCounts.appeals) === 0 && (
                  <DropdownMenuItem className="text-slate-500" disabled>
                    No pending notifications
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {adminUser?.fullName?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 hidden lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-white">
                  <div>{adminUser?.fullName}</div>
                  <div className="text-xs text-slate-400 font-normal">{adminUser?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  className="text-slate-300 cursor-pointer"
                  onClick={() => navigate('/admin/settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-400 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
