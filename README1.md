cryptogen generate --config=./crypto-config.yaml

export FABRIC_CFG_PATH=$PWD

mkdir channel-artifacts

configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./genesis.block

configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel1.tx -channelID channel1

configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./Org1MSPanchors.tx -channelID channel1 -asOrg Org1MSP

configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./Org2MSPanchors.tx -channelID channel1 -asOrg Org2MSP

docker-compose -f docker-compose-cli.yaml up -d

docker exec -it cli bash

peer channel create -o orderer.be.fujitsu.com:7050 -c channel1 -t 10 -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/be.fujitsu.com/orderers/orderer.be.fujitsu.com/msp/tlscacerts/tlsca.be.fujitsu.com-cert.pem

peer channel join -b channel1.block

CORE_PEER_ADDRESS=peer1.bic.be.fujitsu.com:7051 CORE_PEER_LOCALMSPID="BICorgMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bic.be.fujitsu.com/peers/peer1.bic.be.fujitsu.com/tls/ca.crt peer channel join -b channel1.block

CORE_PEER_ADDRESS=peer2.bic.be.fujitsu.com:7051 CORE_PEER_LOCALMSPID="BICorgMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/bic.be.fujitsu.com/peers/peer2.bic.be.fujitsu.com/tls/ca.crt peer channel join -b channel1.block

peer channel update -o orderer.be.fujitsu.com:7050 -c channel1 -f ./channel-artifacts/BICorgMSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/be.fujitsu.com/orderers/orderer.be.fujitsu.com/msp/tlscacerts/tlsca.be.fujitsu.com-cert.pem

