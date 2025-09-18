import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2
} from 'lucide-react';
import api from '../../services/api';
import UserManagement from './UserManagement';
import SkillsManagement from './SkillsManagement';

interface SystemStats {
  totalUsers: number;
  totalSkills: number;
  completedSessions: number;
  activeUsers: number;
}

interface HealthMetrics {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: string;
      message: string;
    };
    memory: {
      status: string;
      usedMB: number;
      totalMB: number;
    };
    disk: {
      status: string;
      usedGB: number;
      totalGB: number;
    };
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'skills' | 'sessions' | 'analytics'>('dashboard');

  // Load admin data
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [statsResponse, healthResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/health/detailed')
        ]);

        setStats(statsResponse.data);
        setHealthMetrics(healthResponse.data);
      } catch (err) {
        setError('Failed to load admin data');
        console.error('Error loading admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      change: '+12 this month'
    },
    {
      title: 'Total Skills',
      value: stats?.totalSkills || 0,
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: '+8 this week'
    },
    {
      title: 'Completed Sessions',
      value: stats?.completedSessions || 0,
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      change: '+24 this week'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      change: 'Last 30 days'
    }
  ];

  const healthChecks = [
    {
      name: 'Database',
      status: healthMetrics?.checks?.database?.status || 'Unknown',
      message: healthMetrics?.checks?.database?.message || 'Not available',
      icon: Shield
    },
    {
      name: 'Memory Usage',
      status: healthMetrics?.checks?.memory?.status || 'Unknown',
      message: `${healthMetrics?.checks?.memory?.usedMB || 0}MB / ${healthMetrics?.checks?.memory?.totalMB || 0}MB`,
      icon: Activity
    },
    {
      name: 'Disk Space',
      status: healthMetrics?.checks?.disk?.status || 'Unknown',
      message: `${healthMetrics?.checks?.disk?.usedGB || 0}GB / ${healthMetrics?.checks?.disk?.totalGB || 0}GB`,
      icon: DollarSign
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'unhealthy':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'unhealthy':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render different views based on activeView
  if (activeView === 'users') {
    return <UserManagement onClose={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'skills') {
    return <SkillsManagement onClose={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'sessions') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sessions Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View and manage all sessions
            </p>
          </div>
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Sessions Management
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This feature will show all sessions with filtering and management options.
          </p>
        </div>
      </div>
    );
  }

  if (activeView === 'analytics') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              System Analytics
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Detailed analytics and reporting
            </p>
          </div>
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            System Analytics
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This feature will show detailed analytics, charts, and reporting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          System overview and management tools
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${stat.color} h-6 w-6`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Health
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {healthChecks.map((check) => {
              const Icon = check.icon;
              return (
                <div key={check.name} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {check.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {check.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(check.status)}
                    <span className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                      {check.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <button 
              onClick={() => setActiveView('users')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </button>
            <button 
              onClick={() => setActiveView('skills')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Manage Skills</span>
            </button>
            <button 
              onClick={() => setActiveView('sessions')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>View Sessions</span>
            </button>
            <button 
              onClick={() => setActiveView('analytics')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              <span>System Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Version:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{healthMetrics?.version || '1.0.0'}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Environment:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{healthMetrics?.environment || 'Development'}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {healthMetrics?.timestamp ? new Date(healthMetrics.timestamp).toLocaleString() : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
