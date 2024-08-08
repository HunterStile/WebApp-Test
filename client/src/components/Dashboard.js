import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat-item">
          <h2>Statistic 1</h2>
          <p>Details about statistic 1</p>
        </div>
        <div className="stat-item">
          <h2>Statistic 2</h2>
          <p>Details about statistic 2</p>
        </div>
        <div className="stat-item">
          <h2>Statistic 3</h2>
          <p>Details about statistic 3</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
