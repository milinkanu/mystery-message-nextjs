'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { ModeToggle } from './ModeToggle';
import { usePathname } from 'next/navigation';

function Navbar() {
    const { data: session } = useSession();
    const user = session?.user;
    const pathname = usePathname();

    return (
        <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white dark:bg-gray-900">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <a href="#" className="text-xl font-bold mb-4 md:mb-0">
                    True Feedback
                </a>
                {session ? (
                    <div className="flex items-center gap-4">
                        <span className="mr-0">
                            Welcome, {user?.username || user?.email}
                        </span>
                        <Link href="/dashboard">
                            <Button className="w-full md:w-auto bg-slate-100 text-black" variant="outline">Dashboard</Button>
                        </Link>
                        <Button onClick={() => signOut()} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
                            Logout
                        </Button>
                        <ModeToggle />
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href={`/sign-in?callbackUrl=${encodeURIComponent(pathname || '/')}`}>
                            <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
                        </Link>
                        <ModeToggle />
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;