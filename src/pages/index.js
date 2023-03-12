import '../styles/Home.module.css'

import { ethers } from 'ethers/lib'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import { nftmarketaddress } from '../../config'
import NFTMarketplace from '../../artifacts/contracts/NFTMarket.sol/NFTMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider()
    const nftContract = new ethers.Contract(nftmarketaddress, NFTMarketplace.abi, provider)
    const data = await nftContract.fetchMarketItems()
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await nftContract.tokenURI(i.tokenId)
      console.log(tokenUri)
      const meta = await axios.get(tokenUri)
      console.log(meta.data)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.keyvalues.image,
        name: meta.data.keyvalues.name, 
        description: meta.data.keyvalues.description,
      }
      return item
    }))
    console.log("nfts", items)
    setNfts(items)
    setLoadingState('loaded')
  }

  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, NFTMarketplace.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })

    await transaction.wait()
    loadNFTs()
  }

  if(loadingState === 'loaded' && !nfts.length) return (
    <h1 className='px-20 py-10'>No items in marketplace</h1>
  )

  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{maxWidth: '1600px'}}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <img src={nft.image} />
                  <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price} MATIC</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
