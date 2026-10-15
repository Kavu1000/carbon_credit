"use client"

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const initialForm = { owner: '', village: '', province: '', wallet: '', hectares: '', description: '' }

const text = {
  en: {
    back: '← Back to marketplace', eyebrow: 'STEP 1 · FARMER ONBOARDING', title: 'Register your forest plot.',
    intro: 'Submit your land details for review. A verifier will check the boundary and evidence before the plot can join a Carbon Pool.',
    owner: 'Owner information', ownerName: 'Full name', village: 'Village', province: 'Province', wallet: 'Wallet address',
    land: 'Land information', hectares: 'Forest area in hectares', description: 'Description or local evidence', kml: 'Plot boundary KML file', drop: 'Choose a .kml file', hint: 'The file will be stored on IPFS in Step 2. It stays in this browser for this demo.',
    submit: 'Submit for verification', privacy: 'Do not enter a private key or recovery phrase.',
    submitted: 'Application submitted', success: 'Your demo application', pending: 'is now pending verifier review.', another: 'Register another plot', fields: 'Please complete all required fields and select a KML file.', language: 'ລາວ'
  },
  lo: {
    back: '← ກັບໄປຕະຫຼາດ', eyebrow: 'ຂັ້ນຕອນ 1 · ການລົງທະບຽນຊາວບ້ານ', title: 'ລົງທະບຽນແປງປ່າຂອງທ່ານ.',
    intro: 'ສົ່ງຂໍ້ມູນທີ່ດິນເພື່ອກວດສອບ. ຜູ້ກວດສອບຈະກວດເບິ່ງເສັ້ນແດນ ແລະ ຫຼັກຖານ ກ່ອນທີ່ແປງດິນຈະເຂົ້າຮ່ວມ Carbon Pool.',
    owner: 'ຂໍ້ມູນເຈົ້າຂອງ', ownerName: 'ຊື່-ນາມສະກຸນ', village: 'ບ້ານ', province: 'ແຂວງ', wallet: 'ທີ່ຢູ່ກະເປົາເງິນ',
    land: 'ຂໍ້ມູນທີ່ດິນ', hectares: 'ເນື້ອທີ່ປ່າ (ເຮັກຕາ)', description: 'ລາຍລະອຽດ ຫຼື ຫຼັກຖານທ້ອງຖິ່ນ', kml: 'ໄຟລ໌ເສັ້ນແດນແປງ KML', drop: 'ເລືອກໄຟລ໌ .kml', hint: 'ໃນ Step 2 ໄຟລ໌ຈະຖືກເກັບໃນ IPFS. ສຳລັບ demo ນີ້ ຂໍ້ມູນຈະຢູ່ໃນ browser ເທົ່ານັ້ນ.',
    submit: 'ສົ່ງເພື່ອກວດສອບ', privacy: 'ຫ້າມປ້ອນ private key ຫຼື recovery phrase.',
    submitted: 'ສົ່ງຄຳຮ້ອງແລ້ວ', success: 'ຄຳຮ້ອງ demo ຂອງທ່ານ', pending: 'ກຳລັງລໍຖ້າຜູ້ກວດສອບ.', another: 'ລົງທະບຽນແປງອື່ນ', fields: 'ກະລຸນາຕື່ມຂໍ້ມູນທີ່ຈຳເປັນ ແລະ ເລືອກໄຟລ໌ KML.', language: 'EN'
  }
}

export default function RegisterPage() {
  const [lang, setLang] = useState('en')
  const [form, setForm] = useState(initialForm)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const fileInput = useRef(null)
  const t = text[lang]

  useEffect(() => {
    const saved = window.localStorage.getItem('carbonlao-registration-draft')
    if (saved) setForm(JSON.parse(saved))
  }, [])
  useEffect(() => { window.localStorage.setItem('carbonlao-registration-draft', JSON.stringify(form)) }, [form])

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value })
  const chooseFile = (event) => {
    const picked = event.target.files?.[0]
    if (picked && !picked.name.toLowerCase().endsWith('.kml')) { setError('Please choose a KML file (.kml).'); return }
    setFile(picked || null); setError('')
  }
  const submit = (event) => {
    event.preventDefault()
    if (!form.owner || !form.village || !form.province || !form.wallet || !form.hectares || !file) { setError(t.fields); return }
    const id = `LGP-${String(Date.now()).slice(-6)}`
    const entry = { id, ...form, kmlFile: file.name, submittedAt: new Date().toISOString(), status: 'Pending' }
    const applications = JSON.parse(window.localStorage.getItem('carbonlao-applications') || '[]')
    window.localStorage.setItem('carbonlao-applications', JSON.stringify([...applications, entry]))
    window.localStorage.removeItem('carbonlao-registration-draft')
    setSubmitted(entry); setError('')
  }
  const reset = () => { setForm(initialForm); setFile(null); setSubmitted(null); if (fileInput.current) fileInput.current.value = '' }
  const Field = ({ label, children }) => <label className="grid gap-1.5 text-sm font-medium text-carbon-ink"><span>{label}</span>{children}</label>
  const input = 'w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-carbon-green focus:ring-2 focus:ring-carbon-green/15'

  return <main className="min-h-screen bg-[#f8f7f3] px-5 py-8 text-carbon-ink sm:px-8 lg:px-12"><div className="mx-auto max-w-4xl"><div className="mb-10 flex items-center justify-between"><Link href="/" className="text-sm font-medium text-carbon-green hover:underline">{t.back}</Link><button onClick={() => setLang(lang === 'en' ? 'lo' : 'en')} className="rounded-md border border-[#b9c7a7] bg-white px-3 py-2 text-xs font-semibold text-carbon-green">{t.language}</button></div>{submitted ? <section className="mx-auto max-w-xl rounded-xl border border-[#c9d9a9] bg-[#fffefa] p-8 text-center shadow-sm"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e4efc8] text-2xl text-carbon-green">✓</div><p className="mt-5 font-mono text-xs uppercase tracking-widest text-carbon-green">{t.submitted}</p><h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium">{t.success} <em className="text-carbon-green">{submitted.id}</em> {t.pending}</h1><div className="mt-7 border-y border-stone-200 py-4 text-left text-sm leading-7 text-stone-600"><p><b className="text-carbon-ink">{submitted.owner}</b> · {submitted.village}, {submitted.province}</p><p>{submitted.hectares} ha · {submitted.kmlFile}</p></div><button onClick={reset} className="mt-7 rounded-sm bg-carbon-green px-5 py-3 text-sm font-semibold text-white">{t.another}</button></section> : <><div className="max-w-2xl"><p className="font-mono text-xs uppercase tracking-widest text-carbon-green">{t.eyebrow}</p><h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-medium tracking-tight sm:text-6xl">{t.title}</h1><p className="mt-5 max-w-xl text-base leading-7 text-stone-600">{t.intro}</p></div><form onSubmit={submit} className="mt-10 grid gap-7 rounded-xl border border-stone-200 bg-[#fffefa] p-6 shadow-sm sm:p-8"><section><h2 className="font-[family-name:var(--font-display)] text-2xl">{t.owner}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label={t.ownerName}><input required value={form.owner} onChange={update('owner')} className={input}/></Field><Field label={t.wallet}><input required value={form.wallet} onChange={update('wallet')} placeholder="0x..." className={input}/></Field><Field label={t.village}><input required value={form.village} onChange={update('village')} className={input}/></Field><Field label={t.province}><input required value={form.province} onChange={update('province')} className={input}/></Field></div></section><section className="border-t border-stone-200 pt-7"><h2 className="font-[family-name:var(--font-display)] text-2xl">{t.land}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label={t.hectares}><input required type="number" min="0.01" step="0.01" value={form.hectares} onChange={update('hectares')} className={input}/></Field><Field label={t.kml}><input ref={fileInput} required type="file" accept=".kml,application/vnd.google-earth.kml+xml" onChange={chooseFile} className="hidden"/><button type="button" onClick={() => fileInput.current?.click()} className="flex w-full items-center justify-between rounded-md border border-dashed border-carbon-green/50 bg-[#f4f8ea] px-3 py-2.5 text-left text-sm text-carbon-green"><span>{file ? file.name : t.drop}</span><span>↑</span></button></Field></div><Field label={t.description}><textarea value={form.description} onChange={update('description')} rows="3" className={input}/></Field><p className="mt-3 text-xs leading-5 text-stone-500">{t.hint}</p></section>{error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex flex-col gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-stone-500">{t.privacy}</p><button className="rounded-sm bg-carbon-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183d2a]">{t.submit} →</button></div></form></>}</div></main>
}
