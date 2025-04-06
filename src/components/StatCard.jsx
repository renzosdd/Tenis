    // === src/components/StatCard.js ===
    const StatCard = ({ title, value, color = 'gray' }) => {
        const colorClasses = {
          blue: 'bg-blue-50 text-blue-800', green: 'bg-green-50 text-green-800',
          red: 'bg-red-50 text-red-800', yellow: 'bg-yellow-50 text-yellow-800',
          purple: 'bg-purple-50 text-purple-800', teal: 'bg-teal-50 text-teal-800',
          gray: 'bg-gray-50 text-gray-800'
        };
        return (
          <div className={`p-3 rounded ${colorClasses[color]}`}>
            <p className="text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        );
      };