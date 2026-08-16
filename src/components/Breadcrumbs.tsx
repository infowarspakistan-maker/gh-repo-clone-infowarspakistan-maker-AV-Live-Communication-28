import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">
      <Link to="/" className="hover:text-[#00B4D8] transition-colors">Home</Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-3 h-3" />
          {item.path ? (
            <Link to={item.path} className="hover:text-[#00B4D8] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#00B4D8]">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
