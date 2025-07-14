import React from 'react';

interface ChartDataItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartDataItem[];
  title: string;
  barColor?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, barColor = 'bg-blue-500' }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1); // Avoid division by zero
  const containerHeightPx = 256; // h-64 is 16rem = 256px

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-end h-64 space-x-2 md:space-x-4" aria-label={`Grafico a barre per ${title}`}>
        {data.map((item, index) => {
            const barHeightPx = (item.value / maxValue) * containerHeightPx;
            // The text is shifted up by 1rem (16px). If the bar is shorter than that,
            // the text will appear on the white background.
            const isTextOutsideBar = barHeightPx < 16; 
            const textColor = isTextOutsideBar ? 'text-gray-700' : 'text-white';

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end h-full">
                  <div
                    className={`w-full ${barColor} rounded-t-md hover:opacity-80 transition-opacity`}
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                    role="presentation"
                    aria-label={`${item.label}: ${item.value}`}
                    title={`${item.label}: ${item.value}`}
                  >
                     <span className={`${textColor} text-xs font-bold relative -top-4 text-center block`}>{item.value > 0 ? item.value : ''}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-center text-gray-500">{item.label}</div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default BarChart;
