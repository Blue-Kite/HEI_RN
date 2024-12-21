import React from 'react';
import { View, Text, StyleSheet, Button, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImageItem {
    uri: string;
    fileName: string;
    fileSize: number;
    uploadDate: Date;
}

export default function Home() {
    const [images, setImages] = React.useState<ImageItem[]>([]);

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                alert('사진첩 권한이 필요합니다.');
                return;
            }
        }

        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);
    };

    return (
        <View style={styles.container}>
            <Text>Upload image</Text>
            <Button title="Upload" onPress={pickImage} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
});
