import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '@/app/(tabs)/index';
import * as ImagePicker from 'expo-image-picker';
import { formatFileSize } from '@/utils/formatFileSize';

const MOCK_IMAGE = {
  uri: '../../assets/images/test1.png',
  fileName: 'test1.png',
  fileSize: 1024,
  uploadDate: new Date('2024-12-22'),
};

describe('<Home /> 랜더링 확인', () => {
  test('홈랜더링 확인', () => {
    const { getByText, getByRole } = render(<Home />);

    expect(getByText('Upload image local')).toBeTruthy();
    expect(getByRole('button', { name: 'Upload' })).toBeTruthy();
  });
});

describe('이미지 업로드 테스트', () => {
  beforeEach(() => {
    jest
      .spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync')
      .mockResolvedValue({ granted: true });

    jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockResolvedValue({
      canceled: false,
      assets: [MOCK_IMAGE],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('버튼 클릭시 이미지 업로드 및 성공 메시지 출력 테스트', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { getByText, findByText } = render(<Home />);
    const uploadButton = getByText('Upload');
    fireEvent.press(uploadButton);

    await waitFor(() => {
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(findByText(`파일명: ${MOCK_IMAGE.fileName}`)).toBeTruthy();
      expect(findByText(`크기: ${formatFileSize(MOCK_IMAGE.fileSize)}`)).toBeTruthy();
      expect(findByText(`업로드: ${MOCK_IMAGE.uploadDate.toLocaleDateString()}`)).toBeTruthy();
    });

    expect(consoleSpy).toHaveBeenCalledWith('이미지 업로드 성공');
    consoleSpy.mockRestore();
  });
});

describe('이미지 업로드 실패 테스트', () => {
  beforeEach(() => {
    jest
      .spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync')
      .mockResolvedValue({ granted: true });

    jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockResolvedValue(new Error('에러 발생!!!'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('실패 메시지 출력 테스트', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const { getByText } = render(<Home />);
    const uploadButton = getByText('Upload');
    fireEvent.press(uploadButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('이미지 업로드 에러 발생:', expect.any(Error));
    });
  });
});
