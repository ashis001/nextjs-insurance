"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat } from "@/context/ChatContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  Megaphone,
  MessageCircle,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Advisors", href: "/advisors", icon: Users },
  {
    label: "Corporate Customers",
    href: "/corporate-customers",
    icon: Building2,
  },
  { label: "Members", href: "/members", icon: UserCircle },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
];

export function Sidebar() {
  const pathname = usePathname();
  const { toggleChat, isOpen } = useChat();

  return (
    <aside className='fixed left-0 top-0 h-full w-64 border-r border-gray-200 bg-white'>
      <div className='flex h-14 items-center border-b border-gray-200 px-6'>
        <h1 className='text-lg font-bold text-gray-900'>Max Insurance</h1>
      </div>
      <nav className='flex flex-col gap-1 p-4'>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname.startsWith(item.href) ||
            (item.href.includes("/corporate-customers") &&
              pathname.includes("/corporate-customers"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}>
              <item.icon className='h-5 w-5' />
              {item.label}
            </Link>
          );
        })}

        {/* Max AI Assistant Button */}
        <button
          onClick={toggleChat}
          className={clsx(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all mt-2 border",
            isOpen
              ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-md shadow-blue-900/10"
              : "text-gray-600 hover:bg-gray-50 border-transparent hover:border-gray-200",
          )}>
          <div className={clsx(
            "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
            isOpen ? "bg-white/10" : "bg-gray-100"
          )}>
            <MessageCircle className={clsx("h-3.5 w-3.5", isOpen ? "text-white" : "text-gray-400")} />
          </div>
          Max
          {isOpen && <span className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>}
        </button>
      </nav>
      <div className='absolute bottom-4 left-0 w-full px-4'>
        <div className='flex items-center gap-3 rounded-md bg-gray-50 p-3'>
          <div className='h-8 w-8 rounded-full bg-gray-200'>
            <img
              src='/image.png'
              className='h-full w-full object-cover object-center rounded-full'
              alt=''
            />
          </div>
          <div className='text-xs'>
            <p className='font-medium text-gray-900'>John Smith</p>
            {/* <p className="text-gray-500">Super Admin</p> */}
          </div>
        </div>
      </div>
    </aside>
  );
}
