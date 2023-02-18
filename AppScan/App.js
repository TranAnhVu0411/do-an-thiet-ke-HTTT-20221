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
  Dimensions,
  Modal,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import DocumentPicker from 'react-native-document-picker';
import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin';
// import ImagePicker from 'react-native-image-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ImgToBase64 from 'react-native-image-base64';
import RadioGroup from 'react-native-radio-buttons-group';
import SelectDropdown from 'react-native-select-dropdown';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Pdf from 'react-native-pdf';
// import PSPDFKitView from 'react-native-pspdfkit';

const qualityImage = [
  {
    id: '1',
    label: 'Low',
    value: 'low',
    selected: true,
  },
  {
    id: '2',
    label: 'Medium',
    value: 'medium',
    selected: false,
  },
  {
    id: '3',
    label: 'High',
    value: 'high',
    selected: false,
  }
];

let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [filePDF, setFilePDF] = useState(null);
  const [scannedImage, setScannedImage] = useState([]);
  const [imageUpload, setImageUpload] = useState();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [quality, setQuality] = useState(qualityImage);
  const [modalVisible, setModalVisible] = useState(false);
  const [indexModalVisible, setIndexModalVisible] = useState();
  const URL = 'http://127.0.0.1:5000';

  const backgroundStyle = {
    backgroundColor: Colors.white,
    marginTop: 16,
    // color: Colors.black
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
          // let base64Img = `data:image/jpg;base64,${base64String}`;
          let base64Img = base64String;
          setScannedImage([...scannedImage, base64Img])
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
    let base64Img = pickerResult.assets[0].base64;
    setScannedImage([...scannedImage, base64Img])
  };
  const submit = async () => {
    try {
      let bookInfoData = {
          title: title,
          author: author,
          year: year,
          cover: scannedImage[0]
      }
      // Create book
      let bookRes = await fetch("http://192.168.1.160:3502/api/books", {
        body: JSON.stringify(bookInfoData),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      let bookId = await bookRes.json()
      // Create and preprocess pages
      let pageImagesData = {
        ...bookId,
        images: scannedImage,
        quality: quality.find(t => t.selected == true).value,
      }
      let pagesRes = await fetch("http://192.168.1.160:3502/api/pages", {
        body: JSON.stringify(pageImagesData),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
    }catch (error) {
      console.log(error);
    }
  }
  const onPressRadioButton = (radioButtonsArray) => {
    setQuality(radioButtonsArray);
  }
  const cancelImage = (id) => {
    var scannedImageTmp = scannedImage.filter((img, index) => index != id);
    setScannedImage(scannedImageTmp);
  }
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        // contentInsetAdjustmentBehavior="automatic"
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
        {/* View Image */}
        <View style={styles.viewImages}>
          {
            (scannedImage && scannedImage.length > 0) ? (
              scannedImage.map((itemI, index) => {
                return (
                  <View key={index} style={styles.imageItem}>
                    <TouchableOpacity onPress={() => {
                      setIndexModalVisible(index);
                      setModalVisible(!modalVisible)
                    }}>
                      <View>
                        <Image source={{ uri: `data:image/jpg;base64,${itemI}` }} style={{ width: '85%', height: '100%' }} />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ zIndex: 10, position: 'absolute', marginLeft: '84%', marginTop: -5 }}
                      onPress={() => cancelImage(index)}
                    >
                      <View>
                        <MIcon name='close-circle-outline' size={30} />
                      </View>
                    </TouchableOpacity>
                  </View>
                )
              })
            ) : null
          }
        </View>
        

        {/* Modal Image */}
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
          >
            <View style={{ marginTop: '3%', paddingLeft: '3%', backgroundColor: 'white', }}>
              <Image source={{ uri: `data:image/jpg;base64,${scannedImage[indexModalVisible]}` }} style={{ width: '97%', height: '99%', resizeMode: 'contain' }} />
              <TouchableOpacity style={{ zIndex: 10, position: 'absolute', marginLeft: '93%', marginTop: -15 }}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <View>
                  <MIcon name='close-circle-outline' size={30} />
                </View>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
        <View style={styles.quality}>
          <Text style={styles.title_quality}>Choose image quality</Text>
          <View style={{color: "black"}}>
            <RadioGroup
              radioButtons={quality}
              onPress={onPressRadioButton}
              layout="row"
            />
          </View>
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
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  titleHeader: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: '900',
    color: 'black'
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
    marginTop: 16,
    color: 'black'
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
    marginTop: 32,
    marginBottom: 16
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
  quality: {
    marginTop: 16
  },
  title_quality: {
    fontSize: 20,
    marginLeft: 14,
    marginBottom: 10,
    color: 'black'
  },
  textSelect: {
    color: "white",
    fontSize: 18,
  },
  viewImages: {
    flex: 1,
    flexWrap: 'wrap',
    marginTop: 24,
    flexDirection: "row"
  },
  imageItem: {
    // flex: 1,
    width: '46%',
    height: 150,
    paddingTop: 8,
    marginBottom: 16,
    marginLeft: 10,
    position: "relative",
    paddingLeft: 10
  }
});

export default App;
