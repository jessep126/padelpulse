
import React from 'react';
import { Play, Share2, Download, Star, History } from 'lucide-react';

const HIGHLIGHTS = [
  { id: 1, title: 'Amazing Backhand Smash', duration: '0:12', thumb: 'https://picsum.photos/seed/h1/400/225', type: 'Point Winning' },
  { id: 2, title: 'Unreal Wall Recovery', duration: '0:08', thumb: 'https://picsum.photos/seed/h2/400/225', type: 'Defensive Save' },
  { id: 3, title: 'Tactical Lob Winner', duration: '0:15', thumb: 'https://picsum.photos/seed/h3/400/225', type: 'Strategy' },
  { id: 4, title: 'Fast Volley Exchange', duration: '0:10', thumb: 'https://picsum.photos/seed/h4/400/225', type: 'Rally' },
];

const HighlightsGallery: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Match Highlights</h2>
          <p className="text-slate-400 text-sm">AI processed your last match to pick these gems.</p>
        </div>
        <button className="flex items-center gap-2 text-lime-400 font-bold text-sm bg-lime-400/10 px-4 py-2 rounded-xl">
          <History className="w-4 h-4" /> View Full Match
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {HIGHLIGHTS.map((h) => (
          <div key={h.id} className="group relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-lime-500/50 transition-all">
            <div className="aspect-video relative">
              <img src={h.thumb} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <button className="absolute inset-0 m-auto w-12 h-12 bg-lime-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase">{h.duration}</span>
                <span className="bg-lime-400/20 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-lime-400 uppercase tracking-tighter">{h.type}</span>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center">
              <h4 className="font-bold text-white truncate">{h.title}</h4>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
                <button className="p-2 text-slate-400 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl text-center space-y-4 mt-8">
        <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Star className="w-8 h-8 text-yellow-400 fill-current" />
        </div>
        <h3 className="text-xl font-bold">Generate Highlight Reel?</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          We can stitch all high-intensity moments into a 1-minute cinematic reel with music and stats overlay.
        </p>
        <button className="bg-lime-400 text-slate-950 font-black px-8 py-3 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-lime-500/20">
          Create Pro Reel
        </button>
      </div>
    </div>
  );
};

export default HighlightsGallery;
