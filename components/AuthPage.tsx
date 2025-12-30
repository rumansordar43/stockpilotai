
import React, { useState } from 'react';
import { User } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMsg(null);
      setLoading(true);

      // MOCK AUTH LOGIC using LocalStorage
      try {
          // Get current users from storage
          const storedUsers = localStorage.getItem('mock_users');
          const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

          if (isLogin) {
              const user = users.find(u => u.email === formData.email && u.password === formData.password);
              if (user) {
                  // Simulate network delay
                  await new Promise(r => setTimeout(r, 800));
                  onAuthSuccess(user);
              } else {
                  throw new Error("Invalid email or password.");
              }
          } else {
              if (!formData.name) throw new Error("Name is required.");
              
              const exists = users.some(u => u.email === formData.email);
              if (exists) throw new Error("A user with this email already exists.");

              const newUser: User = {
                  id: Math.random().toString(36).substr(2, 9),
                  name: formData.name,
                  email: formData.email,
                  password: formData.password,
                  joinedDate: new Date().toISOString(),
                  role: formData.email === 'rumansordar43@gmail.com' ? 'admin' : 'user'
              };

              users.push(newUser);
              localStorage.setItem('mock_users', JSON.stringify(users));
              
              await new Promise(r => setTimeout(r, 1000));
              setMsg("Signup successful! You can now log in.");
              setIsLogin(true);
          }
      } catch (err: any) {
          setError(err.message || "Authentication failed.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-slate-950">
       <div className="absolute inset-0 z-0">
           <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-float"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] animate-float-delayed"></div>
       </div>

       <div className="relative z-10 w-full max-w-md animate-fade-in-up">
           <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-teal-400"></div>

               <div className="mb-8 text-center">
                   <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                   <h2 className="text-3xl font-display font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                   <p className="text-slate-400 text-sm">Access the future of microstock intelligence.</p>
               </div>

               {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold text-center leading-relaxed">{error}</div>}
               {msg && <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs font-bold text-center leading-relaxed">{msg}</div>}

               <form onSubmit={handleSubmit} className="space-y-4">
                   {!isLogin && (
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                           <input type="text" required className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                   )}
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                       <input type="email" required className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                       <input type="password" required className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                   </div>

                   <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg transition-all btn-3d mt-4 disabled:opacity-50">
                       {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                   </button>
               </form>

               <div className="mt-6 text-center">
                   <button onClick={() => { setIsLogin(!isLogin); setError(null); setMsg(null); }} className="text-sm text-slate-400 hover:text-white transition-colors">
                       {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
                   </button>
               </div>
           </div>
       </div>
    </div>
  );
};

export default AuthPage;
