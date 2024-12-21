import {
    S3Client,
    ListObjectsCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Image } from 'expo-image';

const s3Client = new S3Client({
    region: process.env.EXPO_PUBLIC_AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env
            .EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
    },
});

interface ImageItem {
    uri: string;
    fileName: string;
    fileSize: number;
    uploadDate: Date;
}

export default function Page() {
    const [images, setImages] = React.useState<ImageItem[]>([]);

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
                            } as ImageItem;
                        }
                        return null;
                    })
                );

                setImages(
                    imageItems.filter(
                        (item): item is ImageItem => item !== null
                    )
                );
            }
        } catch (error) {
            alert('이미지 목록을 가져오는데 실패했습니다.');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    React.useEffect(() => {
        fetchImages();
    }, []);

    return (
        <View style={styles.container}>
            <Text>Upload image aws S3</Text>
            <Button title="Upload" />
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
