import { cn } from "../../lib/utils";
import { useState } from "react";

export const Bloodline = () => {
    const [count, setCount] = useState(0);

    return (
        <div className={cn("flex flex-col items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700")}>
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Component Example</h1>
            <h2 className="text-xl font-semibold text-blue-500">{count}</h2>
            <div className="flex gap-2">
                <button
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    onClick={() => setCount((prev) => prev - 1)}
                >
                    -
                </button>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                    onClick={() => setCount((prev) => prev + 1)}
                >
                    +
                </button>
            </div>
        </div>
    );
};
