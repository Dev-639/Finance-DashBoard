import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Records() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN']);
  
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  
  
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/records?${params.toString()}`);
      setRecords(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(0); 
  };

  const clearFilters = () => {
    setFilters({ type: '', category: '', search: '', startDate: '', endDate: '' });
    setPage(0);
  };

  const openForm = (record = null) => {
    if (record) {
      setCurrentRecord(record);
      setFormData({
        amount: record.amount,
        type: record.type,
        category: record.category,
        date: record.date,
        notes: record.notes || ''
      });
    } else {
      setCurrentRecord(null);
      setFormData({
        amount: '',
        type: 'EXPENSE',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setCurrentRecord(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentRecord) {
        await api.put(`/records/${currentRecord.id}`, formData);
      } else {
        await api.post('/records', formData);
      }
      closeForm();
      fetchRecords();
    } catch (err) {
      alert('Failed to save record: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/records/${id}`);
        fetchRecords();
      } catch (err) {
        alert('Failed to delete record.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Records</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all income and expense transactions.</p>
        </div>
        
        {isAdmin && (
          <button onClick={() => openForm()} className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </button>
        )}
      </div>

      
      <div className="card p-4 flex flex-wrap gap-4 items-end bg-slate-50">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search descriptions..."
            className="input-field"
          />
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Type</label>
          <select name="type" value={filters.type} onChange={handleFilterChange} className="input-field">
            <option value="">All</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Start Date</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input-field" />
        </div>
        <div className="w-40">
          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">End Date</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input-field" />
        </div>
        <button onClick={clearFilters} className="btn-secondary flex items-center mb-1">
          <Filter className="w-4 h-4 mr-2" /> Clear
        </button>
      </div>

      
      <div className="card shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Notes</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Created By</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                {isAdmin && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animation-delay-200"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animation-delay-400"></div>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-slate-500">
                    No records found matching your filters.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-900">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {record.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs">{record.notes || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.type === 'INCOME' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{record.createdByUsername}</td>
                    <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${
                      record.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {record.type === 'INCOME' ? '+' : '-'}${record.amount.toFixed(2)}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button onClick={() => openForm(record)} className="text-slate-400 hover:text-primary-600 mx-2 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(record.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50 transition-opacity backdrop-blur-sm" onClick={closeForm}></div>
            <div className="relative inline-block bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl leading-6 font-bold text-slate-900">
                    {currentRecord ? 'Edit Record' : 'Add New Record'}
                  </h3>
                  <button onClick={closeForm} className="text-slate-400 hover:text-slate-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                      <select 
                        required
                        className="input-field"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($) *</label>
                      <input 
                        required type="number" step="0.01" min="0.01"
                        className="input-field"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                      <input 
                        required type="text"
                        className="input-field"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        list="categories"
                      />
                      <datalist id="categories">
                        <option value="Salary" />
                        <option value="Rent" />
                        <option value="Utilities" />
                        <option value="Food" />
                        <option value="Travel" />
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                      <input 
                        required type="date"
                        className="input-field"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea 
                      className="input-field" rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save Record</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
