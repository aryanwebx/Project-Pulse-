import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Define colors for each sentiment
const COLORS = {
  'positive': '#22C55E', // Green
  'neutral': '#F59E0B',  // Amber
  'negative': '#EF4444', // Red
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{`${payload[0].name}`}</p>
        <p style={{ color: payload[0].fill }}>{`Count: ${payload[0].value} (${(payload[0].percent * 100).toFixed(0)}%)`}</p>
      </div>
    );
  }
  return null;
};

const SentimentChart = ({ data }) => {
  // Recharts expects data with a 'name' key, our API provides '_id'
  const chartData = data.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1), // Capitalize (e.g., 'negative' -> 'Negative')
    value: item.count
  }));

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Issue Sentiment (AI)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentChart;