'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { supabase } from '@/lib/supabase'
import { checkStaffStatus } from '@/lib/panel/api'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, Frown, RefreshCw } from 'lucide-react'
import type { Category } from '@/types'
import { useTranslations } from 'next-intl'

export default function CategoriasPage() {
  const t = useTranslations('Categories')
  const tCommon = useTranslations('Common')
  const router = useRouter()
  const [isStaff, setIsStaff] = useState<boolean | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalName, setModalName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    checkStaffStatus().then((staff) => {
      if (!staff) {
        router.replace('/dashboard')
        return
      }
      setIsStaff(true)
      fetchCategories()
    })
  }, [router])

  async function fetchCategories() {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) {
      setError(error.message)
    } else {
      setCategories(data ?? [])
    }
    setLoading(false)
  }

  function openCreate() {
    setEditingId(null)
    setModalName('')
    setShowModal(true)
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id)
    setModalName(cat.name)
    setShowModal(true)
  }

  async function handleSave() {
    if (!modalName.trim()) return
    setSaving(true)
    const payload = { name: modalName.trim() }

    if (editingId) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editingId)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload)
      if (error) {
        setError(error.message)
        setSaving(false)
        return
      }
    }

    setShowModal(false)
    setSaving(false)
    fetchCategories()
  }

  async function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return
    setDeletingId(id)
    const { error } = await supabase.from('categories').delete().eq('id', id)
    setDeletingId(null)
    if (error) {
      setError(error.message)
      return
    }
    fetchCategories()
  }

  if (isStaff === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 sm:gap-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
          {t('title')}
        </h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700"
        >
          <Plus className="h-4 w-4" />
          {t('addCategory')}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Frown className="h-12 w-12 text-stone-300" />
          <div>
            <p className="text-base font-semibold text-stone-700">{t('noCategories')}</p>
            <p className="mt-1 text-sm text-stone-400">{t('noCategoriesDesc')}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900 sm:text-base">
                  {cat.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                  aria-label={tCommon('ariaEdit', { name: cat.name })}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  aria-label={tCommon('ariaDelete', { name: cat.name })}
                >
                  {deletingId === cat.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                {editingId ? t('editCategory') : t('newCategory')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  {t('nameLabel')} <span className="text-red-400">*</span>
                </label>
                <input
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200"
                  autoFocus
                />
              </div>

            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-2xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition-all hover:bg-stone-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !modalName.trim()}
                className="flex-1 rounded-2xl bg-stone-800 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700 disabled:bg-stone-200 disabled:text-stone-400"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-white" />
                    {t('saving')}
                  </span>
                ) : (
                  editingId ? tCommon('save') : t('create')
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
