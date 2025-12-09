import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarComponent({ events, onEventClick }) {

    // Custom render to handle colors dynamically if not set in event object
    // But better to map events before passing to FullCalendar

    // Actually FullCalendar supports 'color' property in event object. 
    // Or classNames. 'bg-green-500', etc.
    // Spec says: Green (Approved), Yellow (Pending), Red (Rejected).

    return (
        <div className="h-full w-full calendar-custom">
            <style>{`
                .fc-event { cursor: pointer; border: none; }
                .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 700; }
                .fc-button-primary { background-color: #2563eb !important; border-color: #2563eb !important; }
                .fc-button-primary:hover { background-color: #1d4ed8 !important; border-color: #1d4ed8 !important; }
                .fc-button-active { background-color: #1e40af !important; border-color: #1e40af !important; }
                
                /* Custon Status Colors */
                .event-approved { background-color: #10b981 !important; border-left: 4px solid #065f46 !important; color: white !important; }
                .event-pending { background-color: #eab308 !important; border-left: 4px solid #854d0e !important; color: black !important; }
                .event-rejected { background-color: #ef4444 !important; border-left: 4px solid #7f1d1d !important; color: white !important; }
            `}</style>

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,listWeek'
                }}
                events={events.map(evt => ({
                    id: evt._id,
                    title: evt.title,
                    start: `${evt.date}T${evt.time}`, // Assuming date is ISO YYYY-MM-DD
                    className: `event-${evt.status}`,
                    extendedProps: { ...evt }
                }))}
                eventClick={onEventClick}
                height="100%"
                dayMaxEvents={true}
            />
        </div>
    );
}
