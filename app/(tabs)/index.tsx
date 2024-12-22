import React from 'react';
import { View, Text, Button, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { formatFileSize } from '@/utils/formatFileSize';
import { ImageType } from '@/types/ImageType';
import { CommonStyled } from '@/components/CommonStyled';

export default function Page() {
    const [images, setImages] = React.useState<ImageType[]>([]);

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                alert('사진첩 권한이 필요합니다.');
                return;
            }
        }

        try {
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
                console.log('이미지 업로드 성공');
            }
        } catch (error) {
            console.log('이미지 업로드 에러 발생:', error);
        }
    };

    return (
        <View style={CommonStyled.container}>
            <Text>Upload image local</Text>
            <Button title="Upload" onPress={pickImage} />
            <ScrollView style={CommonStyled.gallery}>
                {images &&
                    images.map((img, index) => (
                        <View key={index} style={CommonStyled.imageContainer}>
                            <Image
                                source={{ uri: img.uri }}
                                style={CommonStyled.image}
                                contentFit="cover"
                            />
                            <View style={CommonStyled.imageInfo}>
                                <Text style={CommonStyled.infoText}>
                                    파일명: {img.fileName}
                                </Text>
                                <Text style={CommonStyled.infoText}>
                                    크기: {formatFileSize(img.fileSize)}
                                </Text>
                                <Text style={CommonStyled.infoText}>
                                    업로드:{' '}
                                    {img.uploadDate.toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    ))}
            </ScrollView>
        </View>
    );
}
