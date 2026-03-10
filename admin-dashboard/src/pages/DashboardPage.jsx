import { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Newspaper, Eye, TrendingUp, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-white font-playfair">{value?.toLocaleString()}</p>
    <p className="text-slate-400 text-sm mt-1">{label}</p>
    {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
  </div>
);

const CATEGORY_COLORS = {
  Announcements: '#f59e0b', Events: '#3b82f6', Achievements: '#10b981',
  Placements: '#8b5cf6', Circulars: '#ef4444', Sports: '#f97316',
  Cultural: '#ec4899', Academic: '#06b6d4'
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.dashboard()
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const chartData = data?.categoryStats?.map(c => ({
    name: c._id,
    articles: c.count,
    views: c.views,
    fill: CATEGORY_COLORS[c._id] || '#94a3b8'
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back! Here's what's happening at Ashoka.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Newspaper} label="Total Articles" value={data?.stats?.totalNews} color="bg-amber-500" />
        <StatCard icon={TrendingUp} label="Published" value={data?.stats?.publishedNews} color="bg-emerald-500" />
        <StatCard icon={FileText} label="Drafts" value={data?.stats?.draftNews} color="bg-blue-500" />
        <StatCard icon={Eye} label="Total Views" value={data?.stats?.totalViews} color="bg-purple-500" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Chart */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Articles by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="articles" radius={[6, 6, 0, 0]} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent news */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Recent Articles</h2>
            <Link to="/news" className="text-amber-400 text-xs hover:text-amber-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentNews?.map(article => (
              <div key={article._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-tight line-clamp-2">{article.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{article.category}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{article.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
