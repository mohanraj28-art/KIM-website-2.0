'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
    LayoutGrid, Plus, Search, MoreVertical, Users, Shield,
    ArrowRight, Folder, ChevronRight, Loader2, X, XCircle,
    CheckCircle, Calendar, Trash2, Edit2, UserPlus, Fingerprint,
    ShieldCheck, Info, Filter, ExternalLink, Settings,
    ArrowUpRight, Users2, MoreHorizontal, UserMinus
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

interface Group {
    id: string
    name: string
    description: string | null
    memberCount: number
    roles: { id: string, name: string, key: string, permissions?: string[] }[]
    createdAt: string
}

interface User {
    id: string
    email: string
    displayName: string | null
    firstName: string | null
    lastName: string | null
}

interface Role {
    id: string
    name: string
    key: string
    permissions?: string[]
}

export default function GroupsManagementPage() {
    const { accessToken } = useAuth()
    const [groups, setGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Details Panel State
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showAddMemberModal, setShowAddMemberModal] = useState(false)
    const [showAssignRoleModal, setShowAssignRoleModal] = useState(false)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form states
    const [formData, setFormData] = useState({ name: '', description: '' })
    const [memberEmail, setMemberEmail] = useState('')
    const [selectedRoleId, setSelectedRoleId] = useState('')

    // Data for selectors
    const [groupMembers, setGroupMembers] = useState<User[]>([])
    const [availableRoles, setAvailableRoles] = useState<Role[]>([])
    const [loadingDetails, setLoadingDetails] = useState(false)

    const fetchGroups = useCallback(async () => {
        if (!accessToken) return
        setIsLoading(true)
        try {
            const res = await fetch('/api/groups', {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            const data = await res.json()
            if (data.success) setGroups(data.data)
        } catch (err) {
            console.error('Failed to fetch groups:', err)
        } finally {
            setIsLoading(false)
        }
    }, [accessToken])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    const fetchGroupFullDetails = async (group: Group) => {
        if (!accessToken) return
        setSelectedGroup(group)
        setIsPanelOpen(true)
        setLoadingDetails(true)

        try {
            const res = await fetch(`/api/groups/${group.id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            const data = await res.json()
            if (data.success) {
                setSelectedGroup(data.data)
                setGroupMembers(data.data.members || [])
            }
        } catch (err) {
            console.error('Failed to fetch group details:', err)
        } finally {
            setLoadingDetails(false)
        }
    }

    const fetchAvailableRoles = async () => {
        if (!accessToken) return
        try {
            const res = await fetch('/api/roles', {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            const data = await res.json()
            if (data.success) setAvailableRoles(data.data)
        } catch (err) {
            console.error(err)
        }
    }

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!accessToken) return
        setIsActionLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setFormData({ name: '', description: '' })
                fetchGroups()
                setShowCreateModal(false)
            } else setError(data.error)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleDeleteGroup = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation()
        if (!accessToken || !confirm('Are you sure you want to delete this group?')) return
        try {
            const res = await fetch(`/api/groups/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            const data = await res.json()
            if (data.success) {
                fetchGroups()
                if (selectedGroup?.id === id) setIsPanelOpen(false)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!accessToken || !selectedGroup) return
        setIsActionLoading(true)
        setError(null)
        try {
            // First find user by email
            const uRes = await fetch(`/api/users?search=${memberEmail}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            const uData = await uRes.json()
            const user = uData.data.users.find((u: any) => u.email.toLowerCase() === memberEmail.toLowerCase())

            if (!user) {
                setError('User not found in your organization.')
                return
            }

            const res = await fetch(`/api/groups/${selectedGroup.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ userId: user.id })
            })
            const data = await res.json()
            if (data.success) {
                setShowAddMemberModal(false)
                setMemberEmail('')
                fetchGroupFullDetails(selectedGroup)
            } else setError(data.error)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleRemoveMember = async (userId: string) => {
        if (!accessToken || !selectedGroup) return
        try {
            const res = await fetch(`/api/groups/${selectedGroup.id}/members?userId=${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            const data = await res.json()
            if (data.success) fetchGroupFullDetails(selectedGroup)
        } catch (err) {
            console.error(err)
        }
    }

    const handleAssignRole = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!accessToken || !selectedGroup || !selectedRoleId) return
        setIsActionLoading(true)
        try {
            const res = await fetch('/api/groups/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ groupId: selectedGroup.id, roleId: selectedRoleId })
            })
            const data = await res.json()
            if (data.success) {
                setShowAssignRoleModal(false)
                setSelectedRoleId('')
                fetchGroupFullDetails(selectedGroup)
            } else setError(data.error)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleRemoveRole = async (roleId: string) => {
        if (!accessToken || !selectedGroup) return
        try {
            const res = await fetch(`/api/groups/roles?groupId=${selectedGroup.id}&roleId=${roleId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            const data = await res.json()
            if (data.success) fetchGroupFullDetails(selectedGroup)
        } catch (err) {
            console.error(err)
        }
    }

    const filteredGroups = useMemo(() => groups.filter((g: Group) =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    ), [groups, search])

    const allPermissions = useMemo(() => {
        if (!selectedGroup?.roles) return []
        const perms = new Set<string>()
        selectedGroup.roles.forEach(r => r.permissions?.forEach(p => perms.add(p)))
        return Array.from(perms).sort()
    }, [selectedGroup])

    return (
        <div className="flex relative overflow-hidden h-[calc(100vh-120px)]">
            <div className={`flex-1 transition-all duration-500 overflow-y-auto pr-2 ${isPanelOpen ? 'mr-[420px]' : ''}`}>
                {/* Header Section */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <Users2 size={32} className="text-indigo-500" />
                            Groups Management
                        </h1>
                        <p className="text-slate-400 mt-1.5 font-medium">Organize users into logical security containers for bulk authorization.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                            <Plus size={18} /> Create Group
                        </button>
                    </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Groups', value: groups.length, icon: Folder, color: 'text-blue-400' },
                        { label: 'Avg Members', value: groups.length ? Math.round(groups.reduce((a, b) => a + b.memberCount, 0) / groups.length) : 0, icon: Users, color: 'text-emerald-400' },
                        { label: 'Role Assignments', value: groups.reduce((a, b) => a + b.roles.length, 0), icon: Shield, color: 'text-amber-400' },
                        { label: 'Security Policies', value: allPermissions.length || 0, icon: ShieldCheck, color: 'text-indigo-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#0d1117] border border-white/5 p-5 rounded-3xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                                <stat.icon size={16} className={stat.color} />
                            </div>
                            <div className="text-2xl font-black text-white">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search groups by name or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#0d1117] border border-white/10 rounded-[24px] py-4.5 pl-14 pr-6 text-base font-medium text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* Groups Table */}
                <div className="bg-[#0d1117] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="p-6 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">Group Name</th>
                                <th className="p-6 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">Members</th>
                                <th className="p-6 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">Roles</th>
                                <th className="p-6 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">Created</th>
                                <th className="p-6 text-right text-[11px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-20 text-center"><Loader2 size={32} className="animate-spin text-indigo-500 mx-auto" /></td></tr>
                            ) : filteredGroups.map((group) => (
                                <tr key={group.id} onClick={() => fetchGroupFullDetails(group)} className={`border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-all group/row ${selectedGroup?.id === group.id ? 'bg-indigo-500/5' : ''}`}>
                                    <td className="p-6 text-sm font-black text-white">{group.name}</td>
                                    <td className="p-6 text-sm font-bold text-slate-300">{group.memberCount}</td>
                                    <td className="p-6">
                                        <div className="flex flex-wrap gap-1.5">
                                            {group.roles.map(role => (
                                                <span key={role.id} className="text-[10px] font-black px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg">{role.name}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-6 text-xs text-slate-500">{format(new Date(group.createdAt), 'MMM d, yyyy')}</td>
                                    <td className="p-6 text-right">
                                        <button onClick={(e) => handleDeleteGroup(group.id, e)} className="p-2 text-slate-600 hover:text-rose-400 rounded-xl transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Details Panel */}
            <AnimatePresence>
                {isPanelOpen && selectedGroup && (
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-[64px] bottom-0 w-[420px] bg-[#0d1117] border-l border-white/5 z-50 flex flex-col shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-black text-white">{selectedGroup.name}</h2>
                            <button onClick={() => setIsPanelOpen(false)} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Members Section */}
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Members ({groupMembers.length})</h3>
                                    <button onClick={() => setShowAddMemberModal(true)} className="text-[10px] font-black uppercase text-indigo-400 hover:underline flex items-center gap-1">
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {loadingDetails ? <Loader2 size={24} className="animate-spin text-slate-700 mx-auto" /> : groupMembers.map((m: User) => (
                                        <div key={m.id} className="p-3 bg-white/5 rounded-2xl flex justify-between items-center">
                                            <div className="text-xs font-bold text-white">{m.email}</div>
                                            <button onClick={() => handleRemoveMember(m.id)} className="text-slate-600 hover:text-rose-400"><UserMinus size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Roles Section */}
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Roles</h3>
                                    <button onClick={() => { fetchAvailableRoles(); setShowAssignRoleModal(true); }} className="text-[10px] font-black uppercase text-amber-500 hover:underline flex items-center gap-1">
                                        <Shield size={12} /> Assign
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {selectedGroup.roles.map((r: any) => (
                                        <div key={r.id} className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex justify-between items-center">
                                            <span className="text-xs font-black text-amber-500">{r.name}</span>
                                            <button onClick={() => handleRemoveRole(r.id)} className="text-amber-700 hover:text-rose-400"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Permissions Section */}
                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Permissions Inherited</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {allPermissions.map((p: string) => (
                                        <div key={p} className="text-[11px] font-mono text-slate-400 bg-white/[0.02] p-2 rounded-lg border border-white/5">{p}</div>
                                    ))}
                                    {allPermissions.length === 0 && <p className="text-xs italic text-slate-600">No permissions found.</p>}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {/* Create Group Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-[40px] p-8">
                            <h2 className="text-2xl font-black text-white mb-6">Create New Group</h2>
                            <form onSubmit={handleCreateGroup} className="space-y-4">
                                <input type="text" placeholder="Group Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <textarea placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl font-bold">Cancel</button>
                                    <button type="submit" disabled={isActionLoading} className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-black">{isActionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Create'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Add Member Modal */}
                {showAddMemberModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-[40px] p-8">
                            <h2 className="text-2xl font-black text-white mb-2">Add Member</h2>
                            <p className="text-slate-500 text-sm mb-6">Enter the email of a user within your account.</p>
                            <form onSubmit={handleAddMember} className="space-y-4">
                                {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}
                                <input type="email" placeholder="user@example.com" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setShowAddMemberModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl font-bold">Cancel</button>
                                    <button type="submit" disabled={isActionLoading} className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-black">{isActionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Add Member'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Assign Role Modal */}
                {showAssignRoleModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-[40px] p-8">
                            <h2 className="text-2xl font-black text-white mb-6">Assign Role to Group</h2>
                            <form onSubmit={handleAssignRole} className="space-y-4">
                                <select value={selectedRoleId} onChange={e => setSelectedRoleId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white appearance-none" required>
                                    <option value="">Select a role...</option>
                                    {availableRoles.map(r => <option key={r.id} value={r.id}>{r.name} ({r.key})</option>)}
                                </select>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setShowAssignRoleModal(false)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl font-bold">Cancel</button>
                                    <button type="submit" disabled={isActionLoading} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black">{isActionLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Assign Role'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
