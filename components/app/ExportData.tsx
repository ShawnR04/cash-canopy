import { Download } from "lucide-react";

export default function ExportData(){
    return(
        <>
            <button
                className="bg-secondary h-12 hover:scale-105 p-2 gap-2 font-semibold flex items-center rounded-md transition-all duration-300"
            >
                <Download className="w-6 h-6"/>
                Export Data
            </button>
        </>
    );
}