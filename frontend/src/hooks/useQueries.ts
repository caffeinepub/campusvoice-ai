import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type UserProfile, type Complaint, ComplaintStatus, Priority } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAccount();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// ─── Complaints ──────────────────────────────────────────────────────────────

export function useGetAllComplaints() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Complaint[]>({
    queryKey: ['allComplaints'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllComplaints();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetMyComplaints() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Complaint[]>({
    queryKey: ['myComplaints', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getComplaintsByStudent(identity.getPrincipal() as unknown as Principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetComplaintsByStatus(status: ComplaintStatus) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Complaint[]>({
    queryKey: ['complaintsByStatus', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComplaintsByStatus(status);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      description,
      priority,
    }: {
      id: string;
      description: string;
      priority: Priority;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createComplaint(id, description, priority);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['allComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaintsByStatus'] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ComplaintStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDepartmentComplaintStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['allComplaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaintsByStatus'] });
    },
  });
}

// Alias for semantic clarity in staff/HOD/admin contexts
export function useUpdateDepartmentComplaintStatus() {
  return useUpdateComplaintStatus();
}

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
