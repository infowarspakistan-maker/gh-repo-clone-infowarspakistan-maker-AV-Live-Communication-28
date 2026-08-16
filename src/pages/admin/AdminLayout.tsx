import { Sidebar } from '../../components/admin/Sidebar';
import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen flex text-[#1A2B4C] font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
