package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

var logger = shim.NewLogger("Contractauth chaincode")

// SmartContract struct
type SmartContract struct {
}

//**********************************************************************************************************
//Contract struct
//**********************************************************************************************************
//

type Contract struct {
	ContractHash      string `json:"ContractHash"`
	ContractID        string `json:"ContractID"`
	PatientID         string `json:"PatientID"`
	CareCode          string `json:"CareCode"`
	PhysicianID       string `json:"PhysicianID"`
	ContractDate      string `json:"ContractDate"`
	ContractStatus    string `json:"ContractStatus"`
	ChargeAmount      string `json:"ChargeAmount"`
	ChargeUnit        string `json:"ChargeUnit"`
	AuthorizeContract string `json:"AuthorizeContract"`
	ActionStatus      string `json:"ActionStatus"`
	ContractCount     string `json:"ContractCount"`
	Timestamp         string `json:"Timestamp"`
}

//**********************************************************************************************************
//ToChaincodeArgs converts array to two-dimensional byte array
//**********************************************************************************************************

func ToChaincodeArgs(args ...string) [][]byte {
	bargs := make([][]byte, len(args))
	for i, arg := range args {
		bargs[i] = []byte(arg)
	}
	return bargs

}

//**********************************************************************************************************
//Init SmartContract
//**********************************************************************************************************

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

//Invoke SmartContract
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordNewContract" {
		return s.recordNewContract(APIstub, args)
	} else if function == "updateContract" {
		return s.updateContract(APIstub, args)
	} else if function == "queryAllContract" {
		return s.queryAllContract(APIstub, args)
	} else if function == "queryOnPhysicianID" {
		return s.queryOnPhysicianID(APIstub, args)
	} else if function == "queryOnPatientID" {
		return s.queryOnPatientID(APIstub, args)
	} else if function == "queryContractCount" {
		return s.queryContractCount(APIstub)
	} else if function == "queryContractStatus" {
		return s.queryContractStatus(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name")
}

//**********************************************************************************************************
//initledger
//**********************************************************************************************************

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	logger.Info("########### Contract chaincode InitLedger ###########")

	return shim.Success(nil)
}

//**********************************************************************************************************
//recording new Contractauth into  ledger
//**********************************************************************************************************

func (s *SmartContract) recordNewContract(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	logger.Info("########### Contractauth chaincode Invoke(recordNewContract) ###########")
	// bargs := ToChaincodeArgs(args...) //getting array into 2d array
	//getting args list as a json format
	var err error
	if len(args) != 1 {
		str := fmt.Sprintf("Incorrect no of args %d.", len(args))
		fmt.Println(str)
		return shim.Error(str)
	}
	data := &Contract{}
	err = json.Unmarshal([]byte(args[0]), data)
	if err != nil {
		str := fmt.Sprintf("Failed to parse json :%+v", err)
		fmt.Println(str)
		return shim.Error(str)
	}

	dataAsBytes, err := APIstub.GetState(data.ContractHash)
	if err != nil {
		str := fmt.Sprintf("Failed to get: %s", data.ContractHash)
		fmt.Println(str)
		return shim.Error(str)
	} else if dataAsBytes != nil {
		str := fmt.Sprintf("Record already exists: %s", data.ContractHash)
		fmt.Println(str)
		return shim.Error(str)
	}

	dataAsByte, err := json.Marshal(data)
	fmt.Println(dataAsByte)
	if err != nil {
		str := fmt.Sprintf("could not marshal data %+v", err.Error())
		fmt.Println(str)
		return shim.Error(str)
	}
	err = APIstub.PutState(data.ContractHash, dataAsByte)
	if err != nil {
		str := fmt.Sprintf("Couldnot put state %+v", err.Error())
		fmt.Println(str)
		return shim.Error(str)

	}

	return shim.Success(nil)

}

//**********************************************************************************************************
//query Contract based on Contract No
//**********************************************************************************************************
func (s *SmartContract) queryOnPatientID(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	// if len(args) != 2 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
	// }
	startKey := ""
	endKey := ""
	//getting all records of ledger in resultIterator
	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		data := Contract{}

		json.Unmarshal(queryResponse.Value, &data)
		if data.PatientID == args[0] {
			if bArrayMemberAlreadyWritten == true {
				buffer.WriteString(",")
			}
			//writing data into buffer
			buffer.WriteString("{\"Key\":")
			buffer.WriteString("\"")
			buffer.WriteString(queryResponse.Key)
			buffer.WriteString("\"")

			buffer.WriteString(", \"Record\":")
			buffer.WriteString(string(queryResponse.Value))
			buffer.WriteString("}")
			bArrayMemberAlreadyWritten = true

		}
	}
	buffer.WriteString("]")

	fmt.Printf("- queryonPatientID:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

//**********************************************************************************************************
//query Contract based on Physician ID
//**********************************************************************************************************
func (s *SmartContract) queryOnPhysicianID(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	logger.Info("########### Contract chaincode Invoke(queryOnPhysicianID) ###########")
	// if len(args) != 2 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
	// }
	startKey := ""
	endKey := ""
	//getting all records of ledger in resultIterator
	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		data := Contract{}

		json.Unmarshal(queryResponse.Value, &data)
		if data.PhysicianID == args[0] {
			if bArrayMemberAlreadyWritten == true {
				buffer.WriteString(",")
			}
			//writing data into buffer
			buffer.WriteString("{\"Key\":")
			buffer.WriteString("\"")
			buffer.WriteString(queryResponse.Key)
			buffer.WriteString("\"")

			buffer.WriteString(", \"Record\":")
			buffer.WriteString(string(queryResponse.Value))
			buffer.WriteString("}")
			bArrayMemberAlreadyWritten = true

		}
	}
	buffer.WriteString("]")

	fmt.Printf("- queryOnPhysicianID:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}
//***********************************************************************************************************
//query for User count
//***********************************************************************************************************

func (s *SmartContract) queryContractCount(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := ""
	endKey := ""

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true

	}
	buffer.WriteString("]")
	//count no of bytes

	KeyCount := []byte(strconv.Itoa(bytes.Count([]byte(buffer.String()), []byte("Key"))))

	return shim.Success(KeyCount)
}

// //**********************************************************************************************************
// //query Contract based on Contract No
// //**********************************************************************************************************
// func (s *SmartContract) queryEmailid(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
// 	// if len(args) != 2 {
// 	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
// 	// }
// 	startKey := ""
// 	endKey := ""
// 	//getting all records of ledger in resultIterator
// 	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}
// 	defer resultsIterator.Close()
// 	var buffer bytes.Buffer
// 	buffer.WriteString("[")

// 	bArrayMemberAlreadyWritten := false
// 	for resultsIterator.HasNext() {
// 		queryResponse, err := resultsIterator.Next()
// 		if err != nil {
// 			return shim.Error(err.Error())
// 		}
// 		data := Contract{}

// 		json.Unmarshal(queryResponse.Value, &data)
// 		if data.EmailID == args[0] {
// 			if bArrayMemberAlreadyWritten == true {
// 				buffer.WriteString(",")
// 			}
// 			//writing data into buffer
// 			buffer.WriteString("{\"Key\":")
// 			buffer.WriteString("\"")
// 			buffer.WriteString(queryResponse.Key)
// 			buffer.WriteString("\"")

// 			buffer.WriteString(", \"Record\":")
// 			buffer.WriteString(string(queryResponse.Value))
// 			buffer.WriteString("}")
// 			bArrayMemberAlreadyWritten = true

// 		}
// 	}
// 	buffer.WriteString("]")

// 	fmt.Printf("- queryContract:\n%s\n", buffer.String())

// 	return shim.Success(buffer.Bytes())
// }

// //***********************************************************************************************************
// //query for Contract count
// //***********************************************************************************************************

// func (s *SmartContract) queryContractCount(APIstub shim.ChaincodeStubInterface) sc.Response {

// 	startKey := ""
// 	endKey := ""

// 	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}
// 	defer resultsIterator.Close()

// 	var buffer bytes.Buffer
// 	buffer.WriteString("[")

// 	bArrayMemberAlreadyWritten := false
// 	for resultsIterator.HasNext() {
// 		queryResponse, err := resultsIterator.Next()
// 		if err != nil {
// 			return shim.Error(err.Error())
// 		}

// 		if bArrayMemberAlreadyWritten == true {
// 			buffer.WriteString(",")
// 		}
// 		buffer.WriteString("{\"Key\":")
// 		buffer.WriteString("\"")
// 		buffer.WriteString(queryResponse.Key)
// 		buffer.WriteString("\"")
// 		buffer.WriteString("}")
// 		bArrayMemberAlreadyWritten = true

// 	}
// 	buffer.WriteString("]")
// 	//count no of bytes

// 	KeyCount := []byte(strconv.Itoa(bytes.Count([]byte(buffer.String()), []byte("Key"))))

// 	return shim.Success(KeyCount)
// }

//*********************************************************************************************************
//queryInvCountBasedOnStatus
//**********************************************************************************************************
func (s *SmartContract) queryContractStatus(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	startKey := ""
	endKey := ""
	//getting all records of ledger in resultIterator
	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		Contract := Contract{}
		json.Unmarshal(queryResponse.Value, &Contract)
		if Contract.ActionStatus == args[0] {
			if bArrayMemberAlreadyWritten == true {
				buffer.WriteString(",")
			}
			buffer.WriteString("{\"Key\":")
			buffer.WriteString("\"")
			buffer.WriteString(queryResponse.Key)
			buffer.WriteString("\"")
			buffer.WriteString(", \"Record\":")
			buffer.WriteString(string(queryResponse.Value))
			buffer.WriteString("}")
			bArrayMemberAlreadyWritten = true
		}
	}
	buffer.WriteString("]")

	fmt.Printf("- queryContractOnStatus:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

//*********************************************************************************************************
//queryContractCountBasedOnStatus
//**********************************************************************************************************
// func (s *SmartContract) queryContractOnCompany(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
// 	if len(args) != 1 {
// 		return shim.Error("Incorrect number of arguments. Expecting 1")
// 	}
// 	startKey := ""
// 	endKey := ""
// 	//getting all records of ledger in resultIterator
// 	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
// 	if err != nil {
// 		return shim.Error(err.Error())
// 	}
// 	defer resultsIterator.Close()
// 	var buffer bytes.Buffer
// 	buffer.WriteString("[")

// 	bArrayMemberAlreadyWritten := false
// 	for resultsIterator.HasNext() {
// 		queryResponse, err := resultsIterator.Next()
// 		if err != nil {
// 			return shim.Error(err.Error())
// 		}
// 		Contract := Contract{}
// 		json.Unmarshal(queryResponse.Value, &Contract)
// 		if Contract.ProviderName == args[0] {
// 			if bArrayMemberAlreadyWritten == true {
// 				buffer.WriteString(",")
// 			}
// 			buffer.WriteString("{\"Key\":")
// 			buffer.WriteString("\"")
// 			buffer.WriteString(queryResponse.Key)
// 			buffer.WriteString("\"")
// 			buffer.WriteString(", \"Record\":")
// 			buffer.WriteString(string(queryResponse.Value))
// 			buffer.WriteString("}")
// 			bArrayMemberAlreadyWritten = true
// 		}
// 	}
// 	buffer.WriteString("]")

// 	fmt.Printf("- queryContractOnCompany:\n%s\n", buffer.String())

// 	return shim.Success(buffer.Bytes())
// }

//************************************************************************************************************
////ShortDateFromString parse shot date from string
//************************************************************************************************************
func ShortDateFromString(ds string) (time.Time, error) {
	const shortDate = "2006-01-02"
	t, err := time.Parse(shortDate, ds)
	if err != nil {
		return t, err
	}
	return t, nil
}

//**********************************************************************************************************
//queryAllContract
//**********************************************************************************************************

func (s *SmartContract) queryAllContract(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	startKey := ""
	endKey := ""
	//getting all records of ledger in resultIterator
	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return shim.Error(err.Error())
		}

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		//writing data into buffer
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllContract:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())

}

