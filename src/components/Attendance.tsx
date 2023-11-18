import React, {useState, useEffect} from 'react'
import {supabase} from "../utils/renderBox";
import { time } from 'node:console';

function parseISOString(s: string) {
    const date = new Date(s)

    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    
    const period = hours < 12 ? 'AM' : 'PM';
    const hours12 = (hours % 12) || 12; // Handle midnight (0) as 12 in 12-hour format

    const formattedTime = `${month}/${day}/${year}      ${hours12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;

    return formattedTime;
  }
  const convertToCSV = (data: Record<string, any>[]) => {
    if (data.length === 0) {
      return '';
    }
  
    const header = Object.keys(data[0]).join(',');
    const csv = data.map((row) => Object.values(row).join(',')).join('\n');
    return header + '\n' + csv;
 };

const manilaTimezoneOffset = 480;
const Attendance = ()=>{
    const [res, setRes] = useState<any[]>([]);
  
    useEffect(()=>{
        const utcTimestamp = new Date().getTime();
        let dateObj = new Date(utcTimestamp + manilaTimezoneOffset * 60 * 1000);
        let month = dateObj.getUTCMonth() + 1; //months from 1-12
        let day = dateObj.getUTCDate();
        let year = dateObj.getUTCFullYear();

        const dateNow = year + "/" + month + "/" + day;
        const getDetections = async() =>{
            const timestamp = new Date(utcTimestamp + manilaTimezoneOffset * 60 * 1000).toISOString();
            const channel = supabase
            .channel('schema-db-changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'detections',
              },
              (payload) => setRes(prev=>[...prev, payload.new])
            )
            .subscribe()
            const { data, error } = await supabase.from('detections').select().gte('date', dateNow)
            console.log(error)
            setRes(data!)
        }
    
        getDetections();
    }, [setRes]);
    const handleGenerateWeeklyReport = () => {
        // Fetch the data and export to CSV here
        const fetchDataAndExportToCSV = async () => {
          try {
            const utcTimestamp = new Date().getTime();
            let dateObj = new Date(utcTimestamp + manilaTimezoneOffset * 60 * 1000);
            let month = dateObj.getUTCMonth() + 1; //months from 1-12
            let day = dateObj.getUTCDate();
            let year = dateObj.getUTCFullYear();
            

            const dateNow = year + "/" + month + "/" + day;
    

            const { data, error } = await supabase
              .from('detections')
              .select()
              .gte('date', dateNow);
    
            if (error) {
              console.error('Error fetching data:', error);
              return;
            }
    
            // Convert data to CSV format
            const csvData = convertToCSV(data);
    
            // Create a Blob and trigger download
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'weekly_report.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Error exporting CSV:', error);
          }
        };
    
        fetchDataAndExportToCSV();
      };
    return (

        <>
        <div className="flex flex-col justify-center items-center w-[800px]  mt-24">
            <div className="w-[500px] h-[750px] max-h-[750px] overflow-hidden overflow-y-auto overflow-y-visible">
            {res && res.length > 0 && res.map((attendance, i) => 
            <div key={i} className="border rounded-lg flex flex-col px-12 py-6">
            <h2 className="font-bold text-xl">{attendance.name}</h2>
            <p className="">{parseISOString(attendance.timestamp)}</p>
            </div>
            )}
            </div>
            <button onClick={handleGenerateWeeklyReport} className="bg-green-500 text-white font-bold w-fit px-5 py-2 mt-2 text-lg rounded-lg">Generate weekly report</button>

        </div>
        </>
        // <>{res.length > 0 && res.map((a, i) => console.log(a.name))}</>
    );
}
export default Attendance