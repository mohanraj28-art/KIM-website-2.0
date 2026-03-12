'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard, Users, Building2, Shield, Activity,
    Settings, Key, FileText, CreditCard, Webhook,
    Search, Bell, Menu, Globe, LayoutGrid, LogOut,
} from 'lucide-react'
import { UserButton } from '@/components/UserButton'
import Image from 'next/image'

const NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/users', icon: Users, label: 'Users' },
    { href: '/dashboard/groups', icon: LayoutGrid, label: 'Groups' },
    { href: '/dashboard/tenants', icon: Building2, label: 'Tenants' },
    { href: '/dashboard/sessions', icon: Activity, label: 'Sessions' },
    { href: '/dashboard/audit-logs', icon: FileText, label: 'Audit Logs' },
    { href: '/dashboard/roles', icon: Shield, label: 'Roles & Permissions' },
    { href: '/dashboard/api-keys', icon: Key, label: 'API Keys' },
    { href: '/dashboard/webhooks', icon: Webhook, label: 'Webhooks' },
    { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSignedIn, signOut } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = useState(true)

    useEffect(() => {
        if (isLoaded && !isSignedIn) router.push('/sign-in')
    }, [isLoaded, isSignedIn, router])

    if (!isLoaded) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
            <Image src="/kaappu-logo.png" alt="Kaappu" width={40} height={40} style={{ borderRadius: 8, opacity: 0.8 }} />
        </div>
    )

    if (!isSignedIn) return null

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0a0a0f', overflow: 'hidden' }}>

            {/* ── Sidebar ── */}
            <aside style={{
                width: open ? 260 : 0,
                minWidth: open ? 260 : 0,
                flexShrink: 0,
                background: '#111118',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'width 0.25s ease, min-width 0.25s ease',
            }}>
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '20px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    flexShrink: 0,
                }}>
                    <Image
                        src="/kaappu-logo.png"
                        alt="Kaappu"
                        width={144}
                        height={144}
                        style={{ objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>Kaappu Identity</span>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, overflowY: 'auto', padding: '20px 12px' }}>
                    <p style={{
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.1em', color: '#475569',
                        padding: '0 10px', marginBottom: 12,
                    }}>Navigation</p>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {NAV.map(({ href, icon: Icon, label }) => {
                            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                            return (
                                <li key={href}>
                                    <Link href={href} style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            background: active ? '#4f46e5' : 'transparent',
                                            color: active ? '#fff' : '#94a3b8',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                        }}>
                                            <Icon size={16} style={{ flexShrink: 0 }} />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                                        </div>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                    <button
                        onClick={() => signOut()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            width: '100%', padding: '10px 12px', borderRadius: 8,
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: '#64748b', fontSize: 14, fontWeight: 500,
                        }}
                    >
                        <LogOut size={16} style={{ flexShrink: 0 }} />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

                {/* Header */}
                <header style={{
                    height: 72, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 32px',
                    background: '#111118',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button
                            onClick={() => setOpen(!open)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 6, borderRadius: 6 }}
                        >
                            <Menu size={20} />
                        </button>

                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 14px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            width: 260,
                        }}>
                            <Search size={14} color="#475569" />
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#cbd5e1', width: '100%' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Link href="/" target="_blank" style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 7,
                            fontSize: 13, color: '#94a3b8', textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <Globe size={14} /> Visit site
                        </Link>

                        <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 8, borderRadius: 7 }}>
                            <Bell size={20} />
                            <span style={{
                                position: 'absolute', top: 8, right: 8,
                                width: 8, height: 8, borderRadius: '50%',
                                background: '#6366f1', border: '2px solid #111118',
                            }} />
                        </button>

                        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
                        <UserButton />
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflowY: 'auto', background: '#0a0a0f' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 32px' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
