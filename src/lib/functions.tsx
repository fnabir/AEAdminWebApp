import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { DataSnapshot, remove, set, update } from 'firebase/database';
import {
  generateDatabaseKey,
  getDatabaseReference,
  showToast,
} from '@/lib/utils';
import { expenseDataType } from '@/lib/types';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { TransactionFormData } from './schemas';

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  try {
    await signOut(auth);
    console.log('Logged out successfully.');
  } catch (error) {
    console.error('Error logging out: ', error);
  }
}

export async function updateAccountInfo(uid: string, data: object) {
  await update(getDatabaseReference(`info/user/${uid}`), data)
    .then(() => {
      showToast(
        'Successful',
        'Updated the account info successfully.',
        'success',
      );
    })
    .catch((error) => {
      showToast(
        'Error',
        `Failed to update the account info record: ${error.message}`,
        'error',
      );
    });
}

export function getNextFileNo(filesData: DataSnapshot[] | undefined): number {
  if (!filesData || filesData.length === 0) return 1;
  const existingFileNos = filesData.map((snapshot) => Number(snapshot.key));
  return Math.max(...existingFileNos) + 1;
}

export async function addNewFile(
  fileNo: number,
  fileYear: number,
  data: object,
) {
  await set(getDatabaseReference(`files/info/${fileYear}/${fileNo}`), data)
    .then(() => {
      showToast('Successful', 'Added the new file successfully.', 'success');
    })
    .catch((error) => {
      showToast(
        'Error',
        `Failed to add the new file: ${error.message}`,
        'error',
      );
    });
}

export async function deleteFile(fileNo: number, fileYear: number) {
  const infoRef = getDatabaseReference(`files/info/${fileYear}/${fileNo}`);
  const expenseRef = getDatabaseReference(
    `files/expense/${fileYear}/${fileNo}`,
  );
  const detailsRef = getDatabaseReference(
    `files/details/${fileYear}/${fileNo}`,
  );

  try {
    await Promise.all([
      remove(infoRef),
      remove(expenseRef),
      remove(detailsRef),
    ]);

    showToast('Deleted', 'Deleted the file successfully.', 'success');
  } catch (error: any) {
    showToast('Failed', `Failed to delete the file: ${error.message}`, 'error');
  }
}

export async function addNewTransaction(
  type: string,
  id: string,
  transactionType: string,
  transactionDate: string,
  data: TransactionFormData,
) {
  const newKey: string = `${format(
    new Date(transactionDate),
    'yyMMdd',
  )}${generateDatabaseKey(`transaction/${type}/${id}/${transactionType}`)}`;
  await set(
    getDatabaseReference(
      `transaction/${type}/${id}/${transactionType}/${newKey}`,
    ),
    data,
  )
    .then(() => {
      updateBalanceUpdateDate(type, id);
      showToast(
        'Added',
        `Added the new ${transactionType} transaction successfully.`,
        'success',
      );
    })
    .catch((error) => {
      showToast(
        'Failed',
        `Failed to save the new ${transactionType} transaction: ${error.message}`,
        'error',
      );
    });
}

export async function updateTransaction(
  type: string,
  id: string,
  transactionType: string,
  transactionId: string,
  data: TransactionFormData,
) {
  await update(
    getDatabaseReference(
      `transaction/${type}/${id}/${transactionType}/${transactionId}`,
    ),
    data,
  )
    .then(() => {
      updateBalanceUpdateDate(type, id);
      showToast(
        'Success',
        `Updated the ${transactionType} transaction successfully.`,
        'success',
      );
    })
    .catch((error) => {
      showToast(
        'Failed',
        `Failed to update the ${transactionType} transaction: ${error.message}`,
        'error',
      );
    });
}

export async function deleteTransaction(
  type: string,
  id: string,
  transactionType: string,
  transactionId: string,
) {
  await remove(
    getDatabaseReference(
      `transaction/${type}/${id}/${transactionType}/${transactionId}`,
    ),
  )
    .then(() => {
      showToast('Deleted', 'Deleted the transaction successfully.', 'success');
    })
    .catch((error) => {
      showToast(
        'Failed',
        `Faield to delete the transaction: ${error.message}`,
        'error',
      );
    });
}

export async function updateBalanceUpdateDate(type: string, id: string) {
  const today = new Date();
  const todayTZ = formatInTimeZone(today, 'Asia/Dhaka', 'dd MMM yyyy');
  const formattedDate = format(todayTZ, 'dd MMM yyyy');

  await update(getDatabaseReference(`balance/total/${type}`), {
    date: formattedDate,
  }).catch((error) => {
    console.error(error.message);
    showToast(error.name, error.message, 'error');
  });

  await update(getDatabaseReference(`balance/${type}/${id}`), {
    date: formattedDate,
  }).catch((error) => {
    console.error(error.message);
    showToast(error.name, error.message, 'error');
  });
}

export async function updateFile(
  fileNo: number,
  fileYear: number,
  dataInfo: object,
  dataDetails: object,
) {
  await update(
    getDatabaseReference(`files/info/${fileYear}/${fileNo}`),
    dataInfo,
  )
    .then(async () => {
      await update(
        getDatabaseReference(`files/details/${fileYear}/${fileNo}`),
        dataDetails,
      )
        .then(() => {
          showToast(
            'Successful',
            'Updated the file details successfully.',
            'success',
          );
        })
        .catch((error) => {
          showToast(
            'Error',
            `Failed to update the file details: ${error.message}`,
            'error',
          );
        });
    })
    .catch((error) => {
      showToast(
        'Error',
        `Failed to update the file details: ${error.message}`,
        'error',
      );
    });
}

export async function setFileDuty(
  fileNo: number,
  fileYear: number,
  data: object,
) {
  try {
    await set(
      getDatabaseReference(`files/expense/${fileYear}/${fileNo}/duty`),
      data,
    );
    showToast('Successful', `Updated the file duty successfully.`, 'success');
  } catch (error) {
    showToast(
      'Error',
      `Failed to update the file duty expense: ${error}`,
      'error',
    );
  }
}

export async function updateFileExpense(
  fileNo: number,
  fileYear: number,
  type: string,
  dataSet: expenseDataType[],
) {
  const data = dataSet.reduce((acc, item) => {
    if (item.details != '' && item.value != 0)
      acc[item.id] = { details: item.details, value: item.value };
    return acc;
  }, {} as Record<number, { details: string; value: number }>);
  try {
    await set(
      getDatabaseReference(`files/expense/${fileYear}/${fileNo}/${type}`),
      data,
    );
    showToast(
      'Successful',
      `Updated the file ${type} expense successfully.`,
      'success',
    );
  } catch (error) {
    showToast(
      'Error',
      `Failed to update the file ${type} expense: ${error}`,
      'error',
    );
  }
}

export async function updateTotalBalance(type: string, value: number) {
  await update(getDatabaseReference(`balance/total/${type}`), {
    value: value,
  });
}

export async function updateBalance(type: string, id: string, value: number) {
  await update(getDatabaseReference(`balance/${type}/${id}`), {
    value: value,
  });
}
