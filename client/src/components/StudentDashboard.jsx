import ModernEventCard from './ui/ModernEventCard';

export default function StudentDashboard({ events }) {
    if (events.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <p className="text-lg font-medium">No upcoming events found</p>
                <p className="text-sm">Check back later for updates</p>
            </div>
        );
    }

    const handleRegister = (event) => {
        // Placeholder for register logic
        alert(`Registered for ${event.title}!`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {events.map((event) => (
                <ModernEventCard key={event._id} event={event} onRegister={handleRegister} />
            ))}
        </div>
    );
}
