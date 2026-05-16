import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, LeafyGreen, Calculator, CalendarDays, BookOpen, BarChart3, MessageSquare, UserCircle, LogOut, Bot, ShieldAlert, Menu, X, ChevronLeft, Image as ImageIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "./AuthProvider";
import { BawangLogo } from "./BawangLogo";
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
    <div className="h-screen w-full bg-neo-bg flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden block"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r-4 border-black flex flex-col h-full z-50 transition-transform duration-300 ease-in-out fixed md:relative w-64 md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b-4 border-black bg-neo-accent shrink-0">
          <div className="flex items-center">
            <BawangLogo className="w-6 h-6 text-black mr-2" />
            <span className="text-2xl font-bold text-black tracking-tight" style={{ letterSpacing: "-0.05em" }}>BawangHub</span>
          </div>
          <button onClick={closeMobileMenu} className="md:hidden">
            <X className="w-6 h-6 text-black" />
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
                  "flex items-center px-3 py-3 text-sm font-black border-2 transition-all",
                  isActive
                    ? "bg-neo-yellow border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]"
                    : "border-transparent text-black hover:bg-neo-primary hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px]"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-black" : "text-black"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.name}
              </Link>
            );
          })}
          
          {/* Decorative Vector Graphic Placement (Sidebar Bottom) */}
          <div className="mt-8 mb-4 border-2 border-black bg-[#FFEAA7] p-4 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-neo-yellow opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white border-2 border-black rounded-xl mb-3 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-3 group-hover:rotate-0 transition-all">
                 <JavaneseFarmerSVG className="w-16 h-16" />
              </div>
              <p className="font-black text-black text-sm uppercase">Agri AI</p>
              <p className="text-xs font-bold text-gray-700 mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">Asisten Petani Lokal</p>
            </div>
          </div>
        </nav>
        
        {user ? (
          <div className="p-4 border-t-4 border-black bg-white shrink-0">
            <Link 
              to="/profil" 
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center px-3 py-3 text-sm font-black border-2 mb-2 transition-all", 
                location.pathname.startsWith('/profil') 
                  ? "bg-neo-yellow border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]" 
                  : "border-transparent text-black hover:bg-neo-primary hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[2px] hover:-translate-y-[2px]"
              )}
            >
              <UserCircle className="mr-3 flex-shrink-0 h-5 w-5 text-black" strokeWidth={location.pathname.startsWith('/profil') ? 2.5 : 2} /> Profil Saya
            </Link>
            <button 
              onClick={() => { logOut(); closeMobileMenu(); }}
              className="flex items-center w-full px-3 py-3 text-sm font-bold border-2 border-transparent text-black hover:bg-red-400 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-black" strokeWidth={2.5}/> Keluar
            </button>
          </div>
        ) : (
          <div className="p-4 border-t-4 border-black bg-neo-primary shrink-0">
            <Link 
              to="/login" 
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-full px-3 py-3 text-sm font-bold text-black border-2 border-black bg-neo-accent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
               Masuk / Daftar
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="md:hidden h-16 border-b-4 border-black bg-neo-accent flex items-center justify-between px-4 shrink-0 shadow-sm relative z-20 w-full">
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button 
                onClick={() => navigate(-1)}
                className="p-1 border-2 border-black rounded-full bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <ChevronLeft className="w-5 h-5 text-black" />
              </button>
            ) : (
              <button onClick={toggleMobileMenu} className="p-1 border-2 border-black rounded bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                <Menu className="w-5 h-5 text-black" />
              </button>
            )}
            <div className="flex items-center">
              <span className="text-xl font-bold text-black tracking-tight leading-none pt-1">BawangHub</span>
            </div>
          </div>
          <BawangLogo className="w-6 h-6 text-black" />
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
