import {
    ListObjectsCommand,
    GetObjectCommand,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Button,
    ScrollView,
    Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Image } from 'expo-image';
import { s3Client } from '@/constants/s3Client';
import { formatFileSize } from '@/utils/formatFileSize';
import { ImageType } from '@/types/ImageType';
import * as ImagePicker from 'expo-image-picker';

export default function Page() {
    const [images, setImages] = React.useState<ImageType[]>([]);

    const fetchImages = async () => {
        try {
            const command = new ListObjectsCommand({
                Bucket: process.env.EXPO_PUBLIC_AWS_BUCKET_NAME,
            });

            const response = await s3Client.send(command);

            if (response.Contents) {
                const imageItems = await Promise.all(
                    response.Contents.map(async (item) => {
                        if (item.Key) {
                            const command = new GetObjectCommand({
                                Bucket: process.env.EXPO_PUBLIC_AWS_BUCKET_NAME,
                                Key: item.Key,
                            });
                            const url = await getSignedUrl(s3Client, command, {
                                expiresIn: 3600,
                            });

                            return {
                                uri: url,
                                fileName: item.Key,
                                fileSize: item.Size || 0,
                                uploadDate: item.LastModified || new Date(),
                            } as ImageType;
                        }
                        return null;
                    })
                );

                setImages(
                    imageItems.filter(
                        (item): item is ImageType => item !== null
                    )
                );
            }
        } catch (error) {
            alert('이미지 목록을 가져오는데 실패했습니다.');
        }
    };

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
                const uri = result.assets[0].uri;
                const fileName = result.assets[0].fileName || '파일이름 없음';
                const fileType = result.assets[0].mimeType || 'image';
                const fileSize = result.assets[0].fileSize || 0;

                let fileContent;
                if (Platform.OS === 'web') {
                    fileContent = result.assets[0].file;
                } else {
                    const base64 = await FileSystem.readAsStringAsync(
                        result.assets[0].uri,
                        {
                            encoding: FileSystem.EncodingType.Base64,
                        }
                    );
                    fileContent = Buffer.from(base64, 'base64');
                }

                console.log(result.assets[0]);
                console.log(fileContent);
                const command = new PutObjectCommand({
                    Bucket: process.env.EXPO_PUBLIC_AWS_BUCKET_NAME,
                    Key: `uploads/${fileName}`,
                    Body: fileContent,
                    ContentType: fileType,
                });

                await s3Client.send(command);

                const newImage = {
                    uri: uri,
                    fileName: fileName,
                    fileSize: fileSize,
                    uploadDate: new Date(),
                };

                setImages((prev) => [...prev, newImage]);
                console.log('이미지 업로드 성공');
            }
        } catch (error) {
            console.log('이미지 업로드 에러 발생:', error);
        }
    };

    React.useEffect(() => {
        fetchImages();
    }, []);

    return (
        <View style={styles.container}>
            <Text>Upload image aws S3</Text>
            <Button title="Upload" onPress={pickImage} />
            <ScrollView style={styles.gallery}>
                {images &&
                    images.map((img, index) => (
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
