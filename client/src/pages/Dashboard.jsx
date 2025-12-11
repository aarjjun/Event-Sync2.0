import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CalendarComponent from '../components/CalendarComponent';
// import StudentDashboard from '../components/StudentDashboard'; // Replaced by inline UI
// import StudentEventCard from '../components/StudentEventCard';
import ModernEventCard from '../components/ui/ModernEventCard';
import AdminDashboard from '../components/AdminDashboard';
import HODDashboard from '../components/HODDashboard';
import EventModal from '../components/EventModal';
import AddEventForm from '../components/AddEventForm';
import { useAuth } from '../context/AuthContext';
import { Plus, LayoutGrid, Calendar as CalendarIcon, Users, Filter, Search } from 'lucide-react';
import ExportControls from '../components/ExportControls';
import API_URL from '../config';

export default function Dashboard() {
    const { user } = useAuth();

    // Unified View State: 'calendar', 'list', 'management'
    // Default to 'calendar' for everyone except Student (who defaults to list/calendar depending)
    const [viewMode, setViewMode] = useState('calendar');

    // Filter State: 'all', 'student', 'teacher'
    // Default to 'all' to show everything user is allowed to see
    const [audienceFilter, setAudienceFilter] = useState('all');

    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/events`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            let data = res.data;

            // Student only sees approved events (Backend handles most visibility, just safety check)
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

    // --- Derived Data: Filtered Events ---
    // --- Filtering Logic ---
    const [searchTerm, setSearchTerm] = useState('');
    const [showPastEvents, setShowPastEvents] = useState(false);

    const getFilteredEvents = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = events;

        // 1. Role-based Visibility: Strict 'Approved' for Students/Teachers
        // Admin/HOD see everything (Pending, Approved, Rejected)
        if (user?.role === 'student' || user?.role === 'teacher') {
            filtered = filtered.filter(e => e.status === 'approved');
        }

        // 2. Search
        if (searchTerm) {
            const lowerInfo = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(lowerInfo) ||
                e.community.toLowerCase().includes(lowerInfo) ||
                e.room.toLowerCase().includes(lowerInfo)
            );
        }

        // 3. Target Audience
        if (audienceFilter !== 'all') {
            if (audienceFilter === 'student') {
                filtered = filtered.filter(e => e.targetAudience === 'student' || !e.targetAudience);
            } else {
                filtered = filtered.filter(e => e.targetAudience === audienceFilter);
            }
        }

        // 4. Past vs Future
        filtered = filtered.filter(e => {
            const eventDate = new Date(e.date);
            if (showPastEvents) {
                return eventDate < today; // Only past
            } else {
                return eventDate >= today; // Only future/today
            }
        });

        // 5. Sort Chronologically
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Reverse sort for past events (Most recent past first)
        if (showPastEvents) {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // Inject isPast flag for UI
        return filtered.map(e => ({ ...e, isPast: new Date(e.date) < today }));
    };

    const displayEvents = getFilteredEvents();

    // --- Handlers ---
    const handleEventClick = (info) => {
        // Create a synthetic event object similar to what DB returns or what modal expects
        const clickedEvent = events.find(e => e._id === info.event.extendedProps._id) || info.event.extendedProps;
        setSelectedEvent(clickedEvent);
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

    // --- Permissions ---
    // Add Event: HOD, Rep, Teacher, Admin (Admin usually can)
    const canAddEvent = ['hod', 'rep', 'teacher', 'admin'].includes(user?.role);

    // canManage: Admin or HOD
    const canManage = ['admin', 'hod'].includes(user?.role);

    // canFilter: Teachers, HODs, Admins
    const canFilter = ['teacher', 'hod', 'admin'].includes(user?.role);

    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <Navbar />
            <main className="p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* --- Unified Header & Controls --- */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#1e293b] dark:bg-slate-800 p-6 rounded-2xl border border-white/5 shadow-xl">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                            <p className="text-slate-400 text-sm mt-1">
                                Welcome back, {user?.username} ({user?.role})
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">

                            {/* View Switcher Tabs */}
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <CalendarIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Calendar</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="hidden sm:inline">Events</span>
                                </button>
                                {canManage && (
                                    <button
                                        onClick={() => setViewMode('management')}
                                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'management' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <Users className="w-4 h-4" />
                                        <span className="hidden sm:inline">Manage</span>
                                    </button>
                                )}
                            </div>

                            <div className="h-8 w-[1px] bg-slate-700 hidden sm:block" />

                            {/* Audience Filter (Staff Only) */}
                            {canFilter && (
                                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 items-center">
                                    <Filter className="w-4 h-4 text-slate-500 ml-2 mr-1" />
                                    <select
                                        value={audienceFilter}
                                        onChange={(e) => setAudienceFilter(e.target.value)}
                                        className="bg-transparent text-sm text-slate-300 border-none focus:ring-0 cursor-pointer py-1 pl-1 pr-6"
                                    >
                                        <option value="all">All Events</option>
                                        <option value="student">Student Only</option>
                                        <option value="teacher">Teacher Only</option>
                                    </select>
                                </div>
                            )}

                            {/* Actions */}
                            {user?.role !== 'student' && <ExportControls events={displayEvents} />}

                            {canAddEvent && (
                                <button
                                    onClick={() => setShowAddEvent(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="hidden sm:inline">Add Event</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- Main Content Area --- */}
                    <div className="min-h-[600px]">
                        {loading ? (
                            <div className="h-96 flex items-center justify-center">
                                <p className="animate-pulse text-slate-400">Loading...</p>
                            </div>
                        ) : (
                            <>
                                {/* Calendar View */}
                                {viewMode === 'calendar' && (
                                    <div className="bg-white rounded-2xl p-6 text-black shadow-xl h-[800px]">
                                        <CalendarComponent events={displayEvents} onEventClick={handleEventClick} />
                                    </div>
                                )}

                                {/* Event List View */}
                                {viewMode === 'list' && (
                                    <div className="pb-10 space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                                        {/* Search & Controls */}
                                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                                            <div className="relative w-full md:w-96">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Search events (title, room, community)..."
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                                />
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                                                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${showPastEvents ? 'bg-blue-600 border-blue-600' : 'border-slate-400'}`}>
                                                        {showPastEvents && <Users className="w-3 h-3 text-white" />}
                                                        {/* Icon placeholder, using checkmark logic is better but simple for now */}
                                                        {showPastEvents && <div className="absolute w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={showPastEvents}
                                                        onChange={e => setShowPastEvents(e.target.checked)}
                                                        className="hidden"
                                                    />
                                                    Show Past Events
                                                </label>
                                            </div>
                                        </div>

                                        {displayEvents.length === 0 ? (
                                            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                                                <CalendarIcon className="w-16 h-16 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                                                <h3 className="text-xl font-bold text-gray-400 dark:text-slate-500">
                                                    {showPastEvents ? 'No past events found' : 'No upcoming events found'}
                                                </h3>
                                                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {displayEvents.map(event => (
                                                    <ModernEventCard
                                                        key={event._id}
                                                        event={event}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Management View */}
                                {viewMode === 'management' && (
                                    <div className="animate-in fade-in zoom-in-95 duration-200">
                                        {user?.role === 'admin' ? <AdminDashboard /> : <HODDashboard />}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
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
