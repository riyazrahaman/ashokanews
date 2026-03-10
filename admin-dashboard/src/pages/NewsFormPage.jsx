import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { newsAPI } from '../api';
import toast from 'react-hot-toast';
import { Upload, X, Save, Eye, Calendar, Star } from 'lucide-react';

const CATEGORIES = ['Announcements', 'Events', 'Achievements', 'Placements', 'Circulars', 'Sports', 'Cultural', 'Academic'];

export default function NewsFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: '', shortDescription: '', content: '', category: 'Announcements',
    tags: '', author: "Ashoka Women's College", publishNow: false,
    scheduledAt: '', featured: false
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      newsAPI.getById(id)
        .then(res => {
          const a = res.data.data;
          setForm({
            title: a.title, shortDescription: a.shortDescription, content: a.content,
            category: a.category, tags: a.tags?.join(', ') || '',
            author: a.author, publishNow: false, scheduledAt: '', featured: a.featured
          });
          if (a.imageUrl) setImagePreview(a.imageUrl);
        })
        .catch(() => toast.error('Failed to load article'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries({ ...form, publishNow: publishNow.toString() }).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) data.append(k, v.toString());
      });
      if (image) data.append('image', image);

      if (isEdit) {
        await newsAPI.update(id, data);
        toast.success('Article updated!');
      } else {
        await newsAPI.create(data);
        toast.success(publishNow ? 'Article published!' : 'Draft saved!');
      }
      navigate('/news');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-white">{isEdit ? 'Edit Article' : 'New Article'}</h1>
        <p className="text-slate-400 text-sm mt-1">{isEdit ? 'Update the article details below' : 'Create a new article for the college news feed'}</p>
      </div>

      <form onSubmit={e => handleSubmit(e, false)} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-white font-semibold text-sm">Article Details</h2>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter a compelling title..."
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Short Description *</label>
                <textarea
                  value={form.shortDescription}
                  onChange={e => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="A brief summary shown in the news card..."
                  required
                  rows={3}
                  maxLength={500}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50 resize-none"
                />
                <p className="text-xs text-slate-600 text-right mt-1">{form.shortDescription.length}/500</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Full Content *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the full article content here..."
                  required
                  rows={12}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50 resize-none"
                />
              </div>
            </div>

            {/* Image upload */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold text-sm mb-4">Cover Image</h2>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 rounded-xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-400/50 transition-colors"
                >
                  <Upload size={24} className="text-slate-500" />
                  <p className="text-slate-500 text-sm">Click to upload image</p>
                  <p className="text-slate-600 text-xs">JPG, PNG, WebP — max 5MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish options */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">Publish</h2>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={e => handleSubmit(e, true)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm hover:from-amber-300 transition-all disabled:opacity-50"
                >
                  <Eye size={15} />
                  {isEdit ? 'Update & Publish' : 'Publish Now'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 font-medium px-4 py-2.5 rounded-xl text-sm hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  <Save size={15} />
                  Save as Draft
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                  <Calendar size={12} /> Schedule (optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            {/* Category */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4">Category *</h2>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      form.category === cat ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-white font-semibold text-sm">Meta</h2>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="exam, important, 2024"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400/50"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-amber-400"
                />
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-amber-400" />
                  <span className="text-slate-300 text-xs">Feature this article</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
