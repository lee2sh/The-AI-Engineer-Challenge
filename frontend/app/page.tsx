'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'

interface CodeProps {
  node?: any
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Optimized scroll behavior
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const components: Components = {
    code({ node, inline, className, children, ...props }: CodeProps) {
      return (
        <code
          className={`${className} ${
            inline ? 'bg-dracula-background/50 px-1.5 py-0.5 rounded text-dracula-cyan font-mono text-sm' : 'block p-4 bg-dracula-background/50 rounded-lg my-4 font-mono text-sm'
          }`}
          {...props}
        >
          {children}
        </code>
      )
    },
    p({ node, children, ...props }) {
      return (
        <p className="mb-4 leading-relaxed text-dracula-foreground" {...props}>
          {children}
        </p>
      )
    },
    ul({ node, children, ...props }) {
      return (
        <ul className="list-disc list-inside mb-4 space-y-2 text-dracula-foreground" {...props}>
          {children}
        </ul>
      )
    },
    ol({ node, children, ...props }) {
      return (
        <ol className="list-decimal list-inside mb-4 space-y-2 text-dracula-foreground" {...props}>
          {children}
        </ol>
      )
    },
    li({ node, children, ...props }) {
      return (
        <li className="text-dracula-foreground" {...props}>
          {children}
        </li>
      )
    },
    blockquote({ node, children, ...props }) {
      return (
        <blockquote className="border-l-4 border-dracula-purple pl-4 my-4 italic text-dracula-comment" {...props}>
          {children}
        </blockquote>
      )
    },
    a({ node, children, ...props }) {
      return (
        <a className="text-dracula-pink hover:text-dracula-purple underline transition-colors" {...props}>
          {children}
        </a>
      )
    },
    strong({ node, children, ...props }) {
      return (
        <strong className="font-bold text-dracula-cyan" {...props}>
          {children}
        </strong>
      )
    },
    em({ node, children, ...props }) {
      return (
        <em className="italic text-dracula-green" {...props}>
          {children}
        </em>
      )
    },
    h1({ node, children, ...props }) {
      return (
        <h1 className="text-2xl font-bold text-dracula-pink mb-4" {...props}>
          {children}
        </h1>
      )
    },
    h2({ node, children, ...props }) {
      return (
        <h2 className="text-xl font-bold text-dracula-pink mb-3" {...props}>
          {children}
        </h2>
      )
    },
    h3({ node, children, ...props }) {
      return (
        <h3 className="text-lg font-bold text-dracula-pink mb-2" {...props}>
          {children}
        </h3>
      )
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !apiKey) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developer_message: "You are a helpful AI assistant.",
          user_message: userMessage,
          api_key: apiKey,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let assistantMessage = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        assistantMessage += text
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1].content = assistantMessage
          return newMessages
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-dracula-purple/10 via-transparent to-transparent opacity-50"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-dracula-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-dracula-pink/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-dracula-cyan/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(189,147,249,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(189,147,249,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      <div className="max-w-6xl mx-auto relative">
        <header className="mb-6 text-center relative">
          {/* Decorative Circle */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 border-2 border-dracula-purple/30 rounded-full animate-pulse"></div>
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 border-2 border-dracula-pink/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          <h1 className="text-4xl font-bold text-dracula-pink mb-2 glow-text relative">
            AI Nexus
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-dracula-purple rounded-full animate-pulse"></div>
          </h1>
          <p className="text-dracula-comment text-sm">
            Powered by Advanced AI Technology
          </p>
        </header>

        <div className="mb-4 relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-dracula-green rounded-full animate-pulse"></div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className="dracula-input w-full"
          />
        </div>

        <div 
          ref={chatContainerRef}
          className="bg-dracula-background/50 backdrop-blur-sm rounded-lg shadow-2xl border border-dracula-purple/20 p-6 h-[calc(100vh-12rem)] flex flex-col"
        >
          <div className="flex-1 overflow-y-auto space-y-4 p-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className="message-container"
              >
                <div className={`font-semibold mb-2 ${
                  message.role === 'user' ? 'text-dracula-cyan' : 'text-dracula-green'
                }`}>
                  {message.role === 'user' ? 'You' : 'AI Assistant'}:
                </div>
                <div className="bg-dracula-background/30 p-6 rounded-lg border border-dracula-comment/30">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={components}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4 relative">
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-dracula-green rounded-full animate-pulse"></div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="dracula-input flex-1"
            disabled={isLoading || !apiKey}
          />
          <button
            type="submit"
            className="dracula-button-primary flex items-center gap-2"
            disabled={isLoading || !apiKey}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            Send
          </button>
        </form>
      </div>
    </main>
  )
} 