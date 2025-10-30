import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

const applyAuthHeader = (token) => {
    if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common.Authorization;
    }
};

const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null,
            profile: null,
            needsProfile: false,
            setAuth: ({ token, user, profile, needsProfile }) => {
                applyAuthHeader(token);
                set(() => ({
                    token,
                    user: user ?? null,
                    profile: profile ?? null,
                    needsProfile: !!needsProfile,
                }));
            },
            updateProfile: (profileDelta) => {
                set((state) => ({
                    profile: state.profile
                        ? { ...state.profile, ...profileDelta }
                        : { ...profileDelta },
                }));
            },
            setProfile: (profile) => set(() => ({ profile: profile ?? null })),
            setUser: (user) => set(() => ({ user: user ?? null })),
            updateUser: (userDelta) => {
                if (!userDelta) return;
                set((state) => ({
                    user: state.user
                        ? { ...state.user, ...userDelta }
                        : { ...userDelta },
                }));
            },
            setNeedsProfile: (value) => set(() => ({ needsProfile: value })),
            clearAuth: () => {
                applyAuthHeader(null);
                set(() => ({ token: null, user: null, profile: null, needsProfile: false }));
            },
        }),
        {
            name: "estimular-auth",
            storage:
                typeof window !== "undefined"
                    ? createJSONStorage(() => window.localStorage)
                    : undefined,
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                profile: state.profile,
                needsProfile: state.needsProfile,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.token) {
                    applyAuthHeader(state.token);
                }
            },
        }
    )
);

export default useAuthStore;
