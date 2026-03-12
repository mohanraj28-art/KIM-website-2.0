'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const token = searchParams.get('token')
        if (!token) {
            setStatus('error')
            setMessage('Verification token is missing.')
            return
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}`)
                const data = await res.json()
                if (res.ok) {
                    setStatus('success')
                } else {
                    setStatus('error')
                    setMessage(data.error || 'Verification failed.')
                }
            } catch (err) {
                setStatus('error')
                setMessage('An unexpected error occurred.')
            }
        }

        verify()
    }, [searchParams])

    return (
        <div style={{ background: '#030712', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 70%)', zIndex: 0 }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: 440, background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 48, textAlign: 'center', position: 'relative', zIndex: 10, boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}
            >
                <div style={{ marginBottom: 32 }}>
                    <img src="/kaappu-logo.png" alt="Kaappu" style={{ height: 60, margin: '0 auto' }} />
                </div>

                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: '#6366f1' }} />
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f6fc' }}>Verifying Identity</h2>
                        <p style={{ color: '#8b949e' }}>Please wait while we validate your credentials...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(63,185,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <CheckCircle size={40} color="#3fb950" />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f6fc' }}>Identity Verified</h2>
                        <p style={{ color: '#8b949e' }}>Your email has been successfully verified. You can now access your dashboard.</p>
                        <Link href="/dashboard" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            width: '100%', height: 52, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, textDecoration: 'none'
                        }}>
                            Go to Dashboard <ArrowRight size={18} />
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(248,81,73,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            <XCircle size={40} color="#f85149" />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f6fc' }}>Verification Failed</h2>
                        <p style={{ color: '#f85149', fontWeight: 600 }}>{message}</p>
                        <button onClick={() => router.push('/sign-in')} style={{
                            width: '100%', height: 52, background: 'rgba(255,255,255,0.05)',
                            color: '#f0f6fc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontWeight: 700, cursor: 'pointer'
                        }}>
                            Back to Authentication
                        </button>
                    </div>
                )}

                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                        <Shield size={14} color="#8b949e" />
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#8b949e' }}>Kaappu Protocol Secured</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={null}>
            <VerifyEmailContent />
        </Suspense>
    )
}
