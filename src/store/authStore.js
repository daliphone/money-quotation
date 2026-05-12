import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  session: null,
  profile: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      set({ session, profile, loading: false })
    } else {
      set({ session: null, profile: null, loading: false })
    }
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single()
        set({ session, profile })
      } else {
        set({ session: null, profile: null })
      }
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, profile: null })
  },
}))
