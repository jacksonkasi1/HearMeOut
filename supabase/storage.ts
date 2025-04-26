import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/supabase/client';

//Upload a file from a URI (local file path or remote URL)
export async function uploadFromUri(
    bucketName: string,
    filePath: string,
    uri: string,
    contentType?: string,
    options?: { upsert?: boolean; }
) {
    try {
        if (Platform.OS === 'web') {
            const response = await fetch(uri);
            const blob = await response.blob();

            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(filePath, blob, {
                    contentType: contentType || blob.type,
                    upsert: options?.upsert ?? false,
                    cacheControl: '3600',
                });

            if (error) throw error;
            return { path: data?.path };
        }
        if (uri.startsWith('http')) {
            const downloadResult = await FileSystem.downloadAsync(uri, FileSystem.documentDirectory + 'tempFile');
            uri = downloadResult.uri;
        }
        const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const fileArrayBuffer = decode(fileBase64);

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileArrayBuffer, {
                contentType: contentType || getContentTypeFromUri(uri),
                upsert: options?.upsert ?? false,
                cacheControl: '3600',
            });
        if (error) throw error;
        return { path: data?.path };
    } catch (error) {
        throw error;
    }
}

//Upload a file from a base64 string
export async function uploadFromBase64(
    bucketName: string,
    filePath: string,
    base64Data: string,
    contentType: string,
    options?: { upsert?: boolean; }
) {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, decode(base64Data), {
                contentType,
                upsert: options?.upsert ?? false,
                cacheControl: '3600',
            });
        if (error) throw error;
        return { path: data?.path };
    } catch (error) {
        throw error;
    }
}

// Helper for media permissions
export async function _checkPermission(permissionType: 'camera' | 'mediaLibrary') {
    if (Platform.OS === 'web') return true;

    const permissionMethod = permissionType === 'camera'
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionMethod();
    if (status !== 'granted') {
        throw new Error(`Permission to access ${permissionType} was denied`);
    }
    return true;
}

// Helper for processing and uploading media
export async function _processAndUploadMedia(
    bucketName: string,
    result: ImagePicker.ImagePickerResult,
    filePath: string,
    options?: { upsert?: boolean; }
) {
    if (result.canceled) throw new Error('Operation was canceled');

    const asset = result.assets[0];
    const finalFilePath = filePath.includes('.')
        ? filePath
        : `${filePath}.${getFileExtensionFromUri(asset.uri)}`;

    const uploadResult = await uploadFromUri(
        bucketName,
        finalFilePath,
        asset.uri,
        getContentTypeFromUri(asset.uri),
        { upsert: options?.upsert ?? false }
    );

    return {
        ...uploadResult,
        width: asset.width,
        height: asset.height,
        type: asset.type,
    };
}

//Pick an image from the device and upload it
export async function pickAndUploadImage(
    bucketName: string,
    filePath: string,
    options?: {
        mediaTypes?: ImagePicker.MediaTypeOptions;
        allowsEditing?: boolean;
        quality?: number;
        aspect?: [number, number];
        upsert?: boolean;
    }
) {
    try {
        await _checkPermission('mediaLibrary');
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: options?.mediaTypes || ImagePicker.MediaTypeOptions.Images,
            allowsEditing: options?.allowsEditing ?? true,
            quality: options?.quality ?? 0.8,
            aspect: options?.aspect,
            base64: false,
        });
        return _processAndUploadMedia(bucketName, result, filePath, options);
    } catch (error) {
        throw error;
    }
}

//Take a photo with the camera and upload it
export async function takePhotoAndUpload(
    bucketName: string,
    filePath: string,
    options?: {
        allowsEditing?: boolean;
        quality?: number;
        aspect?: [number, number];
        upsert?: boolean;
    }
) {
    try {
        await _checkPermission('camera');
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: options?.allowsEditing ?? true,
            quality: options?.quality ?? 0.8,
            aspect: options?.aspect,
            base64: false,
        });
        return _processAndUploadMedia(bucketName, result, filePath, options);
    } catch (error) {
        throw error;
    }
}

