'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { TeamMemberGate } from '@/lib/rbac';
import { RoleBadge } from '@/components/admin/RoleBadge';
import { MemberRole, TeamRole } from '@/lib/rbac/types';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Welcome to GVTEWAY',
      description: 'Learn about your role and permissions',
      completed: false,
    },
    {
      id: 'roles',
      title: 'Understanding Your Roles',
      description: 'See what you can do on the platform',
      completed: false,
    },
    {
      id: 'permissions',
      title: 'Your Permissions',
      description: 'Explore your access levels',
      completed: false,
    },
    {
      id: 'navigation',
      title: 'Platform Navigation',
      description: 'Find your way around',
      completed: false,
    },
    {
      id: 'complete',
      title: 'You&apos;re All Set!',
      description: 'Start using GVTEWAY',
      completed: false,
    },
  ]);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  async function loadUserProfile() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    const newSteps = [...steps];
    newSteps[currentStep].completed = true;
    setSteps(newSteps);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function completeOnboarding() {
    try {
      const supabase = createClient();
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('id', user?.id);

      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];

  return (
    <TeamMemberGate fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Member Access Required</h1>
          <p className="text-gray-600">This onboarding is for team members only. Please contact your administrator.</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex-1 ${index !== steps.length - 1 ? 'mr-2' : ''}`}
                >
                  <div
                    className={`h-2 rounded-full transition-all ${
                      step.completed
                        ? 'bg-purple-600'
                        : index === currentStep
                        ? 'bg-purple-400'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Step: Welcome */}
            {currentStepData.id === 'welcome' && (
              <div className="text-center">
                <div className="text-6xl mb-6">👋</div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to GVTEWAY!
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Hi {userProfile?.display_name || 'there'}! Let&apos;s get you started with our platform.
                </p>
                <div className="bg-purple-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-purple-900 mb-3">What is GVTEWAY?</h3>
                  <p className="text-purple-800">
                    GVTEWAY is a comprehensive event management platform that helps you create, manage, 
                    and scale amazing events. As a team member, you have special access to powerful tools 
                    and features.
                  </p>
                </div>
              </div>
            )}

            {/* Step: Roles */}
            {currentStepData.id === 'roles' && userProfile && (
              <div>
                <div className="text-6xl mb-6 text-center">🎭</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Your Roles
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Current Roles:</h3>
                    <div className="flex flex-wrap gap-3 mb-6">
                      <RoleBadge role={userProfile.member_role} type="member" size="lg" />
                      {userProfile.team_role && (
                        <RoleBadge role={userProfile.team_role} type="team" size="lg" />
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Member Role</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Your customer-facing access level
                      </p>
                      <RoleBadge role={userProfile.member_role} type="member" />
                    </div>

                    {userProfile.team_role && (
                      <div className="border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Team Role</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Your internal staff permissions
                        </p>
                        <RoleBadge role={userProfile.team_role} type="team" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Permissions */}
            {currentStepData.id === 'permissions' && userProfile && (
              <div>
                <div className="text-6xl mb-6 text-center">🔐</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  What You Can Do
                </h2>

                <div className="space-y-4">
                  {userProfile.is_team_member && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">✅</span>
                        <h3 className="font-semibold text-green-900">Team Member Access</h3>
                      </div>
                      <p className="text-sm text-green-800">
                        You have access to the admin dashboard and team tools
                      </p>
                    </div>
                  )}

                  {userProfile.team_role === TeamRole.SUPER_ADMIN && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🔱</span>
                        <h3 className="font-semibold text-red-900">Super Admin Powers</h3>
                      </div>
                      <ul className="text-sm text-red-800 space-y-1 ml-4">
                        <li>• Manage all events and users</li>
                        <li>• Assign roles and permissions</li>
                        <li>• Access analytics and reports</li>
                        <li>• Configure platform settings</li>
                      </ul>
                    </div>
                  )}

                  {userProfile.team_role === TeamRole.ADMIN && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🛡️</span>
                        <h3 className="font-semibold text-orange-900">Admin Access</h3>
                      </div>
                      <ul className="text-sm text-orange-800 space-y-1 ml-4">
                        <li>• Manage events</li>
                        <li>• View analytics</li>
                        <li>• Manage team members</li>
                        <li>• Handle customer support</li>
                      </ul>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📚</span>
                      <h3 className="font-semibold text-blue-900">Learn More</h3>
                    </div>
                    <p className="text-sm text-blue-800">
                      Check out the <a href="/docs/RBAC_DEVELOPER_GUIDE.md" className="underline font-medium">RBAC Developer Guide</a> to 
                      understand the full permission system.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Navigation */}
            {currentStepData.id === 'navigation' && (
              <div>
                <div className="text-6xl mb-6 text-center">🧭</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Finding Your Way
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">📊 Dashboard</h3>
                    <p className="text-sm text-gray-600">
                      Your central hub for events, analytics, and quick actions
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">🎫 Events</h3>
                    <p className="text-sm text-gray-600">
                      Create and manage events, tickets, and attendees
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">👥 Users</h3>
                    <p className="text-sm text-gray-600">
                      Manage team members, assign roles, and view activity
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">📈 Analytics</h3>
                    <p className="text-sm text-gray-600">
                      Track performance, revenue, and engagement metrics
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">⚙️ Settings</h3>
                    <p className="text-sm text-gray-600">
                      Configure your account and platform preferences
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">❓ Help</h3>
                    <p className="text-sm text-gray-600">
                      Access documentation, guides, and support
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Complete */}
            {currentStepData.id === 'complete' && (
              <div className="text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  You&apos;re All Set!
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  You&apos;re ready to start using GVTEWAY. Let&apos;s create something amazing!
                </p>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Start Tips:</h3>
                  <ul className="text-left text-gray-700 space-y-2">
                    <li>✨ Start by exploring the dashboard</li>
                    <li>📚 Bookmark the documentation for reference</li>
                    <li>👥 Connect with your team members</li>
                    <li>🎯 Set up your first event or project</li>
                    <li>💬 Reach out to support@gvteway.com if you need help</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </TeamMemberGate>
  );
}
