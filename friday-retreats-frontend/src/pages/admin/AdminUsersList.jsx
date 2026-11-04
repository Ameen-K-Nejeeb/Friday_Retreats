import React from 'react';

const AdminUsersList = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                {/* Search Bar Placeholder */}
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Search
                    </button>
                </div>
            </div>

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
                    <tbody>
                        {/* We will map over the fetched users here later */}
                        <tr className="border-b hover:bg-gray-50">
                            <td className="p-4">user@example.com</td>
                            <td className="p-4"><span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">USER</span></td>
                            <td className="p-4">Nov 4, 2026</td>
                            <td className="p-4"><span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span></td>
                            <td className="p-4 text-right">
                                <button className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition">
                                    Block
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="p-4 border-t flex justify-end">
                <div className="flex space-x-2">
                    <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border rounded text-gray-600 hover:bg-gray-100">Next</button>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersList;