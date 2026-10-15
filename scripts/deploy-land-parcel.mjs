import { readFile } from 'node:fs/promises'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

const rpcUrl = process.env.SEPOLIA_RPC_URL
const privateKey = process.env.DEPLOYER_PRIVATE_KEY

if (!rpcUrl || rpcUrl.includes('example-rpc-url')) {
  throw new Error('Set SEPOLIA_RPC_URL in .env.local before deploying.')
}
if (!privateKey || !/^0x[\da-fA-F]{64}$/.test(privateKey)) {
  throw new Error('Set DEPLOYER_PRIVATE_KEY to a 32-byte testnet key in .env.local before deploying.')
}

const artifactBase = '.solc-build/contracts_LandParcelNFT_sol_LandParcelNFT'
const abi = JSON.parse(await readFile(`${artifactBase}.abi`, 'utf8'))
const bytecode = `0x${(await readFile(`${artifactBase}.bin`, 'utf8')).trim()}`
const account = privateKeyToAccount(privateKey)
const publicClient = createPublicClient({ chain: sepolia, transport: http(rpcUrl) })
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) })

console.log(`Deploying LandParcelNFT from ${account.address} on Sepolia...`)
const hash = await walletClient.deployContract({ abi, bytecode, args: [account.address] })
console.log(`Transaction submitted: https://sepolia.etherscan.io/tx/${hash}`)

const receipt = await publicClient.waitForTransactionReceipt({ hash })
if (!receipt.contractAddress) throw new Error('Deployment confirmed without a contract address.')

console.log('\nDeployment complete')
console.log(`Contract: ${receipt.contractAddress}`)
console.log(`Explorer: https://sepolia.etherscan.io/address/${receipt.contractAddress}`)
console.log(`\nAdd this to .env.local:\nNEXT_PUBLIC_LAND_PARCEL_ADDRESS=${receipt.contractAddress}`)
