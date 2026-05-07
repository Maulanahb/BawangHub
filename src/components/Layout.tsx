import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Stethoscope, Calculator, Leaf, CalendarDays, BookOpen } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Klinik Bawang", href: "/klinik", icon: Stethoscope },
    { name: "Kalkulator Panen", href: "/kalkulator", icon: Calculator },
    { name: "Jadwal Tanam", href: "/jadwal", icon: CalendarDays },
    { name: "Buku Tani", href: "/bukutani", icon: BookOpen },
  ];

  return (
    <div className="h-screen w-full bg-neutral-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col h-full">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <Leaf className="w-6 h-6 text-green-600 mr-2" />
          <span className="text-xl font-bold text-neutral-900 tracking-tight">BawangHub</span>
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
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-green-600" : "text-neutral-400 group-hover:text-neutral-500"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="md:hidden h-16 border-b border-neutral-200 bg-white flex items-center px-4 shrink-0">
          <Leaf className="w-6 h-6 text-green-600 mr-2" />
          <span className="text-xl font-bold text-neutral-900 tracking-tight">BawangHub</span>
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
