// src/pages/PracticeDetail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { PracticeHistoryDetail } from '../components/History/PracticeHistoryDetail';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { practiceHistoryAPI, type PracticeSessionDetailDTO } from '../api/modules/practiceHistory';
import { useApi } from '../hooks/useApi';

export const PracticeDetail: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const { data: sessionDetail, loading, error } = useApi(
    () => practiceHistoryAPI.getSessionDetail(parseInt(sessionId || '0')),
    [sessionId]
  );

  const handleExportSession = () => {
    // Implement session-specific export
    console.log('Export session data for session:', sessionId);
  };

  const handleShareSession = () => {
    // Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: sessionDetail?.lessonName || 'Practice Session',
        text: 'Check out this practice session summary',
        url: window.location.href
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !sessionDetail) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/history')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          </div>
          <ErrorMessage error={error || 'Practice session not found'} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with navigation and actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/history')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
            <div className="h-6 border-l border-gray-600" />
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-100">
                Practice Session Details
              </h1>
              <p className="text-gray-400 text-sm">
                Session #{sessionId} • {sessionDetail.lessonName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleShareSession}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportSession}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Practice session detail content */}
        <PracticeHistoryDetail session={sessionDetail} />
      </div>
    </div>
  );
};