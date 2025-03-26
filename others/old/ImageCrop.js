

import CustomCrop from "react-native-perspective-image-cropper";
import ImagePicker from 'react-native-image-picker'

export default class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      image: null,
      path: '',
      rectangleCoordinates: {
        topLeft: { x: 50, y: 50 },
        topRight: { x: 50, y: 50 },
        bottomRight: { x: 50, y: 50 },
        bottomLeft: { x: 50, y: 50 }
      }
    }
  }

  componentDidMount() {

    const imagePickerOptions = {
      title: 'Selectionner une image',
      takePhotoButtonTitle: 'Prendre une photo',
      chooseFromLibraryButtonTitle: 'Choisir de la librairie',
      cancelButtonTitle: 'Annuler',
      noData: true,
      mediaType: 'photo'
    }


    ImagePicker.launchCamera(imagePickerOptions, response => {

      if (response.didCancel) console.log('User cancelled image picker')
      else if (response.error) console.log('ImagePicker Error: ', response.error);
      else if (response.customButton) console.log('User tapped custom button: ', response.camera);

      else { 

        const path = Platform.OS === 'android' ? response.path : response.uri //try without file://
        
        this.setState({
          path,
          imageWidth: response.width,
          imageHeight: response.height,
          image: response.uri,
        })
      }

    })

  }

  updateImage(image, newCoordinates) {
    image = `data:image/jpeg;base64,${image}`
    Image.getSize(image, ()=> {
      
    })
    this.setState({
      image,
      rectangleCoordinates: newCoordinates
    });
  }

  crop() {
    this.customCrop.crop();
  }

  render() {
    const { image, imageHeight, imageWidth, path } = this.state

    if (!image || !imageWidth || !imageHeight || !path) return null

    return (
      <View>
        <CustomCrop
          updateImage={this.updateImage.bind(this)}
          //rectangleCoordinates={this.state.rectangleCoordinates}
          initialImage={this.state.image}
          path={this.state.path}
          height={this.state.imageHeight}
          width={this.state.imageWidth}
          ref={ref => (this.customCrop = ref)}
          overlayColor="rgba(18,190,210, 1)"
          overlayStrokeColor="rgba(20,190,210, 1)"
          handlerColor="rgba(20,150,160, 1)"
          enablePanStrict={false}
        />
       
      </View>
    )
  }
}

