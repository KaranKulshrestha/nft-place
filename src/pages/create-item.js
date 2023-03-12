import { useState } from "react"
import { ethers } from "ethers/lib"
import axios from "axios"
const FormData = require('form-data')
import { useRouter } from "next/router"
import Web3Modal from 'web3modal'

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlODc4YWM1Ny1kMGM5LTQ3NzgtODc4Mi1iZGVjOGExMTIxNGMiLCJlbWFpbCI6ImthcmFua3VseEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMjdiN2UzMDQ1ODRiMjY5YTM2OWYiLCJzY29wZWRLZXlTZWNyZXQiOiI0YjA0N2EwOWI1MTY1N2NkYTczMGU4Njk3NDcyM2U5ZDEwYzZlN2U1NzMyNGI1MzY4YTRmNTUzYzVmMGYzMDZiIiwiaWF0IjoxNjc4NTAzNTIyfQ.KuHOujcE81GFMXWvtUx7KJbzjpo3ILXHIZU-O5L6IIk'

import {
    nftmarketaddress
  } from '../../config'

import NFTMarketplace from '../../artifacts/contracts/NFTMarket.sol/NFTMarketplace.json'

export default function CreateItem() {
    const [file, setFile] = useState(null);
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()

    console.log(formInput['price'])

    async function onChange(e) {
        const fileImg = e.target.files[0]
        setFile(fileImg)
    }

    async function uploadToIPFS() {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    'pinata_api_key': '27b7e304584b269a369f',
                    'pinata_secret_api_key': '4b047a09b51657cda730e86974723e9d10c6e7e57324b5368a4f553c5f0f306b',
                    "Content-Type": "multipart/form-data"
                },
            });
            const ImgHash = `https://ipfs.io/ipfs/${resFile.data.IpfsHash}`;
            console.log(resFile.data)

            const data = JSON.stringify({
                "pinataOptions": {
                  "cidVersion": 1
                },
                "pinataMetadata": {
                  "name": formInput.name,
                  "keyvalues": {
                    "name": formInput.name,
                    "description": formInput.description,
                    "price": formInput.price,
                    "image": ImgHash,
                  }
                },
                "pinataContent": {
                    "name": formInput.name,
                    "keyvalues": {
                    "name": formInput.name,
                    "description": formInput.description,
                    "price": formInput.price,
                    "image": ImgHash,
                }
              }
            });

              var config = {
                method: 'post',
                url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                headers: { 
                  'Content-Type': 'application/json', 
                  'pinata_api_key': '27b7e304584b269a369f',
                  'pinata_secret_api_key': '4b047a09b51657cda730e86974723e9d10c6e7e57324b5368a4f553c5f0f306b',
                },
                data : data
              };

              const res = await axios(config);
              const DataHash = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
              console.log(DataHash);

            return DataHash
        } catch (error) {
            console.log("Error sending File to IPFS: ")
            console.log(error)
        } 
      }

      async function listNFTForSale() {
        const url = await uploadToIPFS()
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
    
        /* next, create the item */
        const price = ethers.utils.parseUnits(formInput.price, 'ether')
        let contract = new ethers.Contract(nftmarketaddress, NFTMarketplace.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()
        let transaction = await contract.createToken(url, price, { value: listingPrice })
        await transaction.wait()
       
        router.push('/')
      }

    return (
        <div className="flex justify-center">
          <div className="w-1/2 flex flex-col pb-12">
            <input 
              placeholder="Asset Name"
              className="mt-8 border rounded p-4"
              onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
            />
            <textarea
              placeholder="Asset Description"
              className="mt-2 border rounded p-4"
              onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
            />
            <input
              placeholder="Asset Price in Eth"
              className="mt-2 border rounded p-4"
              onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
            />
            <input
              type="file"
              name="Asset"
              className="my-4"
              onChange={onChange}
            />
            <button className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg" onClick={listNFTForSale}>
              Create NFT
            </button>
          </div>
        </div>
      )

}