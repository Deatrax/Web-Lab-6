import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import '../App.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/outfits/analytics');
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="loading">Loading Analytics...</div>;
  if (error) return <div className="error">{error}</div>;

  // Prepare data for charts
  const mostUsedClothes = analyticsData?.mostUsed?.clothes || [];
  const mostUsedAccessories = analyticsData?.mostUsed?.accessories || [];
  
  const donationClothes = analyticsData?.donationSuggestions?.clothes || [];
  const donationAccessories = analyticsData?.donationSuggestions?.accessories || [];

  const mostUsedLabels = [...mostUsedClothes, ...mostUsedAccessories].map(item => item.name);
  const mostUsedData = [...mostUsedClothes, ...mostUsedAccessories].map(item => item.wearCount);

  const chartData = {
    labels: mostUsedLabels,
    datasets: [
      {
        label: '# of Wears',
        data: mostUsedData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="analytics-container">
      <h2>Wardrobe Analytics</h2>
      
      <div className="analytics-section">
        <h3>Most Used Items</h3>
        {mostUsedLabels.length > 0 ? (
          <div className="chart-container">
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
          </div>
        ) : (
          <p>No enough data for most used items.</p>
        )}
      </div>

      <div className="analytics-section">
        <h3>Donation Suggestions</h3>
        <div className="suggestion-grid">
          <div className="suggestion-column">
            <h4>Clothes to Donate</h4>
            {donationClothes.length === 0 ? <p>No suggestions.</p> : (
              <ul>
                {donationClothes.map(item => (
                  <li key={item._id}>{item.name} (Worn: {item.wearCount})</li>
                ))}
              </ul>
            )}
          </div>
          <div className="suggestion-column">
            <h4>Accessories to Donate</h4>
            {donationAccessories.length === 0 ? <p>No suggestions.</p> : (
              <ul>
                {donationAccessories.map(item => (
                  <li key={item._id}>{item.name} (Worn: {item.wearCount})</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
