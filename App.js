import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal'; // or any other library you prefer
import { Table, Row, Rows } from 'react-native-table-component';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Contacts from 'react-native-contacts';




export default function App() {

  const [message, setMessage] = useState("We are creating a book of supportive letters and nice pictures (or 'Bundl') for Dan G. It will only take you a minute to write and submit your letter. It should make for an unforgettable gift that shares our collective love and appreciation. Don't be the last to submit!");
  const [parsedData, setParsedData] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [userID, setUserID] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [newStudent, setNewStudent] = useState(null);
  const [pictureSubmitted, setPictureSubmitted ] = useState(false);
  const [isTableModalVisible, setIsTableModalVisible] = useState(false);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [hover, setHover] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailBody, setEmailBody] = useState('');
  const [emailSubject, setEmailSubject] = useState("Contribute please - 3 days left!");
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [values, setValues] = useState([]);
  const [modalData, setModalData] = useState("");
  const [ submission, setSubmission ] = useState("");
  const [openGmail, setOpenGmail] = useState(false)
  const [ gmailContacts, setGmailContacts ] = useState([{}]);
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [layout, setLayout] = useState('');
  const [msg, setMsg] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastEmailSent, setLastEmailSent] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [pictureUrl, setPictureUrl] = useState(null);
  const [viewPicture, setViewPicture] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isPromptModalVisible, setIsPromptModalVisible] = useState(false);
  const [prompts, setPrompts] = useState([
    "How has Jimmy affected your life?",
    "What do you love about Jimmy?",
    "What's your favorite memory with Jimmy?",
    "How has Jimmy inspired you?",
    "What do you wish for Jimmy's future?"
  ]);
  const [longMessage, setLongMessage] = useState('');
  const [token, setToken] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [userData, setUserData] = useState(null);
  const [recipientFullName, setRecipientFullName] = useState("");
  const [recipientFirstName, setRecipientFirstName] = useState("");
  const [recipientlastName, setRecipientLastName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [googleContacts, setGoogleContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactCount, setContactCount] = useState(0); // Initialize to 0 or the initial number of contacts
  const [nextId, setNextId] = useState(0); // Initialize to 0 or the initial next ID
  const [ text, setText] = useState("Join us in creating a 'Bundl' of loving letters & pics for Dan G. It's a quick, fun way to share our support and appreciation. Look out for an email from dan@givebundl.com with instructions. Don't miss out!");
  const [updateLocalStorageFunction, setUpdateLocalStorageFunction] = useState(() => () => {});

  const tableHead = ['Head1', 'Head2', 'Head3']; // Replace with your table headers
  const tableData = [
    ['1', '2', '3'],
    ['a', 'b', 'c'],
    ['1', '2', '3'],
    ['a', 'b', 'c']
  ]; // Replace with your table data

  const columns = [
    {
      key: "1",
      title: "ID",
      render: (_, __, index) => index + 1,
    },
    {
      key: "2",
      title: "Name",
      dataIndex: "name",
    },
    {
      key: "3",
      title: "Email",
      dataIndex: "email",
    },
    {
      key: "4",
      title: "SMS",
      dataIndex: "sms",
    },
    {
      key: "9",
      title: "Actions",
      render: (record) => {
        return (
          <>
            <EditOutlined
              onClick={() => {
                onEditStudent(record);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                onDeleteStudent(record);
              }}
              style={{ color: "red", marginLeft: 12 }}
            />
          </>
        );
      },
    },
  ];
    

    const showTableModal = () => {
      setIsTableModalVisible(true);
    };
    
    const handleTableModalOk = () => {
      setIsTableModalVisible(false);
    };
    
    const handleTableModalCancel = () => {
      setIsTableModalVisible(false);
    };
    ;

    const addContactToList = async (contact, index) => {
      const newContact = {
        id: dataSource.length + index + 1, // This will increment the ID for each new contact
        name: contact.names[0].displayName,
        email: prioritizeEmail(contact.emailAddresses), // Use the prioritizeEmail function here
        sms: '', // Changed "address" to "sms"
      };
    
      // Check if a contact with the same name already exists in the dataSource
      if (dataSource.some(existingContact => existingContact.name === newContact.name)) {
        console.log(`A contact with the name ${newContact.name} already exists.`);
        return;
      }
    
      // Add the new contact to the dataSource state
      setDataSource(prevDataSource => [...prevDataSource, newContact]);
    
      // Increment the contact count
      setContactCount(prevCount => prevCount + 1);
    };


const prioritizeEmail = (emailAddresses) => {
  if (!emailAddresses || emailAddresses.length === 0) return '';
  const sortedEmails = emailAddresses.sort((a, b) => {
    if (a.value.endsWith('.com') && b.value.endsWith('.edu')) return -1;
    if (a.value.endsWith('.edu') && b.value.endsWith('.com')) return 1;
    return 0;
  });
  return sortedEmails[0].value;
};


const filteredContacts = googleContacts.filter(contact => {
  const hasEmail = contact.emailAddresses && contact.emailAddresses.length > 0;
  const matchesSearchTerm = contact.names && contact.names.some(name => name.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
  return hasEmail && matchesSearchTerm;
});

const handleSearch = event => {
  setSearchTerm(event.target.value);
};

useEffect(() => {
  // Define a function that updates localStorage
  const updateLocalStorage = (data) => {
    if (typeof window !== 'undefined') {
       AsyncStorage.setItem('csvData', JSON.stringify(data));
    }
  };

  // Set the function in state so it can be used outside of this effect
  setUpdateLocalStorageFunction(() => updateLocalStorage);
}, []);

// useEffect(() => {
// if (typeof window !== 'undefined') {
//   const storedCsvData =  AsyncStorage.getItem('csvData');

//   if (storedCsvData) {
//     const parsedData = JSON.parse(storedCsvData);
//     console.log("parsed Data =", parsedData);
//     setParsedData(parsedData);
//     setDataSource(parsedData); // Set the parsed data to the dataSource state
//     setContactCount(parsedData.length); // Set the contact count to the length of the dataSource
//   }
// }
// }, []);


// In your component's useEffect hook
useEffect(() => {
const isAuthenticating =  AsyncStorage.getItem('isAuthenticating');
if (isAuthenticating === 'true') {
  setIsAuthenticated(true);
  AsyncStorage.removeItem('isAuthenticating'); // Remove the flag from local storage once it has been checked
}
}, []);

const changeHandler = (event) => {
// Passing file data (event.target.files[0]) to parse using Papa.parse
console.log('event.target.files[0]', event.target.files[0])
Papa.parse(event.target.files[0], {
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    const rowsArray = [];
    const valuesArray = [];

    // Iterating data to get column name and their values
    results.data.map((d) => {
      rowsArray.push(Object.keys(d));
      valuesArray.push(Object.values(d));
    });

    // Parsed Data Response in array format
    setParsedData(results.data);

    // Filtered Column Names
    setTableRows(rowsArray[0]);

    // Filtered Values
    setValues(valuesArray);
    console.log('values = '+ values)
    console.log('parsedData = '+ parsedData)

    // Use the function from state to update AsyncStorage
    updateLocalStorageFunction(results.data);
  },
});
setCsvUploaded(true);
};


const handleContactSelect = (contact, isSelected) => {
setSelectedContacts(prevSelectedContacts => {
  if (isSelected) {
    return [...prevSelectedContacts, contact];
  } else {
    return prevSelectedContacts.filter(c => c.resourceName !== contact.resourceName);
  }
});
};
const addSelectedContactsToList = async () => {
for (let i = 0; i < selectedContacts.length; i++) {
  await addContactToList(selectedContacts[i], i);
}
setSelectedContacts([]);
setIsModalOpen(false);
};

async function signInWithGoogle() {
  try {
    const result = await Google.logInAsync({
      androidClientId: '764289968872-54s7r83tcdah8apinurbj1afh3l0f92u.apps.googleusercontent.com',
      iosClientId: '764289968872-8spc0amg0j9n4lqjs0rr99s75dmmkpc7.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
    });

    if (result.type === 'success') {
      // Handle successful authentication here
      console.log(result.params);
      AsyncStorage.setItem('auth', JSON.stringify(result.params));
      return result.accessToken;
    } else {
      // Handle failed authentication here
      console.log(result);
      return { cancelled: true };
    }
  } catch (error) {
    console.error("error in auth" + error);
  }
}


async function fetchGoogleContacts() {
  try {
    const auth = await AsyncStorage.getItem('auth');
    if (!auth) {
      console.error('Auth token not found');
      return;
    }

    const tokens = JSON.parse(auth);
    const response = await fetch('https://yay-api.herokuapp.com/mobile/getPeople', {
      headers: {
        'Authorization': `Bearer ${tokens}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contacts = await response.json();
    setGoogleContacts(contacts);
    console.log('Google Contacts:', contacts); // Log the contacts
    setIsModalOpen(true); // Open the modal once the contacts are fetched
  } catch (error) {
    console.error('Failed to fetch Google contacts:', error);
  }
}

  function onSendSMS(time, recipient, gifter, to) {
    const url = 'https://yay-api.herokuapp.com/sms/sendSMS';
    const data = {
      time: time,
      recipient: recipient,
      gifter: gifter,
      to: to
    };
  
    fetch(url, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), 
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => {
      console.error('Error:', error);
    });
  }




  const openEmailModal = () => {
    // Get the emails of people who have not yet contributed
    const nonContributors = dataSource.filter(student => student.submitted === "No").map(student => student.email);
    setEmailRecipients(nonContributors.join(', '));
    console.log('Non-contributors:', nonContributors);
    setEmailModalVisible(true);
  };
  
 
 
  
  const handleEmailModalCancel = () => {
    setEmailModalVisible(false);
  };
  

  const closeModal = () => {
    setOpenGmail(false);
  };


  
  

  const handleClose = () => {
    setShowModal(false);
  };

  const handleChangeUpload = (info) => {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);

    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
      notification.success({
        message: 'Picture successfully uploaded',
        duration: 2,
      });
      setPictureSubmitted(true);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalOpen = (data) => {
    setModalData(data);
    console.log("data is", data)
    setShowModal(true);
  };

  const displaySubmission = (data) => {
    if (!data || !data.submission) {
      return "No submission available";
    }
  
    return (
      <div>
        <p>{data.submission}</p>
      </div>
    );
  };

  const handleViewPicture = (record) => {
    setPictureUrl(record.img_file);
    setViewPicture(true)
  };
  
  const handleClosePictureModal = () => {
    setPictureUrl(null);
    setViewPicture(false);
  };
  const addtoList = async () => {
    let objects = [];
  
    for (let i = 0; i < values.length; i ++) {
      const newContact = {
        id: dataSource.length + i + 1, // This will increment the ID for each new contact
        name: values[i][1],
        email: values[i][2],
        sms: values[i][3], // Changed "address" to "sms"
      };
  
      // Check if a contact with the same name already exists in the dataSource
      const existingContactIndex = dataSource.findIndex(existingContact => existingContact.name === newContact.name);
      if (existingContactIndex !== -1) {
        console.log(`A contact with the name ${newContact.name} already exists.`);
        // If the new contact has a phone number, update the existing contact's phone number
        if (newContact.sms) {
          dataSource[existingContactIndex].sms = newContact.sms;
        }
        continue;
      }
  
      objects.push(newContact);
    }
  
    // Add the new contacts to the dataSource state
    setDataSource(prevDataSource => [...prevDataSource, ...objects]);
  
    // Increment the contact count by the number of new contacts
    setContactCount(prevCount => prevCount + objects.length);
  };
  
    
  const handlePromptOk = async () => {
    const token = AsyncStorage.getItem('token');
    const userID = jwt_decode(token).userId;
    const url = `https://yay-api.herokuapp.com/users/${userID}/prompts`;
  
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompts, longMessage }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      console.log('Prompts updated on the server successfully');
      setIsPromptModalVisible(false);
    } catch (error) {
      console.error('Failed to update prompts on the server:', error);
    }
  };

  const handleDownloadCSV = () => {
    window.open('https://docs.google.com/spreadsheets/d/1_fXj2aWK8dXI-GgjzuObLC0crXYx7HpVGTTaQZmdj7g/edit?usp=sharing', '_blank');
  }

  const handleHoverOn = () => {
    setHover(true);
  }
  
const handleHoverOff = () => {
    setHover(false);
  }
  
  const onAddStudent = () => {
    setIsModalVisible(true);
  
    const newStudent = {
      id: dataSource[dataSource.length - 1].id + 1,
      name: name,
      email: email,
      layout: layout? layout : 1,
      msg: msg,
    };
  
    // Make a POST request to your API endpoint
    fetch(`https://yay-api.herokuapp.com/book/${userID}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStudent),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // Update the local state only after the new student has been added to the database
      setDataSource((pre) => {
        return [...pre, newStudent];
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };


  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    console.log('email sent')
    let token = AsyncStorage.getItem('token');
    if (!token) {
      // If the user is not signed in, prompt them to do so
      // You would need to implement this part based on how your sign-in system works
    } else {
      // If the user is signed in, send the email
      const recipientEmails = emailRecipients.split(',').map(email => email.trim());
  
      // Decode the JWT
      const decoded = jwt_decode(token);
  
      // Extract the sender's name and username from the decoded JWT
      const senderName = decoded.name;
      const senderEmail = decoded.username;
      const userID = decoded.userId;
  
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Use the new token
        },
        body: JSON.stringify({
          senderName,
          senderEmail,
          emailSubject, // Use the emailSubject state variable
          emailBody, // Use the emailBody state variable
          recipientEmails,
          userID,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      console.log('Email sent successfully');
      setIsSendingEmail(false);
      setEmailModalVisible(false);
      setShowSuccessModal(true);
  
      // Create a new date only if lastEmailSent is null
      let newDate;
      newDate = moment().toDate();
      AsyncStorage.setItem('lastEmailSent', newDate);
  
        // Update lastEmailed attribute in the backend
        await fetch(`https://yay-api.herokuapp.com/users/${userID}/lastEmailed`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lastEmailed: newDate,
          }),
        });
  
        // Format the new date and update the lastEmailSent state variable
        setLastEmailSent(moment(newDate).format('MMMM Do, YYYY @ h:mm A'));
    }
  };
  


  const onEditStudent = (record) => {
    setIsEditing(true);
    setEditingStudent({ ...record });
  };
  
  
  const onDeleteStudent = (record) => {
    console.log('delete record.uuid = '+ record.uuid)
    Modal.confirm({
      title: "Are you sure, you want to delete this name from your list?",
      okText: "Yes",
      okType: "danger",
      onOk: async () => {
        setDataSource((pre) => {
          return pre.filter((student) => student.id !== record.id);
        });

        // Decrement the contact count
    setContactCount(prevCount => prevCount - 1);
  
        console.log('Student deleted from the server successfully');
      },
    });
  };
  const resetEditing = () => {
    setIsEditing(false);
    setEditingStudent(null);
  };

  const openPrompts = () => {
    setIsPromptModalVisible(true);
  };


  const handlePromptCancel = () => {
    setIsPromptModalVisible(false);
  };

  const handleRecipientOk = async () => {
    const response = await fetch(`https://yay-api.herokuapp.com/users/${userID}/recipient`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientFullName: `${firstName} ${lastName}`,
        recipientFirstName: firstName,
      }),
    });

    if (response.ok) {
      setModalIsOpen(false);
    } else {
      console.error('Failed to update recipient');
    }
  };

  const handleOk = async () => {
    setIsModalVisible(false);
  
    const newStudent = {
      id: dataSource.length + 1,
      name: name,
      email: email,
      submitted: submitted,
      submission: submission,
      picture: pictureSubmitted, // starts as an empty string
      notes: notes,
    };
  
    // Add the new student to the dataSource state
    setDataSource([...dataSource, newStudent]);
  
  }
  

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  async function handleSubmit(event) {
      event.preventDefault();
    
      // Check if the user is authenticated
      const auth = Cookies.get('auth'); // Get the authentication tokens from the cookie
      if (!auth) {
        // If the user is not authenticated, redirect them to Google's OAuth URL
        signInWithGoogle();
        return;
      }
    
      // If the user is authenticated, proceed with submitting the form and sending the welcome message
      try {
        await submitAndSendWelcomeMessage(contributors);
        console.log('Form submitted and welcome message sent');
      } catch (error) {
        console.error('Failed to submit form and send welcome message:', error);
      }
    }

 async function submitAndSendWelcomeMessage(contributors) {
// Assume that contributors is an array of objects, where each object has an email and phone property

// Step 2: Send email to all contributors
const emailResponse = await fetch('https://www.givebundl.com/api/sendEmail', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Include the access token in the Authorization header
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    senderName: 'Your Name',
    senderEmail: 'your-email@example.com',
    emailSubject: 'Welcome to the project!',
    emailBody: 'Thank you for contributing to our project. We appreciate your support!',
    recipientEmails: contributors.map(contributor => contributor.email),
  }),
});

