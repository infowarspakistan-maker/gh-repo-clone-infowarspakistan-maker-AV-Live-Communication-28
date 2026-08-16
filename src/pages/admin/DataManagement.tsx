import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { db } from '../../lib/firebase/client';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import Papa from 'papaparse';

export function DataManagement() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = async (collectionName: string) => {
    try {
      setLoading(collectionName);
      setMessage(null);
      
      const snapshot = await getDocs(collection(db, collectionName));
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return { id: doc.id, ...docData };
      });
      
      if (data.length === 0) {
        setMessage({ text: `No data found in ${collectionName}`, type: 'error' });
        return;
      }
      
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${collectionName}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage({ text: `Successfully exported ${data.length} items from ${collectionName}`, type: 'success' });
    } catch (error: any) {
      console.error(`Error exporting ${collectionName}:`, error);
      setMessage({ text: error.message || 'Error exporting data', type: 'error' });
    } finally {
      setLoading(null);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>, collectionName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(`import_${collectionName}`);
      setMessage(null);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const data = results.data as any[];
            if (data.length === 0) {
              setMessage({ text: 'CSV is empty', type: 'error' });
              return;
            }
            
            // Note: Firestore batched writes are limited to 500 operations
            const batch = writeBatch(db);
            let operationCount = 0;
            let batchCount = 0;
            
            for (const item of data) {
              const docId = item.id;
              const docData = { ...item };
              delete docData.id;
              
              // Basic type casting for boolean/numbers (PapaParse reads everything as string by default)
              Object.keys(docData).forEach(key => {
                if (docData[key] === 'true') docData[key] = true;
                if (docData[key] === 'false') docData[key] = false;
                if (!isNaN(docData[key]) && docData[key] !== '') {
                  docData[key] = Number(docData[key]);
                }
                // Convert stringified arrays back to arrays if possible
                if (typeof docData[key] === 'string' && docData[key].startsWith('[') && docData[key].endsWith(']')) {
                  try {
                    docData[key] = JSON.parse(docData[key].replace(/'/g, '"'));
                  } catch (e) {
                    // Ignore, keep as string
                  }
                }
              });
              
              const docRef = docId ? doc(db, collectionName, docId) : doc(collection(db, collectionName));
              batch.set(docRef, docData, { merge: true });
              
              operationCount++;
              if (operationCount >= 490) {
                await batch.commit();
                operationCount = 0;
                batchCount++;
              }
            }
            
            if (operationCount > 0) {
              await batch.commit();
            }
            
            setMessage({ text: `Successfully imported ${data.length} items to ${collectionName}`, type: 'success' });
            event.target.value = ''; // Reset input
          } catch (error: any) {
            console.error(`Error processing import for ${collectionName}:`, error);
            setMessage({ text: error.message || 'Error processing import', type: 'error' });
          } finally {
            setLoading(null);
          }
        },
        error: (error) => {
          setMessage({ text: `CSV Parse Error: ${error.message}`, type: 'error' });
          setLoading(null);
        }
      });
    } catch (error: any) {
      console.error(`Error starting import for ${collectionName}:`, error);
      setMessage({ text: error.message || 'Error starting import', type: 'error' });
      setLoading(null);
    }
  };

  const sections = [
    { id: 'services', title: 'Services Data', description: 'Export or import service modules and offerings.' },
    { id: 'products', title: 'Products Data', description: 'Export or import the full catalog of products.' },
    { id: 'categories', title: 'Categories Data', description: 'Export or import categories hierarchy, metadata, and SEO.' },
    { id: 'blog_posts', title: 'Blog Data', description: 'Export or import blog articles and posts.' },
    { id: 'settings', title: 'Global Branding & Settings', description: 'Export or import site configuration, branding elements.' },
    { id: 'about', title: 'About Page Content', description: 'Export or import About Us page text.' },
    { id: 'contact', title: 'Contact Page Content', description: 'Export or import Contact page text.' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1A2B4C] tracking-tight">Data Management</h1>
          <p className="text-gray-500 mt-2">Export and import website content using CSV files.</p>
        </div>
        <div className="w-12 h-12 bg-blue-50 text-[#00B4D8] rounded-xl flex items-center justify-center">
          <Database size={24} />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(section => (
          <div key={section.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
            <h2 className="text-xl font-bold text-[#1A2B4C] mb-2">{section.title}</h2>
            <p className="text-gray-500 text-sm mb-6 flex-grow">{section.description}</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => handleExport(section.id)}
                disabled={loading !== null}
                className="flex-1 bg-white border-2 border-[#1A2B4C] text-[#1A2B4C] px-4 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading === section.id ? (
                  <div className="w-5 h-5 border-2 border-[#1A2B4C] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Download size={18} />
                    Export
                  </>
                )}
              </button>
              
              <div className="flex-1 relative">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => handleImport(e, section.id)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled={loading !== null}
                />
                <button 
                  disabled={loading !== null}
                  className="w-full bg-[#1A2B4C] text-white px-4 py-3 rounded-xl font-bold hover:bg-[#00B4D8] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 pointer-events-none"
                >
                  {loading === `import_${section.id}` ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Upload size={18} />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
