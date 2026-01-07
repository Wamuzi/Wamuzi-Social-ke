import React from 'react';
import { userService } from '../services/userService';
import { User } from '../types';
import { BanIcon, TrashIcon } from './icons/Icons';

const AdminUserManagement: React.FC = () => {
    // This component re-renders when the parent AdminDashboard re-renders on service updates.
    // For a more complex app, this component would subscribe directly.
    const allUsers = userService.getAllUsers();
    
    const handleSuspend = (user: User) => {
        const action = user.status === 'suspended' ? 'reinstate' : 'suspend';
        if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
            userService.suspendUser(user.id);
        }
    }
    
    const handleDelete = (user: User) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY DELETE ${user.name}? This action cannot be undone.`)) {
            userService.deleteUser(user.id);
        }
    }

    const handleRoleChange = (userId: string, role: User['role']) => {
        userService.updateUserRole(userId, role);
    }

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {allUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {user.status}
                                    </span>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                                        disabled={user.id === 'user-1'}
                                        className="p-1 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        <option value="user">User</option>
                                        <option value="moderator">Moderator</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.followersCount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleSuspend(user)} className="p-2 bg-yellow-500/10 text-yellow-600 rounded-full hover:bg-yellow-500/20 transition" title={user.status === 'suspended' ? 'Reinstate User' : 'Suspend User'}>
                                            <BanIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(user)} className="p-2 bg-red-500/10 text-red-600 rounded-full hover:bg-red-500/20 transition" title="Delete User">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserManagement;