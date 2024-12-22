import AWS from '@/app/(tabs)/aws';
import { render } from '@testing-library/react-native';
import { Alert } from 'react-native';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  ListObjectsCommand: jest.fn(),
}));

describe('<AWS/> 컴포넌트 랜더링 확인', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('aws 이미지 목록 랜더링 확인', () => {
    const { getByText, getByRole } = render(<AWS />);

    expect(getByText('Upload image aws S3')).toBeTruthy();
    expect(getByRole('button', { name: 'Upload' })).toBeTruthy();
  });
});
