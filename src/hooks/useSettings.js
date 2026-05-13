import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const { data } = await supabase.from('company_settings').select('*').eq('id', 1).single()
    setSettings(data)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const save = async (values) => {
    const { error } = await supabase.from('company_settings').update(values).eq('id', 1)
    if (error) throw error
    await fetch()
  }

  return { settings, loading, save }
}
