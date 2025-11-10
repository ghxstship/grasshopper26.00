'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Label } from '@/design-system/components/atoms/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/atoms/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/components/atoms/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/components/atoms/avatar';
import { toast } from 'sonner';
import { Loader2, User, Heart, Calendar, ShoppingBag, Settings, Bell } from 'lucide-react';
import { Checkbox } from '@/design-system/components/atoms/checkbox';
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
            variant="outline"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className={styles.section}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="profile">
              <User className={styles.icon} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className={styles.icon} />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className={styles.icon} />
              My Events
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className={styles.icon} />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className={styles.icon} />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.subtitle}>Profile Information</CardTitle>
                <CardDescription className={styles.description}>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.row}>
                  <Avatar className={styles.avatar}>
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className={styles.avatarFallback}>
                      {displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
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
                      onChange={(e) => setDisplayName(e.target.value)}
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
          </TabsContent>

          <TabsContent value="favorites">
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.subtitle}>Favorite Artists</CardTitle>
                <CardDescription className={styles.description}>Artists you follow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={styles.description}>No favorite artists yet. Start exploring!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.subtitle}>My Events</CardTitle>
                <CardDescription className={styles.description}>Events you&apos;re attending</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={styles.description}>No upcoming events. Browse events to get tickets!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className={styles.card}>
              <CardHeader>
                <CardTitle className={styles.subtitle}>Order History</CardTitle>
                <CardDescription className={styles.description}>Your ticket and merchandise orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/orders">View All Orders</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
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
                      onCheckedChange={(checked: boolean) =>
                        handleNotificationChange('email_marketing', checked)
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
                      onCheckedChange={(checked: boolean) =>
                        handleNotificationChange('email_events', checked)
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
                      onCheckedChange={(checked: boolean) =>
                        handleNotificationChange('email_orders', checked)
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
                  <Button
                    asChild
                    variant="outline"
                  >
                    <Link href="/forgot-password">Change Password</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
