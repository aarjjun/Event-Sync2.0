import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, FileText, ChevronDown, CalendarDays } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ExportControls({ events }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [selectedMonth, setSelectedMonth] = useState('all');

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // Generate Month Options (Last 6 months + Next 6 months relative to today, or just distinct months from events)
    // Dynamic approach: Get distinct YYYY-MM from available events
    const getAvailableMonths = () => {
        const months = new Set();
        events.forEach(e => {
            if (!e.date) return;
            const date = new Date(e.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(key);
        });
        return Array.from(months).sort().reverse();
    };

    const getFilteredData = (filterType) => {
        let filtered = [...events];

        // 1. Filter by Status (unless 'all')
        if (filterType !== 'all' && filterType !== 'approved') {
            // If filterType is passed as logic, use it. But usually we handle status inside.
        }
        if (filterType === 'approved') {
            filtered = filtered.filter(e => e.status === 'approved');
        }

        // 2. Filter by Month
        if (selectedMonth !== 'all') {
            filtered = filtered.filter(e => e.date.startsWith(selectedMonth));
        }

        // Sort by Date
        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const handleExportPDF = (filterType) => {
        const doc = new jsPDF();
        const data = getFilteredData(filterType);
        const monthLabel = selectedMonth === 'all' ? 'All Time' : new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

        // --- 1. Header Section ---
        doc.setFillColor(30, 41, 59); // Dark Slate Blue
        doc.rect(0, 0, 210, 30, 'F');

        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Event Sync TIST", 14, 18);

        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.setFont("helvetica", "normal");
        const downloadDate = new Date().toLocaleString();
        doc.text(`Generated on: ${downloadDate}`, 14, 25);
        doc.text(`Scope: ${monthLabel} | Status: ${filterType === 'all' ? 'All Events' : 'Approved Only'}`, 200, 25, { align: 'right' });

        // --- 2. Executive Summary ---
        let currentY = 40;
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Executive Summary", 14, currentY);

        currentY += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Events: ${data.length}`, 14, currentY);

        if (selectedMonth !== 'all') {
            // --- 3. Visual Calendar Grid (Only if single month selected) ---
            currentY += 15;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Monthly Calendar View", 14, currentY);

            // Define Grid
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const year = parseInt(selectedMonth.split('-')[0]);
            const month = parseInt(selectedMonth.split('-')[1]) - 1;

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            let gridY = currentY + 5;
            const cellWidth = 26;
            const cellHeight = 20;
            const startX = 14;

            // Draw Header
            doc.setFontSize(9);
            doc.setFillColor(41, 128, 185); // Blue
            doc.setTextColor(255, 255, 255);
            daysOfWeek.forEach((day, i) => {
                doc.rect(startX + (i * cellWidth), gridY, cellWidth, 8, 'F');
                doc.text(day, startX + (i * cellWidth) + 13, gridY + 5, { align: 'center' });
            });

            // Draw Days
            gridY += 8;
            doc.setTextColor(0, 0, 0);
            let currentDay = 1;
            let xIndex = firstDay;
            let yIndex = 0;

            // Events map: day -> count
            const dayEvents = {};
            data.forEach(e => {
                const d = new Date(e.date).getDate();
                if (!dayEvents[d]) dayEvents[d] = [];
                dayEvents[d].push(e);
            });

            while (currentDay <= daysInMonth) {
                const x = startX + (xIndex * cellWidth);
                const y = gridY + (yIndex * cellHeight);

                // Cell Border
                doc.setDrawColor(200, 200, 200);
                doc.rect(x, y, cellWidth, cellHeight);

                // Day Number
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.text(String(currentDay), x + 2, y + 4);

                // Event Dots/Counts
                if (dayEvents[currentDay]) {
                    doc.setFontSize(7);
                    doc.setTextColor(41, 128, 185);
                    const count = dayEvents[currentDay].length;
                    // Show titles if space permits, otherwise count
                    if (count <= 2) {
                        dayEvents[currentDay].forEach((ev, idx) => {
                            const title = ev.title.length > 8 ? ev.title.substring(0, 7) + '..' : ev.title;
                            doc.text(`• ${title}`, x + 2, y + 8 + (idx * 4));
                        });
                    } else {
                        doc.text(`${count} Events`, x + 13, y + 12, { align: 'center' });
                    }
                }
                doc.setTextColor(0, 0, 0);

                currentDay++;
                xIndex++;
                if (xIndex > 6) {
                    xIndex = 0;
                    yIndex++;
                }
            }
            currentY = gridY + ((yIndex + 1) * cellHeight) + 15;
        } else {
            currentY += 15;
        }

        // --- 4. Detailed Agenda Table ---
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text("Detailed Event Agenda", 14, currentY);

        const tableColumn = ["Date", "Time", "Event Details", "Venue", "Status"];
        const tableRows = data.map(e => [
            e.date,
            e.time,
            `${e.title}\nBy: ${e.createdBy?.name || e.createdBy?.username || 'Unknown'} (${e.createdBy?.community || 'N/A'})\nTarget: ${e.targetAudience || 'Public'}`,
            e.room,
            e.status.toUpperCase()
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: currentY + 5,
            theme: 'grid',
            headStyles: {
                fillColor: [30, 41, 59],
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: 3
            },
            columnStyles: {
                2: { cellWidth: 70 } // Wider column for details
            },
            alternateRowStyles: {
                fillColor: [241, 245, 249]
            }
        });

        // Footer
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${totalPages}`, 200, 290, { align: 'right' });
            doc.text(`Event Sync System - Departmental Report`, 14, 290);
        }

        doc.save(`EventSync_Report_${monthLabel.replace(' ', '_')}.pdf`);
        setIsOpen(false);
    };

    const handleExportExcel = (filterType) => {
        const data = getFilteredData(filterType);
        const ws = XLSX.utils.json_to_sheet(data.map(e => ({
            Title: e.title,
            Date: e.date,
            Time: e.time,
            Room: e.room,
            Community: e.community,
            Organizer: e.createdBy?.username,
            Audience: e.targetAudience,
            Status: e.status,
            Description: e.description
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Events");
        XLSX.writeFile(wb, `events_export.xlsx`);
        setIsOpen(false);
    };

    const availableMonths = getAvailableMonths();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-lg font-medium transition-all shadow-lg border border-slate-600"
            >
                <Download className="w-5 h-5 text-blue-400" />
                <span className="hidden sm:inline">Export Report</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden text-black dark:text-white animate-in fade-in zoom-in-95 duration-100">

                    {/* Month Selector */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                            Select Period
                        </label>
                        <div className="relative">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="all">Full Academic Year (All Time)</option>
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>
                                        {new Date(m).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </option>
                                ))}
                            </select>
                            <CalendarDays className="w-4 h-4 absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="p-2">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Actions</div>

                        <button onClick={() => handleExportPDF('all')} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-2 text-sm transition-colors">
                            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded text-red-600 dark:text-red-400">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="font-semibold block">Download PDF Report</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Includes Calendar & Details</span>
                            </div>
                        </button>

                        <button onClick={() => handleExportExcel('all')} className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg flex items-center gap-2 text-sm transition-colors mt-1">
                            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded text-green-600 dark:text-green-400">
                                <FileSpreadsheet className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="font-semibold block">Export as Excel</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Raw data for analysis</span>
                            </div>
                        </button>
                    </div>

                    <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-700 text-center text-xs text-slate-500">
                        {events.length} events available
                    </div>
                </div>
            )}
        </div>
    );
}
