// API Client for Tarcom Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Soumettre un dossier complet avec fichiers
 */
export async function submitDossier(formData: FormData): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      body: formData,
      // Ne pas définir Content-Type, le navigateur le fera automatiquement
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la soumission');
    }

    return await response.json();
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

/**
 * Obtenir une soumission par ID
 */
export async function getSubmission(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`);

    if (!response.ok) {
      throw new Error('Soumission non trouvée');
    }

    return {
      success: true,
      data: await response.json()
    };
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

/**
 * Obtenir une soumission par email
 */
export async function getSubmissionByEmail(email: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/email/${email}`);

    if (!response.ok) {
      return {
        success: false,
        error: 'Soumission non trouvée'
      };
    }

    return {
      success: true,
      data: await response.json()
    };
  } catch (error) {
    console.error('[API Error]', error);
    return {
      success: false,
      error: 'Erreur lors de la récupération'
    };
  }
}

/**
 * Lister les soumissions par statut
 */
export async function listSubmissions(status: string = 'pending'): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions?status=${status}`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des soumissions');
    }

    return {
      success: true,
      data: await response.json()
    };
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

/**
 * Mettre à jour le statut d'une soumission
 */
export async function updateSubmissionStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour');
    }

    return {
      success: true,
      data: await response.json()
    };
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

/**
 * Obtenir les statistiques
 */
export async function getStatistics(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/stats`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return {
      success: true,
      data: await response.json()
    };
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

/**
 * Supprimer une soumission
 */
export async function deleteSubmission(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la suppression');
    }

    return {
      success: true,
      data: await response.json()
    };
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

/**
 * Télécharger un fichier
 */
export async function downloadFile(fileId: string, fileName: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`);

    if (!response.ok) {
      throw new Error('Fichier non trouvé');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('[API Error]', error);
    throw error;
  }
}

/**
 * Vérifier la connexion à l'API
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
}
