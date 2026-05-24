import { create } from 'zustand';
import { conversationApi } from '../api/index.js';

export const useConversationStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  error: null,

  fetchConversations: async (params) => {
    set({ loading: true });
    try {
      const res = await conversationApi.list(params);
      set({ conversations: res.data.conversations, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchConversation: async (id) => {
    set({ loading: true });
    try {
      const res = await conversationApi.get(id);
      set({ activeConversation: res.data.conversation, messages: res.data.messages, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      if (msgs.length && msgs[msgs.length - 1].role === 'assistant') {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
      }
      return { messages: msgs };
    }),

  cancelConversation: async (id) => {
    await conversationApi.update(id, { status: 'cancelled' });
    set((s) => ({
      conversations: s.conversations.map((c) => c._id === id ? { ...c, status: 'cancelled' } : c),
    }));
  },

  deleteConversation: async (id) => {
    await conversationApi.remove(id);
    set((s) => ({ conversations: s.conversations.filter((c) => c._id !== id) }));
  },
}));

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  provider: import.meta.env.VITE_DEFAULT_PROVIDER || 'ollama',
  model: import.meta.env.VITE_DEFAULT_MODEL || 'phi3',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })), 
  setProvider: (provider) => set({ provider }),
  setModel: (model) => set({ model }),
}));
