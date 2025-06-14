import {requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync, launchCameraAsync, 
    launchImageLibraryAsync} from "expo-image-picker";

// specify res type
type pickPicRes = | {success: true; uri: string} | {success: false; message?: string};

// pick one pic by taking photo or select one photo from gallery
export const pickOnePic = async (source: "camera" | "gallery"): Promise<pickPicRes> => {
    let pic;
    if (source === "camera") {
        const permission = await requestCameraPermissionsAsync();
        if (!permission) {
            return {success: false, message: "Please grant camera access to take a photo"};
        }

        pic = await launchCameraAsync({
            allowsEditing: false,
            quality: 0.7
        });
    } else {
        const permission = await requestMediaLibraryPermissionsAsync();
        if (!permission) {
            return {success: false, message: "Please grant access to your gallery to select a photo"};
        }

        pic = await launchImageLibraryAsync({
            allowsEditing: false,
            quality: 0.7
        })
    };

    if (!pic.canceled) {
        return {success: true, uri: pic.assets[0].uri};
    } else {
        return {success: false, message: "No picture was selected"};
    }
}