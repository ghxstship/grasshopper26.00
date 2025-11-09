import { createClient } from '@/lib/supabase/client';

export type UserRole = 'super_admin' | 'brand_admin' | 'event_manager' | 'user' | 'guest';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface UserPermission {
  user_id: string;
  permission_id: string;
  granted: boolean;
  granted_by?: string;
  created_at: string;
}

export class PermissionsService {
  private supabase = createClient();

  /**
   * Check if user has a specific permission
   */
  async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('has_permission', {
        p_user_id: userId,
        p_resource: resource,
        p_action: action,
      });

      if (error) {
        console.error('Error checking permission:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check multiple permissions at once
   */
  async hasAnyPermission(
    userId: string,
    permissions: Array<{ resource: string; action: string }>
  ): Promise<boolean> {
    try {
      const results = await Promise.all(
        permissions.map(({ resource, action }) =>
          this.hasPermission(userId, resource, action)
        )
      );

      return results.some(result => result === true);
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      return false;
    }
  }

  /**
   * Check if user has all specified permissions
   */
  async hasAllPermissions(
    userId: string,
    permissions: Array<{ resource: string; action: string }>
  ): Promise<boolean> {
    try {
      const results = await Promise.all(
        permissions.map(({ resource, action }) =>
          this.hasPermission(userId, resource, action)
        )
      );

      return results.every(result => result === true);
    } catch (error) {
      console.error('Error checking multiple permissions:', error);
      return false;
    }
  }

  /**
   * Get user's role
   */
  async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.role as UserRole;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  /**
   * Update user's role (admin only)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await this.supabase
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true })
        .order('action', { ascending: true });

      if (error) {
        console.error('Error getting permissions:', error);
        return [];
      }

      return (data || []) as Permission[];
    } catch (error) {
      console.error('Error getting permissions:', error);
      return [];
    }
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(role: UserRole): Promise<Permission[]> {
    try {
      const { data, error } = await this.supabase
        .from('role_permissions')
        .select('permission_id, permissions(*)')
        .eq('role', role);

      if (error) {
        console.error('Error getting role permissions:', error);
        return [];
      }

      return (data || []).map((item: any) => item.permissions) as Permission[];
    } catch (error) {
      console.error('Error getting role permissions:', error);
      return [];
    }
  }

  /**
   * Get user-specific permission overrides
   */
  async getUserPermissionOverrides(userId: string): Promise<UserPermission[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting user permissions:', error);
        return [];
      }

      return (data || []) as UserPermission[];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Grant permission to user (admin only)
   */
  async grantPermission(
    userId: string,
    permissionId: string,
    grantedBy: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          permission_id: permissionId,
          granted: true,
          granted_by: grantedBy,
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error granting permission:', error);
      throw error;
    }
  }

  /**
   * Revoke permission from user (admin only)
   */
  async revokePermission(
    userId: string,
    permissionId: string,
    revokedBy: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          permission_id: permissionId,
          granted: false,
          granted_by: revokedBy,
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error revoking permission:', error);
      throw error;
    }
  }

  /**
   * Remove permission override (admin only)
   */
  async removePermissionOverride(
    userId: string,
    permissionId: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('permission_id', permissionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error removing permission override:', error);
      throw error;
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return role === 'super_admin' || role === 'brand_admin';
  }

  /**
   * Check if user is super admin
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return role === 'super_admin';
  }

  /**
   * Get all users with a specific role
   */
  async getUsersByRole(role: UserRole): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id')
        .eq('role', role);

      if (error) {
        console.error('Error getting users by role:', error);
        return [];
      }

      return (data || []).map((item: any) => item.id);
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }
}

export const permissionsService = new PermissionsService();
