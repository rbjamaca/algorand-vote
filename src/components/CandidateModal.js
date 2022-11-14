/*global AlgoSigner*/
import { useState, useRef } from 'react';
import {Modal, Button} from 'react-bootstrap'
import styled from 'styled-components';
import algosdk, {waitForConfirmation} from'algosdk';
import { CONSTANTS } from './Constants';

const RadioContainer = styled.div`
  border: 0.5px solid black;
  padding: 8px;
  margin: 24px;
  display: flex;
  justify-content: space-between;
  flex-direction: row-reverse;
  &:hover {
    background-color: #F28FA9;
    color: white;
  }
  .title{
    font-size: 24px;
    padding: 8px;
  }
`


export default function CandidateModal(props){
  const { peraWallet } = props
  const [radioValue, setRadioValue] = useState(0);
  const [userAccount, setUserAccount] = useState(null)

  const radios = [
    { name: 'Lalisa Manobal', value: 'Lalisa Manobal', party: 'LALISA'},
    { name: 'Rosé Park Chaeyoung', value: 'Rosé Park Chaeyoung', party: 'ROSÉ' },
    { name: 'Kim Jisoo', value: 'Kim Jisoo', party: 'RABBIT' },
    { name: 'Jennie Kim', value: 'Jennie Kim', party: 'MANDU' },
  ];

  
// const endDate = localStorage.getItem("endDate")
let client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port)

  //  CALL(NOOP)
// call application with arguments
const noop = async (index, choice)  => {
  try{
    const userAccount = await peraWallet.reconnectSession()
    console.log(userAccount, 'userAccount')
    setUserAccount(userAccount)
    const sender = userAccount[0]

    let vote = "vote"
    // let choice = localStorage.getItem("candidate")
    // console.log("choice is " + choice)
    const appArgs = []
    appArgs.push(
      new Uint8Array(Buffer.from(vote)),
      new Uint8Array(Buffer.from(choice)),
    )
    let params = await client.getTransactionParams().do()
    const suggestedParams = await client.getTransactionParams().do();

    // create unsigned transaction
    let actionTx = algosdk.makeApplicationNoOpTxn(sender, suggestedParams, index, appArgs)
    // Sign the transaction

    // Use the AlgoSigner encoding library to make the transactions base64
    // const txn_b64 = await AlgoSigner.encoding.msgpackToBase64(txn.toByte());

    // let signedTxs  = await AlgoSigner.signTxn([{txn: txn_b64}])
    // console.log(signedTxs)
    
    // // Get the base64 encoded signed transaction and convert it to binary
    // let binarySignedTx = await AlgoSigner.encoding.base64ToMsgpack(signedTxs[0].blob);

    // // Send the transaction through the SDK client
    // let txId = await client.sendRawTransaction(binarySignedTx).do();
    //   console.log(txId)

    // const confirmedTxn = await algosdk.waitForConfirmation(client, txId, 4);
    const actionTxGroup = [{ txn: actionTx, signers: [sender] }];

    const signedTx = await peraWallet.signTransaction([actionTxGroup]);
    console.log(signedTx);
    const { txId } = await client.sendRawTransaction(signedTx).do();
    const confirmedTxn = await waitForConfirmation(client, txId, 2);
    console.log("confirmed" + confirmedTxn)

    //Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // display results
    let transactionResponse = await client.pendingTransactionInformation(txId).do();
    console.log("Called app-id:",transactionResponse['txn']['txn']['apid'])
    if (transactionResponse['global-state-delta'] !== undefined ) {
        console.log("Global State updated:",transactionResponse['global-state-delta']);
    }
    if (transactionResponse['local-state-delta'] !== undefined ) {
        console.log("Local State updated:",transactionResponse['local-state-delta']);
    }
    props.onHide()
  }catch(err){
    props.onHide()
    console.log(err)
    alert('You have already voted.')
  }
}

const submitVoteHandler = ()=>{
  const value= radioValue
   console.log(value)
   noop(CONSTANTS.APP_ID, value)
 }

  return(
    <div>
         <Modal
      show= {props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          BlackPink Members
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div>
        {  
        radios.map((radio, idx) => (
            <RadioContainer key={idx} >
              <input type="radio" id={radio.name} name="candidates" value={radio.value} checked={radioValue === radio.value}
            onChange={(e) => setRadioValue(e.currentTarget.value)}/>
                <label className='title' htmlFor={radio.name}>
                  {radio.name}
                  <p>{radio.party}</p>
                </label>
            </RadioContainer>
          ))}
      </div>
      </Modal.Body>
       <Modal.Footer>
        <Button style={{backgroundColor: '#F28FA9', borderColor: '#F28FA9'}} onClick={() =>submitVoteHandler()}>Submit Vote</Button>
      </Modal.Footer>
      
    </Modal>
    </div>
  )
}

 