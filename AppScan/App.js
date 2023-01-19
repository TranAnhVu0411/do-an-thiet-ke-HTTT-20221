/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
import type { Node } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import GlobalProvider from './src/context/Provider';
import DocumentPicker from 'react-native-document-picker';
import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin';
// import ImagePicker from 'react-native-image-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImgToBase64 from 'react-native-image-base64';
import SelectDropdown from 'react-native-select-dropdown'
// import Pdf from 'react-native-pdf';
// import PSPDFKitView from 'react-native-pspdfkit';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [filePDF, setFilePDF] = useState(null);
  const [scannedImage, setScannedImage] = useState([]);
  const [imageUpload, setImageUpload] = useState();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");

  const backgroundStyle = {
    backgroundColor: Colors.white,
    marginTop: 16
  };

  const scanDocument = async () => {
    // start the document scanner
    const { scannedImages } = await DocumentScanner.scanDocument({
      // responseType: ResponseType["Base64"]
    })
    // get back an array with scanned image file paths
    if (scannedImages.length > 0) {
      ImgToBase64.getBase64String(`${scannedImages[0]}`)
        .then(base64String => {
          let base64Img = `data:image/jpg;base64,${base64String}`;
          setScannedImage([...scannedImage, base64Img])
          // let data = {
          //   "file": base64Img,
          //   "upload_preset": "app_scan",
          // };
          // fetch(CLOUDINARY_URL, {
          //   body: JSON.stringify(data),
          //   headers: {
          //     'content-type': 'application/json'
          //   },
          //   method: 'POST',
          // }).then(async r => {
          //   let data = await r.json();

          //   // setImageUpload(data.url)
          //   //Here I'm using another hook to set State for the photo that we get back //from Cloudinary
          //   setScannedImage([...scannedImage, data.url])
          //   // setPhoto(data.url);
          // }).catch(err => console.log(err))
        })
        .catch(err => console.log(err));
    }
  }

  const uploadImage = async () => {
    let pickerResult = await launchImageLibrary({
      mediaType: "photo",
      includeBase64: true,
      //We need the image to be base64 in order to be formatted for Cloudinary
    });
    let base64Img = `data:image/jpg;base64,${pickerResult.assets[0].base64}`;
    setScannedImage([...scannedImage, base64Img])
    // Here we need to include your Cloudinary upload preset with can be //found in your Cloudinary dashboard. 
    // let data = {
    //   "file": base64Img,
    //   "upload_preset": "app_scan",
    // }
    //sends photo to cloudinary
    // fetch(CLOUDINARY_URL, {
    //   body: JSON.stringify(data),
    //   headers: {
    //     'content-type': 'application/json'
    //   },
    //   method: 'POST',
    // }).then(async r => {
    //   let data = await r.json()
    //   // console.log("clo", data.url)
    //   setScannedImage([...scannedImage, data.url])
    // }).catch(err => console.log(err))
  };
  const submit = async () => {
    try {
      
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <GlobalProvider >
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={backgroundStyle}>
          {/* <Header /> */}
          <Text style={styles.titleHeader}>App Scan</Text>
          {/* Info book */}
          <View>
            <View
              style={styles.bodyApp}>
              <Text style={[styles.lable]}>Title</Text>
              <View style={[
                styles.wrapper,
              ]}>
                <TextInput
                  style={[styles.textInput]}
                  onChangeText={(e) => setTitle(e)}
                  value={title}
                />
              </View>
            </View>
            <View
              style={styles.bodyApp}>
              <Text style={[styles.lable]}>Author</Text>
              <View style={[
                styles.wrapper,
              ]}>
                <TextInput
                  style={[styles.textInput]}
                  onChangeText={(e) => setAuthor(e)}
                  value={author}
                />
              </View>
            </View>
            <View
              style={styles.bodyApp}>
              <Text style={[styles.lable]}>Year</Text>
              <View style={[
                styles.wrapper
              ]}>
                <TextInput
                  style={[styles.textInput]}
                  onChangeText={(e) => setYear(e)}
                  value={year}
                />
              </View>
            </View>
          </View>

          {/* Scan or upload Image or pdf */}
          <View style={styles.action}>
            <View style={styles.container}>
              <TouchableOpacity
                onPress={uploadImage}
                style={styles.btn}
              >
                <Text style={styles.textSelect}>UPLOAD IMAGES</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.container}>
              <TouchableOpacity
                onPress={scanDocument}
                style={styles.btn}
              >
                <Text style={styles.textSelect}>SCAN DOCUMENTS</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.viewImages}>
            {
              (scannedImage && scannedImage.length > 0) ? (
                scannedImage.map((itemI, index) => {
                  return (
                    <View key={index}>
                      <Image source={{ uri: `${itemI}` }} style={{ width: 150, height: 150, marginRight: 16 }} />
                    </View>
                  )
                })
              ) : null
            }
          </View>
          <View style={styles.submit}>
            <TouchableOpacity
              onPress={submit}
              style={styles.btnSubmit}
            >
              <Text style={styles.textSelect}>SUBMIT</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GlobalProvider>
  );
};

const styles = StyleSheet.create({
  titleHeader: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: '900'
  },
  bodyApp: {
    paddingLeft: 16,
    paddingTop: 16,
    paddingRight: 16,
    backgroundColor: Colors.white,
  },
  lable: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16
  },
  wrapper: {
    height: 42,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    marginTop: 5
  },
  action: {
    marginTop: 48,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.white,
  },
  container: {

    // flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#F5FCFF',
  },
  textInput: {
    flex: 1,
    width: '100%',
  },
  inputContainer: {
    paddingVertical: 12
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  btn: {
    paddingLeft: 14,
    paddingBottom: 14,
    paddingTop: 14,
    paddingRight: 14,
    fontSize: 18,
    backgroundColor: "#16a5e1",
  },
  btnSelect: {
    backgroundColor: "#16a5e1",
  },
  submit: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32
  },
  btnSubmit: {
    backgroundColor: "#16a5e1",
    paddingLeft: 34,
    paddingBottom: 14,
    paddingTop: 14,
    paddingRight: 34,
    fontSize: 18,
    alignSelf: "auto"
  },
  textSelect: {
    color: "white",
    fontSize: 18
  },
  viewImages: {
    marginTop: 24,
    flexDirection: "row",
    paddingLeft: 16,
    paddingRight: 16
  }
});

export default App;
