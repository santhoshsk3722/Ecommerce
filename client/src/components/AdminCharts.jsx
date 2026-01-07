import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const SalesByCategoryChart = ({ data }) => {
    if (!data || data.length === 0) return <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No sales data yet</div>;

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="revenue"
                        nameKey="category"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const TopProductsTable = ({ data }) => {
    if (!data || data.length === 0) return <div>No data</div>;

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Product</th>
                        <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Units Sold</th>
                        <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px', fontWeight: '500', color: 'var(--text-main)' }}>{item.title}</td>
                            <td style={{ padding: '10px', color: 'var(--text-main)' }}>{item.sold}</td>
                            <td style={{ padding: '10px', color: 'var(--success)', fontWeight: 'bold' }}>${item.revenue.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
