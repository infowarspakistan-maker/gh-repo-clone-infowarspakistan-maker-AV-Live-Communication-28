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
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 h-7 py-1 mb-2.5 overflow-x-auto whitespace-nowrap hide-scrollbar"
    >
      <Link to="/" className="hover:text-[#00B4D8] transition-colors inline-flex items-center shrink-0">
        Home
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5 shrink-0">
          <ChevronRight className="w-3 h-3 shrink-0 text-gray-300" />
          {item.path ? (
            <Link to={item.path} className="hover:text-[#00B4D8] transition-colors inline-flex items-center">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#00B4D8] truncate max-w-[200px] sm:max-w-[320px]">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
