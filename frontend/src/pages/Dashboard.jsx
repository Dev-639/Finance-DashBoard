import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Activity, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, catRes, trendRes, recRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/category-summary?type=EXPENSE'),
          api.get('/dashboard/trends'),
          api.get('/dashboard/recent?limit=5')
        ]);
        
        setSummary(sumRes.data);
        setCategoryData(catRes.data);
        setTrendData(trendRes.data);
        setRecentRecords(recRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  if (loading) return <div className="animate-pulse flex space-x-4 p-4"><div className="flex-1 space-y-6 py-1"><div className="h-6 bg-slate-200 rounded w-1/4"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-24 bg-slate-200 rounded"></div><div className="h-24 bg-slate-200 rounded"></div><div className="h-24 bg-slate-200 rounded"></div></div><div className="h-64 bg-slate-200 rounded"></div></div></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Summary and analytics of all financial data.</p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-indigo-500 to-primary-600 text-white shadow-md border-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Net Balance</p>
              <h3 className="text-3xl font-bold">{formatCurrency(summary?.netBalance)}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="mt-4 text-sm text-indigo-100 flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            Total {summary?.totalRecords} active records
          </p>
        </div>

        <div className="card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Total Income</p>
              <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(summary?.totalIncome)}</h3>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Total Expenses</p>
              <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(summary?.totalExpenses)}</h3>
            </div>
            <div className="p-3 bg-rose-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            Income vs Expenses Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '14px', paddingTop: '10px'}} />
                <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Expenses by Category</h3>
          <div className="h-72 w-full flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="totalAmount"
                    nameKey="category"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{fontSize: '14px'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No expense data available</p>
            )}
          </div>
        </div>
      </div>

      
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
          <Link to="/records" className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center">
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{record.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {record.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-medium whitespace-nowrap ${
                    record.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount)}
                  </td>
                </tr>
              ))}
              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No recent activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
