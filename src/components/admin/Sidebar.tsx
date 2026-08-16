import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Home, 
  Info, 
  Phone, 
  Grid,
  Box,
  RefreshCw,
  CreditCard,
  LogOut,
  Shield,
  FileText,
  Sparkles,
  Database,
  Workflow
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const activeModule = location.pathname.split('/').pop() || 'overview';

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/admin/overview', group: 'Dashboard' },
    { id: 'homepage-editor', label: 'Homepage', icon: Home, path: '/admin/homepage-editor', group: 'Page Editor' },
    { id: 'about-editor', label: 'About Us', icon: Info, path: '/admin/about-editor', group: 'Page Editor' },
    { id: 'services-editor', label: 'Services Page', icon: Grid, path: '/admin/services-editor', group: 'Page Editor' },
    { id: 'services-management', label: 'Service Modules', icon: Briefcase, path: '/admin/services-management', group: 'Products' },
    { id: 'contact-editor', label: 'Contact', icon: Phone, path: '/admin/contact-editor', group: 'Page Editor' },
    { id: 'products-all', label: 'All Products', icon: Package, path: '/admin/products-all', group: 'Products' },
    { id: 'categories', label: 'Categories', icon: Grid, path: '/admin/categories', group: 'Products' },
    { id: 'products-inventory', label: 'Inventory', icon: Box, path: '/admin/products-inventory', group: 'Products' },
    { id: 'event-quotes', label: 'Event Quotes', icon: FileText, path: '/admin/event-quotes', group: 'Orders' },
    { id: 'orders-new', label: 'New Orders', icon: ShoppingCart, path: '/admin/orders-new', group: 'Orders' },
    { id: 'orders-rma', label: 'RMA Requests', icon: RefreshCw, path: '/admin/orders-rma', group: 'Orders' },
    { id: 'users-customers', label: 'Customers', icon: Users, path: '/admin/users-customers', group: 'Users' },
    { id: 'users-staff', label: 'Staff Authority', icon: Shield, path: '/admin/users-staff', group: 'Users' },
    { id: 'settings-general', label: 'General', icon: Settings, path: '/admin/settings-general', group: 'Settings' },
    { id: 'settings-payment', label: 'Payment Gateways', icon: CreditCard, path: '/admin/settings-payment', group: 'Settings' },
    { id: 'data-management', label: 'Data Export / Import', icon: Database, path: '/admin/data-management', group: 'Settings' },
    { id: 'automation', label: 'n8n Workflows', icon: Workflow, path: '/admin/automation', group: 'Automation' },
    { id: 'workspace', label: 'Workspace Hub', icon: Sparkles, path: '/admin/workspace', group: 'Google Workspace' },
    { id: 'google-business', label: 'Google Business Profile', icon: Sparkles, path: '/admin/google-business', group: 'Marketing' },
    { id: 'media-guide', label: 'Media URL Guide', icon: FileText, path: '/admin/media-guide', group: 'Help & Docs' },
  ];

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="w-72 bg-[#1A2B4C] text-white flex flex-col shrink-0 h-screen sticky top-0 border-r border-white/5">
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#00B4D8] rotate-45"></div>
          </div>
          <h2 className="text-xl font-bold tracking-tight">AV <span className="text-[#00B4D8]">ADMIN</span></h2>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div key={group} className="px-4 space-y-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">{group}</div>
            {items.map((item) => (
              <Link 
                key={item.id}
                to={item.path}
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${activeModule === item.id ? 'bg-[#00B4D8] text-white font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className="mr-3 flex-shrink-0" size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-white/10 mt-auto">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">JD</div>
               <div>
                  <div className="text-sm font-bold">Admin</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest">Superadmin</div>
               </div>
            </div>
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
              <LogOut size={18} />
            </Link>
         </div>
      </div>
    </div>
  );
}
