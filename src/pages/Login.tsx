import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { BawangLogo } from '../components/BawangLogo';

export default function Login() {
  const { user, signIn, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neo-primary px-4 border-[12px] border-black">
      <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-neo-pink border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3 hover:rotate-0 transition-transform">
          <BawangLogo className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-black mb-2 tracking-tight uppercase" style={{ letterSpacing: "-0.05em" }}>Masuk ke BawangHub</h1>
        <p className="text-black font-medium mb-8 border-b-4 border-black pb-6">
          Masuk untuk menyimpan riwayat panen dan analisis klinik bawang Anda.
        </p>
        <button
          onClick={signIn}
          className="w-full bg-white border-4 border-black text-black font-black py-4 px-4 flex items-center justify-center gap-3 transition-all mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-neo-yellow hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none uppercase tracking-wide text-lg"
        >
          <svg className="w-6 h-6 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-1 bg-white" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Gunakan Google
        </button>
        <a href="/" className="inline-block text-sm font-black text-black uppercase bg-neo-green border-2 border-black px-4 py-2 hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all active:translate-y-[2px] active:shadow-none">
          Lanjutkan tanpa masuk &rarr;
        </a>
      </div>
    </div>
  );
}