//**********************************************************************************************************
//recording new Contractauth into  ledger
//**********************************************************************************************************

func (s *SmartContract) updateContract(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	logger.Info("########### Contractauth chaincode Invoke(updateContract) ###########")
	// bargs := ToChaincodeArgs(args...) //getting array into 2d array
	//getting args list as a json format
	var err error
	if len(args) != 1 {
		str := fmt.Sprintf("Incorrect no of args %d.", len(args))
		fmt.Println(str)
		return shim.Error(str)
	}
	data := &Contract{}
	err = json.Unmarshal([]byte(args[0]), data)
	if err != nil {
		str := fmt.Sprintf("Failed to parse json :%+v", err)
		fmt.Println(str)
		return shim.Error(str)
	}

	dataAsByte, err := json.Marshal(data)
	fmt.Println(dataAsByte)
	if err != nil {
		str := fmt.Sprintf("could not marshal data %+v", err.Error())
		fmt.Println(str)
		return shim.Error(str)
	}
	err = APIstub.PutState(data.ContractHash, dataAsByte)
	if err != nil {
		str := fmt.Sprintf("Couldnot put state %+v", err.Error())
		fmt.Println(str)
		return shim.Error(str)

	}

	return shim.Success(nil)

}

//************************************************************************************************************
////ShortDateFromString parse shot date from string
//************************************************************************************************************
// func ShortDateFromString(ds string) (time.Time, error) {
// 	const shortDate = "2006-01-02"
// 	t, err := time.Parse(shortDate, ds)
// 	if err != nil {
// 		return t, err
// 	}
// 	return t, nil
// }

//**********************************************************************************************************
//main starts here
//**********************************************************************************************************
func main() {
	//main starts
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
