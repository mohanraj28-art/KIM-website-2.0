'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
    Users, Building2, Activity, Shield,
    ArrowUpRight, ArrowDownRight, CheckCircle, AlertTriangle,
    XCircle, Loader2, ChevronRight, Clock, Zap, Lock,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'

interface DashboardStats {
    totalUsers: number
    newUsersThisMonth: number
    userGrowth: number
    totalTenants: number
    newTenantsThisMonth: number
    activeSessions: number
    auditLast7Days: { success: number; failure: number; warning: number }
    mfaAdoptionRate: number
    mfaCount: number
}

interface AuditLog {
    id: string
    action: string
    user: { email: string; firstName: string | null; lastName: string | null }
    result: 'SUCCESS' | 'FAILURE' | 'WARNING'
    ipAddress: string | null
    createdAt: string
}

function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
}

const RESULT_MAP = {
    SUCCESS: { dot: '#34d399', text: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', icon: <CheckCircle size={11} /> },
    FAILURE: { dot: '#f87171', text: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', icon: <XCircle size={11} /> },
    WARNING: { dot: '#fbbf24', text: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', icon: <AlertTriangle size={11} /> },
}

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ title, value, change, up, icon: Icon, note, iconBg, loading }: {
    title: string; value: string; change: string; up: boolean | null
    icon: React.ElementType; note: string; iconBg: string; loading: boolean
}) {
    const cardStyle: React.CSSProperties = {
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    }

    if (loading) return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ width: 64, height: 24, borderRadius: 20, background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: 64, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ width: 120, height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ width: 90, height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
            </div>
        </div>
    )

    const badgeColor = up === null ? '#94a3b8' : up ? '#4ade80' : '#f87171'
    const badgeBg = up === null ? 'rgba(148,163,184,0.1)' : up ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'
    const badgeBorder = up === null ? 'rgba(148,163,184,0.2)' : up ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color="#fff" />
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 20,
                    color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}`,
                }}>
                    {up === true && <ArrowUpRight size={12} />}
                    {up === false && <ArrowDownRight size={12} />}
                    {change}
                </span>
            </div>
            <div>
                <p style={{ fontSize: 30, fontWeight: 700, color: '#f1f5f9', lineHeight: 1, marginBottom: 6 }}>{value}</p>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 12, color: '#475569' }}>{note}</p>
            </div>
        </div>
    )
}

/* ── Panel wrapper ─────────────────────────────────────────── */
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            background: '#111118',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            overflow: 'hidden',
            ...style,
        }}>
            {children}
        </div>
    )
}

/* ── Panel header ──────────────────────────────────────────── */
function PanelHeader({ icon: Icon, iconColor, title, subtitle, right }: {
    icon: React.ElementType; iconColor: string; title: string; subtitle: string; right?: React.ReactNode
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: `${iconColor}18`, border: `1px solid ${iconColor}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={15} color={iconColor} />
                </div>
                <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{title}</p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{subtitle}</p>
                </div>
            </div>
            {right}
        </div>
    )
}

