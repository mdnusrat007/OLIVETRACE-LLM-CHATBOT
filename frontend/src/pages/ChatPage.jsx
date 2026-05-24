import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, StopCircle, Bot, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStream } from '../hooks/useStream.js';
import { useUIStore } from '../store/index.js';
import { conversationApi } from '../api/index.js';

const PROVIDERS = {
  ollama: ['phi3', 'phi3'],
};

function MessageBubble({ msg, isStreaming }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-600' : 'bg-slate-600'}`}>
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-tl-sm'
      } ${isStreaming ? 'cursor-blink' : ''}`}>
        {msg.content || <span className="text-slate-400 italic">…</span>}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { sessionId: paramSession } = useParams();
  const navigate = useNavigate();
  const { provider, model, setProvider, setModel } = useUIStore();
  const [sessionId] = useState(() => paramSession || uuidv4());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const bottomRef = useRef(null);
  const { isStreaming, startStream, cancelStream } = useStream();

  useEffect(() => {
    if (paramSession) {
      conversationApi.get(paramSession).catch(() => {}).then((res) => {
        if (res?.data?.messages) setMessages(res.data.messages);
      });
    }
  }, [paramSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setStreamingContent('');
    const text = input;
    setInput('');

    startStream({
      message: text,
      sessionId,
      provider,
      model,
      onStart: () => {},
      onDone: ({ fullContent }) => {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: fullContent };
          return copy;
        });
        setStreamingContent('');
        if (!paramSession) navigate(`/chat/${sessionId}`, { replace: true });
      },
    });
  };

  // Sync streamed tokens into last message slot
  const displayMessages = [...messages];
  if (isStreaming && displayMessages.length) {
    const lastIdx = displayMessages.length - 1;
    if (displayMessages[lastIdx].role === 'assistant') {
      displayMessages[lastIdx] = { ...displayMessages[lastIdx] };
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-slate-800">
        <select
          value={provider}
          onChange={(e) => { setProvider(e.target.value); setModel(PROVIDERS[e.target.value][0]); }}
          className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {Object.keys(PROVIDERS).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {(PROVIDERS[provider] || []).map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className={`ml-auto text-xs px-2 py-1 rounded-full font-mono ${
          isStreaming ? 'bg-indigo-900 text-indigo-300' : 'bg-slate-700 text-slate-400'
        }`}>
          {isStreaming ? '● streaming' : '○ idle'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
            <Bot size={48} className="opacity-30" />
            <p className="text-sm">Start a conversation</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={i === messages.length - 1 && msg.role === 'assistant' && isStreaming
              ? { ...msg, content: msg.content }
              : msg
            }
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-slate-700 bg-slate-800">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Message… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
            style={{ maxHeight: '120px' }}
          />
          {isStreaming ? (
            <button
              onClick={cancelStream}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              <StopCircle size={16} /> Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              <Send size={16} /> Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
