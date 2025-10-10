import React from "react";
import { User } from "../types/user";

interface UsersTableProps {
  users: User[];
}

export const UsersTable: React.FC<UsersTableProps> = ({ users }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
              ID
            </th>
            <th scope="col" className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
              Name
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-6 py-12 text-center text-slate-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">{user.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{user.name}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
