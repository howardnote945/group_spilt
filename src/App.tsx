/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shuffle, 
  Copy, 
  Check, 
  Settings2,
  ListRestart,
  Plus,
  X
} from 'lucide-react';

interface Group {
  id: number;
  members: string[];
}

export default function App() {
  const [namesText, setNamesText] = useState<string>('');
  const [names, setNames] = useState<string[]>([]);
  const [numGroups, setNumGroups] = useState<number>(2);
  const [groupingMode, setGroupingMode] = useState<'count' | 'size'>('count');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedNames = localStorage.getItem('random_grouper_names');
    if (savedNames) {
      setNamesText(savedNames);
    }
  }, []);

  // Sync names array whenever text changes
  useEffect(() => {
    const list = namesText.split('\n').map(n => n.trim()).filter(n => n !== '');
    setNames(list);
    localStorage.setItem('random_grouper_names', namesText);
  }, [namesText]);

  const generateGroups = useCallback(() => {
    if (names.length === 0) {
      setError('請輸入至少一個名字');
      return;
    }
    setError(null);
    setIsShuffling(true);

    // Simulate shuffling animation delay
    setTimeout(() => {
      const shuffled = [...names].sort(() => Math.random() - 0.5);
      const result: Group[] = [];
      
      let finalNumGroups = numGroups;
      if (groupingMode === 'size') {
        finalNumGroups = Math.ceil(names.length / numGroups);
      }

      for (let i = 0; i < finalNumGroups; i++) {
        result.push({ id: i + 1, members: [] });
      }

      shuffled.forEach((name, index) => {
        result[index % finalNumGroups].members.push(name);
      });

      setGroups(result.filter(g => g.members.length > 0));
      setIsShuffling(false);
    }, 800);
  }, [names, numGroups, groupingMode]);

  const copyToClipboard = () => {
    const text = groups
      .map(g => `第 ${g.id} 組：\n${g.members.join('\n')}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(text).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  const reset = () => {
    setGroups([]);
    setError(null);
  };

  const clearList = () => {
    if (confirm('確定要清空名單嗎？')) {
      setNamesText('');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-[320px] bg-brutal-black text-brutal-white p-10 flex flex-col min-h-screen">
        <div className="logo-text mb-12">SPLIT.</div>
        
        <div className="mb-6 flex flex-col flex-1 overflow-hidden">
          <div className="section-label mb-3 opacity-60 flex justify-between items-center text-white">
            Member List ({names.length})
            <button onClick={clearList} className="hover:text-red-500 transition-colors cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
          <textarea
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            placeholder="一人一行..."
            className="flex-1 bg-brutal-gray border-2 border-brutal-border text-white p-4 font-mono text-sm focus:border-white outline-none resize-none mb-6"
          />
        </div>

        <div className="mb-8">
          <div className="section-label mb-3 opacity-60 text-white">Group Settings</div>
          
          <div className="flex gap-2 mb-4">
             <button
              onClick={() => setGroupingMode('count')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-brutal-border transition-all ${
                groupingMode === 'count' ? 'bg-white text-black border-white' : 'text-white/40 hover:border-white/40'
              }`}
            >
              組數
            </button>
            <button
              onClick={() => setGroupingMode('size')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-brutal-border transition-all ${
                groupingMode === 'size' ? 'bg-white text-black border-white' : 'text-white/40 hover:border-white/40'
              }`}
            >
              每組人數
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6 bg-brutal-gray p-4 border-2 border-brutal-border">
            <input
              type="number"
              min="1"
              max={names.length || 10}
              value={numGroups}
              onChange={(e) => setNumGroups(parseInt(e.target.value) || 1)}
              className="w-16 bg-transparent text-xl font-black text-center focus:outline-none focus:ring-1 focus:ring-white"
            />
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
              {groupingMode === 'count' ? 'Groups' : 'Per Group'}
            </div>
          </div>

          {error && <div className="text-red-500 text-[10px] uppercase font-bold mb-4">{error}</div>}

          <button
            onClick={generateGroups}
            disabled={isShuffling || names.length === 0}
            className="w-full bg-white text-black py-4 font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isShuffling ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}>
                <Shuffle size={18} />
              </motion.div>
            ) : <Shuffle size={18} />}
            {isShuffling ? 'WAITING...' : 'SHUFFLE'}
          </button>
        </div>

        <div className="mt-auto text-[10px] uppercase tracking-[2px] opacity-40 flex justify-between items-center">
          <span>v1.2.0</span>
          <span>SYSTEM READY</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 md:p-16 flex flex-col overflow-y-auto bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="header-text pb-4 w-full md:w-auto">GROUPS.</div>
          
          <div className="flex gap-4">
            {groups.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 border-2 border-black font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2"
                >
                  {hasCopied ? <Check size={14} /> : <Copy size={14} />}
                  {hasCopied ? 'COPIED' : 'COPY ALL'}
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-black/90 transition-all flex items-center gap-2"
                >
                  <X size={14} />
                  CLEAR
                </button>
              </>
            )}
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {groups.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {groups.map((group, idx) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="brutal-border p-6 flex flex-col brutal-shadow"
                >
                  <div className="text-4xl font-black mb-4 border-b-2 border-black pb-2 flex justify-between items-baseline">
                    <span>{group.id.toString().padStart(2, '0')}</span>
                    <span className="text-xs uppercase opacity-40">{group.members.length} PPL</span>
                  </div>
                  <ul className="space-y-2">
                    {group.members.map((member, mIdx) => (
                      <li key={mIdx} className="font-bold border-b border-gray-100 pb-1">
                        {member}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-20 border-4 border-dashed border-black/10 rounded-3xl">
              <Users size={120} className="mb-6" />
              <div className="text-4xl font-black tracking-tighter uppercase px-4">
                No groups generated yet.
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
