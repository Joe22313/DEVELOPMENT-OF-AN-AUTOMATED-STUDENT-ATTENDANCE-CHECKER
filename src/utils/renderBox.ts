import { labels } from './labels';
import { Dispatch, SetStateAction, RefObject } from 'react';

import { createClient } from '@supabase/supabase-js'
export const supabase = createClient('https://lgbirlbfeocyafnqpnpq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYmlybGJmZW9jeWFmbnFwbnBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTcwOTUwNTksImV4cCI6MjAxMjY3MTA1OX0.hwS0-I54z1ucGvFYb8gnHSrSS3RyC5kj5_AxAFbFZNg');


type Cooldowns = {
  [studentName: string]: number; // The key is the class name, and the value is a cooldown timestamp (number)
};
const cooldowns: Cooldowns = {};

const manilaTimezoneOffset = 480;

function xywh2xyxy(x: any) {
  //Convert boxes from [x, y, w, h] to [x1, y1, x2, y2] where xy1=top-left, xy2=bottom-right
  let y = [];
  y[0] = x[0] - x[2] / 2; //top left x
  y[1] = x[1] - x[3] / 2; //top left y
  y[2] = x[0] + x[2] / 2; //bottom right x
  y[3] = x[1] + x[3] / 2; //bottom right y
  return y;
}
async function saveAttendance(studentName: string){
  
    // Check if the object class is not on cooldown or enough time has passed
  if (!cooldowns[studentName] || Date.now() - cooldowns[studentName] >= 30000) {
    // Get the current UTC timestamp
    const utcTimestamp = new Date().getTime();
    // Calculate the timestamp in the Manila, Philippines timezone
    const timestamp = new Date(utcTimestamp + manilaTimezoneOffset * 60 * 1000).toISOString();
   
    let dateObj = new Date(utcTimestamp + manilaTimezoneOffset * 60 * 1000);
    let month = dateObj.getUTCMonth() + 1; //months from 1-12
    let day = dateObj.getUTCDate();
    let year = dateObj.getUTCFullYear();

    const dateNow = year + "/" + month + "/" + day;
    // Insert data into Supabase
    const detectionData = {
      name: studentName,
      date: dateNow,
      timestamp,
    };

    // Update the cooldown timestamp for the object class
    cooldowns[studentName] = Date.now();
    
    // console.log('datenow', Date.now())
    // console.log('cooldowns[studentName]', cooldowns[studentName])
    // console.log('date now - cd', Date.now() - cooldowns[studentName] )
    // console.log(studentName)
    // console.log(detectionData)
    const { data, error } = await supabase.from('detections').upsert([detectionData]);
    // Handle errors or do something with the response as needed
    if (error) {
      console.error('Supabase error:', error);
    }
    // console.log("eval", !cooldowns[studentName] || Date.now() - cooldowns[studentName] >= 30000)

  }
}
export const renderBoxes = async  (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  threshold: number,
  boxes_data: number[],
  scores_data: number[],
  classes_data: number[]
) => {
  const ctx = canvasRef.current!.getContext('2d')!;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // clean canvas
  // font configs
  const font = '20px sans-serif';
  ctx.font = font;
  ctx.textBaseline = 'top';

  for (let i = 0; i < scores_data.length; ++i) {
    if (scores_data[i] > threshold) {
      const clsName = labels[classes_data[i]];
      const score = (scores_data[i] * 100).toFixed(1);
      saveAttendance(clsName)
      let [x1, y1, x2, y2] = xywh2xyxy(boxes_data[i]);
      if (x1 < 0 || y1 < 0) return;

      const width = x2 - x1;
      const height = y2 - y1;

      // Draw the bounding box.
      ctx.strokeStyle = '#B033FF';
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, width, height);

      // Draw the label background.
      ctx.fillStyle = '#B033FF';
      const textWidth = ctx.measureText(clsName + ' - ' + score + '%').width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(
        x1 - 1,
        y1 - (textHeight + 2),
        textWidth + 2,
        textHeight + 2
      );

      // Draw labels
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        clsName + ' - ' + score + '%',
        x1 - 1,
        y1 - (textHeight + 2)
      );

  
    }
  }
 
};