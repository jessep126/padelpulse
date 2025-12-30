
import React, { useEffect, useState } from 'react';
import { Mail, X, ArrowRight, Zap, BellRing } from 'lucide-react';

export interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  timestamp: number;
}

interface EmailSimulatorProps {
  emails: EmailMessage[];
  onClose: (id: string) => void;
}

const EmailSimulator: React.FC<EmailSimulatorProps> = ({ emails, onClose }) => {
  const [activeEmail, setActiveEmail] = useState<EmailMessage | null>(null);

  useEffect(() => {
    if (emails.length > 0 && !activeEmail) {
      setActiveEmail(emails[0]);
    }
  }, [emails, activeEmail]);

  if (emails.length === 0 && !activeEmail) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4 pointer-events-none">
      {emails.map((email) => (
        <div 
          key={email.id}
          className="bg-slate-900 border border-lime-400/30 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-top-12 duration-500 pointer-events-auto mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <p className="text-[10px] font-black text-lime-400 uppercase tracking-widest">New Email Received</p>
                <p className="text-white font-bold truncate max-w-[200px]">{email.subject}</p>
              </div>
            </div>
            <button onClick={() => onClose(email.id)} className="p-2 text-slate-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 max-h-48 overflow-y-auto mb-4">
            <p className="text-slate-400 text-xs whitespace-pre-wrap leading-relaxed">{email.body}</p>
          </div>

          <button 
            onClick={() => onClose(email.id)}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all border border-white/5"
          >
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  );
};

export default EmailSimulator;
