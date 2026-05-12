import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useQuotations() {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })
    setQuotations(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const remove = async (id) => {
    await supabase.from('quotations').delete().eq('id', id)
    await fetch()
  }

  const duplicate = async (id) => {
    const { data: src } = await supabase
      .from('quotations')
      .select('*, quotation_items(*)')
      .eq('id', id)
      .single()
    if (!src) return null
    const { id: _id, number: _num, created_at: _ca, updated_at: _ua, quotation_items, ...rest } = src
    const { data: newQ, error } = await supabase
      .from('quotations')
      .insert({ ...rest, status: 'draft', created_by: null })
      .select().single()
    if (error) throw error
    if (quotation_items?.length) {
      await supabase.from('quotation_items').insert(
        quotation_items.map(({ id: _i, quotation_id: _q, ...item }) => ({ ...item, quotation_id: newQ.id }))
      )
    }
    await fetch()
    return newQ.id
  }

  return { quotations, loading, remove, duplicate, refetch: fetch }
}
