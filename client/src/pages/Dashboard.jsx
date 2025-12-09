import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CalendarComponent from '../components/CalendarComponent';
import StudentDashboard from '../components/StudentDashboard';
import AdminDashboard from '../components/AdminDashboard';
import EventModal from '../components/EventModal';
import AddEventForm from '../components/AddEventForm';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import ExportControls from '../components/ExportControls';
import API_URL from '../config';

export default function Dashboard() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/events`);
            let data = res.data;

            // Student only sees approved events
            if (user?.role === 'student') {
                data = data.filter(e => e.status === 'approved');
            }

            setEvents(data);
        } catch (err) {
            console.error('Failed to fetch events', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchEvents();
    }, [user]);

    const handleEventClick = (info) => {
        setSelectedEvent(info.event.extendedProps);
    };

    const handleEditEvent = (event) => {
        setEventToEdit(event);
        setSelectedEvent(null);
        setShowAddEvent(true);
    };

    const handleCloseAddForm = () => {
        setShowAddEvent(false);
        setEventToEdit(null);
    };

    // Add Event permission: HOD or Rep.
    const canAddEvent = user?.role === 'hod' || user?.role === 'rep';
    const isHOD = user?.role === 'hod';

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <Navbar />
            <main className="p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header with Add Event Button */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1e293b] dark:bg-slate-800 p-6 rounded-2xl border border-white/5 shadow-xl">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
                            <p className="text-slate-400 text-sm mt-1">Manage and view schedule</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {isHOD && <ExportControls events={events} />}

                            {canAddEvent && (
                                <button
                                    onClick={() => setShowAddEvent(true)}
                                    className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="md:hidden">Add Event</span>
                                    <span className="hidden md:inline">Add New Event</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    {user?.role === 'admin' ? (
                        <AdminDashboard />
                    ) : user?.role === 'student' ? (
                        <div className="pb-10">
                            {loading ? (
                                <div className="h-64 flex items-center justify-center text-[var(--text-secondary)]">
                                    <p className="animate-pulse">Loading events...</p>
                                </div>
                            ) : (
                                <StudentDashboard events={events} />
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-6 text-black shadow-xl h-[800px]">
                            {loading ? (
                                <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl">
                                    <p className="text-gray-500 animate-pulse">Loading events...</p>
                                </div>
                            ) : (
                                <CalendarComponent events={events} onEventClick={handleEventClick} />
                            )}
                        </div>
                    )}
                </div>
            </main>

            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onRefresh={fetchEvents}
                    onEdit={handleEditEvent}
                />
            )}

            {showAddEvent && (
                <AddEventForm
                    onClose={handleCloseAddForm}
                    onRefresh={fetchEvents}
                    eventToEdit={eventToEdit}
                    events={events}
                />
            )}
        </div>
    );
}
