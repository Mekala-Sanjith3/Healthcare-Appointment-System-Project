import React, { useState, useEffect, useRef } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { paymentApi } from '../../../services/realtimeApi';
import '../../../styles/pages/admin/FinanceManagement.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const FinanceManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [paymentMethodsData, setPaymentMethodsData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: '$0',
    outstanding: '$0',
    totalExpenses: '$0',
    netProfit: '$0',
    growthRate: '0%'
  });

  const printRef = useRef(null);


  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      const { from, to } = computeDateRange(dateRange);
      const [raw, summaryResp] = await Promise.all([
        paymentApi.getAll({ from, to }),
        paymentApi.getSummary({ from, to })
      ]);
      const paymentsData = (raw || []).map(p => {
        const created = p.createdAt || p.created_at || p.date || '';
        // Normalize various date formats to ISO for reliable parsing
        const normalizedCreatedAt = typeof created === 'string'
          ? created.replace(' ', 'T')
          : created;
        return { ...p, createdAt: normalizedCreatedAt };
      });
      setPayments(paymentsData);
      const backendRevenue = Number((summaryResp && (summaryResp.totalRevenue ?? summaryResp.total_revenue)) || 0);
      calculateSummaryStats(paymentsData, backendRevenue);
      processRevenueChartData(paymentsData);
      processPaymentMethodsData(paymentsData);
      const sortedTransactions = [...paymentsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentTransactions(sortedTransactions.slice(0, 5));
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const computeDateRange = (range) => {
    const now = new Date();
    let start;
    switch(range) {
      case 'week':
        start = new Date(now); start.setDate(now.getDate() - 7); break;
      case 'month':
        start = new Date(now); start.setMonth(now.getMonth() - 1); break;
      case 'quarter':
        start = new Date(now); start.setMonth(now.getMonth() - 3); break;
      case 'year':
        start = new Date(now); start.setFullYear(now.getFullYear() - 1); break;
      default:
        start = new Date(now); start.setMonth(now.getMonth() - 1);
    }
    const to = now.toISOString().slice(0,19);
    const from = new Date(start).toISOString().slice(0,19);
    return { from, to };
  };

  const calculateSummaryStats = (paymentsData, backendRevenue = null) => {
    const filteredPayments = filterPaymentsByDateRange(paymentsData);
    
    // Calculate total revenue (only from completed payments)
    const completedPayments = filteredPayments.filter(p => String(p.status).toUpperCase() === 'COMPLETED');
    const totalRevenueLocal = completedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalRevenue = backendRevenue != null ? backendRevenue : totalRevenueLocal;
    
    // Calculate outstanding amount (from pending payments)
    const pendingPayments = filteredPayments.filter(p => String(p.status).toUpperCase() === 'PENDING');
    const outstanding = pendingPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    
    // Mock expenses (in a real app, this would come from an expenses API)
    const totalExpenses = totalRevenue * 0.6; // Assume expenses are 60% of revenue
    
    // Calculate net profit
    const netProfit = totalRevenue - totalExpenses;
    
    // Calculate mock growth rate
    const growthRate = 12.5; // In a real app, this would be calculated from previous periods
    
    setSummaryStats({
      totalRevenue: `$${totalRevenue.toLocaleString()}`,
      outstanding: `$${outstanding.toLocaleString()}`,
      totalExpenses: `$${totalExpenses.toLocaleString()}`,
      netProfit: `$${netProfit.toLocaleString()}`,
      growthRate: `${growthRate}%`
    });
  };

  const filterPaymentsByDateRange = (paymentsData) => {
    const now = new Date();
    let startDate;
    
    switch(dateRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return paymentsData.filter(payment => {
      const raw = payment.createdAt || payment.created_at;
      if (!raw) return true; // include if missing to avoid dropping rows
      const d = new Date(typeof raw === 'string' ? raw.replace(' ', 'T') : raw);
      return !isNaN(d.getTime()) && d >= startDate;
    });
  };

  const processRevenueChartData = (paymentsData) => {
    // Group by month and calculate total revenue
    const months = [];
    const revenue = [];
    const expenses = [];
    
    // Get the last 12 months
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.push(monthName);
      
      // Calculate revenue for this month
      const monthRevenue = paymentsData
        .filter(payment => {
          const paymentDate = new Date(payment.createdAt);
          return paymentDate.getMonth() === month.getMonth() && 
                 paymentDate.getFullYear() === month.getFullYear() &&
                 String(payment.status).toUpperCase() === 'COMPLETED';
        })
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      
      revenue.push(monthRevenue);
      
      // Mock expenses (60% of revenue)
      expenses.push(monthRevenue * 0.6);
    }
    
    setRevenueData({
      labels: months,
      datasets: [
        {
          label: 'Revenue',
          data: revenue,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Expenses',
          data: expenses,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    });
  };

  const processPaymentMethodsData = (paymentsData) => {
    // Count payments by method
    const paymentMethods = {};
    
    paymentsData
      .filter(payment => String(payment.status).toUpperCase() === 'COMPLETED')
      .forEach(payment => {
        if (!paymentMethods[payment.paymentMethod]) {
          paymentMethods[payment.paymentMethod] = 0;
        }
        paymentMethods[payment.paymentMethod] += Number(payment.amount || 0);
      });
    
    const labels = Object.keys(paymentMethods);
    const data = Object.values(paymentMethods);
    
    setPaymentMethodsData({
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        }
      ]
    });
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const d = new Date(typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString);
    return isNaN(d.getTime()) ? 'Unknown' : d.toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  const exportCsv = () => {
    const headers = ['Transaction ID','Date','Amount','Payment Method','Status'];
    const rows = payments.map(t => [
      t.transactionId || t.transaction_id || '',
      (t.createdAt || t.created_at || '').toString().replace('T',' '),
      Number(t.amount || 0),
      t.paymentMethod || t.payment_method || '',
      t.status || ''
    ]);
    const total = payments.reduce((s,t)=> s + Number(t.amount||0),0);
    rows.push([]);
    rows.push(['Total Revenue', '', total, '', '']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="finance-management-container" ref={printRef}>
      {isLoading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading financial data...</p>
        </div>
      ) : (
        <>
          <div className="finance-header">
            <div className="date-range-selector">
              <label htmlFor="dateRange">View data for: </label>
              <select 
                id="dateRange" 
                value={dateRange} 
                onChange={handleDateRangeChange}
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 3 months</option>
                <option value="year">Last 12 months</option>
              </select>
            </div>
            <div className="finance-actions">
              <button className="finance-action-btn" onClick={exportCsv}>
                <i className="fas fa-download"></i> Export Report
              </button>
              {/* Print removed per request */}
            </div>
          </div>
          
          <div className="finance-summary-cards">
            <div className="finance-card">
              <div className="finance-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="finance-data">
                <h3>Total Revenue</h3>
                <p className="finance-value">{summaryStats.totalRevenue}</p>
                <p className="finance-trend positive">
                  <i className="fas fa-arrow-up"></i> {summaryStats.growthRate} from last period
                </p>
              </div>
            </div>
            <div className="finance-card">
              <div className="finance-icon">
                <i className="fas fa-hand-holding-usd"></i>
              </div>
              <div className="finance-data">
                <h3>Outstanding</h3>
                <p className="finance-value">{summaryStats.outstanding}</p>
                <p className="finance-trend negative">
                  <i className="fas fa-arrow-up"></i> 5.2% from last period
                </p>
              </div>
            </div>
            <div className="finance-card">
              <div className="finance-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <div className="finance-data">
                <h3>Expenses</h3>
                <p className="finance-value">{summaryStats.totalExpenses}</p>
                <p className="finance-trend positive">
                  <i className="fas fa-arrow-down"></i> 3.8% from last period
                </p>
              </div>
            </div>
            <div className="finance-card">
              <div className="finance-icon">
                <i className="fas fa-balance-scale"></i>
              </div>
              <div className="finance-data">
                <h3>Net Profit</h3>
                <p className="finance-value">{summaryStats.netProfit}</p>
                <p className="finance-trend positive">
                  <i className="fas fa-arrow-up"></i> 8.7% from last period
                </p>
              </div>
            </div>
          </div>
          
          <div className="finance-charts-container">
            <div className="chart-card large">
              <h3>Revenue & Expenses</h3>
              <div className="chart-container">
                {revenueData && (
                  <Line 
                    data={revenueData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '$' + value.toLocaleString();
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
            <div className="chart-card">
              <h3>Payment Methods</h3>
              <div className="chart-container">
                {paymentMethodsData && (
                  <Pie 
                    data={paymentMethodsData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="finance-data-section">
            <div className="finance-section-header">
              <h3>Recent Transactions</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.transactionId}</td>
                      <td>{formatDate(transaction.createdAt)}</td>
                      <td className="amount">{formatCurrency(transaction.amount)}</td>
                      <td>
                        <span className="payment-method">
                          {transaction.paymentMethod === 'CARD' && <i className="far fa-credit-card"></i>}
                          {transaction.paymentMethod === 'INSURANCE' && <i className="fas fa-file-medical"></i>}
                          {transaction.paymentMethod === 'PAYPAL' && <i className="fab fa-paypal"></i>}
                          {transaction.paymentMethod === 'CASH' && <i className="fas fa-money-bill-wave"></i>}
                          {transaction.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${transaction.status.toLowerCase()}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Removed Generate Invoice, Run Payroll, and Tax Report buttons per request */}
        </>
      )}
    </div>
  );
};

export default FinanceManagement; 