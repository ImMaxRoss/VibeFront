// src/components/History/PracticeHistoryDetail.tsx
import React from 'react';
import { Calendar, Clock, Users, FileText, Star, BarChart3, MessageSquare } from 'lucide-react';
import { Card } from '../ui/Card';
import { PracticeSessionDetailDTO } from '../../api/modules/practiceHistory';

interface PracticeHistoryDetailProps {
  session: PracticeSessionDetailDTO;
}

export const PracticeHistoryDetail: React.FC<PracticeHistoryDetailProps> = ({ session }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getDurationInMinutes = (): number => {
    if (!session.endTime) return 0;
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const getAverageScore = (evaluation: any): number => {
    if (!evaluation.evaluationScores || evaluation.evaluationScores.length === 0) return 0;
    const scores = evaluation.evaluationScores.map((score: any) => score.score);
    return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 3.5) return 'text-green-400';
    if (score >= 2.5) return 'text-yellow-400';
    if (score >= 1.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getCriteriaLabel = (key: string): string => {
    const labels: Record<string, string> = {
      'yes_and': 'Yes And',
      'agreement': 'Agreement', 
      'who_what_where': 'Who/What/Where',
      'physicality': 'Physicality',
      'listening': 'Listening',
      'commitment': 'Commitment',
      'avoidance_of_denial': 'Avoidance of Denial',
      'efficiency': 'Efficiency'
    };
    return labels[key] || key;
  };

  const duration = getDurationInMinutes();
  const overallStats = {
    totalDuration: duration,
    exercisesCompleted: session.currentExerciseIndex,
    evaluationsCompleted: session.evaluations.length,
    attendanceCount: session.attendees.length
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">{session.lessonName}</h2>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(session.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{session.attendees.length} attendees</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Practice Session</div>
            <div className="text-lg font-bold text-gray-100">#{session.id}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-700 rounded-lg">
            <div className="text-lg font-bold text-blue-400">{overallStats.exercisesCompleted}</div>
            <div className="text-xs text-gray-400">Exercises</div>
          </div>
          <div className="text-center p-3 bg-gray-700 rounded-lg">
            <div className="text-lg font-bold text-green-400">{overallStats.evaluationsCompleted}</div>
            <div className="text-xs text-gray-400">Evaluations</div>
          </div>
          <div className="text-center p-3 bg-gray-700 rounded-lg">
            <div className="text-lg font-bold text-purple-400">{session.notes.length}</div>
            <div className="text-xs text-gray-400">Notes</div>
          </div>
          <div className="text-center p-3 bg-gray-700 rounded-lg">
            <div className="text-lg font-bold text-yellow-400">{overallStats.attendanceCount}</div>
            <div className="text-xs text-gray-400">Present</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Records */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-100">Attendance</h3>
          </div>
          <div className="space-y-3">
            {session.attendees.map((attendee) => (
              <div key={attendee.performerId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-gray-100 font-medium">
                    {attendee.performerFirstName} {attendee.performerLastName}
                  </span>
                </div>
                <span className="text-green-400 text-sm font-medium">Present</span>
              </div>
            ))}
            {session.attendees.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                No attendance records found
              </div>
            )}
          </div>
        </Card>

        {/* Practice Notes */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-100">Practice Notes</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {session.notes.map((note) => (
              <div key={note.id} className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    note.noteType === 'exercise'
                      ? 'bg-blue-500 bg-opacity-20 text-blue-300'
                      : 'bg-purple-500 bg-opacity-20 text-purple-300'
                  }`}>
                    {note.noteType}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <p className="text-gray-200 text-sm">{note.content}</p>
              </div>
            ))}
            {session.notes.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                No notes recorded for this session
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Scene Evaluations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-bold text-gray-100">Scene Evaluations</h3>
          <span className="text-gray-400 text-sm">({session.evaluations.length} evaluations)</span>
        </div>
        
        {session.evaluations.length > 0 ? (
          <div className="space-y-6">
            {session.evaluations.map((evaluation, index) => {
              const avgScore = getAverageScore(evaluation);
              const performerNames = session.attendees
                .filter(attendee => {
                  // Check if this attendee was evaluated in this evaluation
                  return evaluation.evaluatedPerformers?.some((p: any) => p.id === attendee.performerId);
                })
                .map(attendee => `${attendee.performerFirstName} ${attendee.performerLastName}`)
                .join(', ');

              return (
                <div key={evaluation.id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-100 mb-1">
                        Scene {index + 1}
                      </h4>
                      <p className="text-gray-400 text-sm">{performerNames || 'No performers specified'}</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full mt-2 bg-blue-500 bg-opacity-20 text-blue-300">
                        Evaluation
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(avgScore)}`}>
                        {avgScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">Avg Score</div>
                    </div>
                  </div>

                  {/* Criteria Scores */}
                  {evaluation.evaluationScores && evaluation.evaluationScores.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {evaluation.evaluationScores.map((scoreEntry: any, scoreIndex: number) => (
                        <div key={scoreIndex} className="text-center p-2 bg-gray-800 rounded">
                          <div className={`text-sm font-bold ${getScoreColor(scoreEntry.score)}`}>
                            {scoreEntry.score}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {getCriteriaLabel(scoreEntry.criterionName)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Evaluation Notes */}
                  {evaluation.notes && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Coach Notes</span>
                      </div>
                      <p className="text-gray-200 text-sm">{evaluation.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No scene evaluations recorded for this session</p>
          </div>
        )}
      </Card>
    </div>
  );
};