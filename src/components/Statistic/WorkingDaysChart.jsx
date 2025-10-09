import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);


const WorkingDaysChart = ({ workingDaysData }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');

        const data = {
            labels: workingDaysData.map(day => day.date),
            datasets: [
                {
                    label: 'Số Ngày Làm Việc',
                    data: workingDaysData.map(day => day.workingDays),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,

                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Tháng Trong Năm',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Số Ngày Làm Việc',
                        },
                        beginAtZero: true,
                    },
                },
            },
        };

        const chart = new Chart(ctx, config);

        return () => {
            chart.destroy();
        };
    }, [workingDaysData]);
    return (
        <div className="chart-container" style={{ width: '800px', height: '400px' }}>
            <canvas ref={canvasRef} width={800} height={400} />
        </div>
    );

};

export default WorkingDaysChart;
