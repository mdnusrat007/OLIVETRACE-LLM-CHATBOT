import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Trash2, Play, X } from 'lucide-react';
import { useConversationStore } from '../store/index.js';

const STATUS_COLORS = {
  active: 'bg-emerald-900 text-emerald-300',
  cancelled: 'bg-rose-900 text-rose-300',
  archived: 'bg-slate-700 text-slate-400',
};

export default function ConversationsPage() {
  const navigate = useNavigate();
  const { conversations, loading, fetchConversations, cancelConversation, deleteConversation } = useConversationStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  useEffect(() => {
    fetchConversations({ status: statusFilter, provider: providerFilter });
  }, [statusFilter, providerFilter]);

  const handleCancel = async (e, id) => {
    e.stopPropagation();
    if (confirm('Cancel this conversation?')) await cancelConversation(id);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) await deleteConversation(id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Conversations</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Providers</option>
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
          <option value="ollama">Ollama</option>
        </select>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading…</p>}

      <div className="space-y-3">
        {conversations.map((conv) => (
          <div
            key={conv._id}
            onClick={() => navigate(`/chat/${conv.sessionId}`)}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-indigo-500 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={14} className="text-slate-400 flex-shrink-0" />
                  <p className="text-slate-100 text-sm font-medium truncate">{conv.title || 'Untitled'}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[conv.status] || STATUS_COLORS.archived}`}>
                    {conv.status}
                  </span>
                  <span className="font-mono">{conv.provider}/{conv.model?.split('-')[0]}</span>
                  <span>{conv.messageCount} msgs</span>
                  <span>{(conv.totalTokens || 0).toLocaleString()} tokens</span>
                  <span>${(conv.totalCostUsd || 0).toFixed(4)}</span>
                  <span>{new Date(conv.lastActivityAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/chat/${conv.sessionId}`); }}
                  className="p-1.5 text-indigo-400 hover:bg-indigo-900 rounded-lg transition-colors"
                  title="Resume"
                >
                  <Play size={15} />
                </button>
                {conv.status === 'active' && (
                  <button
                    onClick={(e) => handleCancel(e, conv._id)}
                    className="p-1.5 text-yellow-400 hover:bg-yellow-900 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(e, conv._id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-900 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && conversations.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>No conversations yet. Start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
}
