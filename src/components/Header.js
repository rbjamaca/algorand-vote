/*global AlgoSigner*/
import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap'
import logo from '../assets/images/AlgoVote.svg'
import { CONSTANTS } from './Constants';
import algosdk, { waitForConfirmation } from 'algosdk';
import MessageAlert from './Alert';

export default function Header({ peraWallet, optedIn, setOptedIn }) {
  let client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port)
  const [alert, setAlert] = useState(false)
  const [userAccount, setUserAccount] = useState(null)
  const appIndex = CONSTANTS.APP_ID

  const connectAlgoSigner = async () => {
    // await AlgoSigner.connect()
    //     getUserAccount()
    peraWallet.connect().then((newAccounts) => {
      // setup the disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);
      checkOptedIn(newAccounts[0], CONSTANTS.APP_ID)
      setUserAccount(newAccounts)
    });
  }

  function handleDisconnectWalletClick() {
    localStorage.removeItem('walletconnect')
    localStorage.removeItem('PeraWallet.Wallet')
    setUserAccount(null)
  }

  useEffect(() => {
    // reconnect to session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

      if (accounts.length) {
        checkOptedIn(accounts[0], appIndex)
        setUserAccount(accounts);
      }
    })

  }, []);


  //OPTIN
  // create unsigned transaction
  const Optin = async (sender, index) => {
    try {
      console.log(sender)
      const suggestedParams = await client.getTransactionParams().do();
      const optInTxn = algosdk.makeApplicationOptInTxn(
        sender,
        suggestedParams,
        index
      );
      const actionTxGroup = [{ txn: optInTxn, signers: [sender] }];

      const signedTx = await peraWallet.signTransaction([actionTxGroup]);
      console.log(signedTx);
      const { txId } = await client.sendRawTransaction(signedTx).do();
      const result = await waitForConfirmation(client, txId, 2);
      console.log(`Success`);
      setOptedIn(true)
    } catch (e) {
      console.error(`There was an error calling the app: ${e}`);
    }
  }

  const checkOptedIn = async (sender, index) => {
    try {
      let appInfo = await client.accountApplicationInformation(sender, index).do();
      if (appInfo['app-local-state']) {
        setOptedIn(true)
      }
    } catch (e) {
      setOptedIn(false)
      // console.error(`There was an error calling the app: ${e}`);
    }
  }


  const register = () => {
    console.log(userAccount)
    if (userAccount === null) {
      // alert("Connect your wallet")
      setAlert(true)
    } else {
      Optin(userAccount[0], CONSTANTS.APP_ID)
    }

  }
  const handleClose = () => {
    setAlert(false)
  }
  return (
    <div style={{ backgroundColor: '#E9E9E9' }}>
      <Container style={{ marginTop: '24px' }}>
        <Row>
          <Col>
            <img src={logo} alt='vote' />
          </Col>
          <Col>
            <div>
              {/* <label for="StartDate">Start Date</label> */}
              {/* <input type="date" id="start" name="startDate" value={startDate} onChange={(e) => setStartDate(e.currentTarget.value)}/> */}
              {/* <h5>Reg Time</h5> */}
            </div>
            <div>
              {/* <label for="EndDate">End Date</label> */}
              {/* <h5>Vote Time</h5> */}
              {/* <input type="date" id="end" name="endDate" value={endDate} onChange={(e) => setEndDate(e.currentTarget.value)}/> */}
            </div>
          </Col>
          <Col md='4' style={{ display: 'inline' }}>
            {/* <h4>Voting Ends in </h4> */}
            {!optedIn && <Button style={{ backgroundColor: 'black' }} onClick={() => register()}>Register</Button>}
            {/* <h4 id='demo' style={{color: 'red'}}></h4> */}
            <MessageAlert show={alert} close={() => handleClose()} variant={"danger"} title="Connect Wallet" message="Please connect your wallet" />
          </Col>
          <Col md='auto'>
            {!userAccount ? <Button style={{ backgroundColor: '#F28FA9', borderColor: '#F28FA9' }} onClick={connectAlgoSigner}>Connect Wallet</Button> : <Button style={{ backgroundColor: '#F28FA9', borderColor: '#F28FA9' }} onClick={handleDisconnectWalletClick}>Disconnect</Button>}
          </Col>
        </Row>
      </Container>
    </div>
  )
}