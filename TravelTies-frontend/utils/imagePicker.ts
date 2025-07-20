import {requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync, launchCameraAsync, 
    launchImageLibraryAsync} from "expo-image-picker";

// specify res types
type pickPicRes = | {success: true; uri: string} | {success: false; message?: string};
type pickPicsRes = | {success: true; uris: string[]} | {success: false; message?: string};

// pick one pic by taking photo or select one photo from gallery
export const pickOnePic = async (source: "camera" | "gallery"): Promise<pickPicRes> => {
    let pic;
    if (source === "camera") {
        const permission = await requestCameraPermissionsAsync();
        if (!permission.granted) {
            return {success: false, message: "Please grant camera access to take a photo"};
        }

        pic = await launchCameraAsync({
            allowsEditing: false,
            quality: 0.7,
            mediaTypes: "images"
        });
    } else {
        const permission = await requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            return {success: false, message: "Please grant access to your gallery to select a photo"};
        }

        pic = await launchImageLibraryAsync({
            allowsEditing: false,
            quality: 0.7,
            mediaTypes: "images"
        })
    };

    if (!pic.canceled) {
        return {success: true, uri: pic.assets[0].uri};
    } else {
        return {success: false, message: "No picture was selected"};
    }
}

// pick multiple pictures by taking photo or select one photo from gallery
export const pickPics = async (source: "camera" | "gallery"): Promise<pickPicsRes>  => {
    let pics;
    if (source === "camera") {
        const permission = await requestCameraPermissionsAsync();
        if (!permission.granted) {
            return {success: false, message: "Please grant camera access to take a photo"};
        }

        pics = await launchCameraAsync({
            allowsEditing: false,
            quality: 0.7,
            mediaTypes: "images"
        });
    } else {
        const permission = await requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            return {success: false, message: "Please grant access to your gallery to select a photo"};
        }

        pics = await launchImageLibraryAsync({
            allowsEditing: false,
            quality: 0.7,
            mediaTypes: "images",
            allowsMultipleSelection: true
        })
    };

    if (!pics.canceled) {
        const uris = pics.assets.map(pic => pic.uri);
        return {success: true, uris};
    } else {
        return {success: false, message: "No picture was selected"};
    }
}
