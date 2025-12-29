
import React, { useState, useEffect } from 'react';
import { MapPin, Users, Trophy, ExternalLink, Navigation, Search, Loader2, X, MessageSquare, Sword, Award, TrendingUp, Calendar, Filter, CheckCircle2, Clock } from 'lucide-react';
import { padelAI } from '../services/geminiService';
import { PadelLocation, Tournament, Player } from '../types';

const MOCK_PLAYERS: Player[] = [
  { 
    id: '1', 
    name: 'Marco Silva', 
    level: 'Intermediate', 
    distance: '1.2 km', 
    avatar: 'https://picsum.photos/seed/p1/200',
    bio: 'Competitive player looking for early morning matches. Aggressive at the net.',
    preferredSide: 'Left',
    matchesPlayed: 142,
    winRate: '62%'
  },
  { 
    id: '2', 
    name: 'Sophie Chen', 
    level: 'Advanced', 
    distance: '3.5 km', 
    avatar: 'https://picsum.photos/seed/p2/200',
    bio: 'Former tennis player turned padel enthusiast. Strategic and consistent.',
    preferredSide: 'Right',
    matchesPlayed: 89,
    winRate: '75%'
  },
  { 
    id: '3', 
    name: 'Luca Rossi', 
    level: 'Beginner', 
    distance: '0.8 km', 
    avatar: 'https://picsum.photos/seed/p3/200',
    bio: 'Just started last month! Looking to learn and improve with friendly games.',
    preferredSide: 'Both',
    matchesPlayed: 12,
    winRate: '40%'
  },
];

const DiscoveryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courts' | 'players' | 'tournaments'>('courts');
  const [loading, setLoading] = useState(false);
  const [courts, setCourts] = useState<PadelLocation[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [challengeStep, setChallengeStep] = useState<'profile' | 'schedule' | 'success'>('profile');
  const [filterLevel, setFilterLevel] = useState<string>('All');

  const fetchData = async () => {
    setLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const [nearbyCourts, nearbyTournaments] = await Promise.all([
            padelAI.findNearbyCourts(latitude, longitude),
            padelAI.findUpcomingTournaments(`${latitude}, ${longitude}`)
          ]);

          setCourts(nearbyCourts);
          setTournaments(nearbyTournaments);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLocationError("Could not access location. Using default data.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChallengeClick = () => {
    setChallengeStep('schedule');
  };

  const confirmChallenge = () => {
    setChallengeStep('success');
    setTimeout(() => {
      setSelectedPlayer(null);
      setChallengeStep('profile');
    }, 2500);
  };

  const filteredPlayers = MOCK_PLAYERS.filter(p => filterLevel === 'All' || p.level === filterLevel);

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-900 rounded-[1.5rem] border border-slate-800">
        {[
          { id: 'courts', label: 'Courts', icon: MapPin },
          { id: 'players', label: 'Players', icon: Users },
          { id: 'tournaments', label: 'Events', icon: Trophy },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-sm ${
              activeTab === tab.id ? 'bg-lime-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'players' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-slate-900 p-2 rounded-xl flex-shrink-0">
            <Filter className="w-4 h-4 text-slate-500" />
          </div>
          {['All', 'Beginner', 'Intermediate', 'Advanced', 'Pro'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border ${
                filterLevel === lvl ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-slate-950 text-slate-500 border-white/5'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-lime-400" />
          <p className="animate-pulse font-bold tracking-tight">Finding the best matches for you...</p>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {activeTab === 'courts' && (
            <div className="grid gap-4">
              {courts.length > 0 ? courts.map((court, i) => (
                <div key={i} className="group bg-slate-900/50 border border-white/5 p-5 rounded-[2rem] hover:border-lime-500/50 transition-all flex justify-between items-center shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-lime-400 ring-1 ring-white/5 shadow-inner">
                      <Navigation className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-white group-hover:text-lime-400 transition-colors leading-tight">{court.name}</h4>
                      <p className="text-slate-500 text-xs mt-1 font-medium">{court.address}</p>
                    </div>
                  </div>
                  <a href={court.uri} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-800 hover:bg-lime-400 hover:text-slate-950 rounded-2xl text-slate-400 transition-all active:scale-90">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-[2rem]">
                  No local courts found in your immediate area.
                </div>
              )}
            </div>
          )}

          {activeTab === 'players' && (
            <div className="grid gap-4">
              {filteredPlayers.map((player) => (
                <div 
                  key={player.id} 
                  onClick={() => { setSelectedPlayer(player); setChallengeStep('profile'); }}
                  className="bg-slate-900 border border-white/5 p-5 rounded-[2.5rem] flex items-center justify-between cursor-pointer hover:border-lime-500/30 transition-all shadow-xl active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                       <img src={player.avatar} className="w-16 h-16 rounded-full border-2 border-slate-800 shadow-lg" />
                       <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-lime-400 rounded-full border-4 border-slate-900 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                       </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-white text-lg truncate">{player.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] bg-lime-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">{player.level}</span>
                        <span className="text-slate-500 text-xs font-bold">{player.distance}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 bg-slate-950/50 p-2.5 rounded-2xl border border-white/5">
                     <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Recent Form</span>
                     <div className="flex gap-1">
                        {['W','L','W'].map((f, i) => (
                          <div key={i} className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-black ${f === 'W' ? 'bg-lime-400 text-slate-950' : 'bg-red-500/20 text-red-500'}`}>{f}</div>
                        ))}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div className="grid gap-4">
              {tournaments.length > 0 ? tournaments.map((t, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Trophy className="w-24 h-24 text-lime-400" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-black text-xl text-white mb-2">{t.title}</h4>
                    <div className="flex flex-col gap-2 text-xs text-slate-400 mb-6">
                      <span className="flex items-center gap-2 font-bold"><MapPin className="w-4 h-4 text-lime-400" /> {t.location}</span>
                      <span className="flex items-center gap-2 font-bold"><Calendar className="w-4 h-4 text-lime-400" /> {t.date}</span>
                    </div>
                    <a href={t.link} target="_blank" className="inline-flex items-center justify-center w-full md:w-auto gap-3 bg-white text-slate-950 font-black px-8 py-4 rounded-2xl text-sm hover:bg-lime-400 transition-all active:scale-95 shadow-lg">
                      REGISTER INTEREST <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-[2rem]">
                  No upcoming local tournaments found.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Player Profile & Challenge Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            {challengeStep === 'profile' && (
              <>
                <div className="relative h-40 bg-gradient-to-br from-lime-400 to-emerald-600">
                  <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all active:scale-90">
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <img src={selectedPlayer.avatar} className="w-28 h-28 rounded-full border-8 border-slate-900 shadow-2xl" />
                  </div>
                </div>
                
                <div className="px-8 pb-10 mt-14 text-center">
                  <h3 className="text-3xl font-black text-white">{selectedPlayer.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <Award className="w-4 h-4 text-lime-400" />
                    <p className="text-lime-400 font-black text-sm uppercase tracking-widest">{selectedPlayer.level} PRO</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 shadow-inner">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Position</p>
                      <p className="text-sm font-black text-white">{selectedPlayer.preferredSide}</p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 shadow-inner">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Wins</p>
                      <p className="text-sm font-black text-white">{Math.floor(selectedPlayer.matchesPlayed! * 0.6)}</p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 shadow-inner">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Win %</p>
                      <p className="text-sm font-black text-lime-400">{selectedPlayer.winRate}</p>
                    </div>
                  </div>

                  <div className="text-left mb-10 p-5 bg-slate-950/30 rounded-3xl border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-slate-500" />
                      <p className="text-[10px] text-slate-500 font-black uppercase">Scouting Report</p>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed italic">"{selectedPlayer.bio}"</p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={handleChallengeClick}
                      className="flex-1 bg-lime-400 text-slate-950 font-black py-5 rounded-[1.5rem] hover:bg-lime-300 transition-all shadow-xl shadow-lime-500/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Sword className="w-5 h-5" /> CHALLENGE
                    </button>
                    <button className="p-5 bg-slate-800 text-white rounded-[1.5rem] hover:bg-slate-700 transition-all active:scale-95">
                      <MessageSquare className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {challengeStep === 'schedule' && (
              <div className="p-10 text-center animate-in slide-in-from-right duration-300">
                <div className="w-20 h-20 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-lime-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Schedule Match</h3>
                <p className="text-slate-500 text-sm mb-8">Suggest a time to play with {selectedPlayer.name.split(' ')[0]}</p>
                
                <div className="space-y-3 mb-10">
                  {['Today, 18:00', 'Tomorrow, 09:00', 'Sat, 11:30'].map((time) => (
                    <button key={time} className="w-full py-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold hover:border-lime-400/50 transition-all active:scale-95">
                      {time}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmChallenge}
                    className="w-full bg-lime-400 text-slate-950 font-black py-5 rounded-3xl shadow-xl shadow-lime-500/10 active:scale-95"
                  >
                    SEND CHALLENGE
                  </button>
                  <button 
                    onClick={() => setChallengeStep('profile')}
                    className="w-full py-5 text-slate-500 font-black uppercase text-xs"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}

            {challengeStep === 'success' && (
              <div className="p-10 text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-lime-500/30">
                  <CheckCircle2 className="w-12 h-12 text-slate-950" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Challenge Sent!</h3>
                <p className="text-slate-400 text-sm">We'll notify you once {selectedPlayer.name.split(' ')[0]} accepts your invite.</p>
                <div className="mt-10 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                   <div className="h-full bg-lime-400 animate-loading-bar" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes loading-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 2.5s linear forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DiscoveryView;
