import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Plus,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sessionsService, Session } from '../../services/sessionsService';
import { reviewsService, Review } from '../../services/reviewsService';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import BookSessionModal from './BookSessionModal';
import RescheduleModal from '../sessions/RescheduleModal';
import ReviewModal from '../reviews/ReviewModal';

const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'requests'>('upcoming');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] = useState<Session | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState<Session | null>(null);

  // Session action handlers
  const handleJoinSession = (sessionId: number) => {
    // Open the meeting link in a new tab
    const session = sessions.find(s => s.id === sessionId);
    if (session?.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else {
      alert('No meeting link available for this session');
    }
  };

  const handleReschedule = (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSessionForReschedule(session);
      setShowRescheduleModal(true);
    }
  };

  const handleCancelSession = async (sessionId: number) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason || reason.trim() === '') {
      alert('Cancellation reason is required');
      return;
    }

    if (confirm('Are you sure you want to cancel this session?')) {
      try {
        await sessionsService.cancelSession(sessionId, { reason: reason.trim() });
        setSessions(sessions.filter(s => s.id !== sessionId));
        alert('Session cancelled successfully');
      } catch (error) {
        const errorResult = handleError(error, 'cancelSession');
        setError(errorResult.userNotification.message);
      }
    }
  };

  const handleAcceptRequest = async (sessionId: number) => {
    try {
      await sessionsService.acceptSession(sessionId);
      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, status: 2 } : s // 2 = Confirmed
      ));
      alert('Session request accepted');
    } catch (error) {
      const errorResult = handleError(error, 'acceptSession');
      setError(errorResult.userNotification.message);
    }
  };

  const handleDeclineRequest = async (sessionId: number) => {
    if (confirm('Are you sure you want to decline this session request?')) {
      try {
        await sessionsService.declineSession(sessionId);
        setSessions(sessions.filter(s => s.id !== sessionId));
        alert('Session request declined');
      } catch (error) {
        const errorResult = handleError(error, 'declineSession');
        setError(errorResult.userNotification.message);
      }
    }
  };

  const handleRateAndReview = (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSessionForReview(session);
      setShowReviewModal(true);
    }
  };

  const handleCompleteSession = async (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    console.log('Attempting to complete session:', session);
    console.log('Session status:', session?.status);
    console.log('Session status type:', typeof session?.status);
    
    if (confirm('Are you sure you want to mark this session as completed?')) {
      try {
        await sessionsService.completeSession(sessionId);
        console.log('Session completed successfully');
        
        // Reload sessions instead of manual update
        const userSessions = await sessionsService.getMySessions();
        setSessions(userSessions);
        
        // Show review prompt after completion
        if (session && confirm('Session completed! Would you like to leave a review now?')) {
          setSelectedSessionForReview(session);
          setShowReviewModal(true);
        }
      } catch (error) {
        console.error('Error completing session:', error);
        const errorResult = handleError(error, 'completeSession');
        setError(errorResult.userNotification.message);
      }
    }
  };

  const handleSessionBooked = async () => {
    // Reload sessions after booking
    try {
      const userSessions = await sessionsService.getMySessions();
      console.log('Reloaded sessions after booking:', userSessions);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error reloading sessions:', error);
    }
  };

  const handleSessionRescheduled = async () => {
    // Reload sessions after rescheduling
    try {
      const userSessions = await sessionsService.getMySessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Error reloading sessions:', error);
    }
  };

  const handleReviewSubmitted = async () => {
    // Reload both sessions and reviews after review submission
    try {
      const [userSessions, userReviews] = await Promise.all([
        sessionsService.getMySessions(),
        reviewsService.getMyReviews()
      ]);
      setSessions(userSessions);
      setReviews(userReviews);
    } catch (error) {
      console.error('Error reloading data:', error);
    }
  };

  // Load sessions and reviews data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load both sessions and reviews in parallel
        const [userSessions, userReviews] = await Promise.all([
          sessionsService.getMySessions(),
          reviewsService.getMyReviews()
        ]);
        
        console.log('Loaded sessions:', userSessions);
        console.log('Loaded reviews:', userReviews);
        console.log('Session details:', userSessions.map(s => ({
          id: s.id,
          status: s.status,
          statusType: typeof s.status,
          teacherId: s.teacherId,
          studentId: s.studentId,
          scheduledStart: s.scheduledStart
        })));
        console.log('Pending sessions:', userSessions.filter(s => s.status === 1));
        
        setSessions(userSessions);
        setReviews(userReviews);
      } catch (err) {
        const errorResult = handleError(err, 'loadData');
        setError(errorResult.userNotification.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Separate sessions by status (1=Pending, 2=Confirmed, 3=InProgress, 4=Completed, 5=Cancelled, 6=Disputed)
  const upcomingSessions = sessions.filter(session => {
    const isConfirmedOrInProgress = session.status === 2 || session.status === 3;
    const isFuture = new Date(session.scheduledStart) > new Date();
    console.log(`Session ${session.id}: status=${session.status}, isConfirmedOrInProgress=${isConfirmedOrInProgress}, isFuture=${isFuture}`);
    return isConfirmedOrInProgress && isFuture;
  });
  
  const pastSessions = sessions.filter(session => {
    const isCompletedOrCancelled = session.status === 4 || session.status === 5;
    const isPast = new Date(session.scheduledStart) <= new Date();
    console.log(`Session ${session.id}: status=${session.status}, isCompletedOrCancelled=${isCompletedOrCancelled}, isPast=${isPast}`);
    return isCompletedOrCancelled || isPast;
  });
  
  const pendingSessions = sessions.filter(session => {
    const isPending = session.status === 1;
    console.log(`Session ${session.id}: status=${session.status}, isPending=${isPending}`);
    return isPending;
  });

  // Debug logging
  console.log('All sessions:', sessions);
  console.log('Upcoming sessions:', upcomingSessions);
  console.log('Past sessions:', pastSessions);
  console.log('Pending sessions (requests):', pendingSessions);

  const bookings = {
    upcoming: upcomingSessions,
    past: pastSessions,
    requests: pendingSessions
  };


  const getStatusIcon = (status: number) => {
    switch (status) {
      case 2: // Confirmed
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 1: // Pending
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 4: // Completed
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 5: // Cancelled
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 3: // InProgress
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 6: // Disputed
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return 'Pending';
      case 2:
        return 'Confirmed';
      case 3:
        return 'In Progress';
      case 4:
        return 'Completed';
      case 5:
        return 'Cancelled';
      case 6:
        return 'Disputed';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2024-01-01T${time}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to check if user has already reviewed a session
  const hasUserReviewedSession = (sessionId: number): Review | null => {
    return reviews.find(review => review.sessionId === sessionId) || null;
  };

  const renderBookingCard = (session: Session, showActions: boolean = true) => {
    const title = session.userSkill?.skill?.name || 'Unknown Skill';
    const status = session.status;
    const startTime = new Date(session.scheduledStart);
    const endTime = new Date(session.scheduledEnd);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // duration in minutes
    const location = session.location;
    const meetingUrl = session.meetingLink;
    const notes = session.notes;
    const creditsPerHour = session.userSkill?.creditsPerHour || 0;
    const skillCategory = session.userSkill?.skill?.category || 'Uncategorized';
    const isTeacher = user?.id === session.teacherId;
    const isStudent = user?.id === session.studentId;
    const otherUser = isTeacher ? session.student : session.teacher;
    const existingReview = hasUserReviewedSession(session.id);
    
    return (
    <div key={session.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <div className="flex items-center space-x-4 mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
              {skillCategory}
            </span>
            <div className="flex items-center space-x-1">
              {getStatusIcon(status)}
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {getStatusText(status)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{startTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{startTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })} ({duration} min)</span>
            </div>
            <div className="flex items-center space-x-2">
              {meetingUrl ? (
                <Video className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>
                {meetingUrl 
                  ? 'Video call' 
                  : location || 'In-person'
                }
              </span>
            </div>
          </div>

          {notes && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Notes:</span> {notes}
              </p>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {creditsPerHour} credits
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">per hour</p>
        </div>
      </div>

      {/* Participant Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isTeacher ? 'Teaching' : 'Learning from'}: {otherUser?.firstName || 'Unknown'} {otherUser?.lastName || 'User'}
            </p>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {(otherUser?.averageRating || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <button 
            onClick={() => {
              // TODO: Implement more options menu
              alert('More options:\n• View Details\n• Contact User\n• Report Issue');
            }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>


      {/* Action Buttons */}
      {showActions && (
        <div className="flex space-x-3">
          {status === 2 && ( // Confirmed
            <>
              {meetingUrl && (
                <button 
                  onClick={() => handleJoinSession(session.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Join Session
                </button>
              )}
              {/* Only instructor can complete sessions */}
              {isTeacher && (
                <button 
                  onClick={() => handleCompleteSession(session.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Mark Complete
                </button>
              )}
              {/* Only student can reschedule, and only before confirmation */}
              {isStudent && (
                <button 
                  onClick={() => handleReschedule(session.id)}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  Reschedule
                </button>
              )}
              {/* Both can cancel */}
              <button 
                onClick={() => handleCancelSession(session.id)}
                className="flex-1 border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
              >
                Cancel
              </button>
            </>
          )}
          
          {status === 1 && ( // Pending
            <>
              {/* Only instructor can accept/reject session requests */}
              {isTeacher && (
                <>
                  <button 
                    onClick={() => handleAcceptRequest(session.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleDeclineRequest(session.id)}
                    className="flex-1 border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                  >
                    Decline
                  </button>
                </>
              )}
              {/* Student can reschedule pending sessions */}
              {isStudent && (
                <button 
                  onClick={() => handleReschedule(session.id)}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  Reschedule
                </button>
              )}
              {/* Both can cancel pending sessions */}
              <button 
                onClick={() => handleCancelSession(session.id)}
                className="flex-1 border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
              >
                Cancel
              </button>
            </>
          )}
          
          {status === 4 && ( // Completed
            <>
              {existingReview ? (
                /* Show existing review in disabled state */
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-2 px-4 rounded-lg text-sm border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>Reviewed ({existingReview.rating}/5)</span>
                  </div>
                  {existingReview.comment && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                      "{existingReview.comment.length > 50 ? existingReview.comment.substring(0, 50) + '...' : existingReview.comment}"
                    </div>
                  )}
                </div>
              ) : (
                /* Show review button if no review exists */
                <button 
                  onClick={() => handleRateAndReview(session.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Rate & Review
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Bookings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your learning sessions and teaching appointments
          </p>
        </div>
        <button 
          onClick={() => setShowBookModal(true)}
          className="mt-4 lg:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Book New Session
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'upcoming', name: 'Upcoming', count: bookings.upcoming.length },
              { id: 'past', name: 'Past Sessions', count: bookings.past.length },
              { id: 'requests', name: 'Requests', count: bookings.requests.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {bookings[activeTab].length > 0 ? (
          bookings[activeTab].map((booking) => renderBookingCard(booking))
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No {activeTab} sessions
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {activeTab === 'upcoming' && 'You don\'t have any upcoming sessions scheduled.'}
              {activeTab === 'past' && 'You haven\'t completed any sessions yet.'}
              {activeTab === 'requests' && 'You don\'t have any pending session requests.'}
            </p>
            {activeTab === 'upcoming' && (
              <button 
                onClick={() => setShowBookModal(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Your First Session
              </button>
            )}
          </div>
        )}
      </div>

      {/* Book Session Modal */}
      <BookSessionModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        onSessionBooked={handleSessionBooked}
      />

      {/* Reschedule Modal */}
      {selectedSessionForReschedule && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedSessionForReschedule(null);
          }}
          sessionId={selectedSessionForReschedule.id}
          currentStart={selectedSessionForReschedule.scheduledStart}
          currentEnd={selectedSessionForReschedule.scheduledEnd}
          onRescheduled={handleSessionRescheduled}
        />
      )}

      {/* Review Modal */}
      {selectedSessionForReview && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedSessionForReview(null);
          }}
          session={selectedSessionForReview}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default BookingsPage;