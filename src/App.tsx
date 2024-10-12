import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import CryptoJS from 'crypto-js';
import { Lock, Unlock, FileText, Save, Key, Copy, Check } from 'lucide-react';

function App() {
  const [markdown, setMarkdown] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState<'choose' | 'new' | 'open'>('choose');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode === 'new' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const generateKey = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
  };

  const handleSave = () => {
    if (markdown) {
      const newKey = generateKey();
      const encrypted = CryptoJS.AES.encrypt(markdown, newKey).toString();
      localStorage.setItem('encryptedContent', encrypted);
      setSavedKey(newKey);
    } else {
      alert('Please enter some content before saving.');
    }
  };

  const handleOpen = () => {
    const savedContent = localStorage.getItem('encryptedContent');
    if (savedContent && key) {
      try {
        const decrypted = CryptoJS.AES.decrypt(savedContent, key).toString(CryptoJS.enc.Utf8);
        setMarkdown(decrypted);
        setMode('new');
      } catch (error) {
        alert('Invalid key. Please try again.');
      }
    } else {
      alert('No saved content or key not provided.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderChooseMode = () => (
    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
      <button
        className="bg-white p-6 rounded-lg shadow-sm hover:shadow transition-shadow duration-300 flex flex-col items-center"
        onClick={() => setMode('new')}
      >
        <FileText className="w-12 h-12 mb-4 text-blue-500" />
        <span className="text-lg font-medium">New Document</span>
      </button>
      <button
        className="bg-white p-6 rounded-lg shadow-sm hover:shadow transition-shadow duration-300 flex flex-col items-center"
        onClick={() => setMode('open')}
      >
        <Unlock className="w-12 h-12 mb-4 text-green-500" />
        <span className="text-lg font-medium">Open Document</span>
      </button>
    </div>
  );

  const renderNewMode = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <textarea
          ref={inputRef}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Enter your Markdown here..."
          className="w-full md:w-1/2 p-4 border rounded-lg h-[calc(100vh-300px)] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="w-full md:w-1/2 border rounded-lg p-4 h-[calc(100vh-300px)] overflow-auto bg-white">
          <ReactMarkdown className="prose max-w-none">{markdown}</ReactMarkdown>
        </div>
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
      >
        <Save className="mr-2" size={18} /> Save and Generate Key
      </button>
      {savedKey && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <Lock className="mr-2 text-gray-600" size={16} />
            <span className="text-sm font-medium text-gray-800">{savedKey}</span>
          </div>
          <button
            onClick={() => copyToClipboard(savedKey)}
            className="ml-2 p-2 text-blue-500 hover:text-blue-600 focus:outline-none"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      )}
    </div>
  );

  const renderOpenMode = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <input
          type="text"
          placeholder="Enter decryption key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleOpen}
          className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
        >
          <Key className="mr-2" size={18} /> Open
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center text-gray-800">Encrypted Markdown Editor</h1>
        {mode === 'choose' && renderChooseMode()}
        {mode === 'new' && renderNewMode()}
        {mode === 'open' && renderOpenMode()}
        {mode !== 'choose' && (
          <button
            onClick={() => setMode('choose')}
            className="mt-6 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}

export default App;