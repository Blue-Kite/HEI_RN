import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button,
    Platform,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

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

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets.length > 0) {
            const newImage = {
                uri: result.assets[0].uri,
                fileName: result.assets[0].fileName || '파일이름 없음',
                fileSize: result.assets[0].fileSize || 0,
                uploadDate: new Date(),
            };

            setImages((prev) => [...prev, newImage]);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <View style={styles.container}>
            <Text>Upload image</Text>
            <Button title="Upload" onPress={pickImage} />
            <ScrollView style={styles.gallery}>
                {images.map((img, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image
                            source={{ uri: img.uri }}
                            style={styles.image}
                            contentFit="cover"
                        />
                        <View style={styles.imageInfo}>
                            <Text style={styles.infoText}>
                                파일명: {img.fileName}
                            </Text>
                            <Text style={styles.infoText}>
                                크기: {formatFileSize(img.fileSize)}
                            </Text>
                            <Text style={styles.infoText}>
                                업로드: {img.uploadDate.toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    gallery: {
        width: '100%',
    },
    imageContainer: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        borderRadius: 10,
    },
    image: {
        width: 400,
        height: 300,
    },
    imageInfo: {
        padding: 10,
    },
    infoText: {
        fontSize: 14,
    },
});
