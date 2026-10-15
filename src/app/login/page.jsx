"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'

function shortAddress(address) { return `${address.slice(0, 6)}...${address.slice(-4)}` }

export default function LoginPage() {
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem('carbonlao-wallet')
    if (saved) { setAddress(saved); setStatus('connected') }
  }, [])

  async function connect() {
    if (!window.ethereum) {
      setStatus('error')
      setMessage('MetaMask was not detected. Install the extension, then refresh this page.')
      return
    }
    try {
      setStatus('loading'); setMessage('Open MetaMask and approve the connection.')
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts?.[0]) throw new Error('No wallet account was selected.')
      const connected = accounts[0]
      window.localStorage.setItem('carbonlao-wallet', connected)
      setAddress(connected); setStatus('connected'); setMessage('')
    } catch (error) {
      setStatus('error')
      setMessage(error?.message || 'Wallet connection was cancelled.')
    }
  }

  function disconnect() {
    window.localStorage.removeItem('carbonlao-wallet')
    setAddress(''); setStatus('idle'); setMessage('')
  }

  return <main className="grid min-h-screen place-items-center bg-[#f8f7f3] px-5 py-10 text-carbon-ink"><section className="w-full max-w-md rounded-xl border border-stone-200 bg-[#fffefa] p-7 text-center shadow-sm sm:p-10"><Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-carbon-ink"><b className="grid h-8 w-8 place-items-center rounded-full bg-carbon-green text-[#e7f5b3]">◒</b>carbon<span className="text-[#6d915d]">lao</span></Link><p className="mt-8 font-mono text-xs uppercase tracking-widest text-carbon-green">Web3 sign in</p><h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium">Connect your wallet.</h1><p className="mt-4 text-sm leading-6 text-stone-600">Use MetaMask to securely identify your account. CarbonLao never asks for your private key or recovery phrase.</p>{status === 'connected' ? <div className="mt-8 rounded-lg border border-[#c9d9a9] bg-[#f4f8ea] p-5"><p className="text-xs font-semibold uppercase tracking-wider text-carbon-green">Wallet connected</p><p className="mt-2 font-mono text-base text-carbon-ink">{shortAddress(address)}</p><div className="mt-5 flex justify-center gap-3"><Link href="/" className="rounded-sm bg-carbon-green px-4 py-2.5 text-sm font-semibold text-white">Go to marketplace</Link><button onClick={disconnect} className="rounded-sm border border-stone-300 px-4 py-2.5 text-sm font-semibold">Disconnect</button></div></div> : <><button onClick={connect} disabled={status === 'loading'} className="mt-8 flex w-full items-center justify-center gap-3 rounded-sm bg-carbon-green px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183d2a] disabled:cursor-wait disabled:opacity-70"><span className="grid h-5 w-5 place-items-center rounded bg-white text-xs text-carbon-green">M</span>{status === 'loading' ? 'Connecting…' : 'Connect MetaMask'}</button>{message && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-left text-xs leading-5 text-red-700">{message}</p>}</>}<div className="mt-7 border-t border-stone-200 pt-5 text-xs leading-5 text-stone-500">New to CarbonLao? <Link href="/register" className="font-semibold text-carbon-green underline">Register a forest plot</Link></div></section></main>
}
