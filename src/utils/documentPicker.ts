import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
} from '@react-native-documents/picker';

interface DocumentPickerOptions {
  type: string[];
}

interface PickedAsset {
  uri: string;
  name: string;
  mimeType: string | null;
}

interface DocumentPickerResult {
  canceled: boolean;
  assets: PickedAsset[] | null;
}

export async function getDocumentAsync({
  type,
}: DocumentPickerOptions): Promise<DocumentPickerResult> {
  try {
    const [file] = await pick({ type });
    const [copy] = await keepLocalCopy({
      files: [{ uri: file.uri, fileName: file.name ?? 'document' }],
      destination: 'cachesDirectory',
    });

    if (copy.status === 'error') {
      throw new Error(`Unable to prepare the selected document: ${copy.copyError}`);
    }

    return {
      canceled: false,
      assets: [{
        uri: copy.localUri,
        name: file.name ?? 'document',
        mimeType: file.type,
      }],
    };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return { canceled: true, assets: null };
    }
    throw error;
  }
}
