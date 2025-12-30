
import React, { useState, useEffect } from 'react';
import { MapPin, Users, Trophy, ExternalLink, Navigation, Search, Loader2, X, MessageSquare, Sword, Award, TrendingUp, Calendar, Filter, CheckCircle2, Clock, Send, ChevronLeft, Share2, Star, UserPlus, ShieldCheck } from 'lucide-react';
import { padelAI } from '../services/geminiService';
import { PadelLocation, Tournament, UserProfile } from '../types';

interface DiscoveryViewProps {
  allUsers: UserProfile[];
  onChallenge: (opponent: UserProfile) => void;
  // Added onAiFailure to props to handle API key selection resets
  onAiFailure?: () => void;
}

const DiscoveryView: React.FC<DiscoveryViewProps> = ({ allUsers, onChallenge, onAiFailure }) => {
  const [activeTab, setActiveTab] = useState<'courts' | 'players' | 'tournaments'>('players');
  const [loading, setLoading] = useState(false);
  const [courts, setCourts] = useState<PadelLocation[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<UserProfile | null>(null);
  const [challengeStep, setChallengeStep] = useState<'profile' | 'schedule' | 'chat' | 'success'>('profile');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [shareData, setShareData] = useState<{ text: string; url: string } | null>(null);

  const fetchData = async () => {
    if (activeTab === 'players') return;
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
          // Handle AI service failure due to API key selection state
          if (err instanceof Error && err.message.includes("Requested entity was not found")) {
            onAiFailure?.();
          }
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
  }, [activeTab]);

  const confirmChallenge = async () => {
    if (!selectedPlayer) return;
    const userName = localStorage.getItem('padel_user_name') || 'A Player';
    try {
      const comms = await padelAI.composeEmail('challenge', { 
        name: selectedPlayer.name, 
        sender: userName 
      });
      setShareData({ 
        text: comms.share_text, 
        url: window.location.origin + "/challenge/" + Math.random().toString(36).substr(2, 9) 
      });
      setChallengeStep('success');
    } catch (e) {
      // Handle AI service failure due to API key selection state
      if (e instanceof Error && e.message.includes("Requested entity was not found")) {
        onAiFailure?.();
      }
      setChallengeStep('success');
    }
  };

  const handleExternalShare = async () => {
    if (!shareData) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PadelPulse AI Challenge',
          text: shareData.text,
          url: shareData.url
        });
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n\nJoin here: ${shareData.url}`);
      alert("Challenge details copied to clipboard! Paste it into WhatsApp or Email.");
    }
  };

  const filteredPlayers = allUsers.filter(p => {
    const matchesLevel = filterLevel === 'All' || p.level === filterLevel;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-900 rounded-[1.5rem] border border-slate-800">
        {[
          { id: 'players', label: 'Players', icon: Users },
          { id: 'courts', label: 'Courts', icon: MapPin },
          { id: 'tournaments', label: 'Events', icon: Trophy },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-black text-xs ${
              activeTab === tab.id ? 'bg-lime-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'players' && (
        <div className="space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-lime-400 transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by player name or email..."
              className="w-full bg-slate-900 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-white text-sm outline-none focus:border-lime-400 transition-all shadow-xl"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="bg-slate-900 p-2.5 rounded-xl flex-shrink-0 border border-white/5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
            </div>
            {['All', 'Beginner', 'Intermediate', 'Advanced', 'Pro'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all border ${
                  filterLevel === lvl ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-slate-950 text-slate-500 border-white/5'
                }`}
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            {filteredPlayers.length > 0 ? filteredPlayers.map((player) => (
              <div 
                key={player.id} 
                className="bg-slate-900 border border-white/5 p-5 rounded-[2.5rem] flex items-center justify-between cursor-pointer hover:border-lime-500/30 transition-all shadow-xl active:scale-[0.98] group"
                onClick={() => { setSelectedPlayer(player); setChallengeStep('profile'); }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative">
                     <img src={player.avatar} className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-800 shadow-lg group-hover:scale-105 transition-transform" />
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-lime-400 rounded-full border-4 border-slate-900 flex items-center justify-center">
                        <div className="w-1 h-1 bg-slate-950 rounded-full" />
                     </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-white text-base truncate group-hover:text-lime-400 transition-colors">{player.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] bg-lime-400/10 text-lime-400 font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border border-lime-400/20">{player.level}</span>
                      <span className="text-slate-500 text-[10px] font-bold truncate opacity-60 italic">{player.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onChallenge(player);
                    }}
                    className="bg-lime-400 p-4 rounded-2xl text-slate-950 shadow-lg shadow-lime-400/10 hover:scale-110 active:scale-90 transition-all"
                    title="Quick Challenge"
                  >
                    <Sword className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-24 text-slate-700 bg-slate-950 border-2 border-dashed border-slate-900 rounded-[3rem] px-8">
                <Users className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="font-bold text-sm italic">No players found matching your search. Try inviting some friends!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-lime-400" />
          <p className="animate-pulse font-black text-xs tracking-widest uppercase">Fetching Global Intelligence...</p>
        </div>
      )}

      {!loading && activeTab !== 'players' && (
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

          {activeTab === 'tournaments' && (
            <div className="grid gap-4">
              {tournaments.length > 0 ? tournaments.map((t, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
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
                    <img src={selectedPlayer.avatar} className="w-28 h-28 rounded-3xl border-8 border-slate-900 shadow-2xl" />
                  </div>
                </div>
                
                <div className="px-8 pb-10 mt-14 text-center">
                  <h3 className="text-3xl font-black text-white italic tracking-tighter">{selectedPlayer.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <Award className="w-4 h-4 text-lime-400" />
                    <p className="text-lime-400 font-black text-sm uppercase tracking-widest">{selectedPlayer.level} GRADE</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 shadow-inner">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Status</p>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                        <p className="text-sm font-black text-white">Active</p>
                      </div>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-3xl border border-white/5 shadow-inner">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Verification</p>
                      <div className="flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <p className="text-sm font-black text-white italic">Verified</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-left mb-10 p-5 bg-slate-950/30 rounded-3xl border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-slate-500" />
                      <p className="text-[10px] text-slate-500 font-black uppercase">Recent Activity</p>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed italic">Joined PadelPulse to dominate the local rankings and master the Bajada.</p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => onChallenge(selectedPlayer)}
                      className="flex-1 bg-lime-400 text-slate-950 font-black py-5 rounded-[1.5rem] hover:bg-lime-300 transition-all shadow-xl shadow-lime-500/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Sword className="w-5 h-5" /> START CHALLENGE
                    </button>
                    <button 
                      onClick={() => setChallengeStep('chat')}
                      className="p-5 bg-slate-800 text-white rounded-[1.5rem] hover:bg-slate-700 transition-all active:scale-95"
                    >
                      <MessageSquare className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {challengeStep === 'chat' && (
              <div className="flex flex-col h-[500px] animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-white/10 flex items-center gap-4">
                  <button onClick={() => setChallengeStep('profile')} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <img src={selectedPlayer.avatar} className="w-10 h-10 rounded-full border border-white/10" />
                  <div>
                    <h4 className="text-white font-black text-sm">{selectedPlayer.name}</h4>
                    <p className="text-[9px] text-lime-400 font-bold uppercase tracking-widest">Online Now</p>
                  </div>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-950/50">
                   <div className="flex justify-start">
                      <div className="bg-slate-800 text-white px-4 py-3 rounded-2xl rounded-tl-none text-xs max-w-[80%] shadow-lg">
                        Hey! I saw your profile. Up for a match this weekend?
                      </div>
                   </div>
                   <div className="flex justify-end">
                      <div className="bg-lime-400 text-slate-950 px-4 py-3 rounded-2xl rounded-tr-none text-xs font-bold max-w-[80%] shadow-lg">
                         Sure! Which courts do you prefer?
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-slate-900 border-t border-white/10 flex gap-3">
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-white text-xs outline-none focus:border-lime-400 transition-all"
                  />
                  <button 
                    onClick={() => setChatMessage('')}
                    className="p-3 bg-lime-400 text-slate-950 rounded-2xl shadow-lg active:scale-95 transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {challengeStep === 'success' && (
              <div className="p-10 text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-lime-500/30">
                  <CheckCircle2 className="w-12 h-12 text-slate-950" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 italic">CHALLENGE READY!</h3>
                <p className="text-slate-400 text-sm mb-8">Internal invitation sent to {selectedPlayer.name.split(' ')[0]}. Notify them on other apps to confirm.</p>
                
                <div className="space-y-4">
                  <button 
                    onClick={handleExternalShare}
                    className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95"
                  >
                    <Share2 className="w-5 h-5" /> SHARE TO WHATSAPP/EMAIL
                  </button>
                  <button 
                    onClick={() => { setSelectedPlayer(null); setChallengeStep('profile'); }}
                    className="w-full py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
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
