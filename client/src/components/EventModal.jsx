import { X, Check, XCircle, Clock, Calendar, MapPin, Building, Users, FileText, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config';
import { useState } from 'react';

export default function EventModal({ event, onClose, onRefresh, onEdit }) {
    const { user } = useAuth();
    const [updating, setUpdating] = useState(false);

    if (!event) return null;

    // Role based permissions
    const isHOD = user?.role === 'hod';
    const isOwner = user?.role === 'rep' && event.createdBy?._id === user.id;

    // HOD can act on Pending OR Approved events (to revoke/edit)
    const canApproveReject = isHOD && (event.status === 'pending' || event.status === 'approved');

    const canEdit = isHOD || (isOwner && event.status === 'pending');

    const handleAction = async (newStatus, reason = '', suggestedDate = '') => {
        setUpdating(true);
        try {
            await axios.put(`${API_URL}/events/${event._id}`, {
                status: newStatus,
                rejectionReason: reason,
                suggestedDate: suggestedDate
            });
            onRefresh();
            onClose();
        } catch (err) {
            console.error('Failed to update event', err);
        } finally {
            setUpdating(false);
        }
    };

    // Add Trash2 to imports at top if not present, but for now I'll just use it in the snippet and rely on my own knowledge or check imports. 
    // Imports: import { X, Check, XCircle, Clock, Calendar, MapPin, Building, Users, FileText, Edit, Trash2 } from 'lucide-react';

    // Permission Logic
    const canDelete = user?.role === 'admin' || user?.role === 'hod' || (event.createdBy?._id === user?.id);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
        setUpdating(true);
        try {
            await axios.delete(`${API_URL}/events/${event._id}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            onRefresh();
            onClose();
        } catch (err) {
            console.error('Failed to delete', err);
            alert('Failed to delete event');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--border-color)] px-6 py-4 flex justify-between items-center z-10 transition-colors">
                    <div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${event.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                event.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {event.status}
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-1">{event.title}</h2>
                    </div>
                    <div className="flex gap-2">
                        {canDelete && (
                            <button onClick={handleDelete} disabled={updating} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors hidden md:block" title="Delete Event">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                        )}
                        {canEdit && (
                            <button onClick={() => onEdit(event)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors hidden md:block" title="Edit Event">
                                <Edit className="w-5 h-5 text-[var(--text-secondary)]" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            <X className="w-6 h-6 text-[var(--text-secondary)]" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Poster Preview */}
                    {event.posterLink && (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-[var(--border-color)]">
                            {/* Handling Drive Link: ideally backend processes it, or we assume it's direct link. 
                                For now, assuming direct or img tag compatible. If it's a Drive viewer link, might need embed or iframe.
                                Using img tag for now as per "Poster Preview"
                            */}
                            <img src={event.posterLink} alt="Event Poster" className="w-full h-full object-contain"
                                onError={(e) => { e.target.style.display = 'none'; }} />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ display: 'none' }}>
                                {/* Fallback if image fails */}
                                <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <span>{event.room}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span>{event.community} ({event.type})</span>
                        </div>
                        {event.createdBy && (
                            <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                                <Users className="w-5 h-5 text-green-500" />
                                <span>Added by: {event.createdBy.name || event.createdBy.username}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </div>

                    {/* Rejection Reason (if rejected) */}
                    {(event.status === 'rejected' || event.status === 'approved') && event.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-red-800 mb-1">Feedback from HOD</h3>
                            <p className="text-red-600 text-sm">{event.rejectionReason}</p>
                        </div>
                    )}

                    {/* HOD Suggested Date */}
                    {event.suggestedDate && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-yellow-600" />
                            <div>
                                <h3 className="text-sm font-semibold text-yellow-800">Suggested Date Change</h3>
                                <p className="text-yellow-700 text-sm">HOD suggests rescheduling to: <strong>{event.suggestedDate}</strong></p>
                            </div>
                        </div>
                    )}

                    {/* Registration Link (if approved) */}
                    {event.status === 'approved' && event.registrationLink && (
                        <a href={event.registrationLink} target="_blank" rel="noreferrer"
                            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center rounded-xl transition-colors">
                            Register Now
                        </a>
                    )}
                </div>

                {/* HOD Actions Area */}
                {isHOD && (event.status === 'pending' || event.status === 'rejected' || event.status === 'approved') && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-[var(--border-color)] space-y-4">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">HOD Actions</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Reason (for Rejection/Feedback)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Clash with exams"
                                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    id="actionReason"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Suggested Date (Optional)</label>
                                <input
                                    type="date"
                                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    id="actionDate"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                disabled={updating}
                                onClick={() => {
                                    const reason = document.getElementById('actionReason').value;
                                    const date = document.getElementById('actionDate').value;
                                    handleAction('rejected', reason, date);
                                }}
                                className="px-4 py-2 text-red-600 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" /> Reject & Suggest
                            </button>
                            <button
                                disabled={updating}
                                onClick={() => handleAction('approved')}
                                className="px-4 py-2 text-white bg-green-600 hover:bg-green-500 font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
                            >
                                <Check className="w-4 h-4" /> Approve Event
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
