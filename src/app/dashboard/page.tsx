"use client";

import AgentUI from "@/components/AgentUi";
import { Sidebar } from "../corporate-customers/[id]/_components/Sidebar";
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

// Mock Data
const STATS_DATA = {
  Today: { corps: 124, members: 8543, revenue: "1.2M", claims: 432 },
  "This Week": { corps: 130, members: 8600, revenue: "1.25M", claims: 450 },
  "This Month": { corps: 145, members: 9200, revenue: "1.4M", claims: 600 },
};

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<
    "Today" | "This Week" | "This Month"
  >("Today");
  const stats = STATS_DATA[timeRange];

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />
      <main className='flex-1 ml-64'>
        {/* Header matching Corporate Page */}
        <header className='flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6'>
          <div className='flex items-center gap-4'>
            <h1 className='text-lg font-semibold text-gray-900'>Dashboard</h1>
          </div>
          <div className='flex items-center gap-4'>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className='rounded border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none'>
              <option value='Today'>Today</option>
              <option value='This Week'>This Week</option>
              <option value='This Month'>This Month</option>
            </select>
            <div className='h-4 w-[1px] bg-gray-300'></div>
            <div className='text-sm'>
              <span className='text-gray-600'>Welcome, </span>
              <span className='font-medium'>John Smith</span>
            </div>
          </div>
        </header>

        <div className='p-6 space-y-6'>
          {/* Stats Grid */}
          <div className='grid grid-cols-4 gap-6'>
            <StatCard
              title='Total Corporations'
              value={stats.corps}
              icon={Building2}
              color='blue'
              trend='+12% from last period'
            />
            <StatCard
              title='Active Members'
              value={stats.members.toLocaleString()}
              icon={Users}
              color='green'
              trend='+5.4% new enrollments'
            />
            <StatCard
              title='Total Revenue'
              value={`$${stats.revenue}`}
              icon={DollarSign}
              color='indigo'
              trend='+8% growth'
            />
            <StatCard
              title='Claims Processed'
              value={stats.claims}
              icon={Activity}
              color='orange'
              trend={`${Math.floor(stats.claims * 0.05)} pending`}
            />
          </div>

          {/* Recent Activity Section with Navy Header */}
          <div>
            <div className='bg-[#1e3a5f] px-4 py-2 flex justify-between items-center'>
              <h3 className='text-sm font-semibold text-white'>
                Recent Onboarding Activity
              </h3>
              <button className='text-xs text-white/80 hover:text-white underline'>
                View All
              </button>
            </div>
            <div className='bg-white border border-t-0 border-gray-200'>
              <table className='w-full text-left text-sm'>
                <thead className='bg-gray-50 text-gray-500'>
                  <tr>
                    <th className='px-6 py-3 font-medium'>Corporation</th>
                    <th className='px-6 py-3 font-medium'>Broker</th>
                    <th className='px-6 py-3 font-medium'>Status</th>
                    <th className='px-6 py-3 font-medium'>Date</th>
                    <th className='px-6 py-3 font-medium text-right'>Action</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {[
                    {
                      name: "Acme Corp Inc.",
                      broker: "Sarah Johnson",
                      status: "Active",
                      date: "Oct 24, 2024",
                      color: "green",
                    },
                    {
                      name: "TechFlow Solutions",
                      broker: "Mike Peters",
                      status: "Pending",
                      date: "Oct 23, 2024",
                      color: "yellow",
                    },
                    {
                      name: "Global Logistics Ltd",
                      broker: "Sarah Johnson",
                      status: "Onboarding",
                      date: "Oct 21, 2024",
                      color: "blue",
                    },
                    {
                      name: "Starlight Media",
                      broker: "James Anderson",
                      status: "Draft",
                      date: "Oct 19, 2024",
                      color: "gray",
                    },
                  ].map((row, i) => (
                    <tr key={i} className='hover:bg-gray-50'>
                      <td className='px-6 py-3 font-medium text-gray-900'>
                        {row.name}
                      </td>
                      <td className='px-6 py-3 text-gray-600'>{row.broker}</td>
                      <td className='px-6 py-3'>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-${row.color}-100 text-${row.color}-800`}>
                          {row.status}
                        </span>
                      </td>
                      <td className='px-6 py-3 text-gray-500'>{row.date}</td>
                      <td className='px-6 py-3 text-right text-blue-600 hover:underline cursor-pointer'>
                        Manage
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
  const colorClasses =
    {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      indigo: "bg-indigo-100 text-indigo-600",
      orange: "bg-orange-100 text-orange-600",
    }[color as string] || "bg-gray-100 text-gray-600";

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
            {title}
          </p>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <Icon className='h-5 w-5' />
        </div>
      </div>
      <div className='mt-4 text-xs text-gray-500'>{trend}</div>
    </div>
  );
}