//Pick a document from the device and upload it
export async function pickAndUploadDocument(
    bucketName: string,
    filePath: string,
    options?: {
        type?: string[];
        upsert?: boolean;
    }
) {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: options?.type || ['*/*'],
            copyToCacheDirectory: true,
        });
        if (result.canceled) throw new Error('Document picking was canceled');

        const asset = result.assets[0];
        const finalFilePath = filePath.includes('.')
            ? filePath
            : `${filePath}.${getFileExtensionFromUri(asset.uri)}`;
        const uploadResult = await uploadFromUri(
            bucketName,
            finalFilePath,
            asset.uri,
            asset.mimeType,
            { upsert: options?.upsert ?? false }
        );

        return {
            ...uploadResult,
            name: asset.name,
            size: asset.size,
            type: asset.mimeType,
        };
    } catch (error) {
        throw error;
    }
}

//Download a file from storage to the local filesystem
export async function downloadFile(imageFullPath: string, localUri?: string) {
    try {
        const fileExtension = getFileExtensionFromUri(imageFullPath);
        const finalLocalUri = localUri || `${FileSystem.documentDirectory}${Date.now()}.${fileExtension}`;

        return (await FileSystem.downloadAsync(imageFullPath, finalLocalUri))?.uri;
    } catch (error) {
        throw error;
    }
}

//Delete a file from storage
export async function deleteFile(bucketName: string, filePath: string) {
    try {
        const { error } = await supabase.storage.from(bucketName).remove([filePath]);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        throw error;
    }
}

//Delete multiple files from storage
export async function deleteFiles(bucketName: string, filePaths: string[]) {
    try {
        const { error } = await supabase.storage.from(bucketName).remove(filePaths);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        throw error;
    }
}

//List all files in a directory
export async function listFiles(
    bucketName: string,
    path: string = '',
    options?: {
        limit?: number;
        offset?: number;
        sortBy?: { column: string; order: 'asc' | 'desc' };
    }
) {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .list(path, {
                limit: options?.limit ?? 100,
                offset: options?.offset ?? 0,
                sortBy: options?.sortBy,
            });

        if (error) throw error;
        return data || [];
    } catch (error) {
        throw error;
    }
}

//Get a public URL for a file
export function getPublicUrl(
    bucketName: string,
    filePath: string,
    options?: {
        download?: boolean;
        transform?: {
            width?: number;
            height?: number;
            resize?: 'cover' | 'contain' | 'fill';
            format?: 'origin';
            quality?: number;
        };
    }
) {
    try {
        let urlParams = {};
        if (options?.transform) {
            urlParams = { transform: options.transform, download: options.download };
        } else if (options?.download) {
            urlParams = { download: true };
        }

        const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath, urlParams);
        return data.publicUrl;
    } catch (error) {
        throw error;
    }
}

//Create a signed URL for temporary access to a file
export async function getSignedUrl(bucketName: string, filePath: string, expiresIn: number = 60) {
    try {
        const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(filePath, expiresIn);

        if (error) throw error;
        return data?.signedUrl;
    } catch (error) {
        throw error;
    }
}

//Move a file to a new location
export async function moveFile(bucketName: string, fromPath: string, toPath: string) {
    try {
        const { error } = await supabase.storage.from(bucketName).move(fromPath, toPath);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        throw error;
    }
}

//Copy a file to a new location
export async function copyFile(bucketName: string, fromPath: string, toPath: string) {
    try {
        const { error } = await supabase.storage.from(bucketName).copy(fromPath, toPath);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        throw error;
    }
}

//Get the content type from a URI
export function getContentTypeFromUri(uri: string): string {
    const extension = getFileExtensionFromUri(uri).toLowerCase();
    const mimeTypes: Record<string, string> = {
        jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png',
        pdf: 'application/pdf', doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        txt: 'text/plain', mp3: 'audio/mpeg', mp4: 'video/mp4',
        mov: 'video/quicktime', zip: 'application/zip',
    };
    return mimeTypes[extension] || 'application/octet-stream';
}

export function getFileExtensionFromUri(uri: string): string {
    return uri.split('.').pop() || '';
}