import { StyleSheet } from 'react-native';

export const CommonStyled = StyleSheet.create({
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
