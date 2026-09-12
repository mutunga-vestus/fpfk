import { useMemo, useState } from 'react';
import { Play, Search, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';

function getYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;
    }
    return null;
  } catch {
    return null;
  }
}

function toEmbedUrl(url) {
  const id = getYouTubeId(url);
  if (id) return `https://www.youtube.com/embed/${id}`;
  return url || '';
}

function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function isLiveSermon(sermon) {
  if (sermon.isLive) return true;
  return typeof sermon.duration === 'string' && sermon.duration.trim().toLowerCase().startsWith('live');
}

export default function Sermons() {
  const { content, loading } = useContent();
  const [query, setQuery] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('All');
  const [playingSermon, setPlayingSermon] = useState(null);

  const items = content?.sermons?.items || [];

  const sortedItems = useMemo(() => {
    return items
      .map((item, idx) => ({ item, idx }))
      .sort((a, b) => {
        const dateA = Date.parse(a.item.date);
        const dateB = Date.parse(b.item.date);
        const validA = !isNaN(dateA);
        const validB = !isNaN(dateB);
        if (validA && validB) return dateB - dateA;
        if (validA) return -1;
        if (validB) return 1;
        return b.idx - a.idx;
      })
      .map(({ item }) => item);
  }, [items]);

  const seriesOptions = useMemo(() => {
    const unique = Array.from(new Set(sortedItems.map((s) => s.series).filter(Boolean)));
    return ['All', ...unique];
  }, [sortedItems]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedItems.filter((s) => {
      const matchesSeries = seriesFilter === 'All' || s.series === seriesFilter;
      if (!matchesSeries) return false;
      if (!q) return true;
      return (
        s.title?.toLowerCase().includes(q) ||
        s.speaker?.toLowerCase().includes(q) ||
        s.series?.toLowerCase().includes(q)
      );
    });
  }, [sortedItems, query, seriesFilter]);

  if (loading) return null;
  const { title } = content.sermons;

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold text-center mb-10">{title}</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or speaker..."
            className="w-full pl-12 pr-6 py-3.5 border border-slate-200 rounded-full focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={seriesFilter}
          onChange={(e) => setSeriesFilter(e.target.value)}
          className="px-6 py-3.5 border border-slate-200 rounded-full focus:outline-none focus:border-indigo-500 bg-white"
        >
          {seriesOptions.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All Series' : s}
            </option>
          ))}
        </select>
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center text-slate-500">No sermons match your search.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((sermon, i) => {
          const thumbnail = getYouTubeThumbnail(sermon.videoUrl);
          const live = isLiveSermon(sermon);
          return (
            <div
              key={i}
              className="border border-slate-200 rounded-3xl overflow-hidden hover:border-indigo-200 transition-all hover:shadow-xl flex flex-col"
            >
              <button
                type="button"
                onClick={() => sermon.videoUrl && setPlayingSermon(sermon)}
                disabled={!sermon.videoUrl}
                className="relative w-full h-48 bg-slate-900 flex items-center justify-center group disabled:cursor-not-allowed overflow-hidden"
              >
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt={sermon.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <Play className="relative w-14 h-14 text-white group-hover:scale-110 transition disabled:opacity-50" />

                {live ? (
                  <span className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                ) : (
                  sermon.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                      {sermon.duration}
                    </span>
                  )
                )}
              </button>
              <div className="p-8 flex flex-col flex-1">
                <div className="uppercase text-indigo-600 text-sm font-medium mb-2">{sermon.series}</div>
                <h3 className="text-2l font-semibold mb-3">{sermon.title}</h3>
                <p className="text-slate-600 mb-6">
                  {sermon.speaker} • {sermon.date}
                  {!live && sermon.duration ? ` • ${sermon.duration}` : ''}
                </p>
                <button
                  onClick={() => sermon.videoUrl && setPlayingSermon(sermon)}
                  disabled={!sermon.videoUrl}
                  className="mt-auto bg-indigo-600 text-white px-8 py-3.5 rounded-full hover:bg-indigo-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed self-start"
                >
                  {!sermon.videoUrl ? 'Coming Soon' : live ? 'Watch Live' : 'Watch Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {playingSermon && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setPlayingSermon(null)}
        >
          <div
            className="bg-black rounded-2xl overflow-hidden w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-5 py-3 bg-slate-900">
              <span className="text-white font-medium truncate">{playingSermon.title}</span>
              <button onClick={() => setPlayingSermon(null)} className="text-white hover:text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={toEmbedUrl(playingSermon.videoUrl)}
                title={playingSermon.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}