/* ── Main page ─────────────────────────────────────────────── */
export default function DashboardPage() {
    const { user, accessToken } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!accessToken) return
        const h = { Authorization: `Bearer ${accessToken}` }
        Promise.all([
            fetch('/api/stats', { headers: h }).then(r => r.json()),
            fetch('/api/audit-logs?limit=8&page=1', { headers: h }).then(r => r.json()),
            fetch('/api/users?limit=6&page=1', { headers: h }).then(r => r.json()),
        ]).then(([s, l, u]) => {
            if (s.success) setStats(s.data)
            if (l.success) setLogs(l.data.logs)
            if (u.success) setUsers(u.data.users)
        }).catch(console.error).finally(() => setLoading(false))
    }, [accessToken])

    const cards = useMemo(() => {
        if (!stats) return []
        return [
            { title: 'Total Users', value: String(stats.totalUsers), change: `${stats.userGrowth >= 0 ? '+' : ''}${stats.userGrowth}%`, up: stats.userGrowth >= 0, icon: Users, note: `${stats.newUsersThisMonth} new this month`, iconBg: '#4f46e5' },
            { title: 'Tenants', value: String(stats.totalTenants), change: `+${stats.newTenantsThisMonth} new`, up: true, icon: Building2, note: `${stats.newTenantsThisMonth} added this month`, iconBg: '#0284c7' },
            { title: 'Active Sessions', value: String(stats.activeSessions), change: 'Live', up: null, icon: Activity, note: 'Currently active', iconBg: '#059669' },
            { title: 'Failed Logins (7d)', value: String(stats.auditLast7Days.failure), change: stats.auditLast7Days.failure > 0 ? 'Review' : 'Clean', up: stats.auditLast7Days.failure > 0 ? false : null, icon: Shield, note: `${stats.auditLast7Days.warning} warnings`, iconBg: '#dc2626' },
        ]
    }, [stats])

    const successRate = stats
        ? Math.round(stats.auditLast7Days.success / Math.max(1, stats.auditLast7Days.success + stats.auditLast7Days.failure + stats.auditLast7Days.warning) * 100)
        : 0

    return (
        /* Outer container — flex column with explicit gap so spacing never collapses */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 48 }}>

            {/* ── Page heading ── */}
            <div style={{ paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
                    {getGreeting()}, {user?.firstName || 'Admin'}
                </h1>
                <p style={{ fontSize: 14, color: '#64748b' }}>
                    Real-time overview of your identity platform.
                </p>
            </div>

            {/* ── Stat cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <StatCard key={i} loading title="" value="" change="" up={null} icon={Users} note="" iconBg="" />
                    ))
                    : cards.map((c, i) => <StatCard key={i} {...c} loading={false} />)
                }
            </div>

            {/* ── Activity + Users ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

                {/* Recent Activity */}
                <Panel>
                    <PanelHeader
                        icon={Activity} iconColor="#818cf8"
                        title="Recent Activity" subtitle="Last 8 audit events"
                        right={
                            <Link href="/dashboard/audit-logs" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#818cf8', textDecoration: 'none' }}>
                                View all <ChevronRight size={13} />
                            </Link>
                        }
                    />

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 12 }}>
                            <Loader2 size={20} color="#6366f1" className="animate-spin" />
                            <p style={{ fontSize: 12, color: '#475569' }}>Loading…</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '64px 0', fontSize: 13, color: '#475569' }}>No activity yet.</p>
                    ) : logs.map((log, i) => {
                        const r = RESULT_MAP[log.result] ?? RESULT_MAP.WARNING
                        return (
                            <div key={log.id} style={{
                                display: 'flex', alignItems: 'center', gap: 16,
                                padding: '16px 24px',
                                borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.dot, flexShrink: 0 }} />
                                <code style={{
                                    fontSize: 11, color: '#a5b4fc',
                                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                    padding: '3px 8px', borderRadius: 6,
                                    flexShrink: 0, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {log.action}
                                </code>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 13, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.user?.email || '—'}</p>
                                    <p style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginTop: 3 }}>{log.ipAddress || 'Unknown IP'}</p>
                                </div>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569', flexShrink: 0 }}>
                                    <Clock size={11} /> {formatRelativeTime(log.createdAt)}
                                </span>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    padding: '3px 10px', borderRadius: 20,
                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                                    color: r.text, background: r.bg, border: `1px solid ${r.border}`,
                                    flexShrink: 0,
                                }}>
                                    {r.icon} {log.result}
                                </span>
                            </div>
                        )
                    })}
                </Panel>

                {/* Recent Users */}
                <Panel>
                    <PanelHeader
                        icon={Users} iconColor="#a78bfa"
                        title="Users" subtitle="Recent registrations"
                        right={
                            <Link href="/dashboard/users" style={{ fontSize: 13, color: '#a78bfa', textDecoration: 'none' }}>
                                View all →
                            </Link>
                        }
                    />

                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ width: 100, height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                                    <div style={{ width: 140, height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                                </div>
                            </div>
                        ))
                        : users.length === 0
                            ? <p style={{ textAlign: 'center', padding: '64px 0', fontSize: 13, color: '#475569' }}>No users yet.</p>
                            : users.map((u, i) => (
                                <div key={u.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '14px 24px',
                                    borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: '#4f46e5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0,
                                    }}>
                                        {u.firstName?.[0] || u.email?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {u.firstName ? `${u.firstName} ${u.lastName ?? ''}`.trim() : u.email?.split('@')[0]}
                                        </p>
                                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                                    </div>
                                    {u.emailVerified && (
                                        <span style={{
                                            fontSize: 10, fontWeight: 600,
                                            padding: '2px 8px', borderRadius: 4,
                                            color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                                            flexShrink: 0,
                                        }}>✓</span>
                                    )}
                                </div>
                            ))
                    }
                </Panel>
            </div>

            {/* ── Security Health + Quick Actions ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

                {/* Security Health */}
                <Panel>
                    <PanelHeader icon={Shield} iconColor="#818cf8" title="Security Health" subtitle="Identity platform score — last 7 days" />
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>

                        {/* Progress bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {[
                                { label: 'MFA Adoption', value: stats?.mfaAdoptionRate ?? 0, color: '#6366f1' },
                                { label: 'Auth Success Rate', value: successRate, color: '#10b981' },
                            ].map(({ label, value, color }) => (
                                <div key={label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>{label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{value}%</span>
                                    </div>
                                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                                        <div style={{ height: '100%', borderRadius: 4, background: color, width: `${value}%`, transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mini stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                            {[
                                { label: 'Total Events', val: (stats?.auditLast7Days.success ?? 0) + (stats?.auditLast7Days.failure ?? 0) + (stats?.auditLast7Days.warning ?? 0) },
                                { label: 'Successful', val: stats?.auditLast7Days.success ?? 0 },
                                { label: 'Failures', val: stats?.auditLast7Days.failure ?? 0 },
                                { label: 'Warnings', val: stats?.auditLast7Days.warning ?? 0 },
                            ].map(({ label, val }) => (
                                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 16 }}>
                                    <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: 8 }}>{label}</p>
                                    <p style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                {/* Quick Actions */}
                <Panel>
                    <PanelHeader icon={Zap} iconColor="#f59e0b" title="Quick Actions" subtitle="Common management tasks" />
                    {[
                        { icon: Users, color: '#7c3aed', label: 'Manage Users', desc: 'View and edit all users', href: '/dashboard/users' },
                        { icon: Shield, color: '#4f46e5', label: 'Roles & Permissions', desc: 'Configure access control', href: '/dashboard/roles' },
                        { icon: Activity, color: '#059669', label: 'Active Sessions', desc: 'Monitor live sessions', href: '/dashboard/sessions' },
                        { icon: Lock, color: '#dc2626', label: 'Security Settings', desc: 'Harden your platform', href: '/dashboard/security' },
                        { icon: Zap, color: '#d97706', label: 'Webhooks', desc: 'Manage event integrations', href: '/dashboard/webhooks' },
                    ].map(({ icon: Icon, color, label, desc, href }, i, arr) => (
                        <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '16px 20px',
                                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                cursor: 'pointer',
                            }}>
                                <div style={{ width: 36, height: 36, borderRadius: 9, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={16} color="#fff" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>{label}</p>
                                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{desc}</p>
                                </div>
                                <ChevronRight size={14} color="#475569" />
                            </div>
                        </Link>
                    ))}
                </Panel>
            </div>
        </div>
    )
}
