import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, MapPin, Link, FileText, Users, Type } from 'lucide-react';
import API_URL from '../config';

export default function AddEventForm({ onClose, onRefresh, eventToEdit, events = [] }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [conflict, setConflict] = useState(null);

    const [formData, setFormData] = useState({
        title: eventToEdit?.title || '',
        community: eventToEdit?.community || (user.role === 'rep' ? user.community : ''),
        type: eventToEdit?.type || 'Workshop',
        description: eventToEdit?.description || '',
        date: eventToEdit?.date || '',
        time: eventToEdit?.time || '',
        endTime: eventToEdit?.endTime || '',
        room: eventToEdit?.room || '',
        posterLink: eventToEdit?.posterLink || '',
        registrationLink: eventToEdit?.registrationLink || ''
    });

    // Check for room conflict when date, time, or room changes
    const checkConflict = (newData) => {
        const { date, room, time, endTime } = newData;
        if (!date || !room || !time || !endTime) {
            setConflict(null);
            return;
        }

        const isConflict = events.find(e =>
            e.date === date &&
            e.room.toLowerCase() === room.toLowerCase() &&
            e.status === 'approved' &&
            e._id !== eventToEdit?._id // Exclude self if editing
        );

        if (isConflict) {
            setConflict(`Room ${room} is already booked on ${date} (Event: ${isConflict.title})`);
        } else {
            setConflict(null);
        }
    };

    const handleChange = (e) => {
        const newData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newData);
        checkConflict(newData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (conflict) {
            if (!confirm('There is a room conflict. Do you still want to proceed? (It may be rejected)')) return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            const payload = {
                ...formData,
                createdBy: eventToEdit?.createdBy || user.id
            };

            if (user.role === 'hod' && !eventToEdit) {
                payload.status = 'approved';
            }

            if (eventToEdit) {
                await axios.put(`${API_URL}/events/${eventToEdit._id}`, payload, config);
            } else {
                await axios.post(`${API_URL}/events`, payload, config);
            }

            if (onRefresh) onRefresh();
            onClose();
        } catch (err) {
            console.error('Save Event Error:', err);
            console.log('Error Response:', err.response?.data);
            alert(`Failed to save event: ${err.response?.data?.msg || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Submit New Event</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {conflict && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            <span className="text-sm font-bold">{conflict}</span>
                        </div>
                    )}

                    <div className="space-y-4 text-gray-900 dark:text-white">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange}
                                className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-black dark:text-white placeholder-gray-400" placeholder="e.g. AI Workshop 2024" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Users className="w-4 h-4" /> Community</label>
                                <input type="text" name="community" required value={formData.community} onChange={handleChange}
                                    readOnly={user.role === 'rep'}
                                    className={`w-full px-4 py-2 border dark:border-slate-600 rounded-lg outline-none text-black dark:text-white ${user.role === 'rep' ? 'bg-gray-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500'}`} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Type className="w-4 h-4" /> Event Type</label>
                                <select name="type" value={formData.type} onChange={handleChange}
                                    className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-black dark:text-white">
                                    <option>Workshop</option>
                                    <option>Seminar</option>
                                    <option>Competition</option>
                                    <option>Hackathon</option>
                                    <option>Meetup</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</label>
                                <input type="date" name="date" required value={formData.date} onChange={handleChange}
                                    className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-black dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Start Time</label>
                                <input type="time" name="time" required value={formData.time} onChange={handleChange}
                                    className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-black dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> End Time</label>
                                <input type="time" name="endTime" required value={formData.endTime} onChange={handleChange}
                                    className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-black dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><MapPin className="w-4 h-4" /> Room/Area</label>
                                <input type="text" name="room" required value={formData.room} onChange={handleChange}
                                    className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-black dark:text-white" placeholder="e.g. Auditorium" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Link className="w-4 h-4" /> Poster Link (Google Drive/Image URL)</label>
                            <input type="url" name="posterLink" required value={formData.posterLink} onChange={handleChange}
                                className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-black dark:text-white" placeholder="https://..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Link className="w-4 h-4" /> Registration Link (Optional)</label>
                            <input type="url" name="registrationLink" value={formData.registrationLink} onChange={handleChange}
                                className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-black dark:text-white" placeholder="https://..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><FileText className="w-4 h-4" /> Description</label>
                            <textarea name="description" required rows="4" value={formData.description} onChange={handleChange}
                                className="w-full px-4 py-2 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-black dark:text-white" placeholder="Event details..."></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg mr-2 font-medium">Cancel</button>
                        <button type="submit" disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg transition-transform active:scale-95 disabled:opacity-50">
                            {loading ? 'Submitting...' : 'Submit Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
