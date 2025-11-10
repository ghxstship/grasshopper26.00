'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
import { Button } from '@/design-system/components/atoms/Button';
import { Input } from '@/design-system/components/atoms/Input';
import { Label } from '@/design-system/components/atoms/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/atoms/Card';
import { Tabs } from '@/design-system/components/atoms/Tabs';
import { Avatar } from '@/design-system/components/atoms/Avatar';
import { toast } from 'sonner';
import { Loader2, User, Heart, Calendar, ShoppingBag, Settings, Bell } from 'lucide-react';
import { Checkbox } from '@/design-system/components/atoms/Checkbox';
import Link from 'next/link';
import styles from '../auth.module.css';

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
      <div className={styles.container}>
        <Loader2 className={styles.loadingIcon} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.maxWidth}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            My Profile
          </h1>
          <Button
            variant="outlined"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>

        <Tabs
          defaultTab="profile"
          className={styles.section}
          tabs={[
            {
              id: 'profile',
              label: 'Profile',
              content: (
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.subtitle}>Profile Information</CardTitle>
                <CardDescription className={styles.description}>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.row}>
                  <Avatar
                    src={profile?.avatar_url}
                    alt={displayName || user?.email || 'User'}
                    fallback={displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    className={styles.avatar}
                  />
                  <div>
                    <p className={styles.label}>Email</p>
                    <p className={styles.value}>{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className={styles.section}>
                  <div className={styles.section}>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className={styles.section}>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className={styles.textarea}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading && <Loader2 className={styles.icon} />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
              ),
            },
            {
              id: 'favorites',
              label: 'Favorites',
              content: (
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.subtitle}>Favorite Artists</CardTitle>
                <CardDescription className={styles.description}>Artists you follow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={styles.description}>No favorite artists yet. Start exploring!</p>
              </CardContent>
            </Card>
              ),
            },
            {
              id: 'events',
              label: 'My Events',
              content: (
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.subtitle}>My Events</CardTitle>
                <CardDescription className={styles.description}>Events you&apos;re attending</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={styles.description}>No upcoming events. Browse events to get tickets!</p>
              </CardContent>
            </Card>
              ),
            },
            {
              id: 'orders',
              label: 'Orders',
              content: (
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.subtitle}>Order History</CardTitle>
                <CardDescription className={styles.description}>Your ticket and merchandise orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/orders">
                  <Button>View All Orders</Button>
                </Link>
              </CardContent>
            </Card>
              ),
            },
            {
              id: 'settings',
              label: 'Settings',
              content: (
            <div className={styles.section}>
              <Card className={styles.card}>
                <CardHeader>
                  <CardTitle className={`${styles.subtitle} ${styles.row}`}>
                    <Bell className={styles.icon} />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className={styles.description}>Manage how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className={styles.section}>
                  <div className={styles.header}>
                    <div>
                      <p className={styles.label}>Marketing Emails</p>
                      <p className={styles.description}>
                        Receive updates about new events and promotions
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.email_marketing}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleNotificationChange('email_marketing', e.target.checked)
                      }
                    />
                  </div>
                  <div className={styles.header}>
                    <div>
                      <p className={styles.label}>Event Updates</p>
                      <p className={styles.description}>
                        Get notified about events you&apos;re interested in
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.email_events}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleNotificationChange('email_events', e.target.checked)
                      }
                    />
                  </div>
                  <div className={styles.header}>
                    <div>
                      <p className={styles.label}>Order Confirmations</p>
                      <p className={styles.description}>
                        Receive receipts and ticket delivery emails
                      </p>
                    </div>
                    <Checkbox
                      checked={notifications.email_orders}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleNotificationChange('email_orders', e.target.checked)
                      }
                    />
                  </div>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                  >
                    {loading && <Loader2 className={styles.icon} />}
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>

              <Card className={styles.card}>
                <CardHeader>
                  <CardTitle className={styles.subtitle}>Password & Security</CardTitle>
                  <CardDescription className={styles.description}>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/forgot-password">
                    <Button variant="outlined">
                      Change Password
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
