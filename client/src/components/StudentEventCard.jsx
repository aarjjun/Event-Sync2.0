import { Calendar, Clock, MapPin, Users, UserCheck } from 'lucide-react';

export default function StudentEventCard({ event }) {
    return (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Poster Image */}
            <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                {event.posterLink ? (
                    <img
                        src={event.posterLink}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        No Poster Available
                    </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur text-xs font-bold text-gray-800 rounded-md shadow-sm">
                    {event.type}
                </div>
                {event.isPast && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-600/90 backdrop-blur text-xs font-bold text-white rounded-md shadow-sm">
                        COMPLETED
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                <div>
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">{event.community}</div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{event.title}</h3>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="text-sm truncate">{event.room}</span>
                    </div>

                    {/* Creator Info */}
                    {event.createdBy && (
                        <div className="flex items-center gap-2 text-slate-400 mt-1">
                            <UserCheck className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs">
                                Added by: <span className="text-slate-300">{event.createdBy.name || event.createdBy.username}</span>
                                {event.createdBy.community && <span className="text-slate-500"> ({event.createdBy.community})</span>}
                            </span>
                        </div>
                    )}
                </div>

                <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {event.description}
                </p>

                {event.registrationLink ? (
                    <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-center rounded-lg transition-colors"
                    >
                        Register Now
                    </a>
                ) : (
                    <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed">
                        Registration Closed
                    </button>
                )}
            </div>
        </div>
    );
}
