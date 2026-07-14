import { useState, useRef, useEffect } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { FaBook, FaBookOpen } from 'react-icons/fa';
import { Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! I am Libra, your AI library assistant. How can I help you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        const handleOpenChat = (e) => {
            setIsOpen(true);
            if (e.detail?.action === 'ai-picks') {
                setMessages(prev => {
                    if (prev.some(m => m.text.includes('AI Picks!'))) return prev;
                    return [...prev, { 
                        role: 'model', 
                        text: "I see you're looking for AI Picks! What is your preferred genre? (e.g., Fiction, Sci-Fi, History, Romance). Let me know and I'll find some top trending books for you!" 
                    }];
                });
            }
        };
        window.addEventListener('open-ai-chat', handleOpenChat);
        return () => window.removeEventListener('open-ai-chat', handleOpenChat);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        const newHistory = [...messages, { role: 'user', text: userMsg }];
        setMessages(newHistory);
        setInput('');
        setIsLoading(true);

        try {
            // We pass the history excluding the very first welcome message
            const res = await api.post('/chat', {
                message: userMsg,
                history: messages.slice(1)
            });

            setMessages([...newHistory, { role: 'model', text: res.data.data.reply }]);
        } catch (error) {
            setMessages([...newHistory, { role: 'model', text: 'Oops! I am having trouble connecting to my servers right now.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute bottom-20 right-0 w-[calc(100vw-3rem)] sm:w-[400px] max-w-[400px] flex flex-col mb-2 origin-bottom-right"
                    >
                        {/* Floating Open Book Above Chatbox */}
                        <motion.div
                            animate={{ 
                                y: [0, -12, 0],
                                x: [0, -8, 8, 0],
                                rotateZ: [0, -5, 5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 text-amber-500 drop-shadow-2xl hidden sm:block"
                        >
                            <div className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border dark:border-slate-700 border-amber-100">
                                <FaBookOpen size={28} className="text-amber-500" />
                            </div>
                        </motion.div>

                        <div className="bg-white dark:bg-slate-900 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden h-[65vh] sm:h-[520px] max-h-[600px]">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 text-white flex items-center justify-between z-10 relative overflow-hidden shadow-md shrink-0">
                                <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
                                <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                                    <div className="relative">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border dark:border-slate-700 border-white/30">
                                            <Bot size={24} className="text-white drop-shadow-md" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-orange-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight drop-shadow-sm flex items-center gap-1">
                                            Libra AI <Sparkles size={14} className="text-amber-200" />
                                        </h3>
                                        <p className="text-xs text-amber-50 font-medium tracking-wide opacity-90">Always here to help</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10">
                                    <FiX size={22} />
                                </button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-slate-900 relative">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, idx) => (
                                        <motion.div 
                                            key={idx} 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.role === 'model' && (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-1">
                                                    <Bot size={16} />
                                                </div>
                                            )}
                                            <div className={`max-w-[75%] p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                                                msg.role === 'user' 
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-tr-sm font-medium' 
                                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                                            }`}>
                                                {msg.text}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex justify-start gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-1">
                                                <Bot size={16} />
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 border-slate-100 p-4 rounded-2xl rounded-tl-sm text-amber-500 shadow-sm flex items-center gap-1.5">
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-amber-400 rounded-full" />
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-amber-400 rounded-full" />
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-amber-400 rounded-full" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={messagesEndRef} className="h-2" />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                                <div className="relative flex items-center bg-slate-100 dark:bg-slate-700 rounded-full p-1.5 shadow-inner focus-within:ring-2 focus-within:ring-amber-500/30 transition-all">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent px-4 py-2 text-[15px] outline-none text-slate-800 dark:text-white placeholder-slate-400"
                                        disabled={isLoading}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!input.trim() || isLoading}
                                        className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                                    >
                                        <FiSend size={18} className="ml-0.5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <div className="relative group">
                {/* Tooltip */}
                {!isOpen && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                        Chat with Libra AI
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-800 dark:border-l-slate-700"></div>
                    </div>
                )}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all duration-300 relative z-[1000] ${isOpen ? 'rotate-90 rounded-full' : ''}`}
                >
                    {isOpen ? (
                        <FiX size={28} className="transition-transform" />
                    ) : (
                        <motion.div
                            animate={{ 
                                y: [0, -6, 0],
                                x: [0, -4, 4, 0],
                                rotateZ: [0, -4, 4, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                        >
                            <FaBook size={28} className="drop-shadow-md" />
                        </motion.div>
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default ChatWidget;
