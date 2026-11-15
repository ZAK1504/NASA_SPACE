import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Target, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle,
  Award, Sparkles, HelpCircle, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const Missions: React.FC = () => {
  const { missionId } = useParams<{ missionId?: string }>();
  const navigate = useNavigate();

  const [missions, setMissions] = useState<any[]>([]);
  const [activeMission, setActiveMission] = useState<any | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  
  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  useEffect(() => {
    api.getMissions()
      .then((data) => {
        setMissions(data);
        if (missionId) {
          const m = data.find((item: any) => item.id === missionId);
          if (m) {
            setActiveMission(m);
            setCurrentStageIndex(0);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [missionId]);

  const handleSelectMission = (m: any) => {
    setActiveMission(m);
    setCurrentStageIndex(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
    navigate(`/missions/${m.id}`);
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

    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => { setActiveMission(null); navigate('/missions'); }}
          className="flex items-center gap-1.5 text-xs text-[#9E9AA7] hover:text-[#F3EFE8] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Missions</span>
        </button>

        {/* Mission Header */}
        <div className="bg-[#111117] border border-[#262635] rounded p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-[#F4A272]">{activeMission.subtitle}</span>
            <Badge variant={activeMission.difficulty === 'beginner' ? 'green' : 'amber'}>
              {activeMission.difficulty}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-[#F3EFE8] mb-2">{activeMission.title}</h1>
          <p className="text-sm text-[#9E9AA7] leading-relaxed mb-4">{activeMission.description}</p>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-[#08080C] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F4A272] transition-all duration-300"
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
          <div className="bg-[#111117] border border-[#262635] rounded p-6 mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
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
                        className={`w-full p-3 text-left text-xs rounded border transition-all cursor-pointer flex items-start gap-2.5 ${style}`}
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
                  <div className={`p-4 rounded border text-xs leading-relaxed space-y-2 ${isCorrect ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-amber-900/20 border-amber-800 text-amber-300'}`}>
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
                <h3 className="text-xl font-bold text-[#F3EFE8]">Mission Completed!</h3>
                <p className="text-sm text-[#9E9AA7] max-w-md mx-auto leading-relaxed">
                  {currentStage.content}
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/objects/barnards-star')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Explore Barnard's Star in Detail
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
                onClick={() => {
                  setCurrentStageIndex((p) => Math.max(0, p - 1));
                  setQuizSubmitted(false);
                  setSelectedOption(null);
                }}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>

              {!isLastStage && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setCurrentStageIndex((p) => Math.min(stages.length - 1, p + 1));
                    setQuizSubmitted(false);
                    setSelectedOption(null);
                  }}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Next Step
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
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F3EFE8] mb-2">Guided Astronomy Missions</h1>
        <p className="text-sm text-[#9E9AA7]">
          Hands-on discovery missions designed to teach astronomy through real space telescope observations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="bg-[#111117] border border-[#262635] rounded p-6 hover:border-[#3c3c4d] transition-colors flex flex-col group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[#9E9AA7]">{mission.subtitle}</span>
              <Badge variant={mission.difficulty === 'beginner' ? 'green' : 'amber'}>
                {mission.difficulty}
              </Badge>
            </div>

            <Target className="w-6 h-6 text-[#F4A272] mb-3" />
            <h3 className="text-lg font-semibold text-[#F3EFE8] mb-2 group-hover:text-[#F4A272] transition-colors">
              {mission.title}
            </h3>
            <p className="text-sm text-[#9E9AA7] leading-relaxed mb-4 flex-1">{mission.description}</p>

            <div className="text-xs text-[#9E9AA7] mb-4 font-mono">~{mission.estimated_minutes || 15} minutes</div>

            <div className="flex flex-wrap gap-1 mb-5">
              {mission.teaches && mission.teaches.map((t: string) => <Badge key={t} variant="muted">{t}</Badge>)}
            </div>

            <Button
              variant="secondary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="w-full justify-center mt-auto"
              onClick={() => handleSelectMission(mission)}
            >
              Launch Mission
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
