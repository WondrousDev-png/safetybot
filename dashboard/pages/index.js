import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (session) router.push('/dashboard');
    }, [session, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-center px-4">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
                FORTRESS BOT
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-lg">
                The advanced, safety-focused security system for your Discord server. 
                Anti-Raid, Anti-Nuke, and total control.
            </p>

            {!session ? (
                <button
                    onClick={() => signIn('discord')}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-lg transition shadow-lg shadow-indigo-500/30"
                >
                    Login with Discord
                </button>
            ) : (
                <div className="space-y-4">
                    <p className="text-xl">Welcome back, {session.user.name}</p>
                    <Link href="/dashboard" className="px-6 py-3 bg-green-600 rounded hover:bg-green-700 block">
                        Go to Dashboard
                    </Link>
                </div>
            )}
        </div>
    );
}
