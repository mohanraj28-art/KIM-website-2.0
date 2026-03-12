'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    User, Mail, Shield, Smartphone, Globe,
    Camera, CheckCircle, ExternalLink, Trash2,
    Lock, Fingerprint, Key, ChevronRight
} from 'lucide-react'

export default function ProfilePage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('account')

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="flex items-center gap-6 mb-10">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-500/20 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-all shadow-lg group-hover:scale-110">
                        <Camera size={14} />
                    </button>
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-[#f0f6fc] tracking-tight">
                        {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-slate-400 font-medium">Manage your personal information and security settings.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 mb-8">
                {['Account', 'Security', 'Connections'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.toLowerCase()
                            ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {activeTab === 'account' && (
                    <div className="grid gap-6">
                        <ProfileSection title="Profile Details" description="Standard information used across the platform.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                <div className="space-y-4">
                                    <ProfileField label="First Name" value={user?.firstName || 'Not set'} />
                                    <ProfileField label="Last Name" value={user?.lastName || 'Not set'} />
                                </div>
                                <div className="space-y-4">
                                    <ProfileField label="Email Address" value={user?.email || 'Not set'} />
                                    <ProfileField label="Phone Number" value="+1 (555) 000-0000" />
                                </div>
                            </div>
                        </ProfileSection>

                        <ProfileSection title="Regional Settings" description="Configure your timezone and locale.">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileField label="Timezone" value="UTC-07:00 (Pacific Time)" />
                                <ProfileField label="Language" value="English (United States)" />
                            </div>
                        </ProfileSection>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="grid gap-6">
                        <ProfileSection title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                            <div className={`p-6 flex items-center justify-between border rounded-xl m-2 ${user?.mfaEnabled ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                                <div className="flex gap-4 items-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user?.mfaEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${user?.mfaEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            2FA is {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            {user?.mfaEnabled
                                                ? 'Your account is protected with multi-factor authentication.'
                                                : 'Protect your account by adding an extra layer of security.'}
                                        </p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-all border border-slate-700">
                                    {user?.mfaEnabled ? 'Manage' : 'Enable'}
                                </button>
                            </div>
                        </ProfileSection>

                        <ProfileSection title="Passkeys" description="Passwordless login using biometric or hardware keys.">
                            <div className="p-4 bg-slate-900/50 flex justify-center border-t border-white/5">
                                <button className="flex items-center gap-2 text-indigo-400 font-bold text-sm hover:text-indigo-300 transition-all">
                                    <Key size={14} /> Add a passkey
                                </button>
                            </div>
                        </ProfileSection>
                    </div>
                )}

                {activeTab === 'connections' && (
                    <ProfileSection title="Social Connections" description="Link your social accounts for faster sign-in.">
                        <div className="divide-y divide-white/5">
                            <ConnectionRow
                                name="Google"
                                provider="GOOGLE"
                                icon={<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /><path fill="none" d="M0 0h48v48H0z" /></svg>}
                                email={user?.socialAccounts?.includes('GOOGLE') ? user.email : undefined}
                                connected={user?.socialAccounts?.includes('GOOGLE') || false}
                            />
                            <ConnectionRow
                                name="GitHub"
                                provider="GITHUB"
                                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>}
                                connected={user?.socialAccounts?.includes('GITHUB') || false}
                            />
                        </div>
                    </ProfileSection>
                )}
            </div>
        </div>
    )
}

function ProfileSection({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-sm shadow-indigo-500/5">
            <div className="px-6 py-5 border-b border-white/5 bg-slate-900/30">
                <h3 className="text-lg font-bold text-[#f0f6fc] tracking-tight">{title}</h3>
                <p className="text-sm text-slate-400 mt-1 font-medium">{description}</p>
            </div>
            {children}
        </div>
    )
}

function ProfileField({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1.5 p-3 rounded-lg hover:bg-white/5 transition-all cursor-default group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
            <div className="flex items-center justify-between">
                <p className="text-[#f0f6fc] font-semibold">{value}</p>
                <button className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-all text-xs font-bold uppercase tracking-wider">Edit</button>
            </div>
        </div>
    )
}

function ConnectionRow({ name, provider, icon, email, connected }: { name: string, provider: string, icon: React.ReactNode, email?: string, connected: boolean }) {
    return (
        <div className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all">
            <div className="flex gap-4 items-center">
                <div className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg">
                    {icon}
                </div>
                <div>
                    <p className="font-bold text-[#f0f6fc]">{name}</p>
                    {email && <p className="text-sm text-slate-500 font-medium">{email}</p>}
                </div>
            </div>
            {connected ? (
                <div className="flex gap-3">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase rounded flex items-center gap-1.5 border border-emerald-500/20">
                        <CheckCircle size={10} /> Connected
                    </span>
                    <button className="text-slate-500 hover:text-rose-500 p-1.5 transition-all"><Trash2 size={16} /></button>
                </div>
            ) : (
                <button className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-indigo-500/20">
                    Connect
                </button>
            )}
        </div>
    )
}
