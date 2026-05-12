import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProducts({ activeOnly = false } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('category').order('name')
    if (activeOnly) query = query.eq('active', true)
    const { data, error } = await query
    if (error) setError(error.message)
    else setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [activeOnly])

  const save = async (product) => {
    const { id, ...fields } = product
    if (id) {
      const { error } = await supabase.from('products').update(fields).eq('id', id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('products').insert(fields)
      if (error) throw error
    }
    await fetch()
  }

  const toggle = async (id, active) => {
    const { error } = await supabase.from('products').update({ active }).eq('id', id)
    if (error) throw error
    await fetch()
  }

  return { products, loading, error, save, toggle }
}
