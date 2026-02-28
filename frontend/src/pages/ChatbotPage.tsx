import React from 'react';
import AIChatbot from '../components/AIChatbot';
import { MessageSquare } from 'lucide-react';

export default function ChatbotPage() {
  return (
    <div className="page-enter space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get help with complaints, track status, and find answers to campus FAQs.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          {/* The chatbot is rendered as a floating widget; on this page we show a full version */}
          <div className="p-6 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-primary/40" />
            <p className="font-medium text-foreground mb-1">CampusVoice AI Assistant</p>
            <p className="text-sm">
              Click the chat bubble in the bottom-right corner to start a conversation with the AI assistant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
