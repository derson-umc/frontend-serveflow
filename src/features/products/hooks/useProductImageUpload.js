import { useState, useCallback, useRef, useEffect } from 'react';
import { productsApi } from '@core/api/products';
import { fileToBase64, base64ToFile, pendingUploads } from '@features/products/services/imageStore';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export function useProductImageUpload(initialUrl = null) {
  const [preview,     setPreview]     = useState(initialUrl);
  const [uploadedUrl, setUploadedUrl] = useState(initialUrl);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [offline,     setOffline]     = useState(false);
  const fileRef    = useRef(null);
  const pendingKey = useRef(null);

  const doUpload = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await productsApi.uploadImage(formData);
    return typeof result === 'string' ? result : result?.url ?? null;
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE) return;

    const base64 = await fileToBase64(file);
    setPreview(base64);
    setUploadedUrl(null);
    setUploadError(null);
    setOffline(false);
    setUploading(true);

    try {
      const url = await doUpload(file);
      setUploadedUrl(url);
    } catch {
      const key = await pendingUploads.enqueue(base64, file.name, file.type);
      pendingKey.current = key;
      setOffline(true);
      setUploadError('Sem conexão — foto salva localmente. Será enviada ao reconectar.');
    } finally {
      setUploading(false);
    }
  }, [doUpload]);

  // Retry automático ao reconectar
  useEffect(() => {
    const handleOnline = async () => {
      const key = pendingKey.current;
      if (!key) return;

      const item = await pendingUploads.get(key);
      if (!item) return;

      setUploading(true);
      setUploadError(null);

      try {
        const file = base64ToFile(item.base64, item.fileName, item.mimeType);
        const url  = await doUpload(file);
        await pendingUploads.dequeue(key);
        pendingKey.current = null;
        setUploadedUrl(url);
        setOffline(false);
      } catch {
        setUploadError('Reconectou, mas o envio falhou. Tente novamente.');
      } finally {
        setUploading(false);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [doUpload]);

  // Limpa a fila se o formulário for fechado sem salvar
  useEffect(() => {
    return () => {
      if (pendingKey.current) {
        pendingUploads.dequeue(pendingKey.current);
        pendingKey.current = null;
      }
    };
  }, []);

  const clear = useCallback(() => {
    if (pendingKey.current) {
      pendingUploads.dequeue(pendingKey.current);
      pendingKey.current = null;
    }
    setPreview(null);
    setUploadedUrl(null);
    setUploadError(null);
    setOffline(false);
  }, []);

  return { preview, uploadedUrl, uploading, uploadError, offline, fileRef, handleFile, clear };
}
