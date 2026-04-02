import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users?page=${page}&size=10`);
      console.log(response.data);
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleStatusChange = async (userId, activeStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { active: activeStatus });
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <ShieldAlert className="w-4 h-4 text-rose-500 mr-1" />;
      case 'ANALYST': return <Shield className="w-4 h-4 text-blue-500 mr-1" />;
      default: return <Shield className="w-4 h-4 text-slate-400 mr-1" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">Manage system users, roles, and access permissions.</p>
      </div>

      <div className="card shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="animate-pulse flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animation-delay-200"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animation-delay-400"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentUser.userId;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${isSelf ? 'bg-primary-50 hover:bg-primary-50' : ''}`}>
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold mr-3 text-xs">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        {u.username} {isSelf && <span className="ml-2 text-xs text-primary-600 font-semibold">(You)</span>}
                      </td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getRoleIcon(u.role)}
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={isSelf}
                            className={`ml-1 bg-transparent border-0 font-medium cursor-pointer focus:ring-0 text-sm p-0 ${isSelf ? 'text-slate-500 cursor-not-allowed' : 'text-slate-900'
                              }`}
                          >
                            <option value="VIEWER">VIEWER</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleStatusChange(u.id, !u.active)}
                          disabled={isSelf}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all ${u.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                            } ${isSelf ? 'opacity-75 cursor-not-allowed hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' : ''}`}
                          title={isSelf ? "You cannot change your own status" : `Click to ${u.active ? 'deactivate' : 'activate'}`}
                        >
                          {u.active ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {u.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        { }
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-sm text-slate-600">
            Page {page + 1} of {totalPages || 1}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
