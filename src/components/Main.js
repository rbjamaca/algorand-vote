import { useState} from 'react'
import {Button, Row, Col, Container} from 'react-bootstrap'
import styled from 'styled-components'
import vote from '../assets/images/bp.jpeg'
import voting from '../assets/images/voting.svg'
import select from '../assets/images/select.svg'
import result from '../assets/images/result.svg'
import wallet from '../assets/images/wallet.svg'
import CandidateModal from './CandidateModal'
import ResultModal from './ResultModal'
import { CONSTANTS } from './Constants'
import algosdk from'algosdk';
import MessageAlert from './Alert'

const Wrapper = styled.div`
  display: flex;
  background-color: #E9E9E9;
`
const Title = styled.h1`
  color: #F28FA9;
  font-size: 77px;
  font-weight: 600;
  margin-top: 100px;
`
const SubText = styled.p`
  font-size: 24px;
  margin: 24px 0;
`
const SubHeading = styled.h4`
  text-align: center;
  margin: 48px;
`
export default function MainContent({peraWallet, optedIn}){
  const [showCandidate, setShowCandidate] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [data, setData] = useState([])
  const [alert, setAlert] = useState(false)
  const [loading, setLoading] = useState("")

   const client = new algosdk.Algodv2(CONSTANTS.algodToken, CONSTANTS.baseServer, CONSTANTS.port)
// read global state of application
  const readGlobalState = async (index) => {
    try{
      let applicationInfoResponse = await client.getApplicationByID(index).do();
      let globalState = applicationInfoResponse['params']['global-state']
      return globalState.map((state) =>{
        return state
      })
    }catch(err){
      console.log(err)
    }
  }
  const args = [
    btoa("RegBegin"),
    btoa("RegEnd"),
    btoa("VoteBegin"),
    btoa("VoteEnd"),
    btoa("Creator"),
  ]

  const candidateHandler = () => {
    if (!optedIn) {
      setAlert(true)
      return
    }
    setShowCandidate(true)
  }

  const handleClose = () => {
    setAlert(false)
  }

  const resultHandler = async () =>{
      let filteredItems = []
      setLoading("loading...")
      const gloablState = await readGlobalState(CONSTANTS.APP_ID)
      gloablState.forEach(item => {
      if (!args.includes(item.key)) {
        filteredItems.push(item)
        setData(filteredItems)
        setLoading("")
      }
    })
    setShowResult(true)
  }

  // // Code to get the winner with the highest vote count
  // let maxVote = filteredItems.reduce((max, item) => max.value.uint > item.value.uint ? max.key : item);
  // console.log(atob("ghello" + maxVote))
  // setWinner(maxVote)
  return(
    <Wrapper> 
      <Container>
      <Row>
        <Col>
          <MessageAlert show={alert} close={() => handleClose()} variant={"danger"} title="Register First" message="Please register first before voting." />
          <Title>Algorand BlackPink Popularity Vote</Title>
          <SubText>Who's your bias?</SubText>
          <Button style={{backgroundColor: '#F28FA9', borderColor: '#F28FA9', borderWidth: '1px'}} onClick={candidateHandler}>VOTE NOW</Button>
          <Button style={{backgroundColor: 'transparent', borderColor: '#F28FA9', borderWidth: '1px', color: '#F28FA9',  marginLeft:'24px'}} onClick={resultHandler}> RESULT</Button>
          <CandidateModal peraWallet={peraWallet} show={showCandidate} onHide={() => setShowCandidate(false)}/>
          <ResultModal show={showResult} onHide={() => setShowResult(false)} data={data} loading={loading}/>
        </Col>
      </Row>
      <SubHeading>HOW TO VOTE</SubHeading>
      <Row className="justify-content-md-evenly">
        <Col md='auto'>
          <img src={wallet}  style={{marginBottom: '24px'}} width='48px' height='48px' alt='wallet'/> 
           <h5>Connect your wallet</h5>
           </Col>
           <Col md='auto'>
          <img src={select} style={{marginBottom: '24px'}} width='48px' height='48px' alt='select candidate'/> 
          <h5>Register</h5>
          </Col>
        {/* <Col md='auto'>
          <img src={select} style={{marginBottom: '24px'}} width='48px' height='48px' alt='select candidate'/> 
          <h5>Select preferred candidate</h5>
          </Col> */}
        <Col md='auto'>
          <img src={voting}  style={{marginBottom: '24px'}} alt='voting' width='48px' height='48px'/>  
          <h5>Submit vote</h5>
        </Col>
        <Col md='auto'>
          <img src={result} style={{marginBottom: '24px'}} alt='result' width='48px' height='48px'/> 
          <h5>Check result</h5>
          </Col>
      </Row>
      </Container>  
    </Wrapper>
  )
}