'use client'

import { useState, useEffect } from 'react'
import SystemMonitor from '@/components/SystemMonitor'
import DockerManager from '@/components/DockerManager'
import BookmarkManager from '@/components/BookmarkManager'
import { Cpu, HardDrive, Bookmark, Settings } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('system')

  const tabs = [
    { id: 'system', label: '系统监控', icon: Cpu },
    { id: 'docker', label: 'Docker', icon: HardDrive },
    { id: 'bookmarks', label: '网址收藏', icon: Bookmark },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AllPanel</h1>
          <p className="text-slate-300">NAS666管理面板 - 系统监控 · Docker管理 · 网址收藏</p>
        </header>

        {/* Navigation Tabs */}
        <nav className="mb-8">
          <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg backdrop-blur-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Content */}
        <main className="space-y-6">
          {activeTab === 'system' && <SystemMonitor />}
          {activeTab === 'docker' && <DockerManager />}
          {activeTab === 'bookmarks' && <BookmarkManager />}
        </main>
      </div>
    </div>
  )
}
