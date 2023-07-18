import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Switch, Animated } from 'react-native';
import Modal from 'react-native-modal'; // or any other library you prefer
import { Picker } from '@react-native-picker/picker';
import * as AuthSession from 'expo-auth-session';
import * as Contacts from 'expo-contacts';
import { Swipeable } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Linking from 'expo-linking';

const { makeRedirectUri } = AuthSession;

 WebBrowser.maybeCompleteAuthSession();

export default function App() {

        const [message, setMessage] = useState("We are creating a book of supportive letters and nice pictures (or 'Bundl') for Dan G. It will only take you a minute to write and submit your letter. It should make for an unforgettable gift that shares our collective love and appreciation. Don't be the last to submit!");
        const [parsedData, setParsedData] = useState([]);
        const [userID, setUserID] = useState(null);
        const [isModalVisible, setIsModalVisible] = useState(false);
        const [notes, setNotes] = useState("");
        const [submitted, setSubmitted] = useState("");

        const [pictureSubmitted, setPictureSubmitted ] = useState(false);
        const [isTableModalVisible, setIsTableModalVisible] = useState(false);

        const [emailBody, setEmailBody] = useState('');
        const [emailSubject, setEmailSubject] = useState("Contribute please - 3 days left!");
        const [emailRecipients, setEmailRecipients] = useState([]);
        const [values, setValues] = useState([]);
  
        const [ submission, setSubmission ] = useState("");

        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [layout, setLayout] = useState('');
        const [msg, setMsg] = useState('');

        const [physicalBook, setPhysicalBook] = useState(false);

        const [dataSource, setDataSource] = useState([]);

        const [prompts, setPrompts] = useState([
          "How has Jimmy affected your life?",
          "What do you love about Jimmy?",
          "What's your favorite memory with Jimmy?",
          "How has Jimmy inspired you?",
          "What do you wish for Jimmy's future?"
        ]);
        const [longMessage, setLongMessage] = useState('');
        const [modalIsOpen, setModalIsOpen] = useState(false);

        const [userData, setUserData] = useState(null);
        const [recipientFullName, setRecipientFullName] = useState("");
        const [recipientFirstName, setRecipientFirstName] = useState("");
        const [recipientlastName, setRecipientLastName] = useState("");
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [googleContacts, setGoogleContacts] = useState([]);
        const [ text, setText] = useState("Join us in creating a 'Bundl' of loving letters & pics for Dan G. It's a quick, fun way to share our support and appreciation. Look out for an email from dan@givebundl.com with instructions. Don't miss out!");
        const [updateLocalStorageFunction, setUpdateLocalStorageFunction] = useState(() => () => {});

        const [modalVisible, setModalVisible] = useState(false);
        const [searchTermMobile, setSearchTermMobile] = useState('');
        const [searchTerm, setSearchTerm] = useState('');
        const [contactsMobile, setContactsMobile] = useState([]);
        const [selectedContactsMobile, setSelectedContactsMobile] = useState([]);
          const [selectedContacts, setSelectedContacts] = useState([]);
        const [tableData, setTableData] = useState([]);
        const [contactCount, setContactCount] = useState([]);

        const [userInfo, setUserInfo] = useState(null);
        const [token, setToken] = useState("");
        const [request, response, promptAsync] = Google.useAuthRequest({
          androidClientId: "764289968872-54s7r83tcdah8apinurbj1afh3l0f92u.apps.googleusercontent.com",
          iosClientId: "764289968872-8spc0amg0j9n4lqjs0rr99s75dmmkpc7.apps.googleusercontent.com",
          webClientId: "764289968872-tdema5ev8sf7djdjlp6a8is5k5mjrf5t.apps.googleusercontent.com",
          expoClientId: "764289968872-n5nrj6lbnv4vsc42mtso6u2mu1d7nsm5.apps.googleusercontent.com",
          scopes: ["https://www.googleapis.com/auth/contacts.readonly"], 
          redirectUri: makeRedirectUri({
            native: 'https://yay-api.herokuapp.com/mobile/oauth2callback',
            useProxy: true,
          }),
        });

        const [prompt1, setPrompt1] = useState('');
        const [prompt2, setPrompt2] = useState('');
        const [prompt3, setPrompt3] = useState('');
      
        const placeholderName = recipientFullName || 'your recipient';


useEffect(() => {
  if (response?.type === 'success') {
    const { access_token } = response.params;

    // The access token is available in access_token
    console.log(access_token);

    // Handle the effect
    const handleEffect = async () => {
      const user = await getLocalUser();
      console.log("user", user);
      if (!user) {
        setToken(response.authentication.accessToken);
        getUserInfo(response.authentication.accessToken);
      } else {
        setUserInfo(user);
        console.log("loaded locally");
      }
    };

    // Call the handleEffect function
    handleEffect();
  }
}, [response, token]);

      
        const getLocalUser = async () => {
          const data = await AsyncStorage.getItem("@user");
          if (!data) return null;
          return JSON.parse(data);
        };
      
        const getUserInfo = async (token) => {
          if (!token) return;
          try {
            const response = await fetch(
              "https://www.googleapis.com/userinfo/v2/me",
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
      
            const user = await response.json();
            await AsyncStorage.setItem("@user", JSON.stringify(user));
            setUserInfo(user);
          } catch (error) {
            // Add your own error handler here
          }
        };
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

          const getContacts = async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
              const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
              });
              if (data.length > 0) {
                setContactsMobile(data);
                setModalVisible(true);
              }
            }
          };
          
          const addContactToList = async (contact, index) => {
            const newContact = {
              id: tableData.length + index + 1, // This will increment the ID for each new contact
              name: contact.names[0].displayName,
              emailAddresses: [{ value: prioritizeEmail(contact.emailAddresses) }], // Use the prioritizeEmail function here
              phoneNumber: '', // Changed "address" to "sms"
            };
          
            // Check if a contact with the same name already exists in the tableData
            if (tableData.some(existingContact => existingContact.name === newContact.name)) {
              console.log(`A contact with the name ${newContact.name} already exists.`);
              return;
            }
          
            // Add the new contact to the tableData state
            setTableData(prevTableData => [...prevTableData, newContact]);
          
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


      const filteredContactsGoogle = googleContacts.filter(contact => {
        const hasEmail = contact.emailAddresses && contact.emailAddresses.length > 0;
        const matchesSearchTerm = contact.names && contact.names.some(name => name.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
        return hasEmail && matchesSearchTerm;
      });

    const handleSearch = (text) => {
      setSearchTerm(text);
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


      async function fetchGoogleContacts(token) {
        try {
          if (!userInfo) {
            console.error('User info not found');
            return;
          }
      
          const tokens = token;
          console.log('tokens = '+ tokens);
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
        

        const closeModal = () => {x
          setOpenGmail(false);
        };


        
        const renderRightActions = (contact, progress, dragX) => {
          const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
          });
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
        
     
        const handleSelectContact = (contact) => {
          const phoneNumber = contact.phoneNumbers ? contact.phoneNumbers[0].number : '';
          const contactWithPhoneNumber = { ...contact, phoneNumber };
        
          if (selectedContactsMobile.some((selectedContact) => selectedContact.name === contact.name && selectedContact.phoneNumber === contact.phoneNumber)) {
            setSelectedContactsMobile((prev) => prev.filter((selectedContact) => selectedContact.name !== contact.name || selectedContact.phoneNumber !== contact.phoneNumber));
          } else {
            setSelectedContactsMobile((prev) => [...prev, contactWithPhoneNumber]);
          }
        };
        
        const handleAddToList = () => { // phone contacts
          setTableData(prev => [...prev, ...selectedContactsMobile]);
          setSelectedContactsMobile([]);
          setModalVisible(false);
        };
        const handleDeleteContact = (contactToDelete) => {
          setTableData((prevTableData) => {
            return prevTableData.filter(contact => contact.id !== contactToDelete.id);
          });
        };
        
       
      const filteredContacts = contactsMobile.filter((contact) =>
      (contact.name && (contact.phoneNumbers && contact.phoneNumbers.length > 0 || contact.emails && contact.emails.length > 0)) && contact.name.toLowerCase().includes(searchTermMobile.toLowerCase())
    );

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
        
        const prioritizeEmailGoogle = (emailAddresses) => {
          if (!emailAddresses || emailAddresses.length === 0) {
            return 'No email';
          }

          const priorityDomains = ['@outlook.com', '@gmail.com', '@hotmail.com'];
          
          // Sort email addresses based on the priority of the domain
          const sortedEmailAddresses = emailAddresses.sort((a, b) => {
            const aDomain = a.value.split('@')[1];
            const bDomain = b.value.split('@')[1];
            const aPriority = priorityDomains.includes(aDomain) ? 1 : 0;
            const bPriority = priorityDomains.includes(bDomain) ? 1 : 0;
            return bPriority - aPriority;
          });

          // Return the first email address in the sorted list
          return sortedEmailAddresses[0].value;
        };


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
            const emails = contributors.filter(contributor => contributor.email).map(contributor => contributor.email);
            if (emails.length > 0) {
              const emailUrl = `mailto:${emails.join(',')}?subject=Welcome to the project!&body=Thank you for contributing to our project. We appreciate your support!`;
              Linking.openURL(emailUrl).catch(err => console.error('Failed to send email:', err));
            }
          
            // Step 3: Send text message to all contributors
            for (const contributor of contributors) {
              if (contributor.phone) {
                const smsUrl = `sms:${contributor.phone}?body=Thank you for contributing to our project. We appreciate your support!`;
                Linking.openURL(smsUrl).catch(err => console.error('Failed to send SMS:', err));
              }
            }
          }


  return (
    <View style={{ padding: 32 }}  contentContainerStyle={{ alignItems: 'center' }} >
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
          <TouchableOpacity style={styles.button} title="OK" onPress={handleOk}>
            <Text>OK</Text>
          </TouchableOpacity>
          <TouchableOpacity  style={styles.button} title="Cancel" onPress={handleCancel}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <FlatList style={styles.container}  contentContainerStyle={{ alignItems: 'center' }} >
      <View style={styles.section}>
        <Text style={styles.title}>Your Bundl Gift</Text>
        <Text style={styles.subtitle}>Write out the recipient of the gift, the people who will contribute to the gift, and the message you will send to the contributors.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Recipient's full name</Text>
          <TextInput
            style={styles.input}
            value={recipientFullName}
            onChangeText={setRecipientFullName}
            placeholder="Your recipient's full name"
          />
        </View>

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Switch
                  value={physicalBook}
                  onValueChange={setPhysicalBook}
                />
                <Text>Make this Bundl e-book a physical Bundl book for $99</Text>
          </View>

          <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={prompt1}
                onChangeText={setPrompt1}
                placeholder={`1. What is your favorite thing about ${placeholderName}?`}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={prompt2}
                onChangeText={setPrompt2}
                placeholder={`2. What positive thing have you learned from ${placeholderName}?`}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={prompt3}
                onChangeText={setPrompt3}
                placeholder={`3. What is your favorite memory with ${placeholderName}?`}
              />
            </View>

       
        <Modal isVisible={modalVisible}>
          <View style={{ flex: 1, backgroundColor: 'black' }}>
            <Text style={{ color: 'white', fontSize: 20 }}>Contact List:</Text>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1, color: 'white' }}
              onChangeText={setSearchTermMobile}
              value={searchTermMobile}
              placeholder="Search contacts"
              placeholderTextColor="white"
            />
            <FlatList
              data={filteredContacts}
              contentContainerStyle={{ alignItems: 'center' }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Switch
                    value={selectedContactsMobile.some((selectedContact) => selectedContact.id === item.id)}
                    onValueChange={() => handleSelectContact(item)}
                  />
                  <Text style={{ color: 'white', fontSize: 18 }}>{item.name} | {item.phoneNumbers && item.phoneNumbers.length > 0 ? item.phoneNumbers[0].number : 'No phone number'}</Text>
                </View>
              )}
            />
            <TouchableOpacity style={styles.button} title="Add to list" onPress={handleAddToList} color="white" >
               <Text style={styles.buttonText}>Add to list</Text>
                </TouchableOpacity>
            <TouchableOpacity style={styles.button} title="Close" onPress={() => setModalVisible(false)} color="white">
               <Text style={styles.buttonText}>Close</Text>
               </TouchableOpacity> 
          </View>
        </Modal>
        <GestureHandlerRootView style={{flex: 1}}>
              <FlatList
                data={tableData}
                renderItem={({ item }) => (
                  <Swipeable renderRightActions={(progress, dragX) => {
                    const trans = dragX.interpolate({
                      inputRange: [0, 50, 100, 101],
                      outputRange: [-20, 0, 0, 1],
                    });
                    return (
                      <TouchableOpacity style={styles.button} onPress={() => handleDeleteContact(item)}>
                        <Animated.View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', transform: [{ translateX: trans }] }}>
                          <Text style={{ color: 'white', paddingHorizontal: 10 }}>Delete</Text>
                        </Animated.View>
                      </TouchableOpacity>
                    );
                  }}>
                    <View style={styles.itemContainer}>
                    <Text>{item.name ? item.name : ''}</Text>
                    <Text>{prioritizeEmail(item.emailAddresses)}</Text>
                    <Text>{item.phoneNumber ? item.phoneNumber : ''}</Text>
                    </View>
                  </Swipeable>
                )}
        />
      </GestureHandlerRootView>

      {isModalOpen && (
          <Modal isVisible={isModalOpen}>
            <View style={{ height: '80%', width: '80%', backgroundColor: 'white' }}>
              <TextInput placeholder="Search contacts..." onChangeText={handleSearch} />
              {filteredContactsGoogle.map(contact => {
                // Check if the contact has an email
                const email = prioritizeEmailGoogle(contact.emailAddresses);
                if (email == "No emaiml") {
                  // If the contact doesn't have an email, don't render anything
                  return null;
                }

                // If the contact has an email, render the contact
                return (
                  <View key={contact.resourceName} style={styles.contactContainer}>
                    <Switch
                      value={selectedContacts.includes(contact)}
                      onValueChange={isChecked => handleContactSelect(contact, isChecked)}
                    />
                    <Text style={styles.contactText}>
                      {contact.names && contact.names.length > 0 ? contact.names[0].displayName : 'Unnamed Contact'}
                    </Text>
                    <Text style={styles.contactText}>{email}</Text>
                  </View>
                );
              })}
              <TouchableOpacity  style={styles.button} title="Add to list" onPress={addSelectedContactsToList} >
                <Text style={styles.buttonText}>Add to list</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} title="Cancel" onPress={() => setIsModalOpen(false)} >
                <Text style={styles.buttonText}>Cancel</Text> 
              </TouchableOpacity>
            </View>
          </Modal>
        )}



      <View style={styles.buttonContainer} >
    
         <TouchableOpacity style={styles.button} title="Get Contacts" onPress={getContacts}>
          <Text style={styles.buttonText}>Get Your Contacts</Text>
        </TouchableOpacity> 
 
        <View style={styles.container}>
          {!userInfo ? (
            <TouchableOpacity
              style={styles.button}
              title="Sign in with Google"
              disabled={!request}
              onPress={() => {
                promptAsync();
              }}
            >
               <Text style={styles.buttonText}>Sign-in with Google</Text>
            </TouchableOpacity>
           ) : (
            <View>
              {/* {userInfo?.picture && (
                <Image source={{ uri: userInfo?.picture }} style={styles.image} />
              )}
              <Text style={styles.text}>Email: {userInfo.email}</Text>
              <Text style={styles.text}>
                Verified: {userInfo.verified_email ? "yes" : "no"}
              </Text>
              <Text style={styles.text}>Name: {userInfo.name}</Text>
               */}
              <TouchableOpacity
                title="Fetch Google Contacts"
                style={styles.button}
                onPress={() => fetchGoogleContacts(response.params.access_token)}
              >
                <Text style={styles.buttonText}>Get your Google Contacts</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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
          <TouchableOpacity style={styles.button} title="Cancel" onPress={() => {}} >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} title="Send Welcome Messages (SMS and Email) to Contributor List" onPress={submitAndSendWelcomeMessage} >
            <Text style={styles.buttonText}>Send Welcome Messages (SMS and Email) to Contributor List</Text>
          </TouchableOpacity>
        </View>
      </View>
    </FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'column', // stack buttons vertically
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
    marginBottom: 20, // consistent margin for all sections
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
    marginTop: 20, // consistent margin for all input containers
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
  button: {
    backgroundColor: '#FF7F7F', // light red
    width: 200, // set a fixed width
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20, 
    marginRight: 20, // consistent margin between buttons
    marginLeft: 20, // consistent margin between buttons
    marginTop: 20 // consistent margin for all buttons
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  itemContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'transparent', 
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 3,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
  },
});