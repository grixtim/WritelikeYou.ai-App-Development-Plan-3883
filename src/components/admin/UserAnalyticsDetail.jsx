import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { format } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiActivity, FiClock, FiCalendar, FiLoader, FiSearch } = FiIcons;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserAnalyticsDetail = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userJourney, setUserJourney] = useState([]);
  const [searchUserId, setSearchUserId] = useState(userId || '');
  const [userDetails, setUserDetails] = useState(null);
  
  useEffect(() => {
    if (userId) {
      fetchUserJourney(userId);
    }
  }, [userId]);
  
  const fetchUserJourney = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      // Fetch user journey
      const response = await fetch(`${API_BASE_URL}/analytics/admin/user/${id}/journey`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user journey');
      }
      
      const journeyData = await response.json();
      setUserJourney(journeyData);
      
      // Fetch user details
      const userResponse = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserDetails(userData);
      }
      
    } catch (error) {
      console.error('Error fetching user journey:', error);
      setError(error.message || 'Failed to load user journey');
      
      // Set mock data for development/demo
      setMockData(id);
    } finally {
      setLoading(false);
    }
  };
  
  const setMockData = (id) => {
    // Mock user details
    setUserDetails({
      _id: id,
      email: 'user@example.com',
      cohortWeek: '2024-15',
      registrationSource: 'direct',
      subscriptionStatus: 'active',
      createdAt: '2024-04-01T12:00:00.000Z'
    });
    
    // Mock user journey
    const mockJourney = [];
    const eventTypes = [
      'user_registered',
      'setup_completed',
      'email_type_selected',
      'mini_lesson_viewed',
      'magic_prompt_delivered',
      'writing_started',
      'draft_completed',
      'session_completed'
    ];
    
    const startDate = new Date('2024-04-01T12:00:00.000Z');
    
    // Add events with increasing timestamps
    for (let i = 0; i < eventTypes.length; i++) {
      const eventDate = new Date(startDate);
      eventDate.setHours(eventDate.getHours() + i * 2); // Add hours for each event
      
      mockJourney.push({
        _id: `event_${i}`,
        userId: id,
        eventName: eventTypes[i],
        timestamp: eventDate.toISOString(),
        cohortWeek: '2024-15',
        daysSinceRegistration: Math.floor(i / 4), // Increase days every 4 events
        metadata: {
          sessionId: i > 1 ? 'session_123' : undefined,
          emailType: i > 1 ? 'cart_open' : undefined
        }
      });
    }
    
    // Add some additional events on different days
    for (let i = 0; i < 3; i++) {
      const eventDate = new Date(startDate);
      eventDate.setDate(eventDate.getDate() + i + 1); // Different days
      
      mockJourney.push({
        _id: `event_extra_${i}`,
        userId: id,
        eventName: eventTypes[Math.floor(Math.random() * (eventTypes.length - 3)) + 3],
        timestamp: eventDate.toISOString(),
        cohortWeek: '2024-15',
        daysSinceRegistration: i + 1,
        metadata: {
          sessionId: `session_${100 + i}`,
          emailType: ['cart_open', 'belief_shifting', 'social_proof'][i % 3]
        }
      });
    }
    
    setUserJourney(mockJourney);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchUserId.trim()) {
      fetchUserJourney(searchUserId.trim());
    }
  };
  
  // Format user journey for timeline chart
  const getTimelineChartOptions = () => {
    // Group events by day
    const eventsByDay = {};
    
    userJourney.forEach(event => {
      const day = event.timestamp.split('T')[0];
      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }
      eventsByDay[day].push(event);
    });
    
    const days = Object.keys(eventsByDay).sort();
    
    const series = [];
    const categories = [
      'user_registered',
      'setup_completed',
      'email_type_selected',
      'mini_lesson_viewed',
      'magic_prompt_delivered',
      'writing_started',
      'draft_completed',
      'session_completed'
    ];
    
    // Create a series for each day
    days.forEach((day, dayIndex) => {
      const data = eventsByDay[day].map(event => {
        return {
          name: event.eventName.replace(/_/g, ' '),
          value: [
            categories.indexOf(event.eventName),
            new Date(event.timestamp).getTime(),
            event.metadata?.emailType || ''
          ]
        };
      });
      
      series.push({
        name: format(new Date(day), 'MMM d, yyyy'),
        type: 'scatter',
        symbolSize: 15,
        data,
        label: {
          show: true,
          formatter: function(param) {
            return param.data.value[2] || '';
          },
          position: 'right'
        }
      });
    });
    
    return {
      title: {
        text: 'User Journey Timeline',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const date = new Date(params.value[1]);
          const formattedDate = format(date, 'MMM d, yyyy h:mm a');
          let result = `${params.name}<br/>`;
          result += `Time: ${formattedDate}<br/>`;
          if (params.value[2]) {
            result += `Type: ${params.value[2]}`;
          }
          return result;
        }
      },
      legend: {
        data: days.map(day => format(new Date(day), 'MMM d, yyyy')),
        top: 'bottom'
      },
      grid: {
        left: '3%',
        right: '7%',
        top: '10%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories.map(cat => cat.replace(/_/g, ' ')),
        boundaryGap: true,
        splitLine: {
          show: true
        },
        axisLine: {
          show: true
        },
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'time',
        scale: true,
        axisLine: {
          show: true
        },
        axisLabel: {
          formatter: function(value) {
            return format(new Date(value), 'h:mm a');
          }
        },
        splitLine: {
          show: true
        }
      },
      series
    };
  };
  
  // Format event counts by type
  const getEventCountsChartOptions = () => {
    // Count events by type
    const eventCounts = {};
    
    userJourney.forEach(event => {
      if (!eventCounts[event.eventName]) {
        eventCounts[event.eventName] = 0;
      }
      eventCounts[event.eventName]++;
    });
    
    const eventTypes = Object.keys(eventCounts);
    
    return {
      title: {
        text: 'Event Counts by Type',
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
        data: eventTypes.map(type => type.replace(/_/g, ' ')),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: eventTypes.map(type => eventCounts[type]),
          type: 'bar',
          itemStyle: {
            color: function(params) {
              const colors = [
                '#5470c6', '#91cc75', '#fac858', '#ee6666',
                '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
              ];
              return colors[params.dataIndex % colors.length];
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
        <p className="ml-2 text-gray-600">Loading user data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Analytics</h2>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="text"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            placeholder="Enter User ID"
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <SafeIcon icon={FiSearch} className="w-5 h-5" />
          </button>
        </form>
      </div>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load user data</h3>
          <p className="text-red-700 mb-4">{error}</p>
        </div>
      ) : (
        <>
          {userDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Details</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiUser} className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{userDetails.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiActivity} className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{userDetails.subscriptionStatus}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiCalendar} className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cohort Week</p>
                    <p className="font-medium">{userDetails.cohortWeek}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiClock} className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registered</p>
                    <p className="font-medium">{format(new Date(userDetails.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {userJourney.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
                <div className="h-96">
                  <ReactECharts option={getTimelineChartOptions()} style={{ height: '100%' }} />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Distribution</h3>
                <div className="h-80">
                  <ReactECharts option={getEventCountsChartOptions()} style={{ height: '100%' }} />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days Since Reg.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Session ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userJourney.map((event, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {event.eventName.replace(/_/g, ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.daysSinceRegistration}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.metadata?.sessionId || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.metadata?.emailType || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No events found</h3>
              <p className="text-yellow-700">This user has no recorded events yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserAnalyticsDetail;