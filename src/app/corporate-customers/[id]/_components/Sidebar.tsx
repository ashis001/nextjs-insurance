"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Building2, UserCircle, Megaphone } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Advisors", href: "/advisors", icon: Users },
    { label: "Corporate Customers", href: "/corporate-customers/demo-corp-1", icon: Building2 },
    { label: "Members", href: "/members", icon: UserCircle },
    { label: "Marketing", href: "/marketing", icon: Megaphone },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-full w-64 border-r border-gray-200 bg-white">
            <div className="flex h-14 items-center border-b border-gray-200 px-6">
                <h1 className="text-lg font-bold text-gray-900">GroupBenefitz</h1>
            </div>
            <nav className="flex flex-col gap-1 p-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href) || (item.href.includes("/corporate-customers") && pathname.includes("/corporate-customers"));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="absolute bottom-4 left-0 w-full px-4">
                <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <div className="text-xs">
                        <p className="font-medium text-gray-900">Admin User</p>
                        <p className="text-gray-500">Super Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
