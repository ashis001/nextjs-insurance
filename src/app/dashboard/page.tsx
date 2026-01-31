"use client";

import AgentUI from "@/components/AgentUi";
import MaxGreeting from "@/components/MaxGreeting";
import { useChat } from "@/context/ChatContext";
import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";

// Mock Data
const STATS_DATA = {
  Today: { corps: 124, members: 8543, revenue: "1.2M", claims: 432 },
  "This Week": { corps: 130, members: 8600, revenue: "1.25M", claims: 450 },
  "This Month": { corps: 145, members: 9200, revenue: "1.4M", claims: 600 },
};

const AnimatedGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(10, 30, 59, 0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }}
    />
  </div>
);

export default function DashboardPage() {
  const { toggleChat, openChat } = useChat();
  const [timeRange, setTimeRange] = useState<"Today" | "This Week" | "This Month">("Today");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = STATS_DATA[timeRange];

  if (!mounted) return null;

  return (
    <div className='flex min-h-screen bg-gradient-to-tr from-slate-200 via-indigo-50 to-blue-100 font-sans selection:bg-blue-600/10'>
      <MaxGreeting />
      <Sidebar />

      <main className='flex-1 ml-64 relative overflow-hidden flex flex-col'>
        <AnimatedGrid />

        {/* Dynamic Background Accents */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

        {/* Premium Header */}
        <header className='relative z-20 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-md px-8'>
          <div className='flex flex-col'>
            <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">Enterprise overview & real-time analytics</p>
          </div>

          <div className='flex items-center gap-6'>
            <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200">
              {["Today", "This Week", "This Month"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className='h-8 w-px bg-slate-200' />

            <div className='flex items-center gap-3'>
              <button
                onClick={() => openChat("Hi, I’m Max. Your Assistant. Ask me anything")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                Ask Max
              </button>
            </div>
          </div>
        </header>

        <div className='relative z-10 p-8 space-y-8 animate-fade-in'>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <StatCard
              title='Total Corporations'
              value={stats.corps}
              icon={Building2}
              color='blue'
              trend='+12%'
              delay="100ms"
            />
            <StatCard
              title='Active Members'
              value={stats.members.toLocaleString()}
              icon={Users}
              color='indigo'
              trend='+5.4%'
              delay="200ms"
            />
            <StatCard
              title='Total Revenue'
              value={`$${stats.revenue}`}
              icon={DollarSign}
              color='emerald'
              trend='+8%'
              delay="300ms"
            />
            <StatCard
              title='Claims Processed'
              value={stats.claims}
              icon={Activity}
              color='amber'
              trend='Safe'
              delay="400ms"
            />
          </div>

          {/* Activity Section */}
          <div className="animate-slide-up [animation-delay:500ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className='bg-[#0a1e3b] px-8 py-6 flex justify-between items-center'>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-white'>Recent Onboarding Activity</h3>
                    <p className="text-xs text-blue-300 font-medium tracking-wide">Monitoring 48 active applications</p>
                  </div>
                </div>
                <button className='flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10'>
                  View Full Report
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className='p-2'>
                <table className='w-full text-left'>
                  <thead>
                    <tr className='text-slate-400 text-[10px] font-bold uppercase tracking-widest'>
                      <th className='px-8 py-4'>Corporation Entity</th>
                      <th className='px-6 py-4'>Account Broker</th>
                      <th className='px-6 py-4'>Status</th>
                      <th className='px-6 py-4'>Approval Date</th>
                      <th className='px-8 py-4 text-right'>Action</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-50'>
                    {[
                      { name: "Acme Corp Inc.", broker: "Sarah Johnson", status: "Active", date: "Oct 24, 2024", color: "emerald", icon: ShieldCheck },
                      { name: "TechFlow Solutions", broker: "Mike Peters", status: "Pending", date: "Oct 23, 2024", color: "amber", icon: Clock },
                      { name: "Global Logistics Ltd", broker: "Sarah Johnson", status: "Onboarding", date: "Oct 21, 2024", color: "indigo", icon: Zap },
                      { name: "Starlight Media", broker: "James Anderson", status: "Draft", date: "Oct 19, 2024", color: "slate", icon: Activity },
                    ].map((row, i) => (
                      <tr key={i} className='group hover:bg-slate-50 transition-all duration-300'>
                        <td className='px-8 py-5'>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 group-hover:bg-white transition-colors duration-300 border border-transparent group-hover:border-slate-200">
                              {row.name.charAt(0)}
                            </div>
                            <span className='font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-600'>{row.name}</span>
                          </div>
                        </td>
                        <td className='px-6 py-5'>
                          <span className='text-sm text-slate-500 font-medium'>{row.broker}</span>
                        </td>
                        <td className='px-6 py-5'>
                          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-${row.color}-50 text-${row.color}-600 border border-${row.color}-100`}>
                            <row.icon className="w-3 h-3" />
                            {row.status}
                          </div>
                        </td>
                        <td className='px-6 py-5'>
                          <span className='text-sm text-slate-400 font-medium'>{row.date}</span>
                        </td>
                        <td className='px-8 py-5 text-right'>
                          <button className='text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl'>
                            Manage Case
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes card-entrance {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-card-entrance { animation: card-entrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
      `}</style>
    </div>
  );
}



function StatCard({ title, value, icon: Icon, color, trend, delay }: any) {
  const themes: any = {
    blue: "from-blue-600 to-indigo-600 text-blue-600 bg-blue-50 border-blue-100",
    indigo: "from-indigo-600 to-violet-600 text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "from-emerald-600 to-teal-600 text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "from-amber-600 to-orange-600 text-amber-600 bg-amber-50 border-amber-100",
  };

  const theme = themes[color] || themes.blue;

  return (
    <div
      className='animate-card-entrance group bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-300 p-5 shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 relative z-0 hover:z-10'
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      <div className='flex items-start justify-between'>
        <div className={`p-3 rounded-xl ${theme.split(' border-')[0].split(' text-')[1]} border border-slate-100 group-hover:border-current opacity-80 transition-all duration-500 shadow-sm`}>
          <Icon className='h-5 w-5' />
        </div>
        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <TrendingUp className="w-2.5 h-2.5" />
          {trend}
        </div>
      </div>

      <div className='mt-4'>
        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
          {title}
        </p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <h4 className='text-2xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors duration-300'>{value}</h4>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
        </div>
      </div>

      <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${theme.split(' text-')[0]} w-2/3`} />
      </div>
    </div>
  );
}
