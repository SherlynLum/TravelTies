import { Alert } from "react-native"

const handleDelete = (title: string, message: string, action: () => void) => {
    Alert.alert(title, message, [
        {
            text: "No",
            style: "cancel"
        },
        {
            text: "Yes",
            style: "destructive",
            onPress: action
        }
    ])
}

export {
    handleDelete
}