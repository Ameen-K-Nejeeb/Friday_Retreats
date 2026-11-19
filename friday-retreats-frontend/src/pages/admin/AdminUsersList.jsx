import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AdminUsersList = () => {
    const { token } = useSelector((state) => state.auth);
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [currentPageUrl, setCurrentPageUrl] = useState('http://127.0.0.1:8000/api/accounts/admin/users/');
    const [nextUrl, setNextUrl] = useState(null);
    const [prevUrl, setPrevUrl] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async (url) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.results);
            setNextUrl(response.data.next);
            setPrevUrl(response.data.previous);
        } catch (err) {
            setError('Failed to fetch users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const url = new URL(currentPageUrl);
        if (activeSearch) url.searchParams.set('search', activeSearch);
        else url.searchParams.delete('search');
        fetchUsers(url.toString());
    }, [currentPageUrl, activeSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPageUrl('http://127.0.0.1:8000/api/accounts/admin/users/');
        setActiveSearch(searchInput);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setActiveSearch('');
        setCurrentPageUrl('http://127.0.0.1:8000/api/accounts/admin/users/');
    };

    const handleActionClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            const response = await axios.patch(
                `http://127.0.0.1:8000/api/accounts/admin/users/${selectedUser.id}/toggle-status/`,
                {}, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUsers(users.map(u => 
                u.id === selectedUser.id ? { ...u, is_active: response.data.is_active } : u
            ));
            
            setIsModalOpen(false);
            setSelectedUser(null);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update user status.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <form onSubmit={handleSearchSubmit} className="flex space-x-2 w-full max-w-lg">
                        <input 
                            type="text" 
                            placeholder="Search by email..." 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                        />
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Search</button>
                        {activeSearch && (
                            <button type="button" onClick={handleClearSearch} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Clear</button>
                        )}
                    </form>
                </div>

                {error && <div className="p-4 text-red-600 bg-red-50">{error}</div>}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Joined Date</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="relative">
                            {loading && <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading users...</td></tr>}
                            {!loading && users.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>}
                            {!loading && users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800">{user.email}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{user.role}</span>
                                    </td>
                                    <td className="p-4 text-gray-600">{new Date(user.date_joined).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        {user.is_active ? (
                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Blocked</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleActionClick(user)}
                                            className={`px-3 py-1 text-sm border rounded transition ${
                                                user.is_active 
                                                ? "text-red-600 border-red-600 hover:bg-red-50" 
                                                : "text-green-600 border-green-600 hover:bg-green-50"
                                            }`}
                                        >
                                            {user.is_active ? 'Block' : 'Unblock'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t flex justify-end items-center">
                    <div className="flex space-x-2">
                        <button onClick={() => setCurrentPageUrl(prevUrl)} disabled={!prevUrl || loading} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition">Previous</button>
                        <button onClick={() => setCurrentPageUrl(nextUrl)} disabled={!nextUrl || loading} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition">Next</button>
                    </div>
                </div>

                {isModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Confirm {selectedUser.is_active ? 'Block' : 'Unblock'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to {selectedUser.is_active ? 'block' : 'unblock'} <strong>{selectedUser.email}</strong>?
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmToggleStatus}
                                    disabled={actionLoading}
                                    className={`px-4 py-2 text-sm text-white rounded disabled:opacity-50 ${
                                        selectedUser.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {actionLoading ? 'Processing...' : `Yes, ${selectedUser.is_active ? 'Block' : 'Unblock'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersList;