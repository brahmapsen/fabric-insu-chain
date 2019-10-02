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

var logger = shim.NewLogger("userauth chaincode")

// SmartContract struct
type SmartContract struct {
}

//**********************************************************************************************************
//User struct
//**********************************************************************************************************
//

type User struct {
	UserNameID     string `json:"UserNameID"`
	PhysicianID    string `json:"PhysicianID"`
	PatientID      string `json:"PatientID"`
	FirstName      string `json:"FirstName"`
	MiddleName     string `json:"MiddleName"`
	LastName       string `json:"LastName"`
	ProviderName   string `json:"ProviderName"`
	EnrollType     string `json:"EnrollType"`
	Gender         string `json:"Gender"`
	Ssn            string `json:"Ssn"`
	ConsentTo      string `json:"ConsentTo"`
	SharedUnit     string `json:"SharedUnit"`
	DateOfBirth    string `json:"DateOfBirth"`
	PlaceOfBirth   string `json:"PlaceOfBirth"`
	EmailID        string `json:"EmailID"`
	PublicKey      string `json:"PublicKey"`
	MobilePhone    string `json:"MobilePhone"`
	HomePhone      string `json:"HomePhone"`
	StreetAddress1 string `json:"StreetAddress1"`
	StreetAddress2 string `json:"StreetAddress2"`
	City           string `json:"City"`
	State          string `json:"State"`
	Country        string `json:"Country"`
	Zipcode        string `json:"Zipcode"`
	PrivateKey     string `json:"PrivateKey"`
	InvitationCode string `json:"InvitationCode"`
	Status         string `json:"Status"`
	PatientCount   string `json:"PatientCount"`
	Timestamp      string `json:"Timestamp"`
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
	} else if function == "recordNewUser" {
		return s.recordNewUser(APIstub, args)
	} else if function == "updateUser" {
		return s.updateUser(APIstub, args)
	} else if function == "queryAllUser" {
		return s.queryAllUser(APIstub, args)
	} else if function == "queryUserpasswd" {
		return s.queryUserpasswd(APIstub, args)
	} else if function == "queryEmailid" {
		return s.queryEmailid(APIstub, args)
	} else if function == "queryUser" {
		return s.queryUser(APIstub, args)
	} else if function == "queryUserCount" {
		return s.queryUserCount(APIstub)
	} else if function == "queryUserStatus" {
		return s.queryUserStatus(APIstub, args)
	} else if function == "queryUserOnCompany" {
		return s.queryUserOnCompany(APIstub, args)
	} else if function == "queryUserState" {
		return s.queryUserState(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name HOTCH dog.")
}

//**********************************************************************************************************
//initledger
//**********************************************************************************************************

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	logger.Info("########### userauth chaincode InitLedger ###########")

	return shim.Success(nil)
}

//**********************************************************************************************************
//recording new userauth into  ledger
//**********************************************************************************************************

func (s *SmartContract) recordNewUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	logger.Info("########### userauth chaincode Invoke(recordNewUser) ###########")
	// bargs := ToChaincodeArgs(args...) //getting array into 2d array
	//getting args list as a json format
	var err error
	if len(args) != 1 {
		str := fmt.Sprintf("Incorrect no of args %d.", len(args))
		fmt.Println(str)
		return shim.Error(str)
	}
	data := &User{}
	err = json.Unmarshal([]byte(args[0]), data)
	if err != nil {
		str := fmt.Sprintf("Failed to parse json :%+v", err)
		fmt.Println(str)
		return shim.Error(str)
	}

	dataAsBytes, err := APIstub.GetState(data.UserNameID)
	if err != nil {
		str := fmt.Sprintf("Failed to get: %s", data.UserNameID)
		fmt.Println(str)
		return shim.Error(str)
	} else if dataAsBytes != nil {
		str := fmt.Sprintf("Record already exists: %s", data.UserNameID)
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
	err = APIstub.PutState(data.UserNameID, dataAsByte)
	if err != nil {
		str := fmt.Sprintf("Couldnot put state %+v", err.Error())
		fmt.Println(str)
		return shim.Error(str)

	}

	return shim.Success(nil)

}

//**********************************************************************************************************
//query User based on User No
//**********************************************************************************************************
func (s *SmartContract) queryUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	// if len(args) != 2 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
	// }
	logger.Info("BPS-GO-queryUser")
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
		data := User{}

		json.Unmarshal(queryResponse.Value, &data)
		if data.EmailID == args[0] {
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

	fmt.Printf("- queryUser:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

//**********************************************************************************************************
//query User based on User No
//**********************************************************************************************************
func (s *SmartContract) queryUserpasswd(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	// if len(args) != 2 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 1")
	// }
	logger.Info("BPS-GO-queryUserpasswd")
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
		data := User{}

		json.Unmarshal(queryResponse.Value, &data)
		if data.EmailID == args[0] && data.PrivateKey == args[1] && data.EnrollType == args[2] {
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

	fmt.Printf("- queryUser:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

//**********************************************************************************************************
//query User based on User No
//**********************************************************************************************************
func (s *SmartContract) queryEmailid(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
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
		data := User{}

		json.Unmarshal(queryResponse.Value, &data)
		if data.EmailID == args[0] {
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

	fmt.Printf("- queryUser:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

//***********************************************************************************************************
//query for User count
//***********************************************************************************************************

func (s *SmartContract) queryUserCount(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := ""
	endKey := ""

  logger.Info("BPS-GO-queryUserCount")
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

//*********************************************************************************************************
//queryInvCountBasedOnStatus
//**********************************************************************************************************
func (s *SmartContract) queryUserStatus(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
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
		user := User{}
		json.Unmarshal(queryResponse.Value, &user)
		if user.Status == args[0] {
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

	fmt.Printf("- queryUserOnStatus:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

//*********************************************************************************************************
//queryInvCountBasedOnStatus
//**********************************************************************************************************
func (s *SmartContract) queryUserOnCompany(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
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
		user := User{}
		json.Unmarshal(queryResponse.Value, &user)
		if user.ProviderName == args[0] {
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

	fmt.Printf("- queryUserOnCompany:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

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
//queryAllUser
//**********************************************************************************************************

func (s *SmartContract) queryAllUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

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

	fmt.Printf("- queryAllUser:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())

}

//**********************************************************************************************************
//recording new userauth into  ledger
//**********************************************************************************************************

func (s *SmartContract) updateUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	logger.Info("########### userauth chaincode Invoke(updateUser) ###########")
	// bargs := ToChaincodeArgs(args...) //getting array into 2d array
	//getting args list as a json format
	var err error
	if len(args) != 1 {
		str := fmt.Sprintf("Incorrect no of args %d.", len(args))
		fmt.Println(str)
		return shim.Error(str)
	}
	data := &User{}
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
	err = APIstub.PutState(data.UserNameID, dataAsByte)
	if err != nil {
		str := fmt.Sprintf("Couldnot put state %+v", err.Error())
		fmt.Println(str)
		return shim.Error(str)

	}

	return shim.Success(nil)

}

//*********************************************************************************************************
//query user state
//**********************************************************************************************************
func (s *SmartContract) queryUserState(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	var A string // Entities
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting name of the person to query")
	}

	A = args[0]

	// Get the state from the ledger
	Avalbytes, err := APIstub.GetState(A)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + A + "\"}"
		return shim.Error(jsonResp)
	}

	if Avalbytes == nil {
		jsonResp := "{\"Error\":\"Nil amount for " + A + "\"}"
		return shim.Error(jsonResp)
	}

	jsonResp := "{\"Name\":\"" + A + "\",\"Details\":\"" + string(Avalbytes) + "\"}"
	logger.Infof("Query Response:%s\n", jsonResp)
	return shim.Success(Avalbytes)
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
