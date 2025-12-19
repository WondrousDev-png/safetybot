import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function ServerSettings() {
    const router = useRouter();
    const { id } = router.query;
    const { status } = useSession();
    
    const [config, setConfig] = useState(null);
    const [saving, setSaving] = useState(false);
    // Bad word input state
    const [wordInput, setWordInput] = useState("");

    useEffect(() => {
        if (id && status === 'authenticated') {
            axios.get(`/api/guild/${id}`)
                .then(res => setConfig(res.data))
                .catch(err => alert("Failed to load settings"));
        }
    }, [id, status]);

    const saveChanges = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/guild/${id}`, config);
            alert("✅ Settings Saved Successfully!");
        } catch (e) {
            alert("❌ Failed to save.");
        }
        setSaving(false);
    };

    const toggle = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const addWord = () => {
        if (!wordInput) return;
        if (config.badWords.includes(wordInput)) return;
        setConfig(prev => ({ ...prev, badWords: [...prev.badWords, wordInput] }));
        setWordInput("");
    };

    const removeWord = (word) => {
        setConfig(prev => ({ ...prev, badWords: prev.badWords.filter(w => w !== word) }));
    };

    if (!config) return <div className="p-10 text-center">Loading Settings...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link href="/dashboard" className="text-gray-400 hover:text-white mb-6 inline-block">
                &larr; Back to Servers
            </Link>
            
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Security Settings</h1>
                <button 
                    onClick={saveChanges}
                    disabled={saving}
                    className="bg-green-600 px-6 py-2 rounded font-bold hover:bg-green-700 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* AUTO MODERATION SECTION */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
                <h2 className="text-xl font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-2">Auto-Moderation</h2>
                
                <div className="space-y-6">
                    {/* Toggle: Anti-Link */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-lg">Anti-Link</h3>
                            <p className="text-gray-400 text-sm">Block http/https links sent by non-admins.</p>
                        </div>
                        <button 
                            onClick={() => toggle('antiLink')}
                            className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${config.antiLink ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform ${config.antiLink ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Toggle: Anti-Invite */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-lg">Anti-Invite</h3>
                            <p className="text-gray-400 text-sm">Block Discord server invites (discord.gg).</p>
                        </div>
                        <button 
                            onClick={() => toggle('antiInvites')}
                            className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${config.antiInvites ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform ${config.antiInvites ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Toggle: Anti-Caps */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-lg">Anti-Caps</h3>
                            <p className="text-gray-400 text-sm">Block messages containing 70%+ capital letters.</p>
                        </div>
                        <button 
                            onClick={() => toggle('antiCaps')}
                            className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${config.antiCaps ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full transition-transform ${config.antiCaps ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* BLACKLISTED WORDS SECTION */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
                <h2 className="text-xl font-bold text-red-400 mb-4 border-b border-gray-700 pb-2">Blacklisted Words</h2>
                <div className="flex space-x-2 mb-4">
                    <input 
                        type="text" 
                        value={wordInput}
                        onChange={(e) => setWordInput(e.target.value)}
                        placeholder="Enter a word to ban..."
                        className="bg-gray-900 border border-gray-600 rounded px-4 py-2 flex-1 text-white focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => e.key === 'Enter' && addWord()}
                    />
                    <button onClick={addWord} className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700">Add</button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {config.badWords.map(word => (
                        <span key={word} className="bg-red-900/50 text-red-200 px-3 py-1 rounded-full text-sm flex items-center">
                            {word}
                            <button onClick={() => removeWord(word)} className="ml-2 text-red-400 hover:text-white font-bold">&times;</button>
                        </span>
                    ))}
                    {config.badWords.length === 0 && <span className="text-gray-500 italic">No blacklisted words.</span>}
                </div>
            </div>

            {/* CHANNEL CONFIG SECTION */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-yellow-400 mb-4 border-b border-gray-700 pb-2">Configuration</h2>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Log Channel ID</label>
                    <input 
                        type="text"
                        value={config.logChannelId || ""}
                        onChange={(e) => setConfig({ ...config, logChannelId: e.target.value })}
                        placeholder="Enter Channel ID (e.g., 123456789...)"
                        className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">Enable "Developer Mode" in Discord to copy Channel IDs.</p>
                </div>
            </div>
        </div>
    );
}
