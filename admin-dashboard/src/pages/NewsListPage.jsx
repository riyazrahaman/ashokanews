import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { newsAPI } from '../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['All', 'Announcements', 'Events', 'Achievements', 'Placements', 'Circulars', 'Sports', 'Cultural', 'Academic'];

const CATEGORY_COLORS = {
  Announcements: 'bg-amber-500/10 text-amber-400',
  Events: 'bg-blue-500/10 text-blue-400',
  Achievements: 'bg-emerald-500/10 text-emerald-400',
  Placements: 'bg-purple-500/10 text-purple-400',
  Circulars: 'bg-red-500/10 text-red-400',
  Sports: 'bg-orange-500/10 text-orange-400',
  Cultural: 'bg-pink-500/10 text-pink-400',
  Academic: 'bg-cyan-500/10 text-cyan-400',
};

export default function NewsListPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (category !== 'All') params.category = category;
      const res = await newsAPI.getAll(params);
      setNews(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [page, category]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      await newsAPI.delete(id);
      toast.success('Article deleted');
      fetchNews();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await newsAPI.togglePublish(id);
      toast.success(res.data.message);
      fetchNews();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = news.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-white">News Management</h1>
          <p className="text-slate-400 text-sm mt-1">{pagination.total || 0} total articles</p>
        </div>
        <Link to="/news/new" className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm hover:from-amber-300 transition-all shadow-lg shadow-amber-500/20">
          <Plus size={16} />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                category === cat ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No articles found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-500 px-6 py-4">Article</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-4 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-4 hidden lg:table-cell">Date</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-4 hidden lg:table-cell">Views</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-4">Status</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((article, i) => (
                  <tr key={article._id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {article.imageUrl && (
                          <img src={article.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium line-clamp-1">{article.title}</p>
                          <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{article.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[article.category] || 'bg-slate-700 text-slate-300'}`}>
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-sm hidden lg:table-cell">
                      {format(new Date(article.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-sm hidden lg:table-cell">
                      {article.views?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggle(article._id)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                          article.published ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        {article.published ? '● Published' : '○ Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/news/edit/${article._id}`} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all">
                          <Pencil size={15} />
                        </Link>
                        <button onClick={() => handleDelete(article._id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">Page {pagination.page} of {pagination.pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
