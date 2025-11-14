'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Bell } from 'lucide-react';
import {
  Card,
  Stack,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Avatar,
  Checkbox,
} from '@/design-system';
import { Tabs } from '@/design-system';
import { PageTemplate } from '@/design-system';
import styles from '../auth.module.css';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [notifications, setNotifications] = useState({
    email_marketing: true,
    email_events: true,
    email_orders: true,
  });
  const [activeTab, setActiveTab] = useState('profile');

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    setUser(user);
    
    // Fetch user profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setDisplayName(profileData.display_name || '');
      setBio(profileData.bio || '');
      setNotifications(profileData.notification_preferences || {
        email_marketing: true,
        email_events: true,
        email_orders: true,
      });
    }

    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          bio: bio,
          notification_preferences: notifications,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <PageTemplate showHeader={false} showFooter={false}>
        <div className={styles.loadingContainer}>
          <Stack align="center" gap={4}>
            <Loader2 size={48} className={styles.loadingIcon} />
            <Heading level={2} font="bebas" align="center">
              Loading profile...
            </Heading>
          </Stack>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate showHeader={false} showFooter={false}>
      <div className={styles.profileContainer}>
        <div className={styles.profileInner}>
          <div className={styles.profileHeader}>
            <Heading level={1} font="anton">
              My Profile
            </Heading>
            <Button variant="secondary" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          <Tabs
            tabs={[
              {
                id: 'profile',
                label: 'Profile',
                content: (
                  <Card variant="elevated" padding={6}>
                    <Stack gap={6}>
                      <div className={styles.profileAvatar}>
                        <Avatar
                          src={profile?.avatar_url}
                          alt={displayName || user?.email || 'User'}
                          fallback={displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                          size="lg"
                        />
                        <div className={styles.profileInfo}>
                          <Text size="sm" color="secondary">
                            Email
                          </Text>
                          <Text>{user?.email}</Text>
                        </div>
                      </div>

                      <form onSubmit={handleUpdateProfile}>
                        <Stack gap={4}>
                          <Stack gap={2}>
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                              id="displayName"
                              value={displayName}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setDisplayName(e.target.value)
                              }
                              fullWidth
                            />
                          </Stack>

                          <Stack gap={2}>
                            <Label htmlFor="bio">Bio</Label>
                            <textarea
                              id="bio"
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              rows={4}
                              className={styles.textarea}
                              placeholder="Tell us about yourself..."
                            />
                          </Stack>

                          <Button type="submit" disabled={loading} variant="primary" size="lg">
                            Save Changes
                          </Button>
                        </Stack>
                      </form>
                    </Stack>
                  </Card>
                ),
              },
              {
                id: 'favorites',
                label: 'Favorites',
                content: (
                  <Card variant="outlined" padding={6}>
                    <Stack gap={2}>
                      <Heading level={3} font="bebas">
                        Favorite Artists
                      </Heading>
                      <Text color="secondary">
                        Artists you follow
                      </Text>
                      <Text color="secondary">
                        No favorite artists yet. Start exploring!
                      </Text>
                    </Stack>
                  </Card>
                ),
              },
              {
                id: 'events',
                label: 'My Events',
                content: (
                  <Card variant="outlined" padding={6}>
                    <Stack gap={2}>
                      <Heading level={3} font="bebas">
                        My Events
                      </Heading>
                      <Text color="secondary">
                        Events you&apos;re attending
                      </Text>
                      <Text color="secondary">
                        No upcoming events. Browse events to get tickets!
                      </Text>
                    </Stack>
                  </Card>
                ),
              },
              {
                id: 'orders',
                label: 'Orders',
                content: (
                  <Card variant="outlined" padding={6}>
                    <Stack gap={2}>
                      <Heading level={3} font="bebas">
                        Order History
                      </Heading>
                      <Text color="secondary">
                        Your ticket and merchandise orders
                      </Text>
                      <Link href="/orders" className={styles.linkNoDecoration}>
                        <Button variant="primary">View All Orders</Button>
                      </Link>
                    </Stack>
                  </Card>
                ),
              },
              {
                id: 'settings',
                label: 'Settings',
                content: (
                  <Stack gap={6}>
                    <Card variant="outlined" padding={6}>
                      <Stack gap={4}>
                        <Stack direction="horizontal" gap={2} align="center">
                          <Bell size={18} />
                          <Heading level={3} font="bebas">
                            Notification Preferences
                          </Heading>
                        </Stack>
                        <Text color="secondary">
                          Manage how you receive updates
                        </Text>

                        <Stack gap={4}>
                          <div className={styles.notificationRow}>
                            <div className={styles.notificationContent}>
                              <Text weight="bold">Marketing Emails</Text>
                              <Text size="sm" color="secondary">
                                Receive updates about new events and promotions
                              </Text>
                            </div>
                            <Checkbox
                              checked={notifications.email_marketing}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleNotificationChange('email_marketing', e.target.checked)
                              }
                            />
                          </div>

                          <div className={styles.notificationRow}>
                            <div className={styles.notificationContent}>
                              <Text weight="bold">Event Updates</Text>
                              <Text size="sm" color="secondary">
                                Get notified about events you&apos;re interested in
                              </Text>
                            </div>
                            <Checkbox
                              checked={notifications.email_events}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleNotificationChange('email_events', e.target.checked)
                              }
                            />
                          </div>

                          <div className={styles.notificationRow}>
                            <div className={styles.notificationContent}>
                              <Text weight="bold">Order Confirmations</Text>
                              <Text size="sm" color="secondary">
                                Receive receipts and ticket delivery emails
                              </Text>
                            </div>
                            <Checkbox
                              checked={notifications.email_orders}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleNotificationChange('email_orders', e.target.checked)
                              }
                            />
                          </div>
                        </Stack>

                        <Button
                          onClick={handleUpdateProfile}
                          disabled={loading}
                          variant="primary"
                          size="lg"
                        >
                          Save Preferences
                        </Button>
                      </Stack>
                    </Card>

                    <Card variant="outlined" padding={6}>
                      <Stack gap={2}>
                        <Heading level={3} font="bebas">
                          Password &amp; Security
                        </Heading>
                        <Text color="secondary">
                          Manage your account security
                        </Text>
                        <Link href="/forgot-password" className={styles.linkNoDecoration}>
                          <Button variant="secondary">Change Password</Button>
                        </Link>
                      </Stack>
                    </Card>
                  </Stack>
                ),
              },
            ]}
            defaultTab="profile"
          />
        </div>
      </div>
    </PageTemplate>
  );
}
