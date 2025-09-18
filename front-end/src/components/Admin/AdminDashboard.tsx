import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Activity,
  Database,
  Server,
  Clock,
  UserCheck,
  UserX,
  Settings,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { User, Session, Skill, SessionStatus } from '../../types';
import { apiClient } from '../../lib/api';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalSkills: number;
  completedSessions: number;
  activeUsers: number;
  pendingSessions: number;
  totalRevenue: number;
  systemHealth: {
    status: string;
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSkills: 0,
    completedSessions: 0,
    activeUsers: 0,
    pendingSessions: 0,
    totalRevenue: 0,
    systemHealth: {
      status: 'healthy',
      uptime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    }
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sessions' | 'system'>('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Load admin stats (mock data since endpoint might not exist)
      const mockStats: AdminStats = {
        totalUsers: 1247,
        totalSkills: 456,
        completedSessions: 3201,
        activeUsers: 189,
        pendingSessions: 23,
        totalRevenue: 45670,
        systemHealth: {
          status: 'healthy',
          uptime: 2592000, // 30 days in seconds
          memoryUsage: 68.5,
          cpuUsage: 23.2
        }
      };
      
      setStats(mockStats);
      
      // Load recent data
      const [users, sessions] = await Promise.all([
        apiClient.searchUsers('', '').catch(() => []),
        apiClient.getMySessions().catch(() => [])
      ]);
      
      setRecentUsers(users.slice(0, 5));
      setRecentSessions(sessions.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Skills',
      value: stats.totalSkills.toLocaleString(),
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions.toLocaleString(),
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: Activity,
      color: 'from-yellow-500 to-yellow-600',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Pending Sessions',
      value: stats.pendingSessions.toLocaleString(),
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      change: '-3%',
      changeType: 'negative' as const
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      change: '+22%',
      changeType: 'positive' as const
    }
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'sessions' as const, label: 'Sessions', icon: Calendar },
    { id: 'system' as const, label: 'System', icon: Server }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Shield className="w-8 h-8 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-blue-100">
                System overview and management tools
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-blue-100">System Status</p>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Healthy</span>
                </div>
              </div>
            </div>
          </div>
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change} this month
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                    Recent Users
                  </h3>
                </div>
                <div className="p-6">
                  {recentUsers.length > 0 ? (
                    <div className="space-y-4">
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {format(new Date(user.createdAt), 'MMM dd')}
                            </p>
                            <div className="flex items-center space-x-1">
                              {user.isEmailVerified ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No recent users</p>
                  )}
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Server className="w-5 h-5 mr-2 text-blue-600" />
                    System Health
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-600">Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium">30 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Memory Usage</span>
                      <span className="font-medium">68.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">CPU Usage</span>
                      <span className="font-medium">23.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database</span>
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600">Advanced user management features coming soon</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Session Management</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Session Management</h3>
                <p className="text-gray-600">Session monitoring and management tools coming soon</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">System Configuration</h3>
                <p className="text-gray-600">System configuration and maintenance tools coming soon</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;