import MainContent from "./Main";
import Header from "./Header";
import { PeraWalletConnect } from '@perawallet/connect';
const peraWallet = new PeraWalletConnect();

export default function Home(){
  return(
    <div style={{ backgroundColor: '#E9E9E9' }}>
      <Header peraWallet={peraWallet} />
      <MainContent peraWallet={peraWallet} />
    </div>
  )
}