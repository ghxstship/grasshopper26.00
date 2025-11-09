import { createClient } from '@/lib/supabase/server';
import { Button } from '@/design-system/components/atoms/button';
import { Input } from '@/design-system/components/atoms/input';
import { Badge } from '@/design-system/components/atoms/badge';
import { Card, CardContent } from '@/design-system/components/atoms/card';
import { Search, UserPlus, Mail, Shield, Ban } from 'lucide-react';
import Link from 'next/link';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  const search = params.search || '';
  const role = params.role || '';
  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  // Fetch users from auth
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
    page,
    perPage: limit,
  });

  if (usersError) {
    console.error('Error fetching users:', usersError);
  }

  // Fetch user profiles and roles
  const userIds = users?.map(u => u.id) || [];
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_id', userIds);

  const { data: brandUsers } = await supabase
    .from('brand_users')
    .select('*')
    .in('user_id', userIds);

  // Merge data
  const enrichedUsers = users?.map(user => ({
    ...user,
    profile: profiles?.find(p => p.user_id === user.id),
    brandUser: brandUsers?.find(bu => bu.user_id === user.id),
  })) || [];

  // Filter by search
  const filteredUsers = enrichedUsers.filter(user => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        user.email?.toLowerCase().includes(searchLower) ||
        user.profile?.display_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Filter by role
  const roleFilteredUsers = role
    ? filteredUsers.filter(u => u.brandUser?.role === role)
    : filteredUsers;

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-700';
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'staff':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-10"
            defaultValue={search}
          />
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button variant={!role ? 'default' : 'outline'} size="sm">
              All
            </Button>
          </Link>
          <Link href="/admin/users?role=admin">
            <Button variant={role === 'admin' ? 'default' : 'outline'} size="sm">
              Admins
            </Button>
          </Link>
          <Link href="/admin/users?role=staff">
            <Button variant={role === 'staff' ? 'default' : 'outline'} size="sm">
              Staff
            </Button>
          </Link>
          <Link href="/admin/users?role=user">
            <Button variant={role === 'user' ? 'default' : 'outline'} size="sm">
              Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Users list */}
      <div className="space-y-4">
        {roleFilteredUsers && roleFilteredUsers.length > 0 ? (
          roleFilteredUsers.map((user: any) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {user.profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {user.profile?.display_name || 'Unnamed User'}
                        </h3>
                        {user.brandUser?.role && (
                          <Badge className={getRoleColor(user.brandUser.role)}>
                            {user.brandUser.role}
                          </Badge>
                        )}
                        {user.email_confirmed_at && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Permissions
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
