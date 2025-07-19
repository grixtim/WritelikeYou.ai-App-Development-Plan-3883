import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { format, subDays } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBarChart2, FiUsers, FiActivity, FiTrendingUp, FiLoader, FiCalendar, FiRefreshCw } = FiIcons;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AnalyticsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [funnelData, setFunnelData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [eventCounts, setEventCounts] = useState([]);
  const [cohortData, setCohortData] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      // Fetch funnel data
      const funnelResponse = await fetch(`${API_BASE_URL}/analytics/admin/funnel`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!funnelResponse.ok) {
        throw new Error('Failed to fetch funnel data');
      }
      
      const funnelData = await funnelResponse.json();
      setFunnelData(funnelData);
      
      // Fetch retention data
      const retentionResponse = await fetch(`${API_BASE_URL}/analytics/admin/retention?days=30`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!retentionResponse.ok) {
        throw new Error('Failed to fetch retention data');
      }
      
      const retentionData = await retentionResponse.json();
      setRetentionData(retentionData);
      
      // Fetch event counts
      const eventResponse = await fetch(
        `${API_BASE_URL}/analytics/admin/events?eventName=user_registered&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!eventResponse.ok) {
        throw new Error('Failed to fetch event counts');
      }
      
      const eventData = await eventResponse.json();
      setEventCounts(eventData);
      
      // Fetch cohort data
      const cohortResponse = await fetch(`${API_BASE_URL}/analytics/admin/cohorts?weeks=8`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!cohortResponse.ok) {
        throw new Error('Failed to fetch cohort data');
      }
      
      const cohortData = await cohortResponse.json();
      setCohortData(cohortData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'Failed to load analytics data');
      
      // Set mock data for development/demo purposes
      setMockData();
    } finally {
      setLoading(false);
    }
  };
  
  const setMockData = () => {
    // Mock funnel data
    setFunnelData([
      { step: 'user_registered', count: 100, dropoff: 0, conversionRate: 100 },
      { step: 'setup_completed', count: 85, dropoff: 15, conversionRate: 85 },
      { step: 'email_type_selected', count: 75, dropoff: 10, conversionRate: 88.2 },
      { step: 'writing_started', count: 68, dropoff: 7, conversionRate: 90.7 },
      { step: 'session_completed', count: 52, dropoff: 16, conversionRate: 76.5 }
    ]);
    
    // Mock retention data
    setRetentionData([
      { eventType: 'email_type_selected', newUsers: 100, retainedUsers: 68, retentionRate: 68 },
      { eventType: 'session_completed', newUsers: 100, retainedUsers: 52, retentionRate: 52 }
    ]);
    
    // Mock event counts
    const mockEventCounts = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      mockEventCounts.push({
        date: format(date, 'yyyy-MM-dd'),
        count: Math.floor(Math.random() * 10) + 1
      });
    }
    setEventCounts(mockEventCounts);
    
    // Mock cohort data
    const mockCohortData = [];
    for (let i = 0; i < 8; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekNumber = Math.ceil((date.getDate() + 6) / 7);
      const cohort = `${date.getFullYear()}-${String(weekNumber).padStart(2, '0')}`;
      
      const retention = [100];
      for (let j = 1; j < 8; j++) {
        retention.push(Math.floor(Math.random() * (100 - j * 10)));
      }
      
      mockCohortData.push({
        cohort,
        registrations: Math.floor(Math.random() * 20) + 5,
        retention
      });
    }
    setCohortData(mockCohortData);
  };
  
  const handleDateRangeChange = (event) => {
    setDateRange({
      ...dateRange,
      [event.target.name]: event.target.value
    });
  };
  
  const handleRefresh = () => {
    fetchAnalyticsData();
  };
  
  // Format funnel data for chart
  const getFunnelChartOptions = () => {
    return {
      title: {
        text: 'User Journey Funnel',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {c} users ({d}%)'
      },
      legend: {
        top: 'bottom'
      },
      series: [
        {
          name: 'Funnel',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: funnelData[0]?.count || 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside'
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: {
            label: {
              fontSize: 20
            }
          },
          data: funnelData.map(item => ({
            value: item.count,
            name: item.step.replace(/_/g, ' ')
          }))
        }
      ]
    };
  };
  
  // Format event counts for chart
  const getEventCountsChartOptions = () => {
    return {
      title: {
        text: 'Daily User Registrations',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: eventCounts.map(item => item.date),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: eventCounts.map(item => item.count),
          type: 'bar',
          itemStyle: {
            color: '#3b82f6'
          }
        }
      ]
    };
  };
  
  // Format cohort data for heatmap
  const getCohortChartOptions = () => {
    return {
      title: {
        text: 'Cohort Retention Analysis',
        left: 'center'
      },
      tooltip: {
        position: 'top',
        formatter: function(params) {
          return `Cohort: ${params.data[0]}<br>Week ${params.data[1]}: ${params.data[2]}%`;
        }
      },
      grid: {
        top: 60,
        bottom: 50
      },
      xAxis: {
        type: 'category',
        data: ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: cohortData.map(item => item.cohort),
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 10,
        color: ['#4ade80', '#bef264', '#fef08a', '#fed7aa', '#fecaca']
      },
      series: [
        {
          name: 'Retention Rate',
          type: 'heatmap',
          data: cohortData.flatMap((cohort, cohortIndex) =>
            cohort.retention.map((rate, weekIndex) => [weekIndex, cohortIndex, rate])
          ),
          label: {
            show: true
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="ml-2 text-gray-600">Loading analytics...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load analytics</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={handleRefresh} 
          className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">From:</label>
            <input 
              type="date" 
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">To:</label>
            <input 
              type="date" 
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{funnelData[0]?.count || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiUsers} className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.round((funnelData[funnelData.length - 1]?.count / funnelData[0]?.count) * 100 || 0)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiBarChart2} className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Retention Rate</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(retentionData[0]?.retentionRate || 0)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiActivity} className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{funnelData[funnelData.length - 1]?.count || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Funnel Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Journey Funnel</h3>
        <div className="h-96">
          <ReactECharts option={getFunnelChartOptions()} style={{ height: '100%' }} />
        </div>
      </motion.div>
      
      {/* Event Counts Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registrations Over Time</h3>
        <div className="h-80">
          <ReactECharts option={getEventCountsChartOptions()} style={{ height: '100%' }} />
        </div>
      </motion.div>
      
      {/* Cohort Retention Heatmap */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention Analysis</h3>
        <div className="h-96">
          <ReactECharts option={getCohortChartOptions()} style={{ height: '100%' }} />
        </div>
      </motion.div>
      
      {/* Retention Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-6 shadow-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Retention Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retained Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Retention Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {retentionData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.eventType.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.newUsers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.retainedUsers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round(item.retentionRate)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsOverview;