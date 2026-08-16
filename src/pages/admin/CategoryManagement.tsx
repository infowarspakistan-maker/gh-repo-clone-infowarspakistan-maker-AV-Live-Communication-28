import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  X, 
  Image as ImageIcon, 
  Copy, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  ArrowUp, 
  ArrowDown, 
  Box, 
  Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { 
  Category, 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories, 
  generateSlug, 
  buildCategoryTree,
  getProducts,
  Product
} from '../../lib/firebase/firestore-helpers';

// ============================================
// HELPER FOR PARENT DROPDOWN (EXCLUDING SELF & DESCENDANTS)
// ============================================

function getFlattenedOptions(
  nodes: (Category & { children: any[] })[],
  excludeId: string | null,
  level = 0,
  visited = new Set<string>()
): { id: string; name: string; level: number }[] {
  let result: { id: string; name: string; level: number }[] = [];
  
  for (const node of nodes) {
    if (node.id && visited.has(node.id)) {
      continue;
    }
    if (node.id) {
      visited.add(node.id);
    }

    if (excludeId && node.id === excludeId) {
      // Exclude this node and all of its descendants
      continue;
    }
    
    result.push({
      id: node.id!,
      name: node.name,
      level: level
    });
    
    if (node.children && node.children.length > 0) {
      result = result.concat(getFlattenedOptions(node.children, excludeId, level + 1, visited));
    }
  }
  
  return result;
}

// ============================================
// RECURSIVE TREE NODE COMPONENT
// ============================================

interface CategoryNodeItemProps {
  key?: any;
  category: Category & { children: any[] };
  level: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onAddChild: (parentId: string) => void;
  onMoveOrder: (id: string, direction: 'up' | 'down') => void;
  collapsedNodes: Record<string, boolean>;
  onToggleCollapse: (id: string) => void;
  products: Product[];
  siblings: Category[];
}

function CategoryNodeItem({
  category,
  level,
  onEdit,
  onDelete,
  onToggleActive,
  onAddChild,
  onMoveOrder,
  collapsedNodes,
  onToggleCollapse,
  products,
  siblings
}: CategoryNodeItemProps) {
  const hasChildren = category.children && category.children.length > 0;
  const isCollapsed = !!collapsedNodes[category.id!];
  
  // Calculate direct and recursive product counts
  const getProductCount = (catId: string, recursive = false): number => {
    let count = products.filter(p => p.categoryIds?.includes(catId)).length;
    
    if (recursive && hasChildren) {
      const visited = new Set<string>();
      const countChildren = (node: any): number => {
        if (!node.id || visited.has(node.id)) return 0;
        visited.add(node.id);
        let childCount = products.filter(p => p.categoryIds?.includes(node.id)).length;
        if (node.children) {
          node.children.forEach((child: any) => {
            childCount += countChildren(child);
          });
        }
        return childCount;
      };
      
      category.children.forEach((child: any) => {
        count += countChildren(child);
      });
    }
    
    return count;
  };

  const productCount = getProductCount(category.id!, true);

  const indexInSiblings = siblings.findIndex(s => s.id === category.id);
  const isFirst = indexInSiblings === 0;
  const isLast = indexInSiblings === siblings.length - 1;

  return (
    <div className="group">
      {/* Node row */}
      <div className="flex items-center gap-4 py-4 px-6 hover:bg-gray-50/80 transition-colors border-b border-gray-100 bg-white">
        
        {/* Collapse Toggle */}
        <div className="flex items-center shrink-0 w-6 justify-center">
          {hasChildren ? (
            <button
              onClick={() => onToggleCollapse(category.id!)}
              className="p-1 hover:bg-gray-100 text-gray-500 rounded-md transition-colors"
              type="button"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
          )}
        </div>

        {/* Category Image/Icon */}
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {category.imageUrl ? (
            <img loading="lazy" src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            hasChildren ? (
              isCollapsed ? <Folder size={18} className="text-[#00B4D8]" /> : <FolderOpen size={18} className="text-[#00B4D8]" />
            ) : (
              <Layers size={18} className="text-gray-400" />
            )
          )}
        </div>

        {/* Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#1A2B4C] truncate">{category.name}</span>
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
              /{category.slug}
            </span>
            {productCount > 0 && (
              <span className="text-[10px] font-bold text-[#00B4D8] bg-[#00B4D8]/5 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <Box size={10} />
                {productCount} {productCount === 1 ? 'Prod' : 'Prods'}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 truncate max-w-md mt-0.5">
            {category.description ? category.description.replace(/<[^>]*>/g, '') : 'No description provided'}
          </p>
        </div>

        {/* Actions & Ordering */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Sibling Ordering (Up/Down Arrows) */}
          <div className="flex items-center border border-gray-100 rounded-lg p-0.5 bg-gray-50/50 mr-2">
            <button
              onClick={() => onMoveOrder(category.id!, 'up')}
              disabled={isFirst}
              className={`p-1.5 rounded-md transition-colors ${
                isFirst 
                  ? 'text-gray-200 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-[#00B4D8] hover:bg-white hover:shadow-sm'
              }`}
              title="Move Up"
              type="button"
            >
              <ArrowUp size={13} />
            </button>
            <div className="w-px h-3 bg-gray-200 mx-0.5" />
            <button
              onClick={() => onMoveOrder(category.id!, 'down')}
              disabled={isLast}
              className={`p-1.5 rounded-md transition-colors ${
                isLast 
                  ? 'text-gray-200 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-[#00B4D8] hover:bg-white hover:shadow-sm'
              }`}
              title="Move Down"
              type="button"
            >
              <ArrowDown size={13} />
            </button>
          </div>

          {/* Add Sub-category */}
          <button
            onClick={() => onAddChild(category.id!)}
            className="p-2 text-gray-400 hover:text-[#00B4D8] hover:bg-[#00B4D8]/5 rounded-lg transition-all"
            title="Add Sub-category under this"
            type="button"
          >
            <Plus size={16} />
          </button>
          
          {/* Active status */}
          <button
            onClick={() => onToggleActive(category.id!, category.isActive)}
            className={`p-2 rounded-lg transition-all ${
              category.isActive 
                ? 'text-emerald-500 hover:bg-emerald-50' 
                : 'text-gray-300 hover:bg-gray-100'
            }`}
            title={category.isActive ? 'Active (Click to Hide)' : 'Inactive (Click to Show)'}
            type="button"
          >
            {category.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-400 hover:text-[#1A2B4C] hover:bg-gray-100 rounded-lg transition-all"
            title="Edit Category Node"
            type="button"
          >
            <Edit3 size={16} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(category.id!)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete Category"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Nested Child Nodes */}
      {hasChildren && !isCollapsed && (
        <div className="border-l border-dashed border-gray-200 ml-9 pl-4 transition-all duration-300 bg-gray-50/20">
          {category.children.map((child: any) => (
            <CategoryNodeItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              onAddChild={onAddChild}
              onMoveOrder={onMoveOrder}
              collapsedNodes={collapsedNodes}
              onToggleCollapse={onToggleCollapse}
              products={products}
              siblings={category.children}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  
  // Track collapsed state for nodes
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
    isFeatured: false,
    seoTags: '',
    seoMetaDescription: '',
    imageAltText: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error("Error reading hierarchical taxonomies:", err);
    } finally {
      setLoading(false);
    }
  };

  const tree = buildCategoryTree(categories);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id!);
    setParentId(cat.parentId);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      isActive: cat.isActive,
      isFeatured: !!cat.isFeatured,
      seoTags: cat.seoTags || '',
      seoMetaDescription: cat.seoMetaDescription || '',
      imageAltText: cat.imageAltText || ''
    });
    setShowForm(true);
  };

  const handleAddSub = (pid: string) => {
    setEditingId(null);
    setParentId(pid);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      isActive: true,
      isFeatured: false,
      seoTags: '',
      seoMetaDescription: '',
      imageAltText: ''
    });
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        parentId,
        displayOrder: editingId 
          ? (categories.find(c => c.id === editingId)?.displayOrder || 0) 
          : categories.filter(c => c.parentId === parentId).length
      };

      if (editingId) {
        await updateCategory(editingId, data);
      } else {
        await createCategory(data);
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? Sub-categories will be automatically moved to the root node level.')) return;
    try {
      await deleteCategory(id);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Deletion error.');
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateCategory(id, { isActive: !current });
      // Optimistically update local state first for immediate UI snap
      setCategories(prev => prev.map(c => c.id === id ? { ...c, isActive: !current } : c));
    } catch (error) {
      console.error(error);
      fetchData();
    }
  };

  // Sibling Reordering (Up & Down swapping)
  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const siblings = categories
      .filter(c => c.parentId === category.parentId)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const index = siblings.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prevSibling = siblings[index - 1];
      const tempOrder = category.displayOrder;
      const targetOrder = prevSibling.displayOrder;

      // Optimistic visual update
      setCategories(prev => prev.map(c => {
        if (c.id === category.id) return { ...c, displayOrder: targetOrder };
        if (c.id === prevSibling.id) return { ...c, displayOrder: tempOrder };
        return c;
      }));

      try {
        await reorderCategories([
          { id: category.id!, displayOrder: targetOrder, parentId: category.parentId },
          { id: prevSibling.id!, displayOrder: tempOrder, parentId: prevSibling.parentId }
        ]);
      } catch (err) {
        console.error(err);
        fetchData();
      }
    } else if (direction === 'down' && index < siblings.length - 1) {
      const nextSibling = siblings[index + 1];
      const tempOrder = category.displayOrder;
      const targetOrder = nextSibling.displayOrder;

      // Optimistic visual update
      setCategories(prev => prev.map(c => {
        if (c.id === category.id) return { ...c, displayOrder: targetOrder };
        if (c.id === nextSibling.id) return { ...c, displayOrder: tempOrder };
        return c;
      }));

      try {
        await reorderCategories([
          { id: category.id!, displayOrder: targetOrder, parentId: category.parentId },
          { id: nextSibling.id!, displayOrder: tempOrder, parentId: nextSibling.parentId }
        ]);
      } catch (err) {
        console.error(err);
        fetchData();
      }
    }
  };

  // Build the list of potential parent categories
  const parentDropdownOptions = getFlattenedOptions(tree, editingId);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <span className="text-[#00B4D8] text-xs font-black uppercase tracking-[0.3em] mb-2 block">
            Taxonomy Architecture
          </span>
          <h1 className="text-4xl font-black text-[#1A2B4C] tracking-tight">
            Category Hierarchy Tree
          </h1>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setParentId(null);
            setFormData({ 
              name: '', 
              slug: '', 
              description: '', 
              imageUrl: '', 
              isActive: true,
              seoTags: '',
              seoMetaDescription: '',
              imageAltText: ''
            });
            setShowForm(true);
          }}
          className="bg-[#1A2B4C] text-white px-8 py-4 rounded-2xl hover:bg-[#00B4D8] transition-all flex items-center font-black text-[10px] uppercase tracking-widest shadow-xl shrink-0 self-start sm:self-center"
        >
          <Plus size={18} className="mr-2" />
          Add Root Category
        </button>
      </div>

      {loading ? (
        <div className="py-40 text-center">
          <Loader2 className="animate-spin w-12 h-12 text-[#00B4D8] mx-auto mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
            Reconstructing Node Graph...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Legend and header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Live Interactive Taxonomy Node Graph
            </span>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Publicly Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Draft / Hidden</span>
              </div>
            </div>
          </div>

          {/* Interactive Tree Root */}
          <div className="divide-y divide-gray-50">
            {tree.map(node => (
              <CategoryNodeItem 
                key={node.id} 
                category={node} 
                level={0} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onAddChild={handleAddSub}
                onMoveOrder={handleMoveOrder}
                collapsedNodes={collapsedNodes}
                onToggleCollapse={toggleCollapse}
                products={products}
                siblings={tree}
              />
            ))}
          </div>

          {tree.length === 0 && (
            <div className="py-24 text-center">
              <Layers size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
                No active categories detected in cloud node
              </p>
            </div>
          )}
        </div>
      )}

      {/* Creation / Editing Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-[#1A2B4C]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl my-8 overflow-hidden shadow-2xl border border-gray-100"
            >
              
              {/* Modal Header */}
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-[#1A2B4C] tracking-tight">
                    {editingId ? 'Edit Category Node' : 'Create Category Node'}
                  </h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">
                    AV Live Classified Hierarchy System
                  </p>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="w-10 h-10 rounded-xl bg-white text-gray-400 hover:text-red-500 hover:shadow-md transition-all flex items-center justify-center border border-gray-100"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {/* Visual Parent Indicator/Banner */}
                {parentId && !editingId && (
                  <div className="bg-[#00B4D8]/10 text-[#00B4D8] px-5 py-3 rounded-xl border border-[#00B4D8]/20 flex items-center gap-2 text-xs font-bold">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                      Spawning Sub-node under:
                    </span>
                    <span>
                      {categories.find(c => c.id === parentId)?.name}
                    </span>
                  </div>
                )}

                <div className="space-y-5">
                  
                  {/* Category Label */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2 ml-1">
                      Category Label
                    </label>
                    <input 
                      required
                      placeholder="e.g. Wireless Microphones"
                      value={formData.name}
                      onChange={e => handleNameChange(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] transition-all text-sm" 
                    />
                  </div>

                  {/* Parent Selector Dropdown */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2 ml-1">
                      Parent Category
                    </label>
                    <select
                      value={parentId || ''}
                      onChange={e => setParentId(e.target.value || null)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-bold text-[#1A2B4C] transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="">[None - Make Root Category]</option>
                      {parentDropdownOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {"\u00A0\u00A0".repeat(opt.level) + "↳ " + opt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* URL Semantic Slug */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2 ml-1">
                      URL Semantic Slug
                    </label>
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 overflow-hidden">
                      <span className="text-gray-300 font-mono text-xs shrink-0 select-none mr-1">/category/</span>
                      <input 
                        required
                        value={formData.slug}
                        onChange={e => setFormData({...formData, slug: e.target.value})}
                        className="flex-1 bg-transparent py-3.5 focus:outline-none font-bold text-[#1A2B4C] text-sm" 
                      />
                    </div>
                  </div>

                  {/* Optional Image URL */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2 ml-1">
                      Banner Image URL (Optional)
                    </label>
                    <input 
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#00B4D8] font-semibold text-[#1A2B4C] transition-all text-sm" 
                    />
                  </div>

                  {/* Node Description */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2 ml-1">
                      Node Description
                    </label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={val => setFormData({...formData, description: val})}
                      placeholder="Summary describing the equipment type or system node..."
                    />
                  </div>

                   {/* Status & Featured Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                      <input 
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        className="w-5 h-5 rounded-lg border-gray-300 text-[#00B4D8] focus:ring-[#00B4D8] cursor-pointer shrink-0"
                      />
                      <div>
                        <label htmlFor="isActive" className="text-[10px] font-black text-[#1A2B4C] uppercase tracking-widest cursor-pointer select-none block">
                          Active Status
                        </label>
                        <span className="text-[9px] text-gray-400 font-bold block mt-0.5">Show in frontend navigation</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                      <input 
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                        className="w-5 h-5 rounded-lg border-gray-300 text-[#00B4D8] focus:ring-[#00B4D8] cursor-pointer shrink-0"
                      />
                      <div>
                        <label htmlFor="isFeatured" className="text-[10px] font-black text-[#1A2B4C] uppercase tracking-widest cursor-pointer select-none block">
                          Featured Status
                        </label>
                        <span className="text-[9px] text-gray-400 font-bold block mt-0.5">Highlight on frontpage banners</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO and Metadata section */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <h3 className="text-xs font-black text-[#1A2B4C] uppercase tracking-widest">
                    SEO & Meta Tags
                  </h3>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        Meta Description
                      </label>
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (formData.seoMetaDescription) {
                            navigator.clipboard.writeText(formData.seoMetaDescription); 
                            alert('Copied to Clipboard!'); 
                          }
                        }} 
                        className="flex items-center gap-1 text-[9px] font-bold text-[#00B4D8] uppercase tracking-widest hover:underline"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <textarea 
                      rows={2}
                      placeholder="Brief excerpt for Google indexing (max 160 chars)..."
                      value={formData.seoMetaDescription}
                      onChange={e => setFormData({...formData, seoMetaDescription: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs resize-none"
                      maxLength={160}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        Search Keywords / Hashtags
                      </label>
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (formData.seoTags) {
                            navigator.clipboard.writeText(formData.seoTags); 
                            alert('Copied to Clipboard!'); 
                          }
                        }} 
                        className="flex items-center gap-1 text-[9px] font-bold text-[#00B4D8] uppercase tracking-widest hover:underline"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <input 
                      placeholder="e.g. video conferencing, boardroom av, polycom"
                      value={formData.seoTags}
                      onChange={e => setFormData({...formData, seoTags: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] font-medium text-[#1A2B4C] transition-all text-xs"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-xl hover:bg-gray-200 transition-all uppercase tracking-[0.15em] text-[10px]"
                  >
                    Cancel Action
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#1A2B4C] text-white font-black py-4 rounded-xl hover:bg-[#00B4D8] transition-all shadow-xl shadow-[#1A2B4C]/10 uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      editingId ? 'Save Node Changes' : 'Build Node'
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
