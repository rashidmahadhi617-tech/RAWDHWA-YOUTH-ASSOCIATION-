import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Plus, Edit, Trash2, Tag, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementsProps {
  announcements: Announcement[];
  isAdmin: boolean;
  onAddAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  onEditAnnouncement: (id: string, updatedFields: Partial<Announcement>) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export default function Announcements({
  announcements,
  isAdmin,
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
}: AnnouncementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('zote');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'mkutano' | 'habari' | 'historia' | 'sisi'>('habari');
  const [image, setImage] = useState('');

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('habari');
    setImage('');
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Tafadhali jaza kichwa cha habari na maelezo.');
      return;
    }

    if (editingId) {
      onEditAnnouncement(editingId, { title, content, category, image: image || undefined });
    } else {
      onAddAnnouncement({ title, content, category, image: image || undefined });
    }
    resetForm();
  };

  const handleStartEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setCategory(ann.category);
    setImage(ann.image || '');
    setShowAddForm(true);
  };

  // Filter announcements based on selection
  const filteredAnnouncements = announcements.filter((ann) => {
    if (selectedCategory === 'zote') return true;
    return ann.category === selectedCategory;
  });

  const categories = [
    { key: 'zote', label: 'Zote (All)' },
    { key: 'mkutano', label: 'Taarifa za Mkutano' },
    { key: 'habari', label: 'Taarifa Zengine / Habari' },
    { key: 'sisi', label: 'About Us (Kuhusu Sisi)' },
    { key: 'historia', label: 'Historia Yetu' },
  ];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'mkutano':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'habari':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'sisi':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      case 'historia':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'mkutano':
        return 'Mkutano (Meeting)';
      case 'habari':
        return 'Habari na Taarifa';
      case 'sisi':
        return 'Kuhusu Sisi (About Us)';
      case 'historia':
        return 'Historia (History)';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-6" id="announcements-section">
      {/* Top Banner and Quick actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-800">Habari, Historia & Mikutano</h2>
          <p className="text-xs text-slate-500 mt-1">
            Ukurasa mkuu wa taarifa za Rawdhwa Youth Association. Pata habari za mikutano, malengo yetu na maendeleo.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }}
            className="self-start md:self-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 transition shadow-md shadow-emerald-700/10 cursor-pointer"
            id="add-announcement-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Ongeza Taarifa Mpya</span>
          </button>
        )}
      </div>

      {/* ADMIN POST/EDIT EXPANDABLE FORM */}
      <AnimatePresence>
        {showAddForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            id="announcement-form"
          >
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/45 p-6 rounded-2xl border border-emerald-100/80 shadow-inner space-y-4">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center space-x-1.5">
                <BookOpen className="w-4.5 h-4.5 text-emerald-700" />
                <span>{editingId ? 'Edit / Hariri Taarifa' : 'Andika na Upachike Taarifa Mpya'}</span>
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kichwa cha Taarifa (Title)</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Mfano: Taarifa kwa Mkutano wa Dharura..."
                    className="w-full text-slate-800 text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Aina ya Taarifa (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-slate-800 text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  >
                    <option value="mkutano">Taarifa za Mkutano</option>
                    <option value="habari">Taarifa Zengine / Habari</option>
                    <option value="sisi">Kuhusu Sisi (About Us)</option>
                    <option value="historia">Historia (History)</option>
                  </select>
                </div>

                <div className="md:col-span-12">
                  <label className="block text-xs font-medium text-slate-700 mb-1">URL ya Picha ya Taarifa (Image URL - Hiari)</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Weka link ya picha ya kupendezesha (mfano: https://...)"
                    className="w-full text-slate-800 text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div className="md:col-span-12">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Maelezo Kamili (Content)</label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Andika taarifa yote hapa kwa kina..."
                    className="w-full text-slate-800 text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white"
                  />
                </div>

                <div className="md:col-span-12 flex space-x-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl"
                  >
                    Futa / Ghairi
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow cursor-pointer"
                  >
                    {editingId ? 'Hifadhi Mabadiliko' : 'Chapisha Sasa'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER BUTTONS ROW */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2 border-b border-slate-100" id="announcements-filter">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              selectedCategory === cat.key
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-700/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* LIST OF ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 gap-6" id="announcements-list">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 flex flex-col items-center justify-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <p className="text-sm">Hakuna taarifa yoyote iliyopatikana kwenye kipengele hiki.</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={ann.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition group/card"
            >
              {/* Optional Custom/Generated Image Column */}
              <div className="md:w-1/4 h-48 md:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0">
                <img
                  src={ann.image || 'https://images.unsplash.com/photo-1544535830-9dff9e02ddfc?auto=format&fit=crop&w=400&q=80'}
                  alt={ann.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition duration-300 group-hover/card:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold border shadow-sm uppercase tracking-wider ${getCategoryColor(ann.category)}`}>
                    {getCategoryLabel(ann.category)}
                  </span>
                </div>
              </div>

              {/* Text content details column */}
              <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-slate-400 text-xs mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(ann.createdAt).toLocaleDateString('sw-TZ', { dateStyle: 'medium' })}</span>
                  </div>
                  <h3 className="text-lg font-sans font-bold text-slate-800 leading-snug group-hover/card:text-emerald-800 transition">
                    {ann.title}
                  </h3>
                  <p className="text-slate-600 text-sm mt-3 leading-relaxed whitespace-pre-line font-serif">
                    {ann.content}
                  </p>
                </div>

                {/* Admin-only edit controls */}
                {isAdmin && (
                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleStartEdit(ann)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Hariri</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Je, umehakikisha unataka kufuta taarifa hii?')) {
                          onDeleteAnnouncement(ann.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Futa</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
