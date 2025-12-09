import StudentEventCard from './StudentEventCard';

export default function StudentDashboard({ events }) {
    if (events.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <p className="text-lg font-medium">No upcoming events found</p>
                <p className="text-sm">Check back later for updates</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
                <StudentEventCard key={event._id} event={event} />
            ))}
        </div>
    );
}
