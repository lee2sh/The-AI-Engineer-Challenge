'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { Components } from 'react-markdown'

interface CodeProps {
  node?: any
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

// Add DraculaLoading component
const DraculaLoading = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="relative w-24 h-24 mb-4">
      <div className="absolute inset-0 bg-dracula-purple/20 rounded-full animate-pulse"></div>
      <div className="absolute inset-2 bg-dracula-purple/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="absolute inset-4 bg-dracula-purple/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      <div className="absolute inset-6 bg-dracula-purple/80 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
      <div className="absolute inset-8 bg-dracula-purple rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-12 h-12 text-dracula-pink" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
        </svg>
      </div>
    </div>
    <div className="text-dracula-pink text-sm font-medium">Processing your request...</div>
  </div>
)

export default function Home() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [isKeySet, setIsKeySet] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      setIsKeySet(true)
    }
  }

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
        <ul className="list-disc list-inside mb-4 space-y-2 text-dracula-foreground inline-block" {...props}>
          {children}
        </ul>
      )
    },
    ol({ node, children, ...props }) {
      return (
        <ol className="list-decimal list-inside mb-4 space-y-2 text-dracula-foreground inline-block" {...props}>
          {children}
        </ol>
      )
    },
    li({ node, children, ...props }) {
      return (
        <li className="text-dracula-foreground inline-block" {...props}>
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
        <header className="mb-4 text-center relative">
          {/* Decorative Circle */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 border-2 border-dracula-purple/30 rounded-full animate-pulse"></div>
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 border-2 border-dracula-pink/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          <h1 className="text-3xl font-bold text-dracula-pink mb-1 glow-text relative">
            Dracula Chat
          </h1>
          <p className="text-sm text-dracula-comment">
            Your AI companion in the dark
          </p>
        </header>

        {!isKeySet ? (
          <div className="bg-dracula-background/50 backdrop-blur-sm rounded-lg shadow-2xl border border-dracula-purple/20 p-6">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold text-dracula-pink mb-4">Enter Your API Key</h2>
              <form onSubmit={handleApiKeySubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your OpenAI API key"
                    className="w-full px-4 py-2 bg-dracula-background/50 border border-dracula-purple/30 rounded-lg text-dracula-foreground placeholder-dracula-comment focus:outline-none focus:border-dracula-pink"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-dracula-purple text-white rounded-lg hover:bg-dracula-pink transition-colors"
                >
                  Start Chatting
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-dracula-background/50 backdrop-blur-sm rounded-lg shadow-2xl border border-dracula-purple/20 p-4 h-[calc(100vh-8rem)] flex flex-col">
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto space-y-4 p-4 scroll-smooth will-change-scroll"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-dracula-purple/20'
                        : 'bg-dracula-background/30'
                    } p-4 rounded-lg border ${
                      message.role === 'user'
                        ? 'border-dracula-purple/30'
                        : 'border-dracula-comment/30'
                    }`}
                  >
                    <div className="markdown-content">
                      <ReactMarkdown
                        components={components}
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <DraculaLoading />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-dracula-background/50 border border-dracula-purple/30 rounded-lg text-dracula-foreground placeholder-dracula-comment focus:outline-none focus:border-dracula-pink"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-dracula-purple text-white rounded-lg hover:bg-dracula-pink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
} 