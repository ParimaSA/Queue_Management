import React from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

Chart.register(ArcElement, Tooltip, Legend);

const TOTAL_ENTRY_API_URL = "/api/analytic/number_entry";

interface Entry {
  total_entry: number;
  complete_entry: number;
  waiting_entry: number;
  cancel_entry: number;
}

const EntryChart = () => {
  const { data: entryData, error: entryError } = useSWR<Entry>(TOTAL_ENTRY_API_URL, fetcher);

  if (entryError) {
    return <p>Error loading data.</p>;
  }

  if (!entryData) {
    return <p>Loading...</p>;
  }

  const totalEntry = entryData.total_entry || 0;

  // Data for Doughnut Chart
  const pieData = {
    labels: ['Waiting', 'Complete', 'Cancel'],
    datasets: [
      {
        data: [
          entryData.waiting_entry || 0,
          entryData.complete_entry || 0,
          entryData.cancel_entry || 0,
        ],
        backgroundColor: ['#FFCE56', '#4CAF50', '#FF5252'],
        hoverBackgroundColor: ['#FFCE56', '#4CAF50', '#FF5252'],
      },
    ],
  };

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart: Chart<'doughnut', number[], unknown>) => {
      const ctx = chart.ctx;
      ctx.save();
      const text1 = 'Total Entry';
      const text2 = totalEntry.toString();

      ctx.font = `20px Arial`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      const centerX = chart.getDatasetMeta(0).data[0].x;
      const centerY = chart.getDatasetMeta(0).data[0].y;

      ctx.fillText(text1, centerX, centerY-30);
      ctx.font = `900 50px Arial`;
      ctx.fillText(text2, centerX, centerY+15);
      ctx.restore();
    },
  };

  return (
    <div style={{ width: '350px', height: '350px', margin: 'auto' }}>
      <Doughnut 
        data={pieData} 
        plugins={[centerTextPlugin]} 
        options={{
            cutout: '60%',  
          }}
      />
    </div>
    
  );
};

export default EntryChart;
