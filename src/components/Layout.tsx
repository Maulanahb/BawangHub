import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, LeafyGreen, Calculator, CalendarDays, BookOpen, BarChart3, MessageSquare, UserCircle, LogOut } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "./AuthProvider";
import { BawangLogo } from "./BawangLogo";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();
  const { user, logOut } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Klinik Bawang", href: "/klinik", icon: LeafyGreen },
    { name: "Kalkulator Panen", href: "/kalkulator", icon: Calculator },
    { name: "Jadwal Tanam", href: "/jadwal", icon: CalendarDays },
    { name: "Buku Tani", href: "/bukutani", icon: BookOpen },
    { name: "Statistik", href: "/statistik", icon: BarChart3 },
    { name: "Forum Tani", href: "/forum", icon: MessageSquare },
  ];

  return (
    <div className="h-screen w-full bg-neo-bg flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r-4 border-black hidden md:flex flex-col h-full z-10">
        <div className="h-16 flex items-center px-6 border-b-4 border-black bg-neo-accent">
          <BawangLogo className="w-6 h-6 text-black mr-2" />
          <span className="text-2xl font-bold text-black tracking-tight" style={{ letterSpacing: "-0.05em" }}>BawangHub</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-bold border-2 border-transparent transition-all",
                  isActive
                    ? "bg-neo-yellow border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]"
                    : "text-black hover:bg-neo-primary hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
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
        </nav>
        
        {user ? (
          <div className="p-4 border-t-4 border-black bg-white">
            <Link 
              to="/profil" 
              className={cn("flex items-center px-3 py-3 text-sm font-bold border-2 border-transparent mb-2 transition-all", location.pathname === '/profil' ? "bg-neo-yellow border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "text-black hover:bg-neo-primary hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]")}
            >
              <UserCircle className={cn("mr-3 flex-shrink-0 h-5 w-5 text-black")} /> Profil Saya
            </Link>
            <button 
              onClick={logOut}
              className="flex items-center w-full px-3 py-3 text-sm font-bold border-2 border-transparent text-black hover:bg-red-400 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-black" strokeWidth={2.5}/> Keluar
            </button>
          </div>
        ) : (
          <div className="p-4 border-t-4 border-black bg-neo-primary">
            <Link 
              to="/login" 
              className="flex items-center justify-center w-full px-3 py-3 text-sm font-bold text-black border-2 border-black bg-neo-accent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
               Masuk / Daftar
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="md:hidden h-16 border-b-4 border-black bg-neo-accent flex items-center px-4 shrink-0 shadow-sm relative z-10 w-full">
          <BawangLogo className="w-6 h-6 text-black mr-2" />
          <span className="text-2xl font-bold text-black tracking-tight">BawangHub</span>
        </div>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
