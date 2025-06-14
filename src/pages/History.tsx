// src/pages/History.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  BarChart3, 
  MessageSquare,
  Filter,
  Download,
  Search,
  ChevronRight,
  Trophy,
  Target
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatCard } from '../components/StatCard';
import { practiceHistoryAPI, type PracticeHistoryEntry } from '../api/modules/practiceHistory';
import { useApi } from '../hooks/useApi';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [timeRange, setTimeRange] = useState('all'); // all, week, month, quarter
  
  // Note: getHistory() currently returns empty array due to missing backend endpoints
  // This will work once we have GET /api/practice/sessions?completed=true or similar
  const { data: practiceHistory, loading, error } = useApi(() => practiceHistoryAPI.getHistory());

  // Filter and sort practice history
  const filteredHistory = useMemo(() => {
    if (!practiceHistory) return [];
    
    let filtered = [...practiceHistory];
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.lessonName.toLowerCase().includes(searchLower) ||
        entry.teamName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Team filter
    if (selectedTeam) {
      filtered = filtered.filter(entry => entry.teamName === selectedTeam);
    }
    
    // Time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (timeRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(entry => 
        new Date(entry.sessionDate) >= cutoffDate
      );
    }
    
    // Sort by date (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );
  }, [practiceHistory, searchTerm, selectedTeam, timeRange]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!filteredHistory || filteredHistory.length === 0) {
      return {
        totalSessions: 0,
        totalHours: 0,
        totalAttendees: 0,
        avgEvaluations: 0,
        avgAttendance: 0
      };
    }
    
    const totalSessions = filteredHistory.length;
    const totalMinutes = filteredHistory.reduce((sum, entry) => sum + entry.duration, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    const totalAttendees = filteredHistory.reduce((sum, entry) => sum + entry.attendeeCount, 0);
    const totalEvaluations = filteredHistory.reduce((sum, entry) => sum + entry.evaluationCount, 0);
    const avgEvaluations = Math.round(totalEvaluations / totalSessions * 10) / 10;
    const avgAttendance = Math.round(totalAttendees / totalSessions * 10) / 10;
    
    return {
      totalSessions,
      totalHours,
      totalAttendees,
      avgEvaluations,
      avgAttendance
    };
  }, [filteredHistory]);

  // Get unique team names for filter dropdown
  const teamNames = useMemo(() => {
    if (!practiceHistory) return [];
    const teams = new Set(practiceHistory.map(entry => entry.teamName).filter(Boolean));
    return Array.from(teams).sort();
  }, [practiceHistory]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleViewDetails = (sessionId: number) => {
    navigate(`/history/${sessionId}`);
  };

  const handleExportData = () => {
    // Implement CSV export functionality
    console.log('Export practice history data');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-100">Practice History</h1>
            <p className="text-gray-400 mt-2">Review past practice sessions and coaching insights</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={BarChart3}
            label="Total Sessions"
            value={stats.totalSessions}
            color="bg-blue-500 text-blue-500"
          />
          <StatCard
            icon={Clock}
            label="Hours Coached"
            value={`${stats.totalHours}h`}
            color="bg-green-500 text-green-500"
          />
          <StatCard
            icon={Users}
            label="Avg Attendance"
            value={stats.avgAttendance}
            color="bg-purple-500 text-purple-500"
          />
          <StatCard
            icon={Target}
            label="Avg Evaluations"
            value={stats.avgEvaluations}
            color="bg-yellow-500 text-yellow-500"
          />
          <StatCard
            icon={Trophy}
            label="Total Attendees"
            value={stats.totalAttendees}
            color="bg-red-500 text-red-500"
          />
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search Sessions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by lesson or team name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-500"
              >
                <option value="">All Teams</option>
                {teamNames.map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTeam('');
                  setTimeRange('all');
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Practice Sessions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-400">Failed to load practice history: {error}</p>
            </Card>
          ) : filteredHistory.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">
                Practice History Coming Soon
              </h3>
              <p className="text-gray-400 mb-4">
                The practice history listing requires additional backend endpoints to be implemented.
              </p>
              <div className="text-left bg-gray-700 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Backend endpoints needed:</p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• <code>GET /api/practice/sessions?completed=true</code></li>
                  <li>• <code>GET /api/lessons/{'{lessonId}'}/sessions</code></li>
                  <li>• Or modify existing endpoints to include session data</li>
                </ul>
              </div>
              <div className="mt-6">
                <Button onClick={() => navigate('/dashboard')} variant="secondary">
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          ) : (
            filteredHistory.map((entry) => (
              <Card 
                key={entry.id} 
                hoverable 
                className="p-6 cursor-pointer transition-all duration-200 hover:border-yellow-500/30"
                onClick={() => handleViewDetails(entry.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-100 mb-1">
                          {entry.lessonName}
                        </h3>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                          {entry.teamName && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{entry.teamName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(entry.sessionDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{entry.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>

                    {/* Session Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <Target className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-100">{entry.exerciseCount}</div>
                          <div className="text-xs text-gray-400">Exercises</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-100">{entry.evaluationCount}</div>
                          <div className="text-xs text-gray-400">Evaluations</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-100">{entry.attendeeCount}</div>
                          <div className="text-xs text-gray-400">Attendees</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-100">{entry.noteCount}</div>
                          <div className="text-xs text-gray-400">Notes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Show count of results */}
        {filteredHistory.length > 0 && (
          <div className="text-center mt-6 text-gray-400 text-sm">
            Showing {filteredHistory.length} of {practiceHistory?.length || 0} practice sessions
          </div>
        )}
      </div>
    </div>
  );
};