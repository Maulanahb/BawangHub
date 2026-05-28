import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, LeafyGreen, Calculator, CalendarDays, BookOpen, BarChart3, MessageSquare, UserCircle, LogOut, Bot, ShieldAlert, Menu, X, ChevronLeft, Image as ImageIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "./AuthProvider";
import { JavaneseFarmerSVG } from "./Illustrations";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logOut, isAdmin } = useAuth();

  const baseNavigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Klinik Bawang", href: "/klinik", icon: LeafyGreen },
    { name: "Galeri", href: "/galeri", icon: ImageIcon },
    { name: "Kalkulator Panen", href: "/kalkulator", icon: Calculator },
    { name: "Jadwal Tanam", href: "/jadwal", icon: CalendarDays },
    { name: "Buku Tani", href: "/bukutani", icon: BookOpen },
    { name: "Statistik", href: "/statistik", icon: BarChart3 },
    { name: "Forum Tani", href: "/forum", icon: MessageSquare },
    { name: "Tanya Agri AI", href: "/tanya-ai", icon: Bot },
  ];

  const navigation = isAdmin 
    ? [...baseNavigation, { name: "Admin Panel", href: "/admin", icon: ShieldAlert }]
    : baseNavigation;

  // Toggle mobile menu
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  // Close menu when navigation occurs
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Determine if we should show back button on mobile. 
  // It shouldn't be shown on the home page or main top-level nav pages optimally,
  // but for simplicity, let's show back button if path is not root and it has a depth > 1 or specific screens.
  const pathLevel = location.pathname.split('/').filter(Boolean).length;
  const isTopLevelNav = navigation.some(item => item.href === location.pathname);
  const showBackButton = pathLevel > 0 && !isTopLevelNav;

  return (
    <div className="h-screen w-full bg-agri-bg flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden block"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 flex flex-col h-full z-50 transition-transform duration-300 ease-in-out fixed md:relative w-64 md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-800 tracking-tight">BawangHub</span>
          </div>
          <button onClick={closeMobileMenu} className="md:hidden text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = item.href === "/" 
              ? location.pathname === "/"
              : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-agri-green-light text-agri-green-dark"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-agri-green-dark" : "text-gray-400"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {item.name}
              </Link>
            );
          })}
          
        </nav>
        
        {user ? (
          <div className="p-4 border-t border-gray-200 bg-white shrink-0">
            <div className="px-3 mb-4">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName || 'Petani Bawang'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
            <Link 
              to="/profil" 
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center px-3 py-3 rounded-xl text-sm font-medium mb-2 transition-all", 
                location.pathname.startsWith('/profil') 
                  ? "bg-agri-green-light text-agri-green-dark" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <UserCircle className={cn("mr-3 flex-shrink-0 h-5 w-5", location.pathname.startsWith('/profil') ? "text-agri-green-dark" : "text-gray-400")} strokeWidth={location.pathname.startsWith('/profil') ? 2 : 1.5} /> Profil Saya
            </Link>
            <button 
              onClick={() => { logOut(); closeMobileMenu(); }}
              className="flex items-center w-full px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-500" strokeWidth={1.5}/> Keluar
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200 bg-white shrink-0">
            <Link 
              to="/login" 
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-agri-green hover:bg-agri-green-dark shadow-sm transition-all"
            >
               Masuk / Daftar
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="md:hidden h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 shadow-sm relative z-20 w-full">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button 
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={toggleMobileMenu} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-800 tracking-tight leading-none pt-1">BawangHub</span>
            </div>
          </div>
        </div>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
