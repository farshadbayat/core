import { HttpErrorResponse } from '@angular/common/http';
import { ToastType } from '../modules/toast-notification';

export function ErrorHandling(error: HttpErrorResponse | any): { type: ToastType, caption: string, text: string }
{
  const { status } = error;
  if (error.error instanceof ErrorEvent)
  {
    // Get client-side error
    return { type: 'danger', caption: 'Client Exception', text: error.error.message };
  } else
  {
    // Get server-side error
    switch (status)
    {
      case 404: {
        return { type: 'danger', caption: 'Not Found', text: 'Error Code: 404' };
        break;
      }
      case 401: {
        return { type: 'danger', caption: 'Unauthorize', text: 'Error Code: 401' };
        break;
      }
      case 403: {
        return { type: 'danger', caption: 'Access Denied', text: 'Error Code: 403' };
        break;
      }
      case 500: {
        return { type: 'danger', caption: 'Server Error', text: 'Error Code: 500' };
        break;
      }
      case 0: {
        return { type: 'warning', caption: 'پیام سرور', text: error.message };
        break;
      }
      default:
        return { type: 'danger', caption: `Error Code: ${error.status}`, text: error.message };
    }
  }
}
