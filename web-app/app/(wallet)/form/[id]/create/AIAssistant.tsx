import { FormUpdateInput } from '@/types';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Bot, Sparkles, User } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  formData: FormUpdateInput,
  setFormData: Dispatch<SetStateAction<FormUpdateInput>>,
}

export const AIAssistantForm = ({ formData, setFormData }: AIAssistantProps) => {
  
  const [ aiPrompt, setAiPrompt ] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat/form-creator',
      body: () => ({ formData }),
    }),
    onFinish: ({ message }) => {
      const parts = message.parts || [];
      
      for (const part of parts) {
        // Check if this is a tool result part
        if (part.type?.includes('updateFormFields') || (part as {
          toolName: string
        })?.toolName === 'updateFormFields') {
          
          // Try to extract fields from different possible locations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anyPart = part as any;
          let fields = null;
          
          if (anyPart.result?.fields) {
            fields = anyPart.result.fields;
          } else if (anyPart.args?.fields) {
            fields = anyPart.args.fields;
          } else if (anyPart.input?.fields) {
            fields = anyPart.input.fields;
          }
          console.log({ fields });
          if (fields) {
            setFormData(prevState => ({ ...prevState, fields }));
          }
        }
      }
    },
  });
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ messages ]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userMessage = aiPrompt.trim();
    
    if (!userMessage) {
      return;
    }
    
    setAiPrompt('');
    
    await sendMessage({
      role: 'user',
      parts: [ { type: 'text', text: userMessage } ],
    });
  };
  
  return (
    <aside className="w-80 border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs text-blue-900">
              💡 <strong>Tip:</strong> Describe qué campos quieres agregar a tu formulario y la IA te ayudará a crearlos.
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            // Extract text from message parts
            const textContent = message.parts
              ?.filter((part) => part.type === 'text')
              .map((part) => ('text' in part ? part.text : ''))
              .join('') || '';
            
            if (!textContent) return null;
            
            return (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`rounded-lg px-4 py-3 max-w-[85%] text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        code: ({ children }) => (
                          <code className="bg-gray-200/50 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                        ),
                      }}
                    >
                      {textContent}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        <form onSubmit={handleSubmit}>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe los campos que quieres agregar..."
            rows={3}
            disabled={status === 'submitted' || status === 'streaming'}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <button
            type="submit"
            disabled={status === 'submitted' || status === 'streaming' || !aiPrompt.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <Sparkles className="h-4 w-4" />
            {status === 'submitted' || status === 'streaming' ? 'Generando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </aside>
  );
};
