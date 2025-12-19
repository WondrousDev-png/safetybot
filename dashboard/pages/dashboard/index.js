import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [guilds, setGuilds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            axios.get('/api/user/guilds')
                .then(res => {
                    setGuilds(res.data);
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [status]);

    if (status === 'loading' || loading) return <div className="p-10 text-center">Loading Servers...</div>;
    if (!session) return <div className="p-10 text-center">Please Log In</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold">Select a Server</h1>
                <button onClick={() => signOut()} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">Logout</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guilds.map(guild => (
                    <div key={guild.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-indigo-500 transition shadow-lg">
                        <div className="flex items-center space-x-4 mb-4">
                            {guild.icon ? (
                                <img 
                                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                                    alt="Icon" 
                                    className="w-16 h-16 rounded-full"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-xl">
                                    {guild.name.substring(0, 1)}
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-bold truncate max-w-[150px]">{guild.name}</h2>
                                <span className="text-xs text-green-400 uppercase tracking-widest font-semibold">Admin</span>
                            </div>
                        </div>
                        <Link 
                            href={`/dashboard/${guild.id}`}
                            className="block w-full text-center bg-indigo-600 py-2 rounded hover:bg-indigo-700 font-medium"
                        >
                            Manage Settings
                        </Link>
                    </div>
                ))}
            </div>
            
            {guilds.length === 0 && (
                <div className="text-center text-gray-400 mt-10">
                    <p>No servers found where you are an Admin AND the bot is present.</p>
                </div>
            )}
        </div>
    );
}
