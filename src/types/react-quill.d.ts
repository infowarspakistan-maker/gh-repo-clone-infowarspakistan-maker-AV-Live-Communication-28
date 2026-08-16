declare module 'react-quill' {
  import React from 'react';
  
  export interface ReactQuillProps {
    value?: string;
    defaultValue?: string;
    onChange?: (content: string, delta: any, source: any, editor: any) => void;
    onChangeSelection?: (selection: any, source: any, editor: any) => void;
    theme?: string;
    modules?: any;
    formats?: string[];
    bounds?: string | HTMLElement;
    placeholder?: string;
    preserveWhitespace?: boolean;
    readOnly?: boolean;
    className?: string;
    style?: React.CSSProperties;
    id?: string;
    tabIndex?: number;
  }
  
  export default class ReactQuill extends React.Component<ReactQuillProps> {}
}
