/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Youtube, 
  Download, 
  ExternalLink, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  Copy
} from 'lucide-react';

interface ThumbnailQuality {
  id: string;
  label: string;
  suffix: string;
  resolution: string;
}

const QUALITIES: ThumbnailQuality[] = [
  { id: 'maxres', label: 'Maximum Resolution', suffix: 'maxresdefault.jpg', resolution: '1280x720' },
  { id: 'sd', label: 'Standard Definition', suffix: 'sddefault.jpg', resolution: '640x480' },
  { id: 'hq', label: 'High Quality', suffix: 'hqdefault.jpg', resolution: '480x360' },
  { id: 'mq', label: 'Medium Quality', suffix: 'mqdefault.jpg', resolution: '320x180' },
  { id: 'default', label: 'Default Quality', suffix: 'default.jpg', resolution: '120x90' },
];

export default function App() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(QUALITIES[0].id);

  const videoId = useMemo(() => {
    if (!url.trim()) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[7].length === 11) ? match[7] : null;
    
    if (url && !id) {
      setError('Invalid YouTube URL');
    } else {
      setError('');
    }
    
    return id;
  }, [url]);

  const handleClear = useCallback(() => {
    setUrl('');
    setError('');
  }, []);

  const handleCopyToClipboard = (text: string, message = "Link copied to clipboard!") => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    // Use a custom message system or generic one
    setTimeout(() => setShowCopied(false), 2000);
  };

  const getBloggerCode = (id: string, qualityId: string) => {
    const quality = QUALITIES.find(q => q.id === qualityId) || QUALITIES[0];
    return `<a href="https://www.youtube.com/watch?v=${id}" target="_blank">\n  <img src="https://img.youtube.com/vi/${id}/${quality.suffix}" alt="YouTube Thumbnail" style="width:100%; max-width:640px; border-radius:8px;" />\n</a>`;
  };

  const downloadImage = async (imgUrl: string, filename: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (e) {
      window.open(imgUrl, '_blank');
    }
  };

  const currentQuality = QUALITIES.find(q => q.id === selectedQuality) || QUALITIES[0];

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[800px] bg-white rounded-[24px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] p-8 md:p-12"
      >
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">YT Thumbnail Extractor</h1>
          <p className="text-gray-500 mt-2">Perfectly sized assets for your Blogger posts</p>
        </header>

        <div className="space-y-8">
          {/* Input Area */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2563eb] transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Paste YouTube URL here..."
                className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border rounded-xl outline-none transition-all text-gray-600
                  ${error ? 'border-red-500' : 'border-gray-200 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10'}
                `}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {url && (
                <button 
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-500 text-sm font-medium"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {!videoId ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300 gap-4"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-gray-400">Ready to fetch your thumbnails</p>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                {/* Preview Column */}
                <div className="md:col-span-8">
                  <div className="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-sm relative group">
                    <img 
                      src={`https://img.youtube.com/vi/${videoId}/${currentQuality.suffix}`}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (currentQuality.id === 'maxres') {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Controls Column */}
                <div className="md:col-span-4 flex flex-col justify-center space-y-4">
                  <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-3 block">Resolution</span>
                    <div className="space-y-2.5">
                      {QUALITIES.map((q) => (
                        <label key={q.id} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="res" 
                            checked={selectedQuality === q.id}
                            onChange={() => setSelectedQuality(q.id)}
                            className="w-4 h-4 text-[#2563eb] border-gray-300 focus:ring-[#2563eb]" 
                          />
                          <div className="flex flex-col">
                            <span className={`text-sm font-medium transition-colors ${selectedQuality === q.id ? 'text-[#2563eb]' : 'text-gray-700 group-hover:text-gray-900'}`}>
                              {q.label.split(' ')[0]}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{q.resolution}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => downloadImage(`https://img.youtube.com/vi/${videoId}/${currentQuality.suffix}`, `thumbnail-${videoId}.jpg`)}
                    className="w-full bg-[#2563eb] text-white py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#1d4ed8] transition-all transform active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" />
                    Save Image
                  </button>

                  <button 
                    onClick={() => handleCopyToClipboard(getBloggerCode(videoId, selectedQuality), "Blogger code copied!")}
                    className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Blogger Code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Engine Ready
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex gap-4">
            <span>No Login Required</span>
            <span className="text-gray-200">•</span>
            <span>Free Forever</span>
          </div>
        </footer>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showCopied && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
