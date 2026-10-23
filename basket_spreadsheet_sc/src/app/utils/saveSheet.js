export const SAVE_KEY = "info_last_saved_sheet"

// Devuelve solo los datos del store (excluye funciones)
export const pickStoreData = (state) =>
  Object.fromEntries(
    Object.entries(state).filter(([, value]) => typeof value !== "function")
  )

export const saveSheet = (formData, storeState) => {
  const payload = {
    savedAt: new Date().toISOString(),
    store: pickStoreData(storeState),
    form: formData,
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
  return payload
}

export const loadSheet = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? JSON.parse(raw) : false
  } catch {
    return false
  }
}