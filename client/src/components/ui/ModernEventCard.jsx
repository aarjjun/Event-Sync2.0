import React, { useState, useEffect } from 'react';
import { Clock, Users, ChevronDown, MapPin, ExternalLink, Calendar as CalendarIcon, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RainbowButton } from './RainbowButton';
import { cn } from '../../lib/utils';

const ModernEventCard = ({ event }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLive, setIsLive] = useState(false);

    // Check if event is LIVE
    useEffect(() => {
        const checkLiveStatus = () => {
            const now = new Date();
            // Parse event dates (Assumes YYYY-MM-DD and HH:mm 24h format)
            const start = new Date(`${event.date}T${event.time}`);
            const end = new Date(`${event.date}T${event.endTime}`);

            if (now >= start && now <= end) {
                setIsLive(true);
            } else {
                setIsLive(false);
            }
        };

        checkLiveStatus();
        const interval = setInterval(checkLiveStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [event]);

    // Add to Google Calendar
    const addToCalendar = (e) => {
        e.stopPropagation();
        const title = encodeURIComponent(event.title);

        // Format dates to YYYYMMDDTHHMMSSZ
        // Note: Simple implementation assuming local time for now or simple string ISO creation
        const formatDate = (dateStr, timeStr) => {
            const date = new Date(`${dateStr}T${timeStr}`);
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };

        const startStr = formatDate(event.date, event.time);
        const endStr = formatDate(event.date, event.endTime);

        const details = encodeURIComponent(
            `${event.description}\n\nVenue: ${event.room}\n\nPoster: ${event.posterLink}`
        );
        const location = encodeURIComponent(event.room);

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
        window.open(url, '_blank');
    };

    // Map event type/community to a color class
    const getColorClass = (community) => {
        const colors = {
            'Computer Science': 'border-blue-500 shadow-blue-500/10',
            'Mathematics': 'border-orange-500 shadow-orange-500/10',
            'Physics': 'border-purple-500 shadow-purple-500/10',
            'History': 'border-red-500 shadow-red-500/10',
            'default': 'border-green-500 shadow-green-500/10'
        };
        return colors[community] || colors['default'];
    };

    const getAccentColor = (community) => {
        const colors = {
            'Computer Science': 'text-blue-500 bg-blue-500',
            'Mathematics': 'text-orange-500 bg-orange-500',
            'Physics': 'text-purple-500 bg-purple-500',
            'History': 'text-red-500 bg-red-500',
            'default': 'text-green-500 bg-green-500'
        };
        return colors[community] || colors['default'];
    };

    const colorClass = getColorClass(event.community);
    // Destructure text and bg classes effectively
    const accentClass = getAccentColor(event.community);
    const accentText = accentClass.split(' ')[0];
    const accentBg = accentClass.split(' ')[1];

    const handleRegister = (e) => {
        e.stopPropagation();
        if (event.registrationLink) {
            window.open(event.registrationLink, '_blank');
        } else {
            alert('No registration link available');
        }
    };

    return (
        <motion.div
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
                "relative bg-white dark:bg-[#232228] rounded-[30px] p-2 overflow-hidden cursor-pointer backdrop-blur-xl border border-transparent hover:border-l-4 transition-all duration-300 shadow-lg",
                isExpanded ? "col-span-1 md:col-span-2 row-span-2 z-20" : "",
                colorClass
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Poster Image Area */}
            <motion.div
                layout
                className={cn(
                    "w-full rounded-[24px] overflow-hidden bg-gray-100 relative mb-4",
                    isExpanded ? "h-64" : "h-40"
                )}
            >
                {event.posterLink ? (
                    <img
                        src={event.posterLink}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-400 text-sm">
                        No Poster
                    </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2">
                    {isLive && (
                        <div className="px-3 py-1 bg-red-500/90 backdrop-blur-md text-xs font-bold text-white rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                            <Zap className="w-3 h-3 fill-current" /> LIVE
                        </div>
                    )}
                    <div className="px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold text-gray-800 rounded-full shadow-lg">
                        {event.community}
                    </div>
                </div>
            </motion.div>

            {/* Content Body */}
            <div className="px-4 flex flex-col">
                <motion.div layout className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.date} • {event.time} - {event.endTime}
                    </span>
                </motion.div>

                <motion.h3 layout className="text-xl font-bold text-gray-800 dark:text-white leading-tight mb-2">
                    {event.title}
                </motion.h3>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-gray-500 dark:text-gray-400 mb-4"
                        >
                            <p className="mb-4">{event.description || "No description provided."}</p>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${accentBg} bg-opacity-10`}>
                                        <MapPin className={`w-4 h-4 ${accentText}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Room</p>
                                        <p className="text-sm font-semibold">{event.room}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${accentBg} bg-opacity-10`}>
                                        <Users className={`w-4 h-4 ${accentText}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Access</p>
                                        <p className="text-sm font-semibold">Students</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <motion.div layout className="px-4 pb-2 mt-4">
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex flex-col">
                        {!isExpanded && (
                            <>
                                <span className="text-[10px] uppercase text-gray-400 font-bold">Venue</span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{event.room}</span>
                            </>
                        )}
                        {isExpanded && (
                            <button
                                onClick={addToCalendar}
                                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors"
                            >
                                <CalendarIcon className="w-3.5 h-3.5" />
                                Add to Calendar
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors"
                        >
                            <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isExpanded ? "rotate-180" : "")} />
                        </button>

                        <RainbowButton
                            onClick={handleRegister}
                            className={cn(
                                "h-9 rounded-full px-6 text-xs font-bold shadow-lg",
                                accentBg
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <span>Register</span>
                                {isExpanded && <ExternalLink className="w-3 h-3" />}
                            </span>
                        </RainbowButton>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ModernEventCard;
