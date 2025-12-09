import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ExportControls({ events }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const getFilteredData = (filterType) => {
        if (filterType === 'all') return events;
        return events.filter(e => e.status === filterType);
    };

    const handleExportPDF = (filterType) => {
        const doc = new jsPDF();
        const data = getFilteredData(filterType);

        doc.text(`Event List - ${filterType.toUpperCase()}`, 14, 15);

        const tableColumn = ["Title", "Date", "Time", "Room", "Community", "Status"];
        const tableRows = [];

        data.forEach(event => {
            const eventData = [
                event.title,
                event.date,
                event.time,
                event.room,
                event.community,
                event.status
            ];
            tableRows.push(eventData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save(`events_${filterType}.pdf`);
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
            Type: e.type,
            Status: e.status,
            Description: e.description,
            Poster: e.posterLink
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Events");
        XLSX.writeFile(wb, `events_${filterType}.xlsx`);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-lg"
            >
                <Download className="w-5 h-5" /> Export Data
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-black animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Export All Events</div>
                    <button onClick={() => handleExportPDF('all')} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"><FileText className="w-4 h-4 text-red-500" /> Export as PDF</button>
                    <button onClick={() => handleExportExcel('all')} className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"><FileSpreadsheet className="w-4 h-4 text-green-600" /> Export as Excel</button>

                    <div className="p-2 border-b border-t text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Approved Only</div>
                    <button onClick={() => handleExportPDF('approved')} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"><FileText className="w-4 h-4 text-red-500" /> Export as PDF</button>
                    <button onClick={() => handleExportExcel('approved')} className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"><FileSpreadsheet className="w-4 h-4 text-green-600" /> Export as Excel</button>
                </div>
            )}
        </div>
    );
}
