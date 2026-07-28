import { useAiAgentStore } from '@/lib/store';

export function useAiAgent() {
  const store = useAiAgentStore();
  return {
    isOpen: store.isOpen,
    messages: store.messages,
    isThinking: store.isThinking,
    openDrawer: () => store.setOpen(true),
    closeDrawer: () => store.setOpen(false),
    toggleDrawer: store.toggleDrawer,
    sendMessage: store.sendMessage,
  };
}
