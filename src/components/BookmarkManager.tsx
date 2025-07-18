'use client'

import { useState, useEffect } from 'react'
import { Plus, ExternalLink, Edit, Trash2, Globe, Search } from 'lucide-react'

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  category: string
  order: number
  createdAt: string
  updatedAt: string
}

function BookmarkCard({ bookmark, onEdit, onDelete }: {
  bookmark: Bookmark
  onEdit: (bookmark: Bookmark) => void
  onDelete: (id: string) => void
}) {
  const handleClick = () => {
    window.open(bookmark.url, '_blank')
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all duration-200 group">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {bookmark.icon ? (
            <img 
              src={bookmark.icon} 
              alt={bookmark.title}
              className="w-8 h-8 rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <Globe className={`w-8 h-8 text-slate-400 ${bookmark.icon ? 'hidden' : ''}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 
            className="text-white font-medium truncate cursor-pointer hover:text-blue-400 transition-colors"
            onClick={handleClick}
          >
            {bookmark.title}
          </h3>
          {bookmark.description && (
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">
              {bookmark.description}
            </p>
          )}
          <p className="text-slate-500 text-xs mt-1 truncate">
            {bookmark.url}
          </p>
        </div>
        
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <button
              onClick={handleClick}
              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
              title="打开链接"
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={() => onEdit(bookmark)}
              className="p-1 text-slate-400 hover:text-yellow-400 transition-colors"
              title="编辑"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(bookmark.id)}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              title="删除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddBookmarkModal({ isOpen, onClose, onAdd }: {
  isOpen: boolean
  onClose: () => void
  onAdd: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'default',
    icon: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.url) {
      onAdd(formData)
      setFormData({ title: '', url: '', description: '', category: 'default', icon: '' })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-white mb-4">添加书签</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-1">URL *</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm mb-1">分类</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
            >
              添加
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks')
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks')
      }
      const data = await response.json()
      setBookmarks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const addBookmark = async (bookmarkData: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookmarkData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to add bookmark')
      }
      
      fetchBookmarks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const deleteBookmark = async (id: string) => {
    if (!confirm('确定要删除这个书签吗？')) return
    
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete bookmark')
      }
      
      fetchBookmarks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const categories = ['all', ...Array.from(new Set(bookmarks.map(b => b.category)))]
  
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesCategory = selectedCategory === 'all' || bookmark.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-200">错误: {error}</p>
        <button 
          onClick={fetchBookmarks}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="搜索书签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? '全部分类' : category}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <Plus size={16} />
          <span>添加书签</span>
        </button>
      </div>

      {/* 书签列表 */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto text-slate-500 mb-4" size={48} />
          <p className="text-slate-400">
            {searchTerm || selectedCategory !== 'all' ? '没有找到匹配的书签' : '还没有添加任何书签'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={() => {}} // TODO: 实现编辑功能
              onDelete={deleteBookmark}
            />
          ))}
        </div>
      )}

      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addBookmark}
      />
    </div>
  )
}
