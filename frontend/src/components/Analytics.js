import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import '../App.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get('/api/outfits/analytics');
      setAnalyticsData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch analytics data. Check if backend is running on port 5000.');
      setLoading(false);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <div className="loading">Analyzing your wardrobe...</div>;
  if (error) return (
    <div className="error-container">
      <div className="error">{error}</div>
      <button onClick={fetchAnalytics} className="cta-button">Retry</button>
    </div>
  );

  const mostUsedClothes = analyticsData?.mostUsed?.clothes || [];
  const mostUsedAccessories = analyticsData?.mostUsed?.accessories || [];
  
  const donationClothes = analyticsData?.donationSuggestions?.clothes || [];
  const donationAccessories = analyticsData?.donationSuggestions?.accessories || [];

  const combinedItems = [...mostUsedClothes, ...mostUsedAccessories]
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, 10);

  const barChartData = {
    labels: combinedItems.map(item => item.name),
    datasets: [
      {
        label: 'Number of Wears',
        data: combinedItems.map(item => item.wearCount),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const doughnutData = {
    labels: ['Clothes', 'Accessories'],
    datasets: [
      {
        data: [mostUsedClothes.length, mostUsedAccessories.length],
        backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(16, 185, 129, 0.7)'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="analytics-container">
      <div className="page-header">
        <h2>Wardrobe Insights</h2>
        <p>Understand your style habits and optimize your closet.</p>
      </div>
      
      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-value">{mostUsedClothes.length + mostUsedAccessories.length}</span>
          <span className="stat-label">Active Items</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-value">{donationClothes.length + donationAccessories.length}</span>
          <span className="stat-label">Suggested for Donation</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="analytics-section">
          <h3>Top Used Items</h3>
          <div className="chart-container">
            {combinedItems.length > 0 ? (
              <Bar 
                data={barChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } } 
                }} 
              />
            ) : <p className="empty-msg">Not enough data yet.</p>}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Item Distribution</h3>
          <div className="chart-container doughnut">
            {mostUsedClothes.length + mostUsedAccessories.length > 0 ? (
              <Doughnut 
                data={doughnutData} 
                options={{ responsive: true, maintainAspectRatio: false }} 
              />
            ) : <p className="empty-msg">No items recorded.</p>}
          </div>
        </div>
      </div>

      <div className="donation-section">
        <h3>Donation Suggestions</h3>
        <p className="subtitle">Items you haven't worn in a while or have very low usage.</p>
        
        <div className="suggestion-grid">
          <div className="suggestion-card">
            <h4>Clothes</h4>
            {donationClothes.length === 0 ? <p className="empty-msg">Your clothes are all well-used!</p> : (
              <ul className="suggestion-list">
                {donationClothes.map(item => (
                  <li key={item._id}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-meta">Worn {item.wearCount} times</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="suggestion-card">
            <h4>Accessories</h4>
            {donationAccessories.length === 0 ? <p className="empty-msg">All accessories are in active rotation.</p> : (
              <ul className="suggestion-list">
                {donationAccessories.map(item => (
                  <li key={item._id}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-meta">Worn {item.wearCount} times</span>
                  </li>
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
