'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Eye,
    EyeOff,
    ArrowRight,
    Loader2,
    Mail,
    Lock,
    User,
    CheckCircle,
    Shield
} from 'lucide-react'

export default function SignUpPage() {
    const router = useRouter()
    const { signUp } = useAuth()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [agreed, setAgreed] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!agreed) {
            setError('Please acknowledge the security protocols.')
            return
        }
        setError('')
        setLoading(true)
        try {
            await signUp({ email, password, firstName, lastName })
            router.push('/dashboard')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Identity enrollment failed. Please retry.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container" style={{ background: '#030712', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Premium Background */}
            <div className="auth-bg" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.1) 0%, transparent 50%)', zIndex: 0 }} />
            <div className="auth-bg-grid" style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 1 }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="auth-card animate-fade-in"
                style={{ width: '100%', maxWidth: 480, background: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 40, position: 'relative', zIndex: 10, backdropFilter: 'blur(20px)', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}
            >
                {/* Brand Identity */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
                    <img
                        src="/kaappu-logo.png"
                        alt="KAAPPU Logo"
                        style={{
                            height: 120,
                            marginBottom: 4,
                            filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.3))'
                        }}
                    />
                    <p style={{ color: '#8b949e', fontSize: 13, marginTop: 12, textAlign: 'center' }}>
                        Enroll in the Kaappu Identity Platform (KIP).
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#f85149', textAlign: 'center', fontWeight: 600 }}
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>First Name</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                            <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: 15, paddingRight: 16 }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>Last Name</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                            <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: 15, paddingRight: 16 }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>Work Email</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                            <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: 15, paddingRight: 16 }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginLeft: 4 }}>Access Key</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 52, overflow: 'hidden' }}>
                            <div style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f6fc', fontSize: 15 }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ width: 48, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#484f58' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ paddingTop: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: 2 }}>
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={() => setAgreed(!agreed)}
                                    style={{ position: 'absolute', opacity: 0, cursor: 'pointer' }}
                                />
                                <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid rgba(255,255,255,0.1)', background: agreed ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                    {agreed && <CheckCircle size={14} color="white" />}
                                </div>
                            </div>
                            <span style={{ fontSize: 12, color: '#8b949e', fontWeight: 500, lineHeight: 1.5 }}>
                                I authorize the identity creation and agree to the <Link href="/terms" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>Security Charter</Link>.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !agreed}
                        style={{
                            width: '100%', height: 56, marginTop: 16,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white', border: 'none', borderRadius: 14,
                            fontSize: 15, fontWeight: 700, cursor: agreed ? 'pointer' : 'not-allowed',
                            boxShadow: agreed ? '0 10px 25px rgba(99,102,241,0.3)' : 'none',
                            opacity: agreed ? 1 : 0.6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Enroll Identity <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Enroll via Provider</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                        onClick={() => window.location.href = '/api/auth/oauth/google'}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            height: 52, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                            color: '#e6edf3', fontSize: 13, fontWeight: 600
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                        Google
                    </button>

                    <button
                        onClick={() => window.location.href = '/api/auth/oauth/github'}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            height: 52, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                            color: '#e6edf3', fontSize: 13, fontWeight: 600
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                    </button>
                </div>

                <p style={{ textAlign: 'center', fontSize: 14, color: '#8b949e', marginTop: 32 }}>
                    Already an authorized user?{' '}
                    <Link href="/sign-in" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 700 }}>
                        Authenticate
                    </Link>
                </p>

                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                        <Shield size={14} color="#8b949e" />
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#8b949e' }}>Protocol Secured</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}