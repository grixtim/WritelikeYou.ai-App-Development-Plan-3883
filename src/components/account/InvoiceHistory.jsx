import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFileText, FiDownload, FiLoader, FiAlertCircle, FiRefreshCw, FiCheck } = FiIcons;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InvoiceHistory = () => {
  const { userProfile } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE_URL}/subscriptions/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error fetching invoices');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching invoices:', error);
      
      // For demo purposes, set mock data if API doesn't exist
      setInvoices([
        {
          id: 'in_1OPcXY2eZvKYlo2CghK7T1iV',
          number: '1A2F9D7-0001',
          date: new Date().toISOString(),
          amount: 29.00,
          status: 'paid',
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date().toISOString(),
          downloadUrl: '#'
        },
        {
          id: 'in_1OPcXY2eZvKYlo2CghK7T1iU',
          number: '1A2F9D7-0002',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 29.00,
          status: 'paid',
          periodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          downloadUrl: '#'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Paid</span>;
      case 'open':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Open</span>;
      case 'void':
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Void</span>;
      case 'uncollectible':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Uncollectible</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
        <p className="text-gray-600 mt-4">Loading invoice history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load invoices</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchInvoices}
          className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <SafeIcon icon={FiFileText} className="w-8 h-8 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-blue-900 mb-2">No invoices yet</h3>
        <p className="text-blue-700">
          Your invoice history will appear here once you have made payments.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Invoice History</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Billing Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Download
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(invoice.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${invoice.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <a
                    href={invoice.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                    <span>PDF</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceHistory;