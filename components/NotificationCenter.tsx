
import React from 'react';
import { AppNotification } from '../types';
import { ChevronLeft, Bell, Check, X, ShieldCheck, Trophy, Calendar, Zap, MessageCircleQuestion } from 'lucide-react';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onAccept: (notif: AppNotification) => void;
  onDecline: (id: string) => void;
  onBack: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onAccept, onDecline, onBack }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Activity</h2>
          <p className="text-slate-500 text-sm font-medium">Invites and updates</p>
        </div>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-700">
             <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-6">
                <Bell className="w-10 h-10" />
             </div>
             <p className="font-black uppercase tracking-[0.2em] text-xs">All caught up!</p>
             <p className="text-slate-800 text-sm mt-2 italic">No pending actions</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  {notif.type === 'league_invite' ? <ShieldCheck className="w-24 h-24 text-lime-400" /> : <Zap className="w-24 h-24 text-blue-400" />}
               </div>
               
               <div className="flex items-start gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg ${notif.type === 'league_invite' ? 'bg-lime-400 shadow-lime-400/20' : 'bg-blue-500 shadow-blue-500/20'}`}>
                     {notif.type === 'league_invite' ? <Trophy className="w-7 h-7 text-slate-950" /> : <MessageCircleQuestion className="w-7 h-7 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl mb-1">
                      {notif.type === 'league_invite' ? 'League Invite' : 'Confirm Result'}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                       {notif.type === 'league_invite' ? (
                          <>
                            <span className="text-white font-bold">{notif.fromName}</span> invited you to join the <span className="text-lime-400 font-bold">"{notif.leagueName}"</span> league.
                          </>
                       ) : (
                          <>
                            <span className="text-white font-bold">{notif.fromName}</span> submitted a match result. Does the score match your records?
                          </>
                       )}
                    </p>
                  </div>
               </div>

               <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5 pt-6">
                  <div className="flex items-center gap-2">
                     <Calendar className="w-3 h-3" /> {new Date(notif.timestamp).toLocaleDateString()}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => onAccept(notif)}
                    className={`font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl ${notif.type === 'league_invite' ? 'bg-lime-400 text-slate-950 shadow-lime-500/10' : 'bg-blue-500 text-white shadow-blue-500/10'}`}
                  >
                    <Check className="w-5 h-5" /> {notif.type === 'league_invite' ? 'ACCEPT' : 'CONFIRM'}
                  </button>
                  <button 
                    onClick={() => onDecline(notif.id)}
                    className="bg-slate-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500/20 hover:text-red-500 transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" /> {notif.type === 'league_invite' ? 'IGNORE' : 'DISPUTE'}
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