if (!emailResponse.ok) {
  throw new Error(`Failed to send email: ${emailResponse.status}`);
}

// Step 3: Send text message to all contributors
for (const contributor of contributors) {
  const smsResponse = await fetch('https://www.givebundl.com/api/sendSMS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include the necessary credentials, if any
    },
    body: JSON.stringify({
      to: contributor.phone,
      message: 'Thank you for contributing to our project. We appreciate your support!',
    }),
  });

  if (!smsResponse.ok) {
    throw new Error(`Failed to send SMS: ${smsResponse.status}`);
  }
}

// Step 4: Send all contributors to the backend API
const bookResponse = await fetch('https://yay-api.herokuapp.com/book/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: userID, // The ID of the user
    // Include any other necessary data
  }),
});

if (!bookResponse.ok) {
  throw new Error(`Failed to create book: ${bookResponse.status}`);
}

const book = await bookResponse.json();
console.log('Created book:', book);
}

  return (
    <ScrollView style={{ padding: 32 }}>
      <Modal isVisible={isModalVisible}>
        <View>
          <Text>Add a new contributor manually</Text>
          <Text>Name</Text>
          <TextInput placeholder="Name" value={name} onChangeText={(text) => setName(text)} />
          <Text>Email</Text>
          <TextInput placeholder="Email" value={email} onChangeText={(text) => setEmail(text)} />
          <Text>Submitted</Text>
          <Picker selectedValue={submitted} onValueChange={(itemValue) => setSubmitted(itemValue)}>
            <Picker.Item label="Yes" value="yes" />
            <Picker.Item label="No" value="no" />
          </Picker>
          <Text>Submission</Text>
          <TextInput multiline={true} numberOfLines={10} maxLength={650} placeholder="Submission" value={submission} onChangeText={(text) => setSubmission(text)} />
          {/* You'll need to implement your own image upload component */}
          <Text>Picture Upload</Text>
          <Text>Notes</Text>
          <TextInput placeholder="Notes" value={notes} onChangeText={(text) => setNotes(text)} />
          <Button title="OK" onPress={handleOk} />
          <Button title="Cancel" onPress={handleCancel} />
        </View>
      </Modal>

      <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Your Bundl Details</Text>
        <Text style={styles.subtitle}>This information will be displayed publicly so be careful what you share.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Bundl Recipient's Name</Text>
          <TextInput
            style={styles.input}
            value={recipientFullName}
            onChangeText={setRecipientFullName}
            placeholder="Eliza Irwin"
          />
        </View>
        {isModalOpen && (
        <Modal isVisible={isModalOpen}>
          <View>
            <Text>Select a contact</Text>
            <TextInput placeholder="Search contacts..." onChangeText={handleSearch} />
            {filteredContacts.map(contact => (
              <View key={contact.resourceName} style={styles.contactContainer}>
                <CheckBox
                  value={selectedContacts.includes(contact)}
                  onValueChange={isChecked => handleContactSelect(contact, isChecked)}
                />
                <Text style={styles.contactText}>
                  {contact.names && contact.names.length > 0 ? contact.names[0].displayName : 'Unnamed Contact'}
                </Text>
                <Text style={styles.contactText}>{prioritizeEmail(contact.emailAddresses)}</Text>
              </View>
            ))}
            <Button title="Add to list" onPress={addSelectedContactsToList} />
            <Button title="Cancel" onPress={() => setIsModalOpen(false)} />
          </View>
        </Modal>
      )}

{isTableModalVisible && (
        <Modal isVisible={isTableModalVisible}>
          <View>
            <Text>Contributor List ({dataSource.length})</Text>
            <FlatList
              data={dataSource}
              renderItem={({ item }) => <Text>{item}</Text>}
              keyExtractor={(item, index) => index.toString()}
            />
            <Button title="OK" onPress={handleTableModalOk} />
            <Button title="Cancel" onPress={handleTableModalCancel} />
          </View>
        </Modal>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload CSV</Text>
        <Text style={styles.cardText}>
          Click to upload your CSV file with your contributors information here:
        </Text>
        {/* You'll need to implement your own file upload component */}
        {csvUploaded && <Button title="Add to Contributor List" onPress={addtoList} />}
        <Button title="Download CSV template" onPress={handleDownloadCSV} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pull Contacts from Gmail</Text>
        <Button title="Get my Google contacts" onPress={fetchGoogleContacts} />
        <Button title="Sign in for Google Contacts" onPress={signInWithGoogle} />
      </View>

      <Button title={`View Contributor List (${contactCount})`} onPress={showTableModal} />
      <View style={styles.tableContainer}>
        <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
          <Row data={tableHead} style={styles.head} textStyle={styles.text} />
          <Rows data={tableData} textStyle={styles.text} />
        </Table>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Welcome Message</Text>
        <TextInput
          style={styles.textarea}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={3}
        />
      </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Welcome Message</Text>
          <TextInput
            style={styles.textarea}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Welcome Text Message (SMS)</Text>
          <TextInput
            style={styles.textarea}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Cancel" onPress={() => {}} />
          <Button title="Send Welcome Messages (SMS and Email) to Contributor List" onPress={submitAndSendWelcomeMessage} />
        </View>
      </View>
    </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
  },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  },
  inputContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  },
  textarea: {
    height: 80,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  inputContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textarea: {
    height: 80,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
  },
});