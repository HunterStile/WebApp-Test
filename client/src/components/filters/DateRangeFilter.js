import React from 'react';

const DateRangeFilter = ({ 
    dateRange,  
    setDateRange 
}) => {
    const today = new Date().toISOString().split('T')[0];

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearDates = () => {
        setDateRange({
            startDate: '',
            endDate: ''
        });
    };

    const isDateRangeValid = () => {
        if (!dateRange.startDate || !dateRange.endDate) return true;
        return new Date(dateRange.startDate) <= new Date(dateRange.endDate);
    };

    return (
        <div className="w-full">
            <h3 className="text-sm text-slate-400 mb-2">Filter by Date Range</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="startDate"
                            className="block text-sm font-medium text-slate-300"
                        >
                            From:
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={dateRange.startDate}
                            min={today}
                            max={dateRange.endDate || undefined}
                            onChange={handleDateChange}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     placeholder-slate-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="endDate"
                            className="block text-sm font-medium text-slate-300"
                        >
                            To:
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={dateRange.endDate}
                            min={dateRange.startDate || today}
                            onChange={handleDateChange}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     placeholder-slate-400"
                        />
                    </div>
                </div>

                {(dateRange.startDate || dateRange.endDate) && (
                    <button
                        onClick={clearDates}
                        className="inline-flex items-center px-3 py-2 text-sm rounded-lg
                   bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        Clear Dates
                    </button>
                )}

                {!isDateRangeValid() && (
                    <div className="text-red-400 text-sm bg-red-500/10 border border-red-500 rounded-lg p-2">
                        End date must be after start date
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateRangeFilter;