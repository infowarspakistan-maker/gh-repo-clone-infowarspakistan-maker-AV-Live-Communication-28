import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { storage } from '../../lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        const storageRef = ref(storage, `uploads/editor_${Date.now()}_${file.name}`);
        try {
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', url);
          }
        } catch (error) {
          console.error("Error uploading image: ", error);
          alert("Error uploading image. Please check your storage permissions or try again.");
        }
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image'
  ];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 focus-within:border-[#00B4D8] focus-within:ring-1 focus-within:ring-[#00B4D8] transition-all">
      <ReactQuill 
        // @ts-ignore
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-64 mb-12"
      />
      <style>{`
        .quill {
          display: flex;
          flex-direction: column;
        }
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 16px;
          background-color: #f8f9fa;
          font-family: inherit;
        }
        .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 0.875rem;
        }
        .ql-editor {
          padding: 16px;
          min-height: 250px;
        }
        .ql-editor:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
