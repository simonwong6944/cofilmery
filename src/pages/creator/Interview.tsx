import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Volume2, FileText, CheckCircle, Clock, Wand2 } from 'lucide-react';
import { CreatorSidebar } from '@/components/layout/CreatorSidebar';
import { Logo } from '@/components/shared/Logo';
import { CreditIndicator } from '@/components/shared/CreditIndicator';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

const QUESTIONS_ZH = [
  { id: 1, text: '您是如何與這門手藝結緣的？', asked: true },
  { id: 2, text: '在這幾十年中，最令您印象深刻的事是什麼？', asked: true },
  { id: 3, text: '您認為這門手藝對香港有何重要性？', asked: false },
  { id: 4, text: '年輕人學習這門手藝有什麼挑戰？', asked: false },
  { id: 5, text: '如果要傳承給下一代，您最想傳遞什麼？', asked: false },
];

export default function Interview() {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const [isRecording, setIsRecording] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(2);
  const [questions, setQuestions] = useState(QUESTIONS_ZH);
  const [elapsed] = useState('12:34');

  const markAsked = (id: number) => {
    setQuestions(q => q.map(q2 => q2.id === id ? { ...q2, asked: true } : q2));
  };

  return (
    <div className="flex h-screen bg-bg-soft overflow-hidden">
      <CreatorSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-line px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Logo size="sm" withWordmark />
            <span className="text-amber-600 font-bold">{tr.creator.interview.title}</span>
            <span className="text-muted text-sm">· 陳伯的街市歲月</span>
          </div>
          <div className="flex items-center gap-3">
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-medium animate-pulse">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {elapsed} {tr.creator.interview.recordingLabel}
              </div>
            )}
            <CreditIndicator cost={5} label={tr.creator.interview.aiTranscribe} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-5">
                {/* Video Monitor */}
                <div className="col-span-2">
                  <div className="card-base overflow-hidden mb-4">
                    <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                      {hasVideo ? (
                        <div className="text-center text-white/20">
                          <Video className="w-16 h-16 mx-auto mb-2" />
                          <p className="text-sm">{tr.creator.interview.cameraOn}</p>
                        </div>
                      ) : (
                        <div className="text-center text-white/20">
                          <VideoOff className="w-16 h-16 mx-auto mb-2" />
                          <p className="text-sm">{tr.creator.interview.cameraOff}</p>
                        </div>
                      )}
                      {isRecording && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                          REC
                        </div>
                      )}
                    </div>
                    {/* Controls */}
                    <div className="p-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => setHasVideo(!hasVideo)}
                        className={`p-3 rounded-full transition-colors ${hasVideo ? 'bg-gray-100 text-ink hover:bg-gray-200' : 'bg-red-100 text-red-500'}`}
                      >
                        {hasVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`p-4 rounded-full text-white font-bold transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                      >
                        {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>
                      <button className="p-3 rounded-full bg-gray-100 text-ink hover:bg-gray-200 transition-colors">
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 border border-line px-4 py-2.5 rounded-lg text-sm text-muted hover:border-primary hover:text-primary transition-colors">
                      <FileText className="w-4 h-4" />
                      {tr.creator.interview.viewQuestions}
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors">
                      <Wand2 className="w-4 h-4" />
                      {tr.creator.interview.startTranscribe}
                    </button>
                  </div>
                </div>

                {/* Question List */}
                <div>
                  <div className="card-base p-4">
                    <h3 className="font-bold text-ink mb-3 text-sm">{tr.creator.interview.questionList}</h3>
                    <div className="space-y-3">
                      {questions.map((q, i) => (
                        <div
                          key={q.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            currentQuestion === i
                              ? 'border-amber-400 bg-amber-50'
                              : q.asked
                                ? 'border-green-200 bg-green-50'
                                : 'border-line hover:border-amber-300'
                          }`}
                          onClick={() => setCurrentQuestion(i)}
                        >
                          <div className="flex items-start gap-2">
                            {q.asked ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-muted mt-0.5 flex-shrink-0" />
                            )}
                            <p className="text-xs text-ink leading-relaxed">{q.text}</p>
                          </div>
                          {currentQuestion === i && !q.asked && (
                            <button
                              onClick={e => { e.stopPropagation(); markAsked(q.id); }}
                              className="mt-2 text-xs text-amber-600 hover:underline w-full text-right"
                            >
                              {tr.creator.interview.markAsked}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-line text-xs text-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {tr.creator.interview.progressLabel} {questions.filter(q => q.asked).length} {tr.creator.interview.progressSep} {questions.length} {tr.creator.interview.progressSuffix}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
