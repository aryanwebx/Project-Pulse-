import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{`${label}`}</p>
        <p className="text-primary-600">{`Issues: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const CategoryChart = ({ data }) => {
  // Recharts expects data with a 'name' key, our API provides '_id'
  const chartData = data.map(item => ({
    name: item._id, // The category name
    count: item.count
  }));

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Issues by Category</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 10, // More space for labels
              left: -20, // Adjust to show Y-axis numbers
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" fontSize={12} interval={0} angle={-30} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} />
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;