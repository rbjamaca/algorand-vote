import MainContent from "./Main";
import Header from "./Header";
import { PeraWalletConnect } from '@perawallet/connect';
import { useState } from "react";
const peraWallet = new PeraWalletConnect();

export default function Home(){
  const [optedIn, setOptedIn] = useState(false)

  return(
    <div style={{ backgroundColor: '#E9E9E9' }}>
      <Header peraWallet={peraWallet} optedIn={optedIn} setOptedIn={setOptedIn} />
      <MainContent peraWallet={peraWallet} optedIn={optedIn} />
    </div>
  )
}