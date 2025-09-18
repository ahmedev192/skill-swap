import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Video, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Session, SessionStatus } from '../../types';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const SessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [teachingSessions, setTeachingSessions] = useState<Session[]>([]);
  const [learningSessions, setLearningSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'teaching' | 'learning'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const [allSessions, teaching, learning] = await Promise.all([
        apiClient.getMySessions(),
        apiClient.getTeachingSessions(),
        apiClient.getLearningSessions()
      ]);
      setSessions(allSessions);
      setTeachingSessions(teaching);
      setLearningSessions(learning);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSession = async (sessionId: number, confirmed: boolean) => {
    try {
      await apiClient.confirmSession(sessionId, confirmed);
      toast.success(confirmed ? 'Session confirmed!' : 'Session declined');
      loadSessions();
    } catch (error) {
      console.error('Failed to confirm session:', error);
      toast.error('Failed to update session');
    }
  };

  const handleCancelSession = async (sessionId: number) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await apiClient.cancelSession(sessionId, reason);
      toast.success('Session cancelled');
      loadSessions();
    } catch (error) {
      console.error('Failed to cancel session:', error);
      toast.error('Failed to cancel session');
    }
  };

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case SessionStatus.Confirmed:
        return 'bg-green-100 text-green-800';
      case SessionStatus.InProgress:
        return 'bg-blue-100 text-blue-800';
      case SessionStatus.Completed:
        return 'bg-gray-100 text-gray-800';
      case SessionStatus.Cancelled:
        return 'bg-red-100 text-red-800';
      case SessionStatus.Disputed:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.Pending:
        return 'Pending';
      case SessionStatus.Confirmed:
        return 'Confirmed';
      case SessionStatus.InProgress:
        return 'In Progress';
      case SessionStatus.Completed:
        return 'Completed';
      case SessionStatus.Cancelled:
        return 'Cancelled';
      case SessionStatus.Disputed:
        return 'Disputed';
      default:
        return 'Unknown';
    }
  };

  const getDateLabel = (date: string) => {
    const sessionDate = new Date(date);
    if (isToday(sessionDate)) return 'Today';
    if (isTomorrow(sessionDate)) return 'Tomorrow';
    if (isPast(sessionDate)) return 'Past';
    return format(sessionDate, 'MMM dd, yyyy');
  };

  const getCurrentSessions = () => {
    switch (activeTab) {
      case 'teaching':
        return teachingSessions;
      case 'learning':
        return learningSessions;
      default:
        return sessions;
    }
  };

  const tabs = [
    { id: 'all' as const, label: 'All Sessions', count: sessions.length },
    { id: 'teaching' as const, label: 'Teaching', count: teachingSessions.length },
    { id: 'learning' as const, label: 'Learning', count: learningSessions.length },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">My Sessions</h1>
          <p className="text-blue-100">
            Manage your teaching and learning sessions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Sessions List */}
        {getCurrentSessions().length > 0 ? (
          <div className="space-y-6">
            {getCurrentSessions().map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.userSkill.skill.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                          {getStatusText(session.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>
                            {session.teacherId === user?.id ? 'Teaching' : 'Learning from'}{' '}
                            {session.teacherId === user?.id 
                              ? `${session.student.firstName} ${session.student.lastName}`
                              : `${session.teacher.firstName} ${session.teacher.lastName}`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{getDateLabel(session.scheduledStart)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(new Date(session.scheduledStart), 'h:mm a')} - {format(new Date(session.scheduledEnd), 'h:mm a')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {session.isOnline ? (
                          <div className="flex items-center space-x-1">
                            <Video className="w-4 h-4" />
                            <span>Online Session</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{session.location || 'Location TBD'}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{session.creditsCost} credits</span>
                        </div>
                      </div>

                      {session.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {session.status === SessionStatus.Pending && (
                        <>
                          <button
                            onClick={() => handleConfirmSession(session.id, true)}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleConfirmSession(session.id, false)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}
                      
                      {(session.status === SessionStatus.Confirmed || session.status === SessionStatus.Pending) && (
                        <button
                          onClick={() => handleCancelSession(session.id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      )}

                      {session.meetingLink && session.status === SessionStatus.Confirmed && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Meeting</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                      
                      {session.status === SessionStatus.Completed && (
                        <button className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                          <span>Leave Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'teaching' 
                ? "You haven't scheduled any teaching sessions yet"
                : activeTab === 'learning'
                ? "You haven't booked any learning sessions yet"
                : "You don't have any sessions scheduled"
              }
            </p>
            <a
              href="/discover"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Discover Skills
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;