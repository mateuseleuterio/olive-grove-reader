import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'editor' | 'user';

export const useUserRole = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);

          if (error) {
            console.error('Error fetching user roles:', error);
            setRoles([]);
          } else {
            // Convertemos o array de roles para o formato esperado
            const roleArray = userRoles?.map(role => role.role as UserRole) || [];
            console.log('Roles encontrados:', roleArray); // Debug
            setRoles(roleArray);
          }
        } else {
          setRoles([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRoles();
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: UserRole) => {
    console.log('Checking role:', role, 'Current roles:', roles); // Debug
    return roles.includes(role);
  };
  const isAdmin = () => hasRole('admin');
  const isEditor = () => hasRole('editor');
  const canManageArticles = () => isAdmin() || isEditor();

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,
    isEditor,
    canManageArticles
  };
};