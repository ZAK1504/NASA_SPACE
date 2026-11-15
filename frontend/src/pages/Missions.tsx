import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Target, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle,
  Award, Sparkles, HelpCircle, RefreshCw, RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export interface MissionProgressRecord {
  status: 'not_started' | 'in_progress' | 'completed';
  currentStageIndex: number;
  completedAt?: string;
}

type MissionProgressMap = Record<string, MissionProgressRecord>;

const STORAGE_KEY = 'spherex_mission_progress_v1';

const getStoredProgress = (): MissionProgressMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MissionProgressMap;
  } catch (e) {
    console.error('Failed to parse mission progress from localStorage:', e);
    return {};
  }
};

const saveStoredProgress = (progress: MissionProgressMap) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save mission progress to localStorage:', e);
  }
};

export const Missions: React.FC = () => {
  const { missionId } = useParams<{ missionId?: string }>();
  const navigate = useNavigate();

  const [missions, setMissions] = useState<any[]>([]);
  const [activeMission, setActiveMission] = useState<any | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [progressMap, setProgressMap] = useState<MissionProgressMap>(getStoredProgress);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Refresh progress map from storage on mount
  useEffect(() => {
    setProgressMap(getStoredProgress());
  }, []);

  // Update mission progress helper
  const updateProgress = useCallback((id: string, update: Partial<MissionProgressRecord>) => {
    setProgressMap((prev) => {
      const existing = prev[id] || { status: 'not_started', currentStageIndex: 0 };
      const updated: MissionProgressRecord = { ...existing, ...update };
      const nextMap = { ...prev, [id]: updated };
      saveStoredProgress(nextMap);
      return nextMap;
    });
  }, []);

  useEffect(() => {
    api.getMissions()
      .then((data) => {
        setMissions(data);
        if (missionId) {
          const m = data.find((item: any) => item.id === missionId);
          if (m) {
            setActiveMission(m);
            const saved = getStoredProgress()[m.id];
            if (saved && saved.status !== 'not_started') {
              setCurrentStageIndex(Math.min(saved.currentStageIndex, (m.stages?.length || 1) - 1));
            } else {
              setCurrentStageIndex(0);
              updateProgress(m.id, { status: 'in_progress', currentStageIndex: 0 });
            }
          }
        }
      })
      .catch((err) => console.error(err));
  }, [missionId, updateProgress]);

  const handleSelectMission = (m: any) => {
    setActiveMission(m);
    setSelectedOption(null);
    setQuizSubmitted(false);

    const saved = progressMap[m.id];
    let targetIndex = 0;
    if (saved && saved.status === 'in_progress') {
      targetIndex = Math.min(saved.currentStageIndex, (m.stages?.length || 1) - 1);
    } else if (saved && saved.status === 'completed') {
      targetIndex = (m.stages?.length || 1) - 1;
    } else {
      updateProgress(m.id, { status: 'in_progress', currentStageIndex: 0 });
    }

    setCurrentStageIndex(targetIndex);
    navigate(`/missions/${m.id}`);
  };

  const handleResetMission = (id: string) => {
    updateProgress(id, { status: 'not_started', currentStageIndex: 0, completedAt: undefined });
    setCurrentStageIndex(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
  };

  const handleQuizSubmit = (stage: any) => {
    if (selectedOption === null) return;
    const correct = selectedOption === stage.correct_option_index;
    setIsCorrect(correct);
    setQuizSubmitted(true);
  };

  // If viewing a specific mission
  if (activeMission) {
    const stages = activeMission.stages || [];
    const currentStage = stages[currentStageIndex];
    const isLastStage = currentStageIndex === stages.length - 1;
    const currentStatus = progressMap[activeMission.id]?.status || 'in_progress';

    const handleNextStage = () => {
      const nextIdx = Math.min(stages.length - 1, currentStageIndex + 1);
      setCurrentStageIndex(nextIdx);
      setQuizSubmitted(false);
      setSelectedOption(null);

      // Check if moving to completion stage
      const nextStage = stages[nextIdx];
      if (nextIdx === stages.length - 1 || nextStage?.type === 'completion') {
        updateProgress(activeMission.id, {
          status: 'completed',
          currentStageIndex: nextIdx,
          completedAt: new Date().toISOString(),
        });
      } else {
        updateProgress(activeMission.id, {
          status: 'in_progress',
          currentStageIndex: nextIdx,
        });
      }
    };

    const handlePrevStage = () => {
      const prevIdx = Math.max(0, currentStageIndex - 1);
      setCurrentStageIndex(prevIdx);
      setQuizSubmitted(false);
      setSelectedOption(null);
      updateProgress(activeMission.id, {
        currentStageIndex: prevIdx,
      });
    };

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Top actions bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => { setActiveMission(null); navigate('/missions'); }}
            className="flex items-center gap-1.5 text-xs text-[#9E9AA7] hover:text-[#F3EFE8] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Missions</span>
          </button>

          <button
            onClick={() => handleResetMission(activeMission.id)}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-[var(--accent)] cursor-pointer"
            title="Start this mission over from step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Mission</span>
          </button>
        </div>

        {/* Mission Header */}
        <div data-tour="mission-briefing" className="bg-[#111117] border border-[#262635] rounded-2xl p-6 mb-6 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#F4A272]">{activeMission.subtitle}</span>
              <span className="text-white/20">·</span>
              {currentStatus === 'completed' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-800/60">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  Completed
                </span>
              ) : currentStatus === 'in_progress' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                  In Progress
                </span>
              ) : (
                <span className="text-[11px] font-mono text-white/40">Not Started</span>
              )}
            </div>

            <Badge variant={activeMission.difficulty === 'beginner' ? 'green' : 'amber'}>
              {activeMission.difficulty}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold text-[#F3EFE8] mb-2">{activeMission.title}</h1>
          <p className="text-sm text-[#9E9AA7] leading-relaxed mb-4">{activeMission.description}</p>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#08080C] rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#F4A272] to-[#FF7B3D] transition-all duration-300"
                style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-[#9E9AA7]">
              Step {currentStageIndex + 1} of {stages.length}
            </span>
          </div>
        </div>

        {/* Stage Content Card */}
        {currentStage && (
          <div className="bg-[#111117] border border-[#262635] rounded-2xl p-6 mb-6 shadow-md animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-[#F4A272]" />
              <h2 className="text-lg font-semibold text-[#F3EFE8]">{currentStage.title}</h2>
            </div>

            {currentStage.type === 'quiz' ? (
              <div className="space-y-4">
                <p className="text-sm text-[#F3EFE8] font-medium leading-relaxed">
                  {currentStage.question}
                </p>

                <div className="space-y-2">
                  {currentStage.options.map((opt: string, idx: number) => {
                    const isSelected = selectedOption === idx;
                    let style = 'bg-[#08080C] border-[#262635] text-[#9E9AA7] hover:border-[#3c3c4d]';
                    if (quizSubmitted) {
                      if (idx === currentStage.correct_option_index) {
                        style = 'bg-green-900/20 border-green-700 text-green-300';
                      } else if (isSelected) {
                        style = 'bg-red-900/20 border-red-700 text-red-300';
                      }
                    } else if (isSelected) {
                      style = 'bg-[#1c1c28] border-[#F4A272] text-[#F4A272]';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full p-3 text-left text-xs rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${style}`}
                      >
                        <span className="font-mono font-bold mt-0.5">{String.fromCharCode(65 + idx)}.</span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {!quizSubmitted ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={selectedOption === null}
                    onClick={() => handleQuizSubmit(currentStage)}
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${isCorrect ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-amber-900/20 border-amber-800 text-amber-300'}`}>
                    <div className="flex items-center gap-2 font-semibold">
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                      <span>{isCorrect ? 'Correct scientific reasoning!' : 'Not quite — here is the science:'}</span>
                    </div>
                    <p className="text-[#9E9AA7]">{currentStage.explanation}</p>
                  </div>
                )}
              </div>
            ) : currentStage.type === 'completion' ? (
              <div className="text-center py-6 space-y-4">
                <Award className="w-16 h-16 text-[#F3B85B] mx-auto animate-pulse" />
                <h3 className="text-xl font-bold text-[#F3EFE8]">{currentStage.title}</h3>
                <p className="text-sm text-[#9E9AA7] max-w-md mx-auto leading-relaxed">
                  {currentStage.content}
                </p>
                <div className="pt-3 flex items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate(`/objects/${activeMission.target_object || 'barnards-star'}`)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Investigate Target in Detail
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm text-[#9E9AA7] leading-relaxed">
                <p>{currentStage.content}</p>
                {currentStage.type === 'comparison' && (
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/time-machine?object=${activeMission.target_object}`)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Open Live Time Machine for this Mission
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#262635]">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentStageIndex === 0}
                onClick={handlePrevStage}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Previous Step
              </Button>

              {!isLastStage && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextStage}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Next Step
                </Button>
              )}

              {isLastStage && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    updateProgress(activeMission.id, { status: 'completed', completedAt: new Date().toISOString() });
                    setActiveMission(null);
                    navigate('/missions');
                  }}
                  rightIcon={<CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                >
                  Complete & Return
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Missions List Overview
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F3EFE8] mb-2">Guided Astronomy Missions</h1>
        <p className="text-sm text-[#9E9AA7]">
          Hands-on discovery missions designed to teach astronomy through real space telescope observations
        </p>
      </div>

      <div data-tour="missions-catalog" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {missions.map((mission) => {
          const record = progressMap[mission.id];
          const isDone = record?.status === 'completed';
          const isInProgress = record?.status === 'in_progress';
          const totalStages = mission.stages?.length || 5;
          const currentStep = record ? record.currentStageIndex + 1 : 1;

          return (
            <div
              key={mission.id}
              className={`bg-[#111117] border rounded-2xl p-6 transition-all flex flex-col group shadow-sm ${
                isDone
                  ? 'border-green-800/40 hover:border-green-700/60 bg-gradient-to-b from-[#111117] to-green-950/10'
                  : isInProgress
                  ? 'border-[#F4A272]/40 hover:border-[#F4A272]/70'
                  : 'border-[#262635] hover:border-[#3c3c4d]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-[#9E9AA7]">{mission.subtitle}</span>
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-green-400 bg-green-950/50 px-2 py-0.5 rounded border border-green-800/60 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      Completed
                    </span>
                  ) : isInProgress ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/60 font-medium">
                      <RefreshCw className="w-3 h-3 text-amber-400" />
                      Step {currentStep}/{totalStages}
                    </span>
                  ) : (
                    <span className="text-[10.5px] font-mono text-white/40 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                      Not Started
                    </span>
                  )}
                  <Badge variant={mission.difficulty === 'beginner' ? 'green' : 'amber'}>
                    {mission.difficulty}
                  </Badge>
                </div>
              </div>

              <Target className={`w-6 h-6 mb-3 transition-colors ${isDone ? 'text-green-400' : 'text-[#F4A272]'}`} />
              <h3 className="text-lg font-semibold text-[#F3EFE8] mb-2 group-hover:text-[#F4A272] transition-colors">
                {mission.title}
              </h3>
              <p className="text-sm text-[#9E9AA7] leading-relaxed mb-4 flex-1">{mission.description}</p>

              <div className="text-xs text-[#9E9AA7] mb-4 font-mono">
                ~{mission.estimated_minutes || 15} minutes · {totalStages} scientific steps
              </div>

              <div className="flex flex-wrap gap-1 mb-5">
                {mission.teaches && mission.teaches.map((t: string) => <Badge key={t} variant="muted">{t}</Badge>)}
              </div>

              <div className="mt-auto flex items-center gap-2">
                <Button
                  variant={isDone ? 'ghost' : isInProgress ? 'primary' : 'secondary'}
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="flex-1 justify-center"
                  onClick={() => handleSelectMission(mission)}
                >
                  {isDone ? 'Review Mission' : isInProgress ? 'Continue Mission' : 'Launch Mission'}
                </Button>

                {(isDone || isInProgress) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetMission(mission.id);
                    }}
                    className="p-2 text-white/30 hover:text-white/80 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    title="Reset progress to Not Started"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
