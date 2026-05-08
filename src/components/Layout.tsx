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
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-full">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <BawangLogo className="w-6 h-6 text-rose-600 mr-2" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">BawangHub</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {user ? (
          <div className="p-4 border-t border-gray-200">
            <Link 
              to="/profil" 
              className={cn("flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1", location.pathname === '/profil' ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900")}
            >
              <UserCircle className={cn("mr-3 flex-shrink-0 h-5 w-5", location.pathname === '/profil' ? "text-green-600" : "text-gray-400")} /> Profil Saya
            </Link>
            <button 
              onClick={logOut}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-500" /> Keluar
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200">
            <Link 
              to="/login" 
              className="flex items-center justify-center w-full px-3 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
            >
               Masuk / Daftar
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="md:hidden h-16 border-b border-gray-200 bg-white flex items-center px-4 shrink-0">
          <BawangLogo className="w-6 h-6 text-rose-600 mr-2" />
          <span className="text-xl font-bold text-gray-900 tracking-tight">BawangHub</span>
        </div>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
