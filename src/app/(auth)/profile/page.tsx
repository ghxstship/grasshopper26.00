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
      <div className="min-h-screen flex items-center justify-center " style={{ background: 'var(--gradient-hero)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12 px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold  bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-brand-primary)' }}>
            My Profile
          </h1>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-purple-500/30 hover:bg-purple-500/10"
          >
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-black/40 border border-purple-500/20">
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-purple-600">
              <Heart className="mr-2 h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600">
              <Calendar className="mr-2 h-4 w-4" />
              My Events
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-purple-600">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-purple-600 text-white text-2xl">
                      {displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-black/50 border-purple-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="flex w-full rounded-md border border-purple-500/30 bg-black/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="" style={{ background: 'var(--gradient-brand-primary)' }}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle>Favorite Artists</CardTitle>
                <CardDescription>Artists you follow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">No favorite artists yet. Start exploring!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle>My Events</CardTitle>
                <CardDescription>Events you&apos;re attending</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">No upcoming events. Browse events to get tickets!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Your ticket and merchandise orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="" style={{ background: 'var(--gradient-brand-primary)' }}
                >
                  <Link href="/orders">View All Orders</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Manage how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Marketing Emails</p>
                      <p className="text-sm text-gray-400">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Event Updates</p>
                      <p className="text-sm text-gray-400">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Order Confirmations</p>
                      <p className="text-sm text-gray-400">
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
                    className="" style={{ background: 'var(--gradient-brand-primary)' }}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/20">
                <CardHeader>
                  <CardTitle>Password & Security</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    variant="outline"
                    className="border-purple-500/30 hover:bg-purple-500/10"
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
