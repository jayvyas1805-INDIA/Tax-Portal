import apiClient from "../api/apiClient";

/**
 * Downloads a file from an authenticated API endpoint (e.g. a CSV export).
 * Plain <a href="..."> links can't carry the Authorization header, so this
 * fetches the file as a blob through apiClient (which does attach it) and
 * then triggers a normal browser download.
 */
export const downloadFile = async (url, params, filename) => {
  const response = await apiClient.get(url, { params, responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